# 🚀 Modern Mikrotik Hotspot Login Template

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)]()
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)]()
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]()

Template halaman login Hotspot Mikrotik modern dengan desain **Premium Glassmorphism**. Dibuat khusus untuk memberikan pengalaman login WiFi yang elegan, responsif, dan mirip dengan aplikasi *mobile* native. Sangat cocok untuk usaha RT/RW Net, Warkop, Cafe, maupun jaringan sekolah/kampus.

## ✨ Fitur Unggulan

*   **🎨 Premium Glassmorphism UI:** Desain tembus pandang (efek kaca buram) bergaya modern.
*   **📱 Mobile-First Design:** Tampilan sangat dioptimalkan untuk pengguna *smartphone*.
*   **🍔 Interactive Navigation:** Dilengkapi dengan *Sidebar Drawer* (kiri) dan *Dropdown Menu* (kanan atas) untuk navigasi yang bersih.
*   **🖼️ Hero Carousel:** Banner slider otomatis untuk mempromosikan paket/voucher.
*   **⚡ Ringan & Cepat:** Murni menggunakan HTML5, CSS3, dan Vanilla JavaScript (Tanpa Framework). Sangat ringan dan tidak membebani *storage* RouterOS Mikrotik.
*   **🔍 Status Checker:** Tersedia UI khusus untuk simulasi form pelanggan mengecek masa aktif vouchernya.

## 🌐 Live Preview

Kamu bisa melihat demo langsung dari template ini melalui link berikut:
👉 **[Live Demo Hotspot Login](https://hotspot-login-indihome.vercel.app/)**

## 🛠️ Cara Penggunaan (Instal ke Mikrotik via Aplikasi WinBox)

Karena file utama di repositori ini bernama `index.html` (agar bisa di-preview online via Vercel atau Website pribadi dengan Hosting serta Domain pribadi), kamu harus mengubah nama file index.html ini menjadi `login.html` saat akan dimasukkan ke MikroTik. Saat ini template ini berada dalam versi **Front-End Preview** untuk kebutuhan penyesuaian UI/UX. Untuk menggunakannya langsung di RouterOS Mikrotik:

**Langkah-langkah pemasangan:**
1. Download repositori ini dengan klik tombol hijau **Code** -> **Download ZIP**, lalu ekstrak file ZIP tersebut di laptop kamu.
2. Ubah nama file `index.html` menjadi `login.html`.
3. Buka aplikasi **Winbox** dan login ke router MikroTik kamu.
4. Pada menu sebelah kiri, klik menu **Files**.
5. Cari folder direktori hotspot aktif kamu (biasanya bernama `hotspot` atau `flash/hotspot`). 
   *(Tips: Kamu bisa memastikannya lewat menu IP > Hotspot > Server Profiles > lihat kolom "HTML Directory").*
6. **Drag and drop** (seret dan lepas) file `login.html` beserta folder `assets` dari laptop kamu ke dalam folder `hotspot` di jendela *Files* Winbox. Timpa (*replace*) file bawaan yang sudah ada.
7. Selesai! Silakan hubungkan perangkat ke jaringan WiFi hotspot kamu untuk melihat tampilan barunya.

> **⚠️ Catatan Penting untuk Fungsionalitas Login:**
> File di repositori ini merupakan desain **Front-End Preview**. Agar form login bisa benar-benar mengautentikasi *user* di MikroTik, buka file `login.html` dengan *text editor* (seperti VS Code atau Notepad), lalu pastikan tag `<form>` dan `<input>` disesuaikan dengan variabel bawaan MikroTik.
> 
> Ubah tag form dari:
> `<form onsubmit="prosesLogin(event)">`
> Menjadi:
> `<form name="login" action="$(link-login-only)" method="post">`
> `<input type="hidden" name="dst" value="$(link-orig)" />`
> `<input type="hidden" name="popup" value="true" />`

## 👨‍💻 Author

Dibuat dan dikembangkan oleh **Rislam Febriansah Putra**.

*Open-source* dan bebas digunakan serta dimodifikasi untuk komunitas jaringan. Jika template ini membantu *project* jaringan kamu, jangan lupa klik tombol ⭐ **Star** di pojok kanan atas repository ini!
