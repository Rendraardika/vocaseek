# Vocaseek Frontend

Frontend memakai React + Vite.

## Menjalankan Lewat Docker

Dari root project:

```bash
docker compose up -d react_app
```

URL lokal:

```txt
http://localhost:5173
```

Default API base URL:

```txt
http://127.0.0.1:8001/api
```

## Menjalankan Tanpa Docker

```bash
cd frontend
npm install
npm run dev
```

Jika backend memakai port berbeda, ubah `VITE_API_BASE_URL` di `frontend/.env`.
