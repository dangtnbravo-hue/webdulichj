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

- **Quốc tế:** địa cầu 3D 360°, ảnh Trái Đất, tô vàng các nước đã đến, 11 ghim thành phố/khu vực thuộc 7 nước đã ghé; các điểm gần nhau gom cụm khi thu nhỏ. Chọn tên trong danh sách hoặc trong bảng quốc gia để xoay tới từng nơi (gồm Lệ Giang, Côn Minh, Shangri-La và Bangkok). Tọa độ đại diện địa danh, không phải GPS chuyến đi; Fuji là khu vực. Quốc gia mới chưa có thành phố dùng ghim đại diện quốc gia. Có bản đồ phẳng nhiều màu, tự dự phòng khi không có WebGL2.
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

## Ranh giới tỉnh/thành nhiều màu

Trong mục Việt Nam có hai lớp: **34 tỉnh/thành sau sắp xếp 2025** (mặc định) và **63 tỉnh/thành trước 2025**. Lớp 34 được dựng minh họa bằng cách hợp các đơn vị cũ theo nhóm sắp xếp; không phải dữ liệu khảo sát hành chính mới. Tên địa điểm đã đi vẫn được giữ theo lời tác giả. Mỗi vùng có màu để phân biệt; màu nền không có nghĩa là đã đến. Ghé thăm được biểu thị bằng ghim vàng và nội dung popup.

Chọn hoặc bấm một tỉnh để xem các địa điểm đã ghi nhận trong phạm vi đó; ví dụ vùng Ninh Bình sau sắp xếp chứa ba tên Ninh Bình, Hà Nam và Nam Định. Ranh giới được tải từ `public/maps` khi mở bản đồ Việt Nam; không dùng API key và không cần chạy SQL. Nếu tệp lỗi, bản đồ nền và 20 ghim vẫn hoạt động, có nút thử tải lại.

Hai bộ dữ liệu minh họa được dẫn xuất từ Natural Earth public domain. Helper `scripts/build-vietnam-provinces.py` tạo dữ liệu từ `ne_10m_admin_1_states_provinces.geojson`, cần Shapely 2.x khi chạy lại (không phải dependency website). Helper kiểm tra 63 mã cũ được phân vào đúng 34 nhóm, không trùng/lọt đơn vị, và bảo toàn diện tích hợp; màu được chọn để phân biệt các vùng kề nhau. Tài sản GeoJSON đã được commit, Vercel không cần Python hay Shapely.

## Nền tương tác theo con trỏ

Quầng sáng xanh dương/xanh lá theo chuột trên các mảng nền ngoài; lớp trang trí không nhận thao tác và nằm dưới nội dung, không phủ lên bản đồ hay biểu mẫu. Chỉ cập nhật theo khung hình khi chuột di chuyển, không chạy vòng lặp thường trực. Tự tắt trên thiết bị cảm ứng và khi bật giảm chuyển động; cũng áp dụng cho nhật ký mới được thay vào sau đăng nhập.
