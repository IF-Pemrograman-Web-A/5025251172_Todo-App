# 5025251172_Todo-App

Nama: Zainab Ammar Zahra <br>
NRP: 5025251172

## Description
[E05] The Offline Abyss - Progressive Web App (PWA)

## Preview

### Web App Manifest

`manifest.json` berisi nama aplikasi, `start_url`, `display: standalone`, warna tema, dan ikon (192x192 dan 512x512). Manifest di-link dari `index.php` lewat `<link rel="manifest" href="manifest.json">`.

<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/76951d52-12ca-4de1-8d75-223ba23f3474" />

<img width="1600" height="900" alt="image" src="https://github.com/user-attachments/assets/7fb01208-64f3-40d0-8f84-9833a380c263" />

### Service Worker

`service-worker.js` didaftarkan dari `script.js`. Saat event `install`, file berikut disimpan ke cache (precache): `style.css`, `script.js`, `img/bg.jpg`, `offline.html`, dan ikon aplikasi.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/0aac1e07-e80d-434d-8420-9774a1da9587" />

### Cache Storage

Isi cache hasil precache dapat dilihat di DevTools pada bagian Cache Storage.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/e255a0a1-f7da-4035-a33c-3102d23e10e1" />

### Caching Strategy

| Resource | Strategy | Alasan |
|---|---|---|
| Halaman (`index.php`, navigasi) | Network first, fallback ke `offline.html` | Isi task berasal dari database, jadi harus selalu data terbaru |
| Static files (CSS, JS, gambar, ikon) | Network first, fallback ke cache | File selalu terbaru saat online, tetap tersedia saat offline |
| Request non-GET (create, update, delete) | Tidak di-cache | Perubahan data harus langsung ke server |

### Install Button

Tombol **Install App** muncul di header saat browser mendeteksi aplikasi bisa di-install (event `beforeinstallprompt`), dan hilang setelah aplikasi ter-install.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/c49d2c1c-4e2c-4ff1-8530-1d13b9e249fa" />

### Offline Page

Saat network dimatikan lalu halaman di-reload, halaman offline tampil.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/af0269d5-3545-4bb6-be65-badbc43f5f9b" />

### Offline Test

Dengan network dimatikan (DevTools > Network > Offline), request halaman tetap dijawab oleh service worker, terlihat pada kolom Size yang bertuliskan (ServiceWorker).

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/59f81e6e-43b6-4790-beba-96e2b6033e96" />
