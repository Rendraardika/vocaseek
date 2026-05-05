# Menggunakan Node.js versi terbaru (LTS)
FROM node:20-alpine

WORKDIR /app

# Copy package.json dan install dulu agar build lebih cepat (caching)
COPY package*.json ./
RUN npm install

# Copy semua file frontend
COPY . .

EXPOSE 3000

# Jalankan server development React (Vite/CRA)
CMD ["npm", "run", "dev", "--", "--host"]