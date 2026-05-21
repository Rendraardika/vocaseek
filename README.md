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

## Database Docker Opsional

Jika ingin memakai MySQL dari Docker, aktifkan profile `docker-db`:

```bash
docker compose --profile docker-db up -d
```

Untuk setup ini, arahkan `DOCKER_DB_HOST=mysql_db` di `.env`.

## Catatan Performa WSL

Jika Docker dijalankan dari WSL, project akan lebih cepat jika folder project berada di filesystem WSL, misalnya `~/vocaseek`, bukan di `/mnt/c` atau `/mnt/e`.

Database tetap bisa memakai Laragon Windows dengan `DOCKER_DB_HOST` berisi IP Windows dari command `ip route`.
