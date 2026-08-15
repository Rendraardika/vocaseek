# Vocaseek Workspace

Vocaseek terdiri dari:

- `frontend/` untuk aplikasi React + Vite
- `backend/` untuk aplikasi Laravel API
- `docker-compose.yml` untuk menjalankan frontend, backend, queue, dan database Docker opsional

## Setup Docker + Laragon MySQL

Setup utama saat ini adalah:

```txt
React Docker -> Laravel Docker -> MySQL Laragon Windows
```

Backend Docker memakai port host `8001` agar tidak bentrok dengan project lain yang memakai `8000`.

1. Salin konfigurasi root:

```bash
cp .env.example .env
```

2. Jika menjalankan Docker dari WSL, ambil IP Windows host:

```bash
ip route | awk '/default/ {print $3}'
```

3. Isi `.env` root:

```env
DOCKER_DB_HOST=172.x.x.x
DOCKER_DB_PORT=3306
DOCKER_DB_DATABASE=vocaseek
DOCKER_DB_USERNAME=vocaseek_user
DOCKER_DB_PASSWORD=vocaseek_pass
BACKEND_PORT=8001
```

4. Buat user MySQL di Laragon/HeidiSQL:

```sql
CREATE DATABASE IF NOT EXISTS vocaseek;
CREATE USER IF NOT EXISTS 'vocaseek_user'@'%' IDENTIFIED BY 'vocaseek_pass';
GRANT ALL PRIVILEGES ON vocaseek.* TO 'vocaseek_user'@'%';
FLUSH PRIVILEGES;
```

5. Jalankan aplikasi:

```bash
docker compose up --build -d
docker exec laravel_api php artisan migrate
```

URL lokal:

- Frontend: `http://localhost:5173`
- Backend/API: `http://localhost:8001/api`

## Konfigurasi Environment

Project ini memakai beberapa file environment dengan fungsi berbeda:

- `.env` di root workspace dipakai oleh `docker-compose.yml`.
- `backend/.env` dipakai oleh Laravel API.
- `frontend/.env` dipakai oleh React + Vite.

Jangan menyalin semua isi env production ke frontend. Frontend hanya membutuhkan variabel `VITE_*`, sedangkan konfigurasi Laravel seperti `APP_KEY`, database, mail, Sanctum, CORS, dan Google secret harus berada di `backend/.env`.

### Backend Local

Untuk pengembangan lokal, `backend/.env` biasanya memakai:

```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5173
PASSWORD_RESET_URL=http://localhost:5173

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,localhost:8001,127.0.0.1:8001
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DB_CONNECTION=mysql
DB_HOST=172.x.x.x
DB_PORT=3306
DB_DATABASE=vocaseek
DB_USERNAME=vocaseek_user
DB_PASSWORD=vocaseek_pass

LOG_LEVEL=debug
CACHE_STORE=database
```

Jika backend berjalan dari Docker/WSL dan database berada di Laragon Windows, isi `DB_HOST` dengan IP Windows host yang didapat dari:

```bash
ip route | awk '/default/ {print $3}'
```

### Backend Production Hostinger

Untuk production, `backend/.env` harus diarahkan ke domain dan database hosting:

```env
APP_NAME=Vocaseek
APP_ENV=production
APP_DEBUG=false
APP_URL=https://orange-rat-340752.hostingersite.com
FRONTEND_URL=https://linen-lion-266631.hostingersite.com
PASSWORD_RESET_URL=https://linen-lion-266631.hostingersite.com

SANCTUM_STATEFUL_DOMAINS=linen-lion-266631.hostingersite.com,orange-rat-340752.hostingersite.com
CORS_ALLOWED_ORIGINS=https://linen-lion-266631.hostingersite.com,https://orange-rat-340752.hostingersite.com

LOG_LEVEL=error
CACHE_STORE=file

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_database_hosting
DB_USERNAME=user_database_hosting
DB_PASSWORD=password_database_hosting
```

Pastikan `APP_KEY`, password database, password SMTP, password admin, dan Google OAuth secret diisi dari kredensial production yang valid. Nilai secret tidak boleh disimpan di dokumentasi atau commit git.

Google OAuth production sebaiknya dipisah seperti ini:

```env
GOOGLE_CLIENT_ID=client-id-production.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=client-secret-production
GOOGLE_REDIRECT_URL=https://orange-rat-340752.hostingersite.com/api/auth/google/callback
```

Jangan menempel URL callback ke `GOOGLE_CLIENT_SECRET`. Callback URL harus berada di `GOOGLE_REDIRECT_URL` dan juga didaftarkan di Google Cloud Console sebagai authorized redirect URI.

### Frontend Local dan Production

Untuk lokal, `frontend/.env` mengarah ke backend lokal:

```env
VITE_API_BASE_URL=http://localhost:8001/api
VITE_AUTH_LOGIN_ENDPOINT=/login
VITE_AUTH_REGISTER_ENDPOINT=/register
VITE_AUTH_LOGOUT_ENDPOINT=/logout
VITE_AUTH_FORGOT_PASSWORD_ENDPOINT=/forgot-password
VITE_AUTH_VALIDATE_RESET_TOKEN_ENDPOINT=/forgot-password/validate-token
VITE_AUTH_RESET_PASSWORD_ENDPOINT=/reset-password
VITE_AUTH_GOOGLE_ENDPOINT=/auth/google
VITE_AUTH_GOOGLE_TOKEN_ENDPOINT=/auth/google/token
VITE_GOOGLE_CLIENT_ID=client-id-local.apps.googleusercontent.com
```

Untuk production, ubah API base URL dan Google client ID frontend:

```env
VITE_API_BASE_URL=https://orange-rat-340752.hostingersite.com/api
VITE_GOOGLE_CLIENT_ID=client-id-production.apps.googleusercontent.com
```

Setelah mengubah env frontend, build ulang aplikasi frontend agar nilai `VITE_*` ikut masuk ke bundle:

```bash
npm run build
```

## Database Docker Opsional

Jika ingin memakai MySQL dari Docker, aktifkan profile `docker-db`:

```bash
docker compose --profile docker-db up -d
```

Untuk setup ini, arahkan `DOCKER_DB_HOST=mysql_db` di `.env`.

## Catatan Performa WSL

Jika Docker dijalankan dari WSL, project akan lebih cepat jika folder project berada di filesystem WSL, misalnya `~/vocaseek`, bukan di `/mnt/c` atau `/mnt/e`.

Database tetap bisa memakai Laragon Windows dengan `DOCKER_DB_HOST` berisi IP Windows dari command `ip route`.
