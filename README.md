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

- **Quốc tế:** địa cầu 3D 360°, ảnh Trái Đất, chỉ hiện 11 mảng vùng có địa điểm đã ghé, mỗi mảng một màu; các vùng khác giữ nền Trái Đất tự nhiên. Vân Nam chỉ hiện Lệ Giang, Côn Minh và Địch Khánh (Shangri-La). Singapore được tô toàn quốc theo yêu cầu; các nước khác chỉ tô vùng có địa điểm đã ghé. Có danh sách chọn vùng và tương tác trên cả 3D/2D; 11 ghim thành phố/khu vực thuộc 7 nước đã ghé; các điểm gần nhau gom cụm khi thu nhỏ. Chọn tên trong danh sách hoặc trong bảng quốc gia để xoay tới từng nơi (gồm Lệ Giang, Côn Minh, Shangri-La và Bangkok). Tọa độ đại diện địa danh, không phải GPS chuyến đi; Fuji là thành phố thuộc Shizuoka theo xác nhận của tác giả. Bản đồ 2D có thể dùng ghim đại diện quốc gia mới; địa cầu 3D chỉ ghim các địa danh đã khai báo, không tự tạo ghim dự phòng ở tâm quốc gia. Có bản đồ phẳng nhiều màu, tự dự phòng khi không có WebGL2.
- **Việt Nam:** bản đồ riêng với đường bờ biển Natural Earth 1:10m. Có 20 địa điểm đã đến do tác giả cung cấp, ghim và cụm ghim có thể bấm để khám phá. Bộ đếm Việt Nam tính địa điểm trong danh sách này, không làm tăng số nước ngoài. Các nhãn nền trung tính chỉ để định hướng.

Danh sách ban đầu trong `src/visited-places.js`: Indonesia — Jakarta; Malaysia — Kuala Lumpur; Campuchia — Phnom Penh, Siem Reap; Singapore; Thái Lan — Bangkok; Nhật Bản — Tokyo, Fuji; Trung Quốc — Lệ Giang, Côn Minh, Shangri-La. Tổng cộng 7 nước ngoài. Không tự tạo ngày đi, ảnh hoặc trải nghiệm thực tế.

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

Dữ liệu vùng được đóng gói sẵn, không cần API bản đồ. Dùng `scripts/build-international-regions.py` với bốn tệp nguồn ghi trong notices để tái tạo (cần Shapely 2). Ranh giới minh họa từ dữ liệu lịch sử; Fuji dùng ranh giới thành phố, Singapore dùng đường bao toàn quốc.

Hiệu năng địa cầu: chỉ dựng hình 11 vùng đã ghi nhận thay vì toàn bộ ranh giới thế giới và 249 vùng; bỏ vòng sóng chạy liên tục và chuyển động dựng lớp vùng. Lớp 2D và bộ chọn vùng cũng lọc theo danh sách quốc gia công khai. Tệp vùng chỉ khoảng 41 KB; địa điểm vẫn có 11 ghim và bộ đếm vẫn là 7 nước.

Khi chọn thành phố có ranh giới, camera 3D/2D phóng vừa toàn bộ hình học vùng; không kéo giãn mảng màu để làm địa danh lớn giả. Bảng chi tiết ghi diện tích ước tính từ ranh giới bản đồ và tên phạm vi đang tô (ví dụ Địch Khánh cho Shangri-La). Đây là diện tích theo nguồn hình học minh họa, có thể gồm mặt nước và khác số liệu hành chính chính thức. Singapore có đường bao quốc gia (gồm vùng nước ven bờ theo nguồn); diện tích phạm vi này không phải chỉ diện tích đất liền. Fuji có ranh giới đô thị MLIT 2020.


Hướng dẫn dành cho chủ website: mở `/huong-dan-dang-bai.html` trên website, hoặc liên kết **Cách đăng bài & xem minh họa** sau khi đăng nhập quản trị. Có các bước đăng thật, vị trí hiển thị từng trường và ví dụ tương tác không đăng nội dung.

Điện thoại dùng một WebGL context với pixel ratio 1 và không khử răng cưa để giảm tải GPU. Khi context mất, bản đồ chuyển 2D, giải phóng renderer cũ và cho phép thử lại bằng nút Địa cầu 3D. WebGL2 vẫn là yêu cầu của Three.js; thiết bị/trình duyệt không hỗ trợ không thể được đảm bảo chạy 3D. Các kiểm tra di động là mô phỏng Chromium, không thay thế kiểm tra trên thiết bị thật.

Bộ đếm quốc tế trên bản đồ và trong quản trị dùng cùng danh sách địa điểm tác giả đã xác nhận (`src/international-places.js`): hiện là 7 nước, không gồm Việt Nam. Mã quốc gia dư trong dữ liệu cũ không tạo ghim hoặc làm tăng bộ đếm; không xóa bài, ảnh hay dữ liệu cũ. Khi tác giả cung cấp địa điểm mới, cập nhật danh sách này để bộ đếm tự tính nước mới, không đặt cứng số 7. Dãy ô hình xem trước vùng đã được bỏ theo yêu cầu; vẫn giữ màu, ranh giới và tìm địa điểm trên bản đồ.

Bài Jakarta 24–27/8/2023: `/bai-viet/jakarta-24-27-08-2023.html`, bản chữ được tác giả gửi trong Excel, chưa nhận ảnh gốc. Bài biên tập này được triển khai qua GitHub, được liệt kê trong nhật ký công khai nhóm Quốc tế và có liên kết trong quản trị. Nó tách biệt với snapshot Supabase, chưa phải bài trong kho bản nháp quản trị; sửa/gỡ tại mã nguồn. Không đưa file Excel gốc hoặc thông tin vé/đặt chỗ lên kho công khai.

Trang gốc mở bằng hai lựa chọn ảnh toàn khung **Thế giới của Đôn** và **Việt Nam của Đôn**. Bản đồ và phần nhật ký chỉ khởi tạo khi người đọc chọn một mục; chọn Việt Nam trước không tải mô-đun địa cầu WebGL. Bấm logo để quay về màn hình chọn. Liên kết trực tiếp `/#the-gioi`, `/#viet-nam` và `/#my-journal` vẫn mở được nội dung tương ứng. Ba ô khám phá cũ cũng được thay bằng hai mục này và dẫn đúng bản đồ/nhóm nhật ký.

Hai phần nay có URL độc lập: `/the-gioi/` chỉ có địa cầu quốc tế (và 2D dự phòng), 7 nước ngoài, các bài/ảnh nước ngoài; `/viet-nam/` chỉ có bản đồ Việt Nam, 20 địa điểm và bài/ảnh Việt Nam. Trang `/` chỉ là hai ô lựa chọn. Vite build ba HTML entry riêng; không cần chuyển bộ lọc trong cùng trang để đổi phần. Điều hướng giữa hai phần tải trang tương ứng; logo quay về trang chọn. Liên kết cũ dạng `/#viet-nam` được chuyển sang URL mới. Nhật ký/Supabase vẫn giữ chung dữ liệu để tránh mất bài; chỉ giao diện đọc, thống kê và lựa chọn quốc gia khi viết bài được giới hạn theo trang. Thao tác Đăng công khai vẫn đăng cả snapshot theo cơ chế hiện có.

Thanh menu không còn liên kết Việt Nam. Chạm/bấm **Thế giới** mở danh sách 6 châu (Á, Âu, Phi, Mỹ, Đại Dương, Nam Cực) cùng liên kết Toàn thế giới. Chọn một châu mở `/the-gioi/?chau=...#my-journal`, cuộn tới danh sách bài viết/kinh nghiệm công khai thuộc các nước ở châu đó. Châu chưa có bài hiển thị trạng thái trống. Việt Nam vẫn ở phần riêng, không trộn vào Châu Á của mục Thế giới. Mục Việt Nam vẫn vào từ trang chọn tại `/`.

## Tự sửa bài Jakarta và thêm ảnh

Mở `/the-gioi/?quan-tri=1` (hoặc **Viết bài / Quản trị** ở chân trang), đăng nhập tài khoản chủ website. Với bài Jakarta đã có trong bản nháp hoặc đã đăng trên Supabase, chọn **Chỉnh sửa** ngay trên thẻ bài trong danh sách bản nháp. Chọn ảnh JPG/PNG/WebP từ máy, tối đa 12 ảnh/bài, rồi **Lưu kỷ niệm** và **Đăng nhật ký công khai**. Lưu nháp chưa đưa ảnh lên web. Nút đăng vẫn đăng toàn bộ nhật ký sau xác nhận.

Bài đã đăng trên Supabase tự được thêm vào kho nháp trên thiết bị mới nếu chưa có cùng mã; bản nháp đang sửa không bị ghi đè. Khi muốn lấy bản công khai mới hơn thay cho bản nháp cũ, dùng **Nhập nội dung đã đăng về bản nháp** sau khi sao lưu.

Bản Jakarta đã đăng thay thẻ bài tĩnh trong danh sách công khai; URL cũ `/bai-viet/jakarta-24-27-08-2023.html` cũng tải nội dung và ảnh mới từ Supabase. Nếu chưa cấu hình dịch vụ hoặc không tải được, trang giữ bản chữ có sẵn. Cần cấu hình Supabase theo `supabase/README.md` trước khi đăng nhập và đăng bài. Repository chưa chứa ảnh gốc Jakarta; chủ website cần chọn lại ảnh từ thiết bị.

## Viết xen kẽ chữ và ảnh

Trong form viết/sửa bài, nội dung được chia thành các khối. Viết đoạn đầu, bấm **+ Thêm đoạn văn** hoặc **+ Đoạn văn sau đây** để viết tiếp. Chọn ảnh ở **Ảnh kỷ niệm**; ảnh xuất hiện trong trình soạn, có ô chú thích riêng. Dùng **↑ Lên / ↓ Xuống** trên từng khối để xếp thành đoạn chữ → ảnh → đoạn chữ. Có thể xóa từng khối và bấm **Xem trước bài** trước khi lưu nháp. Giới hạn vẫn là 12 ảnh/bài và 20.000 ký tự nội dung. Ảnh chỉ được tải lên Supabase khi xác nhận đăng công khai.

Bố cục xen kẽ được giữ trong bản nháp, bản sao lưu, bài công khai, album HTML xuất ra và trang Jakarta. Bài cũ chưa có bố cục vẫn đọc được; khi mở sửa, phần chữ và bộ ảnh cũ chuyển thành các khối để sắp xếp. Không cần chạy lại SQL.

Menu phần Việt Nam có ba miền Bắc, Trung, Nam, mở danh sách bài tại `/viet-nam/?mien=bac#my-journal` (hoặc `trung`, `nam`). Khi viết/sửa bài có quốc gia Việt Nam, chọn **Miền của bài viết**, lưu rồi đăng công khai để bài vào đúng miền. Bài cũ chưa chọn miền vẫn hiện ở **Tất cả bài Việt Nam**, không tự đoán địa điểm từ nội dung. Menu Thế giới giữ các châu lục; cả hai thanh menu dùng cùng chiều cao và căn giữa các mục trên máy tính, xếp dọc trên điện thoại.

Trong cửa sổ viết/sửa bài, **Xem trước bài đăng** nằm cạnh form trên máy tính, bên dưới form trên điện thoại. Tiêu đề, ngày, đoạn văn, ảnh, chú thích và thứ tự khối cập nhật ngay khi chỉnh sửa; phần xem trước dùng cùng cách dựng nội dung với bài đọc công khai. **Xem trước bài** đưa con trỏ tới khung này, không mở thêm cửa sổ và không tải nội dung lên Supabase. Vẫn cần lưu nháp và xác nhận đăng công khai như trước.

## Tự đánh dấu quốc gia khi viết bài

Chọn quốc gia trong form và lưu bài: bản đồ nháp cùng bộ đếm tự cập nhật. Sau khi **Đăng nhật ký công khai**, khách thấy quốc gia có bài viết được đánh dấu trên cả bản đồ 2D và địa cầu 3D. Quốc gia đã có địa điểm xác nhận giữ nguyên ghim thành phố; nước mới có ghim ghi rõ **Có bài viết · Vị trí đại diện quốc gia**, không suy đoán thành phố từ nội dung. Nhiều bài về cùng một nước chỉ tính một lần; bài Việt Nam không làm tăng số nước ngoài. Mã quốc gia cũ không có bài viết hoặc địa điểm xác nhận vẫn không tự tạo ghim. Xóa/chuyển hết bài của một nước mới sẽ gỡ ghim tự động của nước đó khi lưu/đăng tương ứng; các địa điểm đã xác nhận trước đây giữ nguyên.

Địa cầu 3D tự đổi nhãn theo mức zoom: khi nhìn xa, mỗi nước có một nhãn tên quốc gia; phóng gần hiện riêng từng địa điểm đã ghi nhận tại đúng tọa độ đại diện của địa danh (không phải GPS chuyến đi). Bấm tên nước để phóng tới các điểm trong nước đó. Quốc gia mới chỉ có bài viết vẫn giữ ghim đại diện quốc gia, không tự tạo thành phố chưa được cung cấp. Thu nhỏ trở lại sẽ gom về nhãn quốc gia.
