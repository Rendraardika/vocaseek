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
