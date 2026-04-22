# Pocaseek Workspace

Struktur project sudah dipisah menjadi:

- `frontend/` untuk aplikasi React + Vite
- `backend/` untuk aplikasi Laravel API
- `archive/` untuk folder lama yang disisihkan agar workspace utama tetap rapi

## Menjalankan Frontend

```powershell
cd C:\laragon\www\pocaseek\frontend
npm install
npm run dev
```

Frontend memakai `.env` di folder `frontend` dan default API base URL ke `http://127.0.0.1:8000/api`.
Untuk tes dari HP di jaringan yang sama, jalankan frontend di host LAN (`VITE_DEV_SERVER_HOST=0.0.0.0`)
dan gunakan IP laptop pada `FRONTEND_URL`, `PUBLIC_FRONTEND_URL`, dan `VITE_API_BASE_URL`.

## Menjalankan Backend

```powershell
cd C:\laragon\www\pocaseek\backend
composer install
php artisan migrate
php artisan serve
```

Backend sudah memiliki file `.env`, key aplikasi, dan `database/database.sqlite` sebagai database lokal default.

## Catatan

- Jika ingin memakai MySQL, ubah konfigurasi `DB_*` di `backend/.env`.
- Jika frontend dijalankan di port selain `5173`, sesuaikan `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, dan `CORS_ALLOWED_ORIGINS` di `backend/.env`.
- Jika link email ingin bisa dibuka di device lain, jangan gunakan `localhost` untuk `PUBLIC_FRONTEND_URL`;
  gunakan IP LAN laptop seperti `http://192.168.100.160:5173`.
