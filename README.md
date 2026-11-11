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

## Dùng máy Windows làm server PostgreSQL

Máy chủ chạy Node.js 22 và PostgreSQL 16. Từ thư mục repo, chạy PowerShell với địa chỉ IPv4 LAN của máy chủ (xem bằng `ipconfig`):

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\start-server.ps1 -Address 192.168.1.20
```

Script build frontend với `VITE_API_URL=/api`, build backend, khởi động PostgreSQL và phục vụ cả web lẫn API ở cùng địa chỉ. Cổng web mặc định là 3080, có thể đổi bằng `-Port`. Máy khác trong LAN mở `http://<IP-máy-chủ>:3080/`. Khi Windows khởi động lại, chạy lại lệnh trên. Nếu dùng bộ PostgreSQL ở vị trí khác, đặt `LIS_PG_BIN` tới thư mục chứa `initdb.exe`.

Thông tin riêng của máy nằm trong `%LOCALAPPDATA%\LamLab`. Để sao chép riêng khóa đăng nhập vào clipboard:

```powershell
(Get-Content -Raw "$env:LOCALAPPDATA\LamLab\server.json" | ConvertFrom-Json).apiToken | Set-Clipboard
```

Dán khóa vào màn hình **Kết nối phòng xét nghiệm**. PostgreSQL chỉ lắng nghe trên `127.0.0.1:55432`; các máy trạm kết nối qua web. Script tạo cụm PostgreSQL riêng trong thư mục LamLab, database và role ứng dụng cùng tên `lamlab`. Khi có firewall, cho phép TCP đến cổng web từ mạng con tin cậy. Đường dẫn HTTP phục vụ thử nghiệm nội bộ; dùng HTTPS và xác thực theo từng người dùng trước khi đưa hồ sơ thật vào hệ thống.

## Kết nối database PostgreSQL có sẵn

Trong `backend/`, chạy `npm ci` và `npm run build`. Sao chép `.env.example` thành `.env`, đặt `DATABASE_URL` tới database PostgreSQL và thiết lập `LIS_API_TOKEN`. Role ứng dụng cần quyền tạo bảng trong schema ứng dụng. Chạy `node --env-file=.env dist/main.js`. Với Vite dev, đặt `VITE_API_URL=http://localhost:3000/api` trong `frontend/.env.local` và khởi động lại Vite.

API giữ hợp đồng workspace hiện có, lưu dữ liệu và mã phiên bản trong bảng `lamlab_workspace` (JSONB). PostgreSQL kiểm tra phiên bản trong cùng câu lệnh cập nhật để ngăn hai máy ghi đè thay đổi của nhau. Khi bảng chưa có dòng dữ liệu, API tự nhập tệp `backend/data/workspace.json` của bản trước nếu có. Dữ liệu demo trong trình duyệt vẫn tách riêng. Sao lưu database bằng công cụ PostgreSQL như `pg_dump`.

### API

Mọi endpoint dùng header `Authorization: Bearer <khóa>`. Giao diện đọc và lưu đồng bộ qua `GET /api/workspace` và `PUT /api/workspace`. Các endpoint chỉ đọc gồm `/api/patients`, `/api/test-orders`, `/api/test-results` và `/api/reports`.

## Triển khai

Push nhánh main để workflow triển khai `frontend/dist` lên GitHub Pages. Mặc định trang công khai dùng chế độ demo. Muốn dùng API online, triển khai backend qua HTTPS và cấu hình PostgreSQL, cấu hình `LIS_FRONTEND_ORIGIN` theo origin của frontend và đặt biến repository `VITE_API_URL` trước khi chạy lại workflow.

API hiện phục vụ thử nghiệm với khóa dùng chung và PostgreSQL. Để dùng hồ sơ thật cần tài khoản cá nhân, phân quyền nghiệp vụ, nhật ký thay đổi và sao lưu định kỳ.
