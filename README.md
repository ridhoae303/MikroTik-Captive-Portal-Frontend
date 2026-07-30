# Zizu MikroTik Hotspot Login - Fixed Build

Versi ini merapikan template asli agar lebih cocok dipakai sebagai halaman login Wi-Fi/Hotspot MikroTik, bukan sekadar demo front-end.

## Yang diperbaiki

- Layout default dibuat ringkas dan responsif. Pada tablet/desktop, navigasi berubah menjadi sidebar vertikal permanen; pada ponsel tetap menjadi drawer hamburger.
- Navbar kanan/kiri dan bottom navigation yang redundan sudah digabung menjadi satu sistem navigasi.
- Slider sekarang mendukung swipe/drag, tombol sebelumnya/berikutnya, dot navigation, keyboard, dan autoplay yang berhenti saat tab tidak aktif.
- Efek blur, animasi, font eksternal, dan transition berlebihan dikurangi agar halaman lebih ringan di perangkat murah dan captive portal WebView. Gambar QR juga dioptimalkan ke WebP lossless.
- Semua `alert()` bawaan browser diganti dengan dialog dan halaman UI internal.
- Form login memakai variabel MikroTik asli dan mendukung voucher username=password, termasuk HTTP CHAP melalui MD5 lokal.
- Pengecekan status tidak lagi memberikan hasil palsu. Front-end melakukan request ke server dan hanya menampilkan data saat server memberikan respons valid.
- Halaman Panduan, Syarat Layanan, Bantuan, serta dialog pembayaran QRIS sudah dilengkapi.
- Penanganan input, timeout server, respons non-JSON, navigasi, fokus keyboard, reduced motion, dan error MikroTik ikut dirapikan.
- Ikon promo dan simbol hak cipta sekarang encoding-safe: source halaman utama hanya memakai ASCII, HTML entities, CSS escapes, dan inline SVG agar tidak berubah menjadi mojibake di captive portal.

## Struktur penting

```text
index.html
assets/css/app.css
assets/js/config.js
assets/js/md5.js
assets/js/app.js
api/subscription/status.js
vercel.json
```

## Pasang ke MikroTik

1. Gunakan file `login.html` yang sudah disertakan. `index.html` tetap tersedia untuk preview/hosting.
2. Upload `login.html` dan seluruh folder `assets` ke direktori Hotspot MikroTik.
3. Pastikan metode login Hotspot mengizinkan `http-chap` atau `http-pap` sesuai profil router.
4. Tambahkan domain API status ke **IP > Hotspot > Walled Garden** apabila status diperiksa sebelum pengguna berhasil login.

Form login sudah berisi variabel berikut:

```html
<form action="$(link-login-only)" method="post">
<input name="dst" value="$(link-orig)">
<input name="popup" value="true">
```

Pada mode preview biasa, tombol login akan menampilkan dialog bahwa file harus dipasang pada MikroTik. Tidak ada pesan sukses palsu.

## Hubungkan pengecekan status ke server nyata

Front-end membaca endpoint dari `assets/js/config.js`:

```js
statusApiUrl: "/api/subscription/status"
```

Project menyertakan fungsi Vercel di `api/subscription/status.js`. Atur Environment Variables berikut di Vercel:

- `SUBSCRIPTION_API_URL` - URL server/database kamu yang benar-benar memeriksa transaksi atau voucher.
- `SUBSCRIPTION_API_METHOD` - `POST` (default) atau `GET`.
- `SUBSCRIPTION_QUERY_PARAM` - nama field query yang diminta server, default `query`.
- `SUBSCRIPTION_API_TOKEN` - opsional; dikirim sebagai Bearer token dari sisi server, tidak bocor ke browser.
- `SUBSCRIPTION_API_TIMEOUT_MS` - opsional, default 7000 ms.

Contoh respons sukses upstream:

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

Respons gagal, timeout, endpoint belum dikonfigurasi, data tidak ditemukan, atau respons bukan JSON akan menghasilkan pesan:

```text
Gagal memeriksa ke sisi server.
```

Jika halaman dijalankan langsung dari MikroTik tanpa Vercel, ubah `statusApiUrl` menjadi URL HTTPS API eksternal kamu. Server tersebut wajib mengizinkan CORS untuk domain/origin portal dan harus dimasukkan ke Walled Garden.

## Konfigurasi lain

Edit `assets/js/config.js` untuk mengatur nomor WhatsApp, URL portal admin, timeout, dan endpoint status.

```js
window.HOTSPOT_CONFIG = Object.freeze({
    statusApiUrl: "/api/subscription/status",
    statusTimeoutMs: 8000,
    adminUrl: "https://admin.example.com",
    whatsappNumber: "628989834130"
});
```

## Kredit

Original design: Rislam Febriansah Putra  
Fixed build: ridhoae303
