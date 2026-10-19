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

## Nhật ký cá nhân và quốc gia đã đến

Mở **Nhật ký của tôi** trên menu hoặc nút trên ảnh bìa.

- Chọn quốc gia → **Đã đến**: bộ đếm tính mỗi quốc gia một lần. Danh mục gồm 195 quốc gia (193 thành viên Liên Hợp Quốc và hai quan sát viên).
- **Viết kỷ niệm**: nhập tên, quốc gia, ngày đi, câu chuyện, kinh nghiệm và tối đa 12 ảnh JPG/PNG/WebP. Mỗi ảnh nguồn tối đa 15 MB; ảnh được chuyển JPEG tối đa 1600 px. Hãy giữ bản gốc riêng.
- Thêm kỷ niệm tự thêm quốc gia vào danh sách đã đến. Xóa kỷ niệm không xóa dấu chân quốc gia. Chỉ được bỏ quốc gia khi không còn kỷ niệm gắn với quốc gia đó.
- Có thể xem, sửa, xóa bài và bỏ ảnh khi sửa.
- **Tải bản sao lưu** xuất JSON chứa ảnh và nội dung. **Nhập bản sao lưu** gộp dữ liệu; cùng mã kỷ niệm sẽ được cập nhật, không nhân đôi. Tệp nhập tối đa 50 MB; tổng kho nhật ký tối đa 45 MB để có thể sao lưu và khôi phục.
- **Xuất album chia sẻ** xuất tệp HTML tự chứa ảnh và nội dung để gửi cho người khác. Có thể xuất từng bài. Không tự đăng lên mạng, không tạo đường link công khai. Kiểm tra nội dung riêng tư trước khi gửi.

Dữ liệu được lưu bằng IndexedDB, riêng từng trình duyệt và địa chỉ website. Chưa có tài khoản, máy chủ lưu trữ hoặc đồng bộ đám mây. Người khác mở website sẽ không tự thấy nhật ký của bạn. Đổi địa chỉ website, dùng thiết bị khác, chế độ riêng tư hoặc xóa dữ liệu trình duyệt có thể khiến nhật ký không còn hiển thị. Sao lưu thường xuyên, lưu tệp ở nơi riêng tư và nhập lại trên thiết bị/địa chỉ mới khi cần. Không lưu thông tin nhạy cảm trên thiết bị dùng chung. Cần tích hợp dịch vụ backend nếu muốn tác giả đăng bài công khai trực tiếp trên website.

Nhật ký được chia thành hai nhóm **Việt Nam** và **Nước ngoài**, tự phân loại từ quốc gia của kỷ niệm. Chuyển nhóm để xem kỷ niệm và dấu chân tương ứng; số kỷ niệm/ảnh ở đầu mục là tổng của cả hai nhóm. Bộ đếm **nước ngoài đã đến** chỉ đếm các quốc gia khác Việt Nam, không trùng. Việt Nam vẫn được đánh dấu riêng trong nhóm Việt Nam. Dữ liệu sao lưu cũ vẫn nhập được, không cần chuyển đổi.
