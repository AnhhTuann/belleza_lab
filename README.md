# Belleza Lab

Ứng dụng phân tích tranh, gợi ý bảng màu và trò chuyện cùng Belle. Frontend dùng React/Vite; API Express giữ Gemini API key ở server, Better Auth xử lý đăng nhập, và PostgreSQL lưu thông tin tài khoản cùng hạn mức sử dụng.

Giao diện hỗ trợ tiếng Việt và English. Ngôn ngữ ban đầu dựa trên cài đặt trình duyệt; lựa chọn được lưu trên thiết bị và áp dụng cho phản hồi AI mới.

## Chạy bằng Docker Compose

Cần Docker Engine và Docker Compose.

1. Tạo file môi trường và điền các giá trị bí mật:

   ```bash
   cp .env.example .env
   openssl rand -hex 32
   openssl rand -base64 32
   ```

   Dùng giá trị đầu tiên làm `POSTGRES_PASSWORD`, giá trị thứ hai làm `BETTER_AUTH_SECRET`, và điền Gemini API key vào `GEMINI_API_KEY`. Không đưa `.env` lên Git.

2. Khởi động ứng dụng và PostgreSQL:

   ```bash
   docker compose up -d --build
   docker compose ps
   ```

3. Mở `http://localhost:3000`. Có thể xem nhật ký bằng `docker compose logs -f app`; dừng ứng dụng bằng `docker compose down`. Dữ liệu PostgreSQL được lưu trong volume `postgres_data` và vẫn còn sau khi dừng container.

## Đưa lên máy chủ

- Cài Docker, cấu hình tên miền và HTTPS qua reverse proxy (ví dụ Caddy, Nginx hoặc dịch vụ tương đương).
- Trên máy chủ, đặt `APP_URL` và `BETTER_AUTH_URL` thành origin HTTPS công khai, ví dụ `https://app.example.com`. Nếu frontend có thêm origin hợp lệ, khai báo chúng trong `BETTER_AUTH_TRUSTED_ORIGINS` dưới dạng danh sách origin phân cách bằng dấu phẩy (không có dấu `/` cuối). Tạo secret và mật khẩu PostgreSQL riêng, mạnh; chỉ cho phép truy cập PostgreSQL từ mạng nội bộ Docker.
- Điền `GEMINI_API_KEY` ở biến môi trường server. Không đặt khóa Gemini trong frontend hoặc đưa `.env` vào image/repository.
- Mở cổng ứng dụng cần thiết qua reverse proxy; không công khai trực tiếp cổng PostgreSQL. Kiểm tra `/healthz` sau khi deploy.
- Cấu hình sao lưu PostgreSQL định kỳ và kiểm tra khả năng khôi phục trước khi sử dụng thật.

Docker Compose tự chờ PostgreSQL sẵn sàng; lệnh `npm start` chạy migration Better Auth trước khi khởi động API. Bảng theo dõi hạn mức được tạo khi server khởi động.

## Phát triển local

Cần Node.js 22+ và PostgreSQL đang chạy:

```bash
npm ci
cp .env.example .env
# Chỉnh DATABASE_URL trỏ tới PostgreSQL local và điền các giá trị secrets/API key.
npm run dev
```

Vite chạy giao diện trên `http://localhost:3000` và proxy `/api` tới Express trên cổng 3001. Nếu chạy bản preview (`npm run preview`, cổng mặc định `4173`), cần chạy API riêng bằng `npm run server`; preview cũng proxy `/api`. Localhost và 127.0.0.1 được tin cậy trong môi trường phát triển. Để chỉ build frontend: `npm run build`.

## Hạn mức và chi phí AI

- Mỗi tài khoản: tối đa 3 lần phân tích ảnh và 10 tin nhắn chat mỗi ngày.
- Ngân sách nội bộ mặc định: 5 USD/tháng. Có thể đặt lại bằng `AI_MONTHLY_BUDGET_USD`.
- Ngưỡng tiền là ước tính dựa trên số token API báo về và mức giá cấu hình; đây **không phải** billing cap của Google. Nó chỉ tính các yêu cầu qua server này, không tính API key bị dùng ở nơi khác. Hãy bật cảnh báo và theo dõi chi phí trong Google AI Studio/Google Cloud.
- Email/password hoạt động ngay sau khi đăng ký; nếu mở công khai, nên bổ sung xác minh email/SMTP và bảo vệ đăng ký để hạn chế tài khoản giả.

Ứng dụng dùng PostgreSQL tự host qua Docker Compose; không cần Neon.
