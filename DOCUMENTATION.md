# Tài liệu Dự án Belleza Lab 🎨

Chào mừng bạn đến với **Belleza Lab**, một ứng dụng phân tích nghệ thuật và tư vấn chiến lược màu sắc chuyên nghiệp được hỗ trợ bởi trí tuệ nhân tạo Gemini (Belle).

---

## 1. Cấu trúc Thư mục (Project Structure)

```text
├── src/
│   ├── services/
│   │   └── geminiService.ts # Logic kết nối với Google Gemini API
│   ├── App.tsx              # File chính chứa toàn bộ giao diện (MUI) và logic
│   ├── main.tsx             # Điểm khởi đầu của ứng dụng React
│   └── index.css            # Custom animations (Aurora, Shimmer, Particles)
├── public/                  # Các tài nguyên tĩnh
├── package.json             # Danh sách dependencies (MUI, Framer Motion, v.v.)
├── tsconfig.json            # Cấu hình TypeScript cho MUI & React
└── vite.config.ts           # Cấu hình Vite (loại bỏ Tailwind plugin)
```

---

## 2. Các thư viện NPM và Tác dụng (Dependencies)

| Thư viện | Tác dụng |
| :--- | :--- |
| `@google/genai` | Thư viện chính kết nối với mô hình Gemini AI. |
| `@mui/material` | Framework UI chính (thay thế cho Tailwind CSS). |
| `@emotion/react` | Engine xử lý style cho Material UI. |
| `motion` (Framer Motion) | Xử lý các hiệu ứng chuyển động và animation 3D nâng cao. |
| `lucide-react` | Bộ sưu tập icon vector cao cấp. |
| `browser-image-compression` | Nén ảnh trước khi gửi AI để tăng tốc độ xử lý. |
| `chroma-js` | Xử lý các phép toán màu sắc và độ tương phản. |
| `html-to-image` | Chuyển đổi HTML thành ảnh PNG để tải về. |

---

## 3. Chi tiết các File quan trọng

### 📂 `src/App.tsx` (Trái tim của ứng dụng)
Đây là file quan trọng nhất, đã được chuyển đổi sang **Material UI**:
- **ThemeProvider:** Quản lý Dark Theme tùy chỉnh (Gold & Blue accents).
- **MUI Components:** Sử dụng `Box`, `Paper`, `Stack` thay cho div/flexbox truyền thống.
- **Glassmorphism:** Các thẻ UI được thiết kế với độ mờ (blur) cao và viền kính siêu mỏng.
- **Components nội bộ:**
    - `PaletteCard`: Thẻ màu phong cách Art Gallery.
    - `ColorFlipCard`: Thẻ màu 3D sử dụng `motion` để lật xem công thức.
    - `ArtLoader`: Animation chờ mang phong cách huyền ảo.

### 📂 `src/services/geminiService.ts` (Bộ não AI)
File này chịu trách nhiệm giao tiếp với "Belle":
- **`analyzeArt`:** Hàm chính gửi ảnh và prompt sang Gemini. Nó có 2 chế độ:
    - *Chế độ Hoàn thiện:* Nhận xét về bố cục, màu sắc và sự hài hòa.
    - *Chế độ Phác thảo (Sketch):* Đề xuất bảng màu và hướng dẫn tô màu.
- **`chatWithBelle`:** Xử lý logic trò chuyện liên tục, giữ ngữ cảnh của bức tranh để trả lời các câu hỏi của người dùng.
- **Prompt Engineering:** Chứa các câu lệnh (prompts) được thiết kế tỉ mỉ để AI trả về dữ liệu đúng cấu trúc JSON.

### 📂 `src/index.css` (Animations & Redesign)
Không còn sử dụng Tailwind CSS, file này hiện tập trung vào các animations nghệ thuật:
- **Aurora Background:** Hiệu ứng các "quang cầu" màu sắc trôi lơ lửng ở nền.
- **Logo Shimmer:** Hiệu ứng ánh kim chạy dọc chữ "Belleza Lab".
- **Particles:** Các hạt sáng trôi nổi trong khu vực upload.
- **Shimmer Sweep:** Hiệu ứng loading cho các phần tử skeleton.

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
