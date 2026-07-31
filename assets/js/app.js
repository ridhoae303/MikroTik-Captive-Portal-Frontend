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
        pageTransitioning: false,
        pendingPage: "",
        slide: 0,
        slideCount: 0,
        trackIndex: 1,
        carouselTimer: 0,
        carouselBusy: false,
        queuedCarouselStep: 0,
        dragStartX: 0,
        dragStartTime: 0,
        dragOffsetX: 0,
        dragMoved: false,
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

    function waitForAnimation(element, timeoutMs) {
        return new Promise((resolve) => {
            let settled = false;
            const finish = () => {
                if (settled) return;
                settled = true;
                element.removeEventListener("animationend", finish);
                resolve();
            };

            element.addEventListener("animationend", finish, { once: true });
            window.setTimeout(finish, timeoutMs);
        });
    }

    function scrollPageToTop() {
        // Desktop scroll lives inside main; mobile scroll lives on the document.
        if (wideNavQuery.matches) {
            ui.mainContent.scrollTo({ top: 0, behavior: "auto" });
        } else {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }

    function syncPageNavigation(pageName) {
        document.querySelectorAll("[data-page]").forEach((link) => {
            const active = link.dataset.page === pageName;
            link.classList.toggle("is-active", active);
            if (link.classList.contains("nav-link")) {
                active ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
            }
        });
    }

    async function runPageTransition(pageName) {
        const nextPage = document.getElementById(`page-${pageName}`);
        const currentPage = document.querySelector(".page.is-active");
        if (!nextPage || currentPage === nextPage) return;

        state.pageTransitioning = true;
        syncPageNavigation(pageName);
        closeNav();

        if (currentPage && !reducedMotionQuery.matches) {
            currentPage.classList.remove("is-entering");
            currentPage.classList.add("is-leaving");
            await waitForAnimation(currentPage, 220);
        }

        if (currentPage) {
            currentPage.hidden = true;
            currentPage.classList.remove("is-active", "is-leaving", "is-entering");
        }

        nextPage.hidden = false;
        nextPage.classList.add("is-active");
        scrollPageToTop();

        if (!reducedMotionQuery.matches) {
            // Restarting the class makes the animation reliable even after rapid page changes.
            nextPage.classList.remove("is-entering");
            void nextPage.offsetWidth;
            nextPage.classList.add("is-entering");
            await waitForAnimation(nextPage, 320);
            nextPage.classList.remove("is-entering");
        }

        state.page = pageName;
        document.title = `${nextPage.dataset.title || "Hotspot"} | Zizu Hotspot`;
        state.pageTransitioning = false;

        if (state.pendingPage) {
            const pendingPage = state.pendingPage;
            state.pendingPage = "";
            if (pendingPage !== state.page) switchPage(pendingPage);
        }
    }

    function switchPage(pageName) {
        if (!document.getElementById(`page-${pageName}`)) return;
        if (state.pageTransitioning) {
            state.pendingPage = pageName;
            return;
        }

        runPageTransition(pageName);
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

    function updateCarouselDots() {
        ui.carouselDots.forEach((dot, dotIndex) => {
            const active = dotIndex === state.slide;
            dot.classList.toggle("is-active", active);
            active ? dot.setAttribute("aria-current", "true") : dot.removeAttribute("aria-current");
        });
    }

    function setCarouselPosition(trackIndex, animate = true, dragPercent = 0) {
        state.trackIndex = trackIndex;
        ui.carouselTrack.classList.toggle("is-jumping", !animate);
        ui.carouselTrack.style.transform = `translate3d(${(-trackIndex * 100) + dragPercent}%, 0, 0)`;

        if (!animate) {
            // Force the no-animation jump to land before transitions are switched back on.
            void ui.carouselTrack.offsetWidth;
            window.requestAnimationFrame(() => ui.carouselTrack.classList.remove("is-jumping"));
        }
    }

    function normalizeCarouselAfterLoop() {
        if (state.trackIndex === 0) {
            setCarouselPosition(state.slideCount, false);
        } else if (state.trackIndex === state.slideCount + 1) {
            setCarouselPosition(1, false);
        }
    }

    function finishCarouselMove(event) {
        if (event && event.target !== ui.carouselTrack) return;
        normalizeCarouselAfterLoop();
        state.carouselBusy = false;

        if (state.queuedCarouselStep) {
            const queuedStep = state.queuedCarouselStep;
            state.queuedCarouselStep = 0;
            window.requestAnimationFrame(() => moveCarousel(queuedStep));
        }
    }

    function moveCarousel(step, userInitiated = false) {
        if (!state.slideCount || !step) return;
        const direction = step > 0 ? 1 : -1;

        if (userInitiated) restartCarousel();
        if (state.carouselBusy) {
            state.queuedCarouselStep = direction;
            return;
        }

        state.carouselBusy = true;
        state.slide = (state.slide + direction + state.slideCount) % state.slideCount;
        updateCarouselDots();
        setCarouselPosition(state.trackIndex + direction, true);
    }

    function showSlide(index, userInitiated = false) {
        if (!state.slideCount) return;
        const target = (index + state.slideCount) % state.slideCount;
        if (target === state.slide) {
            setCarouselPosition(state.trackIndex, true);
            if (userInitiated) restartCarousel();
            return;
        }

        let distance = target - state.slide;
        if (Math.abs(distance) > state.slideCount / 2) {
            distance += distance > 0 ? -state.slideCount : state.slideCount;
        }

        moveCarousel(distance > 0 ? 1 : -1, userInitiated);
    }

    function startCarousel() {
        const carouselHasFocus = ui.carousel.contains(document.activeElement);
        if (reducedMotionQuery.matches || document.hidden || ui.carousel.matches(":hover") || carouselHasFocus) return;
        window.clearInterval(state.carouselTimer);
        state.carouselTimer = window.setInterval(() => moveCarousel(1), 5500);
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
        if (event.target.closest("button, a, input, select, textarea, label")) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (state.carouselBusy) return;

        state.dragging = true;
        state.dragMoved = false;
        state.dragStartX = event.clientX;
        state.dragStartTime = performance.now();
        state.dragOffsetX = 0;
        ui.carousel.classList.add("is-dragging");
        ui.carousel.setPointerCapture?.(event.pointerId);
        stopCarousel();
    }

    function moveDrag(event) {
        if (!state.dragging) return;
        state.dragOffsetX = event.clientX - state.dragStartX;
        if (Math.abs(state.dragOffsetX) > 4) state.dragMoved = true;

        const width = ui.carousel.clientWidth || 1;
        const dragPercent = (state.dragOffsetX / width) * 100;
        setCarouselPosition(state.trackIndex, false, dragPercent);
    }

    function endDrag(event) {
        if (!state.dragging) return;
        state.dragging = false;
        ui.carousel.classList.remove("is-dragging");
        ui.carousel.releasePointerCapture?.(event.pointerId);

        const width = ui.carousel.clientWidth || 1;
        const elapsed = Math.max(performance.now() - state.dragStartTime, 1);
        const velocity = Math.abs(state.dragOffsetX) / elapsed;
        const passedDistance = Math.abs(state.dragOffsetX) >= Math.max(38, width * 0.14);
        const passedVelocity = Math.abs(state.dragOffsetX) >= 18 && velocity >= 0.45;

        // Put transitions back before snapping to a slide.
        ui.carouselTrack.classList.remove("is-jumping");
        void ui.carouselTrack.offsetWidth;

        if (passedDistance || passedVelocity) {
            moveCarousel(state.dragOffsetX < 0 ? 1 : -1, true);
        } else {
            setCarouselPosition(state.trackIndex, true);
            restartCarousel();
        }

        state.dragOffsetX = 0;
    }

    function setupCarousel() {
        const slides = Array.from(ui.carouselTrack.children);
        state.slideCount = slides.length;
        if (state.slideCount < 2) return;

        const firstClone = slides[0].cloneNode(true);
        const lastClone = slides[state.slideCount - 1].cloneNode(true);

        [firstClone, lastClone].forEach((clone) => {
            clone.dataset.carouselClone = "true";
            clone.setAttribute("aria-hidden", "true");
            clone.removeAttribute("id");
            clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
        });

        ui.carouselTrack.prepend(lastClone);
        ui.carouselTrack.append(firstClone);
        setCarouselPosition(1, false);
        updateCarouselDots();
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

        ui.carousel.querySelectorAll("[data-carousel-step]").forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                moveCarousel(Number(button.dataset.carouselStep), true);
            });
        });

        ui.carouselDots.forEach((dot) => {
            dot.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                showSlide(Number(dot.dataset.slide), true);
            });
        });

        ui.carouselTrack.addEventListener("transitionend", finishCarouselMove);
        ui.carousel.addEventListener("pointerdown", beginDrag);
        ui.carousel.addEventListener("pointermove", moveDrag);
        ui.carousel.addEventListener("pointerup", endDrag);
        ui.carousel.addEventListener("pointercancel", endDrag);
        ui.carousel.addEventListener("lostpointercapture", endDrag);
        ui.carousel.addEventListener("mouseenter", stopCarousel);
        ui.carousel.addEventListener("mouseleave", startCarousel);
        ui.carousel.addEventListener("focusin", stopCarousel);
        ui.carousel.addEventListener("focusout", () => window.setTimeout(startCarousel, 0));
        ui.carousel.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveCarousel(-1, true);
            } else if (event.key === "ArrowRight" || event.key === " ") {
                event.preventDefault();
                moveCarousel(1, true);
            } else if (event.key === "Home") {
                event.preventDefault();
                showSlide(0, true);
            } else if (event.key === "End") {
                event.preventDefault();
                showSlide(state.slideCount - 1, true);
            }
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
    setupCarousel();
    bindEvents();
    showMikrotikError();

    const initialPage = document.querySelector(".page.is-active");
    if (initialPage && !reducedMotionQuery.matches) {
        initialPage.classList.add("is-entering");
        waitForAnimation(initialPage, 320).then(() => initialPage.classList.remove("is-entering"));
    }

    startCarousel();
}());
