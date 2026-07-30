Fixed by ridhoae303  
https:/github.com/ridhoae303

# Zizu MikroTik Hotspot Portal

A cleaned-up MikroTik hotspot login portal that actually behaves like a proper Wi-Fi captive portal instead of a stretched-out frontend demo.

The original layout had a solid idea behind it, but a few things were fighting the browser: duplicated navigation, fake status checks, native Chrome alerts, a slider that could not really slide, and some pretty heavy UI effects. This build sorts those out while keeping the project lightweight and easy to deploy.

## So, what got fixed?

- The default page no longer keeps stretching downward for no good reason.
- Mobile gets a proper hamburger drawer, while tablets and desktops get one clean vertical sidebar.
- The duplicated left, right, and bottom navigation has been merged into a single responsive nav system.
- The banner slider now supports touch swipes, mouse dragging, arrow buttons, dots, keyboard controls, and autoplay.
- Native browser alerts are gone. Everything now opens inside the website UI.
- The fake subscription checker has been removed. Random input will not magically count as an active subscription anymore.
- Server errors, timeouts, invalid JSON, missing records, and unconfigured endpoints now fail safely.
- The guide, packages, subscription status, terms, help, QRIS payment, and admin views have been filled in.
- Heavy blur, unnecessary transitions, external fonts, and overdone animations were trimmed down to keep weaker phones and captive portal WebViews happy.
- Broken UTF-8 symbols and mojibake were fixed by replacing encoding-sensitive emoji with inline SVG icons.
- The QRIS image was converted to an optimized WebP file.
- MikroTik variables and HTTP CHAP login support are still intact.
- The code and comments were cleaned up so the next person opening this repo does not have to untangle a giant AI-shaped spaghetti bowl.

## Project layout

```text
index.html
login.html
assets/
├── css/app.css
├── image/qris.webp
└── js/
    ├── app.js
    ├── config.js
    └── md5.js
api/
└── subscription/status.js
vercel.json
```

`index.html` is handy for previews or regular hosting. `login.html` is the one meant for MikroTik Hotspot.

## Quick MikroTik setup

1. Upload `login.html` and the whole `assets` folder into your MikroTik Hotspot directory.
2. Keep the folder structure exactly as it is, otherwise the CSS, JavaScript, or QRIS image will not load.
3. Make sure your Hotspot profile allows `http-chap` or `http-pap`, depending on how the router is configured.
4. Add your external status API domain to **IP > Hotspot > Walled Garden** if users need to check their subscription before logging in.
5. Clear the captive portal cache or reconnect to the Wi-Fi after replacing an older build.

The login form already uses the usual MikroTik placeholders:

```html
<form action="$(link-login-only)" method="post">
    <input name="dst" value="$(link-orig)">
    <input name="popup" value="true">
</form>
```

When the page is opened outside MikroTik, login stays in preview mode and shows a proper in-page message. It will not pretend the login worked.

## Real subscription checks

The frontend reads the status endpoint from `assets/js/config.js`:

```js
window.HOTSPOT_CONFIG = Object.freeze({
    statusApiUrl: "/api/subscription/status",
    statusTimeoutMs: 8000,
    adminUrl: "",
    whatsappNumber: "628989834130"
});
```

This repo includes an optional Vercel serverless proxy at:

```text
api/subscription/status.js
```

Set these environment variables in Vercel:

- `SUBSCRIPTION_API_URL` — the real upstream API that checks vouchers, invoices, users, or subscriptions.
- `SUBSCRIPTION_API_METHOD` — use `POST` or `GET`; defaults to `POST`.
- `SUBSCRIPTION_QUERY_PARAM` — the field name expected by the upstream API; defaults to `query`.
- `SUBSCRIPTION_API_TOKEN` — optional Bearer token, kept on the server so it does not leak into the browser.
- `SUBSCRIPTION_API_TIMEOUT_MS` — optional upstream timeout; defaults to `7000` ms.

A successful upstream response can look like this:

```json
{
  "success": true,
  "found": true,
  "message": "Langganan aktif",
  "data": {
    "status": "Aktif",
    "paket": "Daily Access",
    "berakhirPada": "2026-08-01T23:59:00+07:00"
  }
}
```

If the upstream server is missing, unreachable, too slow, returns junk instead of JSON, or cannot find the requested record, the UI shows:

```text
Gagal memeriksa ke sisi server.
```

No fake success state, no random green checkmark, no guessing.

## Using your own API without Vercel

You can point `statusApiUrl` straight at an external HTTPS endpoint:

```js
statusApiUrl: "https://api.example.com/subscription/status"
```

Just make sure that server:

- accepts the request format used by the frontend;
- returns valid JSON;
- allows CORS from the portal origin;
- uses HTTPS; and
- is added to the MikroTik Walled Garden when needed before login.

Do not put secret API keys inside `config.js`. Anything in that file is visible to the browser. Keep secrets in the Vercel function or your own backend.

## Small config tweaks

Most deploy-specific values live in `assets/js/config.js`, so you do not need to dig through the main app code just to change a phone number or URL.

```js
window.HOTSPOT_CONFIG = Object.freeze({
    statusApiUrl: "/api/subscription/status",
    statusTimeoutMs: 8000,
    adminUrl: "https://admin.example.com",
    whatsappNumber: "628989834130"
});
```

- `statusApiUrl` controls where subscription checks are sent.
- `statusTimeoutMs` controls how long the browser waits before giving up.
- `adminUrl` points the **Portal admin** button somewhere useful. Leave it empty to keep the fallback message.
- `whatsappNumber` is used by the help/contact action. Use the international format without `+`, spaces, or dashes.

## Browser and performance notes

This portal avoids external font requests and keeps visual effects fairly modest on purpose. Captive portal browsers can be weird, older Android WebViews can be even weirder, and a login page should not need a gaming phone just to render smoothly.

The slider also respects reduced-motion preferences, pauses when the tab is hidden, and still works without relying on autoplay.

## Credits

Original design: **Rislam Febriansah Putra**  
Fixed build: **ridhoae303**
