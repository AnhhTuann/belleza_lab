# Deploy Belleza Lab lên VPS (Oracle Cloud)

> Stack: React + Vite (frontend) | Express + PostgreSQL (backend) | Docker Compose | Nginx
> Domain: `bellezalab.duckdns.org`

---

## Kiến trúc

```
Internet (port 80/443)
    └── Nginx (host)
            ├── GET /api/*    → proxy → Docker backend (127.0.0.1:3000)
            ├── GET /healthz  → proxy → Docker backend (127.0.0.1:3000)
            └── GET /*        → static files (/var/www/bellezalab)

Docker Compose:
    belleza_postgres  (127.0.0.1:5432) - internal only
    belleza_app       (127.0.0.1:3000) - internal only
```

---

## Lần đầu setup VPS (nếu chưa làm)

### 1. Cài Docker & Nginx

```bash
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Cài Nginx
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### 2. Mở port trên Oracle Cloud

Vào **Oracle Cloud Console → Networking → Virtual Cloud Networks → Security Lists**:
- Thêm Ingress Rule: **TCP port 80** (HTTP)
- Thêm Ingress Rule: **TCP port 443** (HTTPS)

Và mở firewall trên VM:
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## Deploy lần đầu

### 1. Clone repo lên server

```bash
git clone https://github.com/YOUR_USERNAME/belleza_lab.git /home/ubuntu/belleza_lab
cd /home/ubuntu/belleza_lab
```

### 2. Tạo file `.env` production

```bash
cp .env.example .env
nano .env
```

Điền các giá trị thực:
```env
POSTGRES_PASSWORD=<openssl rand -hex 32>
GEMINI_API_KEY=<your Gemini API key>
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://bellezalab.duckdns.org
APP_URL=https://bellezalab.duckdns.org
DATABASE_URL=postgresql://belleza:<POSTGRES_PASSWORD>@localhost:5432/belleza
AI_MONTHLY_BUDGET_USD=5
```

### 3. Build và chạy Docker Compose

```bash
docker compose build
docker compose up -d

# Kiểm tra containers
docker compose ps

# Xem logs backend
docker compose logs -f app
```

### 4. Setup Nginx

```bash
# Copy config
sudo cp nginx/bellezalab.conf /etc/nginx/sites-available/bellezalab

# Enable site
sudo ln -s /etc/nginx/sites-available/bellezalab /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Copy frontend dist (lần đầu)
sudo mkdir -p /var/www/bellezalab
CONTAINER=$(docker compose ps -q app)
docker cp "$CONTAINER:/app/dist/." /var/www/bellezalab/
sudo chown -R www-data:www-data /var/www/bellezalab

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Thêm SSL với Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx

# Lấy SSL cert
sudo certbot --nginx -d bellezalab.duckdns.org

# Auto-renew
sudo systemctl enable certbot.timer
```

### 6. Kiểm tra

```bash
# Backend health
curl http://127.0.0.1:3000/healthz
# → {"ok":true}

# Qua Nginx
curl http://bellezalab.duckdns.org/healthz
# → {"ok":true}

# Mở browser: https://bellezalab.duckdns.org
```

---

## Deploy lần sau (cập nhật code)

```bash
cd /home/ubuntu/belleza_lab
./deploy.sh
```

> Script tự động: pull code → build → restart → copy dist → xong ✅

---

## Troubleshooting

| Vấn đề | Lệnh kiểm tra |
|--------|---------------|
| Backend không lên | `docker compose logs app` |
| DB connection fail | `docker compose logs postgres` |
| Nginx 502 Bad Gateway | `curl http://127.0.0.1:3000/healthz` |
| Nginx config lỗi | `sudo nginx -t` |
| Frontend không cập nhật | Chạy `./deploy.sh` lại |
| Xem tất cả containers | `docker compose ps` |
| Restart một service | `docker compose restart app` |
| Auth cookie lỗi | Kiểm tra `BETTER_AUTH_URL` trong `.env` = domain thật |

---

## Ports Reference

| Service | Bind | Expose ra ngoài |
|---------|------|----------------|
| PostgreSQL | `127.0.0.1:5432` | ❌ Không |
| Backend API | `127.0.0.1:3000` | ❌ Không (qua Nginx) |
| Nginx HTTP | `0.0.0.0:80` | ✅ Port 80 |
| Nginx HTTPS | `0.0.0.0:443` | ✅ Port 443 (sau Certbot) |
