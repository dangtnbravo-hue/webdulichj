# Đôn Đú Đởn

Website du lịch tiếng Việt, màu xanh dương/xanh lá, lời dẫn tinh nghịch, JavaScript/Vite. Chủ website đăng bài; khách chỉ xem, không cần tài khoản.

## Chạy và kiểm tra

Node.js 20.19+ hoặc 22.12+ (môi trường hiện tại Node24).

```sh
npm ci --cache /workspace/.npm-cache
npm test
npm run dev
```

```sh
npm run build
npm run preview
```

## Hai khu vực

- **Quốc tế:** địa cầu 3D 360°, ảnh Trái Đất, tô vàng các nước đã đến, ghim có tên nước và điểm đã ghé. Có bản đồ phẳng nhiều màu, tự dự phòng khi không có WebGL2.
- **Việt Nam:** bản đồ riêng với đường bờ biển Natural Earth 1:10m. Nhãn địa danh chỉ để định hướng; không tự tính tỉnh/thành đã đến. Bộ đếm là số kỷ niệm Việt Nam, không làm tăng số nước ngoài.

Danh sách ban đầu trong `src/visited-places.js`: Indonesia — Jakarta; Malaysia — Kuala Lumpur; Campuchia — Phnom Penh, Siem Reap; Singapore; Thái Lan; Nhật Bản — Tokyo, Fuji; Trung Quốc — Lệ Giang. Tổng cộng 7 nước ngoài. Không tự tạo ngày đi, ảnh hoặc trải nghiệm thực tế.

## Một người đăng, mọi người xem

Xem [hướng dẫn Supabase](supabase/README.md) để tạo database, gán tài khoản chủ và thêm hai biến môi trường công khai vào Vercel. Dùng gói dịch vụ phù hợp; không cần mua tên miền riêng để chạy trên `.vercel.app`.

Nếu chưa cấu hình Supabase, website ở chế độ chỉ đọc với 7 quốc gia có sẵn và thông báo chưa kết nối trong góc quản trị. Chưa thể đăng bài trực tuyến. Cấu hình hợp lệ mới bật form đăng nhập; quyền đăng thực sự được database kiểm soát.

Bản nháp giữ trên trình duyệt. **Đăng nhật ký công khai** đưa toàn bộ bản nháp lên website sau xác nhận; khách chỉ đọc snapshot đã đăng. Muốn tiếp tục trên thiết bị khác, đăng nhập rồi nhập nội dung đã đăng về bản nháp. Ảnh đã công khai giữ URL đến khi được chủ dọn trong Storage; không tự xóa khi gỡ bài. Dữ liệu cũ vẫn ở IndexedDB `may-du-ky-journal`, có nút tải bản sao lưu cũ.

## Tài nguyên

Ảnh giao diện và ảnh Trái Đất được đóng gói trong `public/images`; font Google có dự phòng. Hình Trái Đất là ảnh tĩnh, không phải ảnh vệ tinh trực tiếp. Địa cầu được tải qua mô-đun riêng và tạm dừng ngoài màn hình hoặc khi tab bị ẩn. Nguồn/giấy phép: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Triển khai

Vercel nối `dangtnbravo-hue/webdulichj`, nhánh `main`, framework Vite, build `npm run build`, output `dist`. Hai biến trong `.env.example` là URL và publishable key công khai. **Không đưa secret/service_role key hay mật khẩu vào GitHub hoặc biến VITE_.** Sau khi đổi biến môi trường cần Redeploy.
