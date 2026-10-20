# Kết nối Đôn Đú Đởn với Supabase

Chỉ một tài khoản được đăng. Khách đọc không cần đăng nhập. Không chia sẻ database password, secret key hoặc service_role key trong chat hay GitHub.

## 1. Tạo bảng và quyền

Mở dự án Supabase → **SQL Editor → New query**. Sao chép toàn bộ nội dung [setup.sql](setup.sql), bấm **Run**. Tệp này tạo nội dung công khai ban đầu với 7 quốc gia tác giả đã cung cấp; chạy lại không ghi đè bài đã đăng.

## 2. Tạo duy nhất tài khoản chủ website

Trong **Authentication → Users → Add user → Create new user**, tạo tài khoản bằng email của bạn và mật khẩu mạnh, bật xác nhận email tự động nếu bảng điều khiển có tùy chọn đó. Nhập mật khẩu trực tiếp tại Supabase, không đưa vào SQL hoặc mã nguồn.

Sao chép **User UID** (UUID, không phải mật khẩu). Mở một SQL query mới, thay `YOUR_USER_UUID` dưới đây bằng UID vừa tạo rồi chạy:

```sql
insert into public.site_owner(singleton, user_id)
values (true, 'YOUR_USER_UUID'::uuid)
on conflict (singleton) do update set user_id = excluded.user_id;
```

Bảng chỉ cho phép một chủ website; chạy lệnh này với UID khác sẽ chuyển quyền chủ sang người đó. Trong phần cấu hình **Authentication → Sign In / Providers** (tên mục có thể thay đổi), tắt **Allow new users to sign up** vì khách không cần tạo tài khoản. Dù đăng ký được bật, người dùng khác vẫn không có quyền đăng do chính sách database.

## 3. Kết nối Vercel

Trong Supabase, nút **Connect** hoặc **Settings → Data API / API Keys** cung cấp Project URL và **publishable key** (bắt đầu `sb_publishable_`). Khóa anon cũ cũng được hỗ trợ. Đây là cấu hình trình duyệt công khai; không dùng khóa secret/service_role.

Trong dự án Vercel đang nối `webdulichj` → **Settings → Environment Variables**, thêm:

| Tên biến | Giá trị lấy từ Supabase |
|---|---|
| `VITE_SUPABASE_URL` | Project URL, dạng `https://PROJECT_REF.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable key hoặc legacy anon key |

Chọn môi trường **Production** (và Preview nếu muốn thử). Lưu rồi **Redeploy** vì Vite đưa cấu hình công khai vào bản build. Không nhập mật khẩu cơ sở dữ liệu vào Vercel. Build từ chối khóa có dạng secret/service_role.

## 4. Đăng bài

Mở website → cuối trang **Góc riêng của Đôn · Quản trị**, đăng nhập bằng tài khoản bước 2.

- **Lưu kỷ niệm**: lưu bản nháp trên trình duyệt, chưa gửi ảnh hay nội dung lên Supabase.
- **Đăng nhật ký công khai**: có xác nhận, đưa **toàn bộ bản nháp hiện tại** (bài viết, ảnh, danh sách quốc gia) lên website. Hiện chưa có đăng riêng từng bài.
- Để gỡ bài công khai: xóa bài khỏi bản nháp rồi đăng lại nhật ký. Ảnh đã đăng trước đây vẫn có thể truy cập bằng URL cho đến khi chủ xóa chúng trong Supabase Storage. Ảnh cũng có thể còn trong bộ nhớ đệm của người nhận.
- **Nhập nội dung đã đăng về bản nháp**: dùng khi chuyển thiết bị hoặc muốn tiếp tục chỉnh sửa nội dung trên mạng. Tải bản sao lưu trước nếu có bản nháp riêng cần giữ; bài cùng mã được thay bằng bản công khai.
- Khách mở website trong trình duyệt khác sẽ thấy bài công khai, không có nút sửa, xóa hay đăng. Bản nháp riêng không được gửi cho khách.

## Lưu ý dữ liệu và giới hạn

Kho bản nháp IndexedDB cũ vẫn được giữ nguyên. Trước khi dùng chế độ mới, có thể tải **bản sao lưu cũ trên thiết bị này** ở góc quản trị. Bản nháp thuộc trình duyệt/địa chỉ website; đổi tên miền hoặc thiết bị phải nhập lại bản sao lưu hoặc nội dung đã đăng. Đăng xuất không xóa bản nháp trên thiết bị: không dùng thiết bị chung cho nội dung riêng tư.

Ảnh được thu nhỏ JPEG tối đa 1600px, tối đa 12 ảnh/bài; lưu ảnh gốc riêng. Ảnh chỉ tải lên bucket công khai khi bạn bấm xác nhận đăng. Bài chưa đăng và ảnh nháp chỉ ở thiết bị. Không tự xóa ảnh cũ khi đăng lại để tránh làm hỏng đường dẫn bài trước; theo dõi dung lượng Storage, có thể có ảnh dư nếu lần đăng bị gián đoạn. Tổng nội dung chữ/URL của snapshot công khai tối đa 5MB, bản nháp tối đa 45MB. Hạn mức, chính sách miễn phí và phí dịch vụ theo tài khoản Supabase/Vercel của bạn.

Database có row-level security và singleton chủ website. Giao diện ẩn nút không phải lớp bảo vệ duy nhất: quyền đọc/ghi do database kiểm soát. Bản công khai có revision để tránh vô tình ghi đè thay đổi từ tab/thiết bị khác. Nội dung cũ vẫn được phục vụ nếu upload ảnh hoặc cập nhật snapshot thất bại.

## Kiểm tra

`npm test` chạy chính sách SQL trên PostgreSQL qua PGlite với roles/auth/storage fixtures: khách đọc được nhưng không ghi; tài khoản khác không đăng hoặc tự cấp quyền; chỉ chủ tải ảnh/đăng được; revision phát hiện bản cũ; chỉ có một chủ.

Các kiểm tra HTTP mô phỏng không thay thế thử nghiệm dự án thật. Sau khi cấu hình, cần xác nhận đăng nhập thật, tải ảnh thật, đăng bài, mở cửa sổ ẩn danh để kiểm tra nội dung công khai và đảm bảo bản nháp chưa đăng không xuất hiện.
