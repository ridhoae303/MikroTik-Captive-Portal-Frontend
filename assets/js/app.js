/*
Fixed by ridhoae303
https:/github.com/ridhoae303
*/

(function () {
    "use strict";

    const config = window.HOTSPOT_CONFIG || {};
    const wideNavQuery = window.matchMedia("(min-width: 760px)");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const ui = {
        body: document.body,
        sideNav: document.getElementById("sideNav"),
        navBackdrop: document.getElementById("navBackdrop"),
        menuButton: document.getElementById("menuButton"),
        navList: document.getElementById("navList"),
        mainContent: document.getElementById("mainContent"),
        loginForm: document.getElementById("loginForm"),
        voucherCode: document.getElementById("voucherCode"),
        voucherPassword: document.getElementById("voucherPassword"),
        voucherError: document.getElementById("voucherError"),
        statusForm: document.getElementById("statusForm"),
        statusQuery: document.getElementById("statusQuery"),
        statusError: document.getElementById("statusError"),
        statusSubmit: document.getElementById("statusSubmit"),
        statusResult: document.getElementById("statusResult"),
        statusResultTitle: document.getElementById("statusResultTitle"),
        statusResultList: document.getElementById("statusResultList"),
        appDialog: document.getElementById("appDialog"),
        dialogTitle: document.getElementById("dialogTitle"),
        dialogCopy: document.getElementById("dialogCopy"),
        paymentDialog: document.getElementById("paymentDialog"),
        paymentTitle: document.getElementById("paymentTitle"),
        toast: document.getElementById("toast"),
        adminLink: document.getElementById("adminLink"),
        supportWhatsapp: document.getElementById("supportWhatsapp"),
        carousel: document.getElementById("promoCarousel"),
        carouselTrack: document.getElementById("carouselTrack"),
        carouselDots: Array.from(document.querySelectorAll(".carousel__dot"))
    };

    const state = {
        page: "home",
        slide: 0,
        slideCount: 3,
        carouselTimer: 0,
        dragStartX: 0,
        dragOffsetX: 0,
        dragging: false,
        toastTimer: 0
    };

    function normalizeCode(value) {
        return value.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9_-]/g, "");
    }

    function isRouterVariable(value) {
        return typeof value === "string" && value.includes("$(");
    }

    function openNav() {
        if (wideNavQuery.matches) return;
        ui.sideNav.classList.add("is-open");
        ui.navBackdrop.hidden = false;
        ui.menuButton.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeNav() {
        ui.sideNav.classList.remove("is-open");
        ui.navBackdrop.hidden = true;
        ui.menuButton.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    function switchPage(pageName) {
        const nextPage = document.getElementById(`page-${pageName}`);
        if (!nextPage) return;

        document.querySelectorAll(".page").forEach((page) => {
            const active = page === nextPage;
            page.hidden = !active;
            page.classList.toggle("is-active", active);
        });

        document.querySelectorAll("[data-page]").forEach((link) => {
            const active = link.dataset.page === pageName;
            link.classList.toggle("is-active", active);
            if (link.classList.contains("nav-link")) {
                active ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
            }
        });

        state.page = pageName;
        document.title = `${nextPage.dataset.title || "Hotspot"} | Zizu Hotspot`;
        closeNav();

        // Desktop scroll lives inside main; mobile scroll lives on the document.
        if (wideNavQuery.matches) {
            ui.mainContent.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
        }
    }

    function showDialog(title, message) {
        ui.dialogTitle.textContent = title;
        ui.dialogCopy.textContent = message;
        if (typeof ui.appDialog.showModal === "function") {
            ui.appDialog.showModal();
            return;
        }

        // Old WebViews exist in the wild. This fallback is ugly but still stays inside the page.
        ui.appDialog.setAttribute("open", "");
    }

    function showToast(message) {
        window.clearTimeout(state.toastTimer);
        ui.toast.textContent = message;
        ui.toast.hidden = false;
        state.toastTimer = window.setTimeout(() => {
            ui.toast.hidden = true;
        }, 3600);
    }

    function setFieldError(input, errorNode, message) {
        input.setAttribute("aria-invalid", message ? "true" : "false");
        errorNode.textContent = message || "";
        errorNode.hidden = !message;
    }

    function applyContactConfig() {
        const phone = String(config.whatsappNumber || "").replace(/\D/g, "");
        if (!phone) return;

        const baseUrl = `https://wa.me/${phone}`;
        ui.supportWhatsapp.href = baseUrl;
        document.querySelectorAll("[data-order-link]").forEach((link) => {
            const packageName = link.dataset.orderLink;
            link.href = `${baseUrl}?text=${encodeURIComponent(`Halo Admin, saya ingin memesan paket ${packageName}.`)}`;
        });
    }

    function handleAdminLink() {
        const adminUrl = String(config.adminUrl || "").trim();
        if (!adminUrl) {
            showDialog("Portal admin belum diatur", "Isi adminUrl pada assets/js/config.js dengan alamat portal admin yang benar.");
            return;
        }

        window.open(adminUrl, "_blank", "noopener,noreferrer");
    }

    function showMikrotikError() {
        const rawError = ui.body.dataset.mikrotikError || "";
        if (!rawError || isRouterVariable(rawError)) return;
        showDialog("Login gagal", rawError);
    }

    function prepareLogin(event) {
        const code = normalizeCode(ui.voucherCode.value.trim());
        ui.voucherCode.value = code;

        if (!code) {
            event.preventDefault();
            setFieldError(ui.voucherCode, ui.voucherError, "Masukkan kode voucher terlebih dahulu.");
            ui.voucherCode.focus();
            return;
        }

        setFieldError(ui.voucherCode, ui.voucherError, "");

        const loginAction = ui.loginForm.getAttribute("action") || "";
        if (isRouterVariable(loginAction)) {
            event.preventDefault();
            showDialog("Mode pratinjau", "Form login akan aktif setelah index.html diganti menjadi login.html dan dipasang di folder Hotspot MikroTik.");
            return;
        }

        const chapId = ui.body.dataset.chapId || "";
        const chapChallenge = ui.body.dataset.chapChallenge || "";
        const hasChap = chapId && chapChallenge && !isRouterVariable(chapId) && !isRouterVariable(chapChallenge);

        // Voucher deployments usually mirror username into password. CHAP gets hashed before submit.
        ui.voucherPassword.value = hasChap && typeof window.hexMD5 === "function"
            ? window.hexMD5(chapId + code + chapChallenge)
            : code;
    }

    function setStatusLoading(loading) {
        ui.statusSubmit.disabled = loading;
        ui.statusSubmit.lastChild.textContent = loading ? " Memeriksa..." : " Periksa ke server";
    }

    function humanizeKey(key) {
        return String(key)
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/[_-]+/g, " ")
            .replace(/^./, (character) => character.toUpperCase());
    }

    function formatValue(value) {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "boolean") return value ? "Ya" : "Tidak";
        if (Array.isArray(value)) return value.map(formatValue).join(", ");
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    }

    function flattenPayload(payload, prefix = "", depth = 0) {
        if (!payload || typeof payload !== "object" || depth > 2) return [];

        const blockedKeys = /token|secret|password|authorization|cookie|credential/i;
        const ignoredKeys = /^(success|ok|found|message|code)$/i;
        const rows = [];

        Object.entries(payload).forEach(([key, value]) => {
            if (blockedKeys.test(key) || ignoredKeys.test(key)) return;
            const label = prefix ? `${prefix} \u00b7 ${humanizeKey(key)}` : humanizeKey(key);

            if (value && typeof value === "object" && !Array.isArray(value) && depth < 2) {
                rows.push(...flattenPayload(value, label, depth + 1));
                return;
            }

            rows.push([label, formatValue(value)]);
        });

        return rows.slice(0, 24);
    }

    function pickResultData(payload) {
        if (!payload || typeof payload !== "object") return null;
        return payload.data || payload.result || payload.subscription || payload.order || payload;
    }

    function renderStatusResult(payload) {
        const resultData = pickResultData(payload);
        const rows = flattenPayload(resultData);
        if (!rows.length) throw new Error("empty_server_payload");

        ui.statusResultTitle.textContent = payload.message || "Data ditemukan";
        ui.statusResultList.replaceChildren();

        rows.forEach(([label, value]) => {
            const row = document.createElement("div");
            const term = document.createElement("dt");
            const detail = document.createElement("dd");
            term.textContent = label;
            detail.textContent = value;
            row.append(term, detail);
            ui.statusResultList.append(row);
        });

        ui.statusResult.hidden = false;
    }

    async function parseJsonResponse(response) {
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) throw new Error("invalid_server_response");
        return response.json();
    }

    async function checkSubscription(event) {
        event.preventDefault();
        const query = normalizeCode(ui.statusQuery.value.trim());
        ui.statusQuery.value = query;
        ui.statusResult.hidden = true;

        if (!query) {
            setFieldError(ui.statusQuery, ui.statusError, "Masukkan nomor transaksi atau kode voucher.");
            ui.statusQuery.focus();
            return;
        }

        setFieldError(ui.statusQuery, ui.statusError, "");
        setStatusLoading(true);

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), Number(config.statusTimeoutMs) || 8000);

        try {
            const response = await fetch(config.statusApiUrl || "/api/subscription/status", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({ query }),
                cache: "no-store",
                credentials: "same-origin",
                signal: controller.signal
            });

            const payload = await parseJsonResponse(response);
            if (!response.ok || payload?.found === false || payload?.success === false || payload?.ok === false) {
                throw new Error("server_rejected_request");
            }

            renderStatusResult(payload);
            showToast("Respon server berhasil diterima.");
        } catch (error) {
            console.error("Status check failed:", error);
            setFieldError(ui.statusQuery, ui.statusError, "Gagal memeriksa ke sisi server.");
            showDialog("Pemeriksaan gagal", "Gagal memeriksa ke sisi server.");
        } finally {
            window.clearTimeout(timeout);
            setStatusLoading(false);
        }
    }

    function showSlide(index, userInitiated = false) {
        state.slide = (index + state.slideCount) % state.slideCount;
        const offset = state.slide * -100;
        ui.carouselTrack.style.transform = `translate3d(${offset}%, 0, 0)`;

        ui.carouselDots.forEach((dot, dotIndex) => {
            const active = dotIndex === state.slide;
            dot.classList.toggle("is-active", active);
            active ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current");
        });

        if (userInitiated) restartCarousel();
    }

    function startCarousel() {
        if (reducedMotionQuery.matches || document.hidden) return;
        window.clearInterval(state.carouselTimer);
        state.carouselTimer = window.setInterval(() => showSlide(state.slide + 1), 5500);
    }

    function stopCarousel() {
        window.clearInterval(state.carouselTimer);
        state.carouselTimer = 0;
    }

    function restartCarousel() {
        stopCarousel();
        startCarousel();
    }

    function beginDrag(event) {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        state.dragging = true;
        state.dragStartX = event.clientX;
        state.dragOffsetX = 0;
        ui.carousel.classList.add("is-dragging");
        ui.carousel.setPointerCapture?.(event.pointerId);
        stopCarousel();
    }

    function moveDrag(event) {
        if (!state.dragging) return;
        state.dragOffsetX = event.clientX - state.dragStartX;
        const width = ui.carousel.clientWidth || 1;
        const base = state.slide * -100;
        const dragPercent = (state.dragOffsetX / width) * 100;
        ui.carouselTrack.style.transform = `translate3d(${base + dragPercent}%, 0, 0)`;
    }

    function endDrag(event) {
        if (!state.dragging) return;
        state.dragging = false;
        ui.carousel.classList.remove("is-dragging");
        ui.carousel.releasePointerCapture?.(event.pointerId);

        if (Math.abs(state.dragOffsetX) >= 42) {
            showSlide(state.slide + (state.dragOffsetX < 0 ? 1 : -1), true);
        } else {
            showSlide(state.slide, true);
        }
    }

    function openPayment(packageName) {
        ui.paymentTitle.textContent = `QRIS \u00b7 ${packageName}`;
        if (typeof ui.paymentDialog.showModal === "function") {
            ui.paymentDialog.showModal();
        } else {
            ui.paymentDialog.setAttribute("open", "");
        }
    }

    function handleDocumentClick(event) {
        const pageButton = event.target.closest("[data-page]");
        if (pageButton) {
            switchPage(pageButton.dataset.page);
            return;
        }

        const carouselStep = event.target.closest("[data-carousel-step]");
        if (carouselStep) {
            showSlide(state.slide + Number(carouselStep.dataset.carouselStep), true);
            return;
        }

        const carouselDot = event.target.closest("[data-slide]");
        if (carouselDot) {
            showSlide(Number(carouselDot.dataset.slide), true);
            return;
        }

        const paymentButton = event.target.closest("[data-open-payment]");
        if (paymentButton) openPayment(paymentButton.dataset.openPayment);
    }

    function bindEvents() {
        ui.menuButton.addEventListener("click", openNav);
        ui.navBackdrop.addEventListener("click", closeNav);
        ui.adminLink.addEventListener("click", handleAdminLink);
        ui.loginForm.addEventListener("submit", prepareLogin);
        ui.statusForm.addEventListener("submit", checkSubscription);
        document.addEventListener("click", handleDocumentClick);

        ui.voucherCode.addEventListener("input", () => {
            ui.voucherCode.value = normalizeCode(ui.voucherCode.value);
            setFieldError(ui.voucherCode, ui.voucherError, "");
        });

        ui.statusQuery.addEventListener("input", () => {
            ui.statusQuery.value = normalizeCode(ui.statusQuery.value);
            setFieldError(ui.statusQuery, ui.statusError, "");
        });

        ui.carousel.addEventListener("pointerdown", beginDrag);
        ui.carousel.addEventListener("pointermove", moveDrag);
        ui.carousel.addEventListener("pointerup", endDrag);
        ui.carousel.addEventListener("pointercancel", endDrag);
        ui.carousel.addEventListener("mouseenter", stopCarousel);
        ui.carousel.addEventListener("mouseleave", startCarousel);
        ui.carousel.addEventListener("focusin", stopCarousel);
        ui.carousel.addEventListener("focusout", startCarousel);
        ui.carousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") showSlide(state.slide - 1, true);
            if (event.key === "ArrowRight") showSlide(state.slide + 1, true);
        });

        document.addEventListener("visibilitychange", () => {
            document.hidden ? stopCarousel() : startCarousel();
        });

        wideNavQuery.addEventListener?.("change", closeNav);
        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeNav();
        });
    }

    applyContactConfig();
    bindEvents();
    showMikrotikError();
    showSlide(0);
    startCarousel();
}());
