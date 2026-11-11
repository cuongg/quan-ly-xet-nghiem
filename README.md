# LamLab · Quản lý xét nghiệm

LamLab gồm giao diện React + Vite và API NestJS. Giao diện có các màn hình Tổng quan, Khách hàng, Phiếu xét nghiệm, Thu ngân, Kết quả, Huyết học, Hóa sinh, Báo cáo và Danh mục dịch vụ.

## Cấu trúc

- `frontend/src/pages/` chứa các màn hình theo nghiệp vụ. `TestResults` dùng chung cho sổ kết quả và hai chuyên khoa.
- `frontend/src/components/` chứa thành phần giao diện dùng chung, `routes/` chứa danh sách màn hình, `services/` xử lý dữ liệu và gọi API, `hooks/` quản lý trạng thái và thao tác lưu. `App.tsx` kết nối các màn hình.
- `backend/src/` chứa xác thực, API khách hàng, phiếu, kết quả, báo cáo và dịch vụ lưu dữ liệu.
- `.github/workflows/pages.yml` build frontend và triển khai GitHub Pages.

## Chạy bản demo

Dùng Node.js 22. Mở terminal ở thư mục repo.

```sh
cd frontend
npm ci
npm run dev
```

Mở địa chỉ Vite in ra. Khi để trống `VITE_API_URL`, dữ liệu minh họa và các thao tác lưu sử dụng trình duyệt. Bản cập nhật đọc lại phiếu đã lưu trên cùng trình duyệt và địa chỉ web.

## Chạy với API trên máy phát triển

Trong terminal thứ hai, từ thư mục repo:

```sh
cd backend
npm ci
npm run build
```

Sao chép `.env.example` thành `.env` trong backend, đặt `LIS_API_TOKEN` thành một khóa ngẫu nhiên riêng rồi chạy:

```sh
node --env-file=.env dist/main.js
```

Trong `frontend/.env.local`, đặt `VITE_API_URL=http://localhost:3000/api` rồi khởi động lại Vite. Mở giao diện và nhập khóa khi được hỏi. Khóa chỉ giữ trong bộ nhớ của trang. Nếu Vite chạy trên origin khác `http://localhost:5173`, cập nhật `LIS_FRONTEND_ORIGIN` ở backend.

Chế độ API bắt đầu với hồ sơ trống và danh mục dịch vụ mẫu. Khi lưu lần đầu, server ghi cả danh mục và dữ liệu vào `backend/data/workspace.json`. Chạy một tiến trình API cho mỗi tệp. Có thể đổi đường dẫn qua `LIS_DATA_FILE`. Server kiểm tra phiên bản lúc lưu để phát hiện thao tác ghi đè dữ liệu cũ.

### API

Mọi endpoint dùng header `Authorization: Bearer <khóa>`. Giao diện đọc và lưu đồng bộ qua `GET /api/workspace` và `PUT /api/workspace`. Các endpoint chỉ đọc gồm `/api/patients`, `/api/test-orders`, `/api/test-results` và `/api/reports`.

## Triển khai

Push nhánh main để workflow triển khai `frontend/dist` lên GitHub Pages. Mặc định trang công khai dùng chế độ demo. Muốn dùng API online, triển khai backend riêng với HTTPS và ổ lưu trữ bền vững, cấu hình `LIS_FRONTEND_ORIGIN` theo origin của frontend và đặt biến repository `VITE_API_URL` trước khi chạy lại workflow.

API hiện phục vụ thử nghiệm với khóa dùng chung và lưu tệp. Để dùng hồ sơ thật cần tài khoản cá nhân, phân quyền nghiệp vụ, nhật ký thay đổi, cơ sở dữ liệu và sao lưu.
