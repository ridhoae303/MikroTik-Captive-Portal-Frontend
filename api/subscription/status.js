/*
Fixed by ridhoae303
https:/github.com/ridhoae303
*/

"use strict";

// This endpoint is a server-side proxy. No upstream configured means no fake green checkmark.
module.exports = async function statusHandler(request, response) {
    response.setHeader("Cache-Control", "no-store, max-age=0");
    response.setHeader("Content-Type", "application/json; charset=utf-8");

    if (request.method === "OPTIONS") {
        response.setHeader("Allow", "POST, OPTIONS");
        return response.status(204).end();
    }

    if (request.method !== "POST") {
        response.setHeader("Allow", "POST, OPTIONS");
        return response.status(405).json({ success: false, message: "Gagal memeriksa ke sisi server." });
    }

    let requestBody = request.body;
    if (typeof requestBody === "string") {
        try {
            requestBody = JSON.parse(requestBody);
        } catch {
            requestBody = {};
        }
    }

    const query = String(requestBody?.query || "").trim();
    if (!query || query.length > 128) {
        return response.status(400).json({ success: false, message: "Gagal memeriksa ke sisi server." });
    }

    const upstreamUrl = process.env.SUBSCRIPTION_API_URL;
    if (!upstreamUrl) {
        return response.status(503).json({ success: false, message: "Gagal memeriksa ke sisi server." });
    }

    const method = String(process.env.SUBSCRIPTION_API_METHOD || "POST").toUpperCase();
    const queryParam = process.env.SUBSCRIPTION_QUERY_PARAM || "query";
    const timeoutMs = Math.min(Math.max(Number(process.env.SUBSCRIPTION_API_TIMEOUT_MS) || 7000, 1000), 15000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const headers = { Accept: "application/json" };
        const token = process.env.SUBSCRIPTION_API_TOKEN;
        if (token) headers.Authorization = `Bearer ${token}`;

        let targetUrl = upstreamUrl;
        let body;

        if (method === "GET") {
            const url = new URL(upstreamUrl);
            url.searchParams.set(queryParam, query);
            targetUrl = url.toString();
        } else {
            headers["Content-Type"] = "application/json";
            body = JSON.stringify({ [queryParam]: query });
        }

        const upstream = await fetch(targetUrl, {
            method,
            headers,
            body,
            cache: "no-store",
            signal: controller.signal
        });

        const contentType = upstream.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) throw new Error("upstream_not_json");

        const payload = await upstream.json();
        const missing = payload?.found === false
            || payload?.success === false
            || payload?.ok === false
            || payload?.status === "not_found"
            || payload?.data === null
            || payload?.result === null;

        if (!upstream.ok || missing) {
            return response.status(404).json({ success: false, message: "Gagal memeriksa ke sisi server." });
        }

        return response.status(200).json(payload);
    } catch (error) {
        console.error("Subscription upstream failed:", error);
        return response.status(502).json({ success: false, message: "Gagal memeriksa ke sisi server." });
    } finally {
        clearTimeout(timeout);
    }
};
