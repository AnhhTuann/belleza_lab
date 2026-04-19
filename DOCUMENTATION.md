# Tài liệu Dự án Belleza Lab 🎨

Chào mừng bạn đến với **Belleza Lab**, một ứng dụng phân tích nghệ thuật và tư vấn chiến lược màu sắc chuyên nghiệp được hỗ trợ bởi trí tuệ nhân tạo Gemini (Belle).

---

## 1. Cấu trúc Thư mục (Project Structure)

```text
├── src/
│   ├── components/            # Các Components bóc tách (UI, Layout, Chat, Palette...)
│   ├── hooks/                 # Custom Hooks quản lý trạng thái (useAppTheme, useArtAnalyzer, userBelleChat)
│   ├── services/
│   │   └── geminiService.ts   # Logic kết nối với Google Gemini API
│   ├── theme/
│   │   └── index.ts           # Hệ thống cấu hình màu sắc (DARK / LIGHT objects)
│   ├── App.tsx                # Component gốc dùng để kết nối các Layout
│   ├── main.tsx               # Điểm khởi đầu của ứng dụng React
│   └── index.css              # Custom animations (Aurora, Shimmer, Particles)
├── public/                    # Các tài nguyên tĩnh
├── package.json               # Danh sách dependencies
├── tsconfig.json              # Cấu hình TypeScript
└── vite.config.ts             # Cấu hình Vite
```

---

## 2. Các thư viện NPM và Tác dụng (Dependencies)

| Thư viện                    | Tác dụng                                                 |
| :-------------------------- | :------------------------------------------------------- |
| `@google/genai`             | Thư viện chính kết nối với mô hình Gemini AI.            |
| `@mui/material`             | Framework UI chính (thay thế cho Tailwind CSS).          |
| `@emotion/react`            | Engine xử lý style cho Material UI.                      |
| `motion` (Framer Motion)    | Xử lý các hiệu ứng chuyển động và animation 3D nâng cao. |
| `lucide-react`              | Bộ sưu tập icon vector cao cấp.                          |
| `browser-image-compression` | Nén ảnh trước khi gửi AI để tăng tốc độ xử lý.           |
| `chroma-js`                 | Xử lý các phép toán màu sắc và độ tương phản.            |
| `html-to-image`             | Chuyển đổi HTML thành ảnh PNG để tải về.                 |

---

## 3. Chi tiết các File quan trọng

### 📂 Thư mục `src/components/`, `src/hooks/` & `src/App.tsx` (Kiến trúc linh hoạt)

Ứng dụng áp dụng thiết kế Clean Architecture để tái sử dụng mã nguồn hiệu quả:

- **`App.tsx`:** Container chính gọn nhẹ, chịu trách nhiệm kết nối Layout (Main Content, Sidebar).
- **`src/hooks/`**: Toàn bộ Logic quản lý state, API, Upload ảnh được tách biệt rõ ràng (`useArtAnalyzer`, `useBelleChat`, `useAppTheme`).
- **`src/theme/`**: Quản lý thiết kế Dark Theme/Light Theme cùng các màu nền.
- **`src/components/`**: Các mảnh ghép UI UI chuyên biệt:
  - `PaletteCard`: Thẻ màu tải xuống phong cách Minimalist Gallery.
  - `ColorFlipCard`: Thẻ màu 3D xoay lật công thức (Framer Motion).
  - `BelleChatBox`: Giao diện chatbot tự động auto-scroll nhẹ nhàng với bóng viền glassmorphism.
  - `ArtLoader`: Animation hạt sáng, quang cầu lúc chờ API phản hồi.

### 📂 `src/services/geminiService.ts` (Bộ não AI)

File này chịu trách nhiệm giao tiếp với "Belle":

- **`analyzeArt`:** Hàm chính gửi ảnh và prompt sang Gemini. Nó có 2 chế độ:
  - _Chế độ Hoàn thiện:_ Nhận xét về bố cục, màu sắc và sự hài hòa.
  - _Chế độ Phác thảo (Sketch):_ Đề xuất bảng màu và hướng dẫn tô màu.
- **`chatWithBelle`:** Xử lý logic trò chuyện liên tục, giữ ngữ cảnh của bức tranh để trả lời các câu hỏi của người dùng.
- **Prompt Engineering:** Chứa các câu lệnh (prompts) được thiết kế tỉ mỉ để AI trả về dữ liệu đúng cấu trúc JSON.

### 📂 `src/index.css` (Animations & Redesign)

Không còn sử dụng Tailwind CSS, file này hiện tập trung vào các animations nghệ thuật:

- **Aurora Background:** Hiệu ứng các "quang cầu" màu sắc trôi lơ lửng ở nền.
- **Logo Shimmer:** Hiệu ứng ánh kim chạy dọc chữ "Belleza Lab".
- **Particles:** Các hạt sáng trôi nổi trong khu vực upload.
- **Shimmer Sweep:** Hiệu ứng loading cho các phần tử skeleton.

---

## 4. Chức năng của Belleza Lab

Dưới đây là các tính năng cốt lõi giúp Belleza Lab trở thành người bạn đồng hành lý tưởng cho nghệ sĩ:

### 🎨 Phân tích & Tối ưu Nghệ thuật

- **Nhận diện Chất liệu:** AI tự động dự đoán loại màu (Sơn dầu, Màu nước, Acrylic...) và đưa ra phân tích về đặc tính kỹ thuật.
- **Trích xuất Bảng màu:** Tự động lấy các mã màu HEX chính xác đang hiện diện trong tác phẩm.
- **Phê bình Chuyên sâu:** Belle đưa ra nhận xét về bố cục, sự hài hòa màu sắc và cảm quan nghệ thuật.
- **Tư vấn Cải thiện:** Chỉ ra các màu sắc chưa phù hợp (Unfit colors) và đề xuất màu thay thế để tăng tính thẩm mỹ.

### 📝 Chế độ Phác thảo (Sketch Mode)

- **Hỗ trợ từ bước đầu:** Dành cho các bản vẽ nét (line art). AI đề xuất bảng màu 6 màu hoàn chỉnh dựa trên tâm trạng (Mood) và phong cách (Style) bạn chọn.
- **Hướng dẫn tô màu (Placement Guide):** Cung cấp mô tả chi tiết vị trí nên sử dụng từng màu sắc trên bản vẽ.

### 🤖 Trợ lý ảo Belle (AI Art Muse)

- **Trò chuyện trực tiếp:** Khung chat cho phép bạn hỏi Belle bất cứ điều gì về hội họa, từ cách pha màu đến ý tưởng sáng tạo.
- **Ghi nhớ ngữ cảnh:** Belle hiểu sâu sắc về bức tranh bạn đang làm việc để đưa ra lời khuyên cá nhân hóa nhất.

### 🧪 Công thức Pha màu (Mixing Guide)

- **Thẻ lật 3D:** Click vào từng màu sắc để xem hướng dẫn pha màu chi tiết dựa trên loại màu bạn đang dùng (Màu bột, Màu nước...).
- **Tính toán tỉ lệ:** Các gợi ý pha màu giúp nghệ sĩ đạt được sắc độ chính xác như AI đề xuất.

### 📥 Xuất thẻ Nghệ thuật (Artist Palette Card)

- **Lưu giữ kỷ niệm:** Chuyển đổi toàn bộ kết quả phân tích thành một tấm thẻ màu (Palette Card) chuyên nghiệp.
- **Tải về PNG:** Dễ dàng lưu về máy để chia sẻ lên mạng xã hội hoặc làm tư liệu tham khảo cho các bài vẽ sau.

### 🌗 Trải nghiệm Người dùng Cao cấp

- **Dual Theme:** Chuyển đổi linh hoạt giữa "The Night Gallery" (Tối, điểm nhấn Vàng Champagne) và "The Minimalist Studio" (Sáng, điểm nhấn Xanh Navy).
- **Thiết kế Glassmorphism:** Giao diện hiện đại với hiệu ứng kính mờ và chuyển động mượt mà.

---

## 5. Cách thức hoạt động của các Luồng chính (System Workflow)

1.  **Phân tích Ảnh (Art Analysis):**
    - Người dùng chọn ảnh -> `App.tsx` nén ảnh -> `geminiService.ts` gửi ảnh + prompt -> Gemini trả về JSON -> `App.tsx` hiển thị bảng màu và nhận xét.
2.  **Chế độ Phác thảo (Sketch Mode):**
    - Khi bật "Đây là tranh phác thảo", AI sẽ không tìm lỗi màu mà sẽ đóng vai trò là người tư vấn, đề xuất 6 màu phù hợp với tâm trạng của nét vẽ.
3.  **Lưu Thẻ Màu (Palette Card):**
    - Sau khi nhấn "Final Review" và nhận lời khen từ Belle, một modal hiện ra. Sử dụng `html-to-image` để kết xuất vùng dữ liệu thành file `.png` chất lượng cao.
4.  **Tương tác lật 3D (Flip Cards):**
    - Mỗi màu trong bảng màu là một `ColorFlipCard`. Khi click, nó sẽ xoay 180 độ để lộ ra công thức pha màu chi tiết do AI tính toán.

---

_Tài liệu này được tạo ra để giúp bạn dễ dàng quản lý và phát triển dự án Belleza Lab._
