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
- **Việt Nam:** bản đồ riêng với đường bờ biển Natural Earth 1:10m. Có 20 địa điểm đã đến do tác giả cung cấp, ghim và cụm ghim có thể bấm để khám phá. Bộ đếm Việt Nam tính địa điểm trong danh sách này, không làm tăng số nước ngoài. Các nhãn nền trung tính chỉ để định hướng.

Danh sách ban đầu trong `src/visited-places.js`: Indonesia — Jakarta; Malaysia — Kuala Lumpur; Campuchia — Phnom Penh, Siem Reap; Singapore; Thái Lan; Nhật Bản — Tokyo, Fuji; Trung Quốc — Lệ Giang. Tổng cộng 7 nước ngoài. Không tự tạo ngày đi, ảnh hoặc trải nghiệm thực tế.

## Một người đăng, mọi người xem

Xem [hướng dẫn Supabase](supabase/README.md) để tạo database, gán tài khoản chủ và thêm hai biến môi trường công khai vào Vercel. Dùng gói dịch vụ phù hợp; không cần mua tên miền riêng để chạy trên `.vercel.app`.

Nếu chưa cấu hình Supabase, website ở chế độ chỉ đọc với 7 quốc gia có sẵn và thông báo chưa kết nối trong góc quản trị. Chưa thể đăng bài trực tuyến. Cấu hình hợp lệ mới bật form đăng nhập; quyền đăng thực sự được database kiểm soát.

Bản nháp giữ trên trình duyệt. **Đăng nhật ký công khai** đưa toàn bộ bản nháp lên website sau xác nhận; khách chỉ đọc snapshot đã đăng. Muốn tiếp tục trên thiết bị khác, đăng nhập rồi nhập nội dung đã đăng về bản nháp. Ảnh đã công khai giữ URL đến khi được chủ dọn trong Storage; không tự xóa khi gỡ bài. Dữ liệu cũ vẫn ở IndexedDB `may-du-ky-journal`, có nút tải bản sao lưu cũ.

## Tài nguyên

Ảnh giao diện và ảnh Trái Đất được đóng gói trong `public/images`; font Google có dự phòng. Hình Trái Đất là ảnh tĩnh, không phải ảnh vệ tinh trực tiếp. Địa cầu được tải qua mô-đun riêng và tạm dừng ngoài màn hình hoặc khi tab bị ẩn. Nguồn/giấy phép: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Triển khai

Vercel nối `dangtnbravo-hue/webdulichj`, nhánh `main`, framework Vite, build `npm run build`, output `dist`. Hai biến trong `.env.example` là URL và publishable key công khai. **Không đưa secret/service_role key hay mật khẩu vào GitHub hoặc biến VITE_.** Sau khi đổi biến môi trường cần Redeploy.

## 20 dấu chân Việt Nam

Danh sách trong `src/vietnam-places.js`: Ninh Bình, Mộc Châu, Quảng Ninh, Hải Phòng, Bắc Ninh, Bắc Giang, Nghệ An, Hải Dương, Thái Bình, Quảng Trị, Quảng Bình, Đà Nẵng, Hồ Chí Minh, Vĩnh Phúc, Hưng Yên, Hà Nam, Nam Định, Tuyên Quang, Hòa Bình, Hà Tĩnh. Giữ nguyên tên địa phương quen thuộc do tác giả cung cấp, không diễn giải thành danh sách đơn vị hành chính hiện hành. Mỗi địa danh có một tọa độ đại diện, không phải GPS hay địa chỉ ghé thăm cụ thể. Không tự tạo ảnh, ngày đi hoặc nội dung kỷ niệm.

Bấm cụm số để tách các ghim gần nhau khi phóng to; dùng danh sách 20 nút bên dưới bản đồ để tìm từng nơi bằng chuột hoặc bàn phím. Thông tin này nằm trong mã website nên khách cũng thấy ngay sau triển khai, không phải chạy lại SQL hoặc ghi đè bài đã đăng. Các bài viết/ảnh trên Supabase được giữ nguyên. Việt Nam có bộ đếm 20 địa điểm riêng; Quốc tế vẫn tính 7 nước đã đến.
