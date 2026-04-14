# Tài liệu Dự án Belleza Lab 🎨

Chào mừng bạn đến với **Belleza Lab**, một ứng dụng phân tích nghệ thuật và tư vấn chiến lược màu sắc chuyên nghiệp được hỗ trợ bởi trí tuệ nhân tạo Gemini (Belle).

---

## 1. Cấu trúc Thư mục (Project Structure)

```text
├── src/
│   ├── components/          # Các thành phần UI tái sử dụng (nếu có)
│   ├── services/
│   │   └── geminiService.ts # Logic kết nối với Google Gemini API
│   ├── App.tsx              # File chính chứa toàn bộ giao diện và logic ứng dụng
│   ├── main.tsx             # Điểm khởi đầu của ứng dụng React
│   └── index.css            # File cấu hình Tailwind CSS và các hiệu ứng 3D
├── public/                  # Các tài nguyên tĩnh (hình ảnh, icons)
├── .env.example             # File mẫu cấu hình biến môi trường
├── package.json             # Danh sách các thư viện và script chạy dự án
├── tsconfig.json            # Cấu hình TypeScript
└── vite.config.ts           # Cấu hình công cụ đóng gói Vite
```

---

## 2. Các thư viện NPM và Tác dụng (Dependencies)

| Thư viện | Tác dụng |
| :--- | :--- |
| `@google/genai` | Thư viện chính để kết nối và gửi yêu cầu đến mô hình Gemini AI. |
| `react` & `react-dom` | Thư viện nền tảng để xây dựng giao diện người dùng theo component. |
| `vite` | Công cụ build cực nhanh giúp phát triển và đóng gói ứng dụng. |
| `tailwindcss` | Framework CSS giúp thiết kế giao diện nhanh chóng bằng các class tiện ích. |
| `motion` (Framer Motion) | Xử lý các hiệu ứng chuyển động, animation mượt mà và hiệu ứng 3D. |
| `lucide-react` | Bộ sưu tập các icon vector đẹp mắt và đồng bộ. |
| `browser-image-compression` | Nén hình ảnh ngay trên trình duyệt trước khi gửi lên AI để tiết kiệm băng thông và tăng tốc độ. |
| `chroma-js` | Xử lý các phép toán về màu sắc (tính độ tương phản, chuyển đổi hệ màu). |
| `html-to-image` | Chuyển đổi một vùng HTML (như Thẻ màu) thành hình ảnh PNG để người dùng tải về. |

---

## 3. Chi tiết các File quan trọng

### 📂 `src/App.tsx` (Trái tim của ứng dụng)
Đây là file quan trọng nhất, quản lý toàn bộ luồng hoạt động của người dùng:
- **Quản lý State:** Lưu trữ ảnh đã upload, kết quả phân tích, trạng thái chat, tab hiện tại, v.v.
- **Xử lý Upload:** Nhận diện file ảnh, nén ảnh và gọi dịch vụ phân tích.
- **Components nội bộ:**
    - `PaletteCard`: Giao diện thẻ màu nghệ thuật để tải về.
    - `ColorFlipCard`: Thẻ màu 3D có thể lật để xem công thức pha màu.
    - `ArtLoader`: Hiệu ứng chờ khi AI đang phân tích.
- **Giao diện chính:** Chia làm 2 phần (Main View để xem ảnh và Sidebar để xem kết quả/chat).

### 📂 `src/services/geminiService.ts` (Bộ não AI)
File này chịu trách nhiệm giao tiếp với "Belle":
- **`analyzeArt`:** Hàm chính gửi ảnh và prompt sang Gemini. Nó có 2 chế độ:
    - *Chế độ Hoàn thiện:* Nhận xét về bố cục, màu sắc và sự hài hòa.
    - *Chế độ Phác thảo (Sketch):* Đề xuất bảng màu và hướng dẫn tô màu.
- **`chatWithBelle`:** Xử lý logic trò chuyện liên tục, giữ ngữ cảnh của bức tranh để trả lời các câu hỏi của người dùng.
- **Prompt Engineering:** Chứa các câu lệnh (prompts) được thiết kế tỉ mỉ để AI trả về dữ liệu đúng cấu trúc JSON.

### 📂 `src/index.css` (Phong cách & Hiệu ứng)
Ngoài việc nạp Tailwind CSS, file này chứa các class tùy chỉnh cho hiệu ứng 3D:
- `perspective-1000`: Tạo chiều sâu cho không gian 3D.
- `preserve-3d`: Giữ cho các phần tử con nằm trong không gian 3D khi xoay.
- `backface-hidden`: Ẩn mặt sau của thẻ khi nó đang quay mặt trước về phía người dùng.

---

## 4. Cách thức hoạt động của các Chức năng chính

1.  **Phân tích Ảnh (Art Analysis):**
    - Người dùng chọn ảnh -> `App.tsx` nén ảnh -> `geminiService.ts` gửi ảnh + prompt -> Gemini trả về JSON -> `App.tsx` hiển thị bảng màu và nhận xét.
2.  **Chế độ Phác thảo (Sketch Mode):**
    - Khi bật "Đây là tranh phác thảo", AI sẽ không tìm lỗi màu mà sẽ đóng vai trò là người tư vấn, đề xuất 6 màu phù hợp với tâm trạng của nét vẽ.
3.  **Thẻ Màu (Palette Card):**
    - Sau khi nhấn "Final Review", một modal hiện ra. Sử dụng `html-to-image` để chụp lại vùng chứa thông tin và lưu thành file `.png`.
4.  **Thẻ lật 3D (Flip Cards):**
    - Mỗi màu trong bảng màu là một `ColorFlipCard`. Khi click, nó sẽ xoay 180 độ để lộ ra công thức pha màu (Mixing Guide) được AI tính toán riêng cho loại màu bạn chọn (Màu nước, Màu bột, v.v.).

---
*Tài liệu này được tạo ra để giúp bạn dễ dàng quản lý và phát triển dự án Belleza Lab.*
