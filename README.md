# Mây Du Ký

Blog du lịch tiếng Việt, bố cục tham khảo phong cách blog Phượt KCT, với thương hiệu riêng và màu xanh dương / xanh lá cây. Dùng JavaScript thuần và Vite.

## Phát triển

Node.js 20.19+ hoặc 22.12+ và npm.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

```sh
npm run build
npm run preview
```

Tính năng: chuyên mục, tìm bài không phân biệt dấu, đọc bài trong hộp thoại, menu điện thoại. Bài viết là nội dung mẫu, chưa phải nhật ký thực tế. Nội dung nằm trong `src/main.js`, giao diện trong `src/style.css`.

Ảnh nguồn Unsplash đã lưu tại `public/images` để tải trực tiếp cùng website. Font từ Google Fonts; có font dự phòng khi không có Internet. Chưa có CMS, tài khoản hay backend; không có đặt tour hoặc biểu mẫu thu thập thông tin. Có thể triển khai thư mục `dist` trên dịch vụ hosting tĩnh sau khi build.
