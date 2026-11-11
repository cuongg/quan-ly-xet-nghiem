# LamLab · Quản lý xét nghiệm

Ứng dụng React cho luồng tiếp nhận, xử lý mẫu hóa sinh và in phiếu. Các hồ sơ ban đầu là dữ liệu minh họa. Thay đổi được lưu trong localStorage của trình duyệt đang dùng.

## Kế hoạch triển khai

1. Tiếp nhận thông tin bệnh nhân, bác sĩ, loại mẫu, thời gian lấy và nhận mẫu. Chọn dịch vụ từ danh mục.
2. Theo dõi phiếu theo trạng thái. Nhập kết quả, khoảng tham chiếu và ghi chú theo từng dịch vụ. Hoàn tất khi đã nhập đủ kết quả, sau đó in phiếu.
3. Triển khai giao diện tĩnh trên GitHub Pages để thử quy trình với dữ liệu giả lập.
4. Trước khi sử dụng với hồ sơ thật, bổ sung API, cơ sở dữ liệu dùng chung, đăng nhập, phân quyền, nhật ký chỉnh sửa, sao lưu và quy trình duyệt kết quả.

## Chạy ứng dụng

Dùng Node.js 22. Chạy `npm ci` rồi `npm run dev`. Để kiểm tra bản phát hành, chạy `npm run build` rồi `npm run preview`.

## GitHub Pages

Trong Settings → Pages của repository, chọn GitHub Actions làm nguồn triển khai. Khi push lên nhánh main, workflow tạo bản build và triển khai thư mục dist. Có thể chạy lại từ Actions → Deploy React to GitHub Pages → Run workflow. URL được hiển thị trong deployment github-pages.

## Các phân hệ trong bản mở rộng

- **Khách hàng** quản lý thông tin liên hệ, lịch sử phiếu và tiếp nhận lượt mới cho khách đã có hồ sơ.
- **Phiếu xét nghiệm** lưu thông tin tại thời điểm tiếp nhận và các dịch vụ chỉ định.
- **Thu ngân** tính phí theo đơn giá trên phiếu, ghi nhận tiền mặt hoặc chuyển khoản và in biên nhận. Sau khi thu tiền, danh sách dịch vụ trên phiếu được khóa.
- **Kết quả**, **Huyết học** và **Hóa sinh** tra cứu theo chỉ số và mở phiếu để nhập kết quả.
- **Danh mục** thêm hoặc sửa dịch vụ, chuyên khoa, đơn vị đo và đơn giá. Mỗi phiếu giữ đơn giá và tên dịch vụ tại lúc chỉ định. Đơn giá khởi tạo là giá minh họa.
- **Báo cáo** tổng hợp số mẫu theo ngày lấy mẫu và thực thu theo ngày thanh toán.

Khi nâng cấp, ứng dụng đọc các phiếu đã lưu của phiên bản trước trên cùng trình duyệt. Mỗi phiếu cũ được liên kết với một hồ sơ khách hàng riêng vì bản trước chưa có mã khách hàng.
