# Multi-Kaggle Manager

Hệ thống quản lý đa tài khoản Kaggle siêu nhẹ (Lightweight), cross-platform (macOS, Linux, Windows), chạy trên **Bun** runtime. Gọi trực tiếp Kaggle REST API v1 (hoàn toàn không cần Python/pip hay `kaggle` CLI), tích hợp điều khiển từ xa qua Telegram Bot và Web Dashboard React chuẩn Cloudflare Tech / ShadcnBlocks.

---

## 1. Cài đặt 1 dòng lệnh (One-line Installers)

Người dùng hoặc AI Agent không cần tải mã nguồn hay cài đặt thủ công. Chạy 1 dòng duy nhất để tải binary đóng gói sẵn:

### Trên macOS & Linux:
```bash
curl -fsSL https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.sh | bash
```

### Trên Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.ps1 | iex
```

---

## 2. Cách sử dụng

### A. Mở Web UI Dashboard
Chỉ cần gõ:
```bash
multikaggle
```
*(Lệnh này tự động khởi động server daemon nền và mở ngay trình duyệt tại `http://localhost:7890`)*.

Nếu muốn chỉ định port khác:
```bash
multikaggle serve --port 8080 --no-open
```

### B. Direct Browser OAuth Authentication
Người dùng có thể đăng nhập bất kỳ tài khoản Kaggle nào thông qua trình duyệt khác hoặc cửa sổ ẩn danh (Incognito) bằng cách truy cập:
```
http://localhost:7890/auth
```
Hệ thống sẽ tự động chuyển hướng đến trang xác thực OAuth của Kaggle và tự động callback về ứng dụng để thêm tài khoản vào danh sách.

### C. Bộ lệnh CLI (Dành cho AI Agent & Terminal)
```bash
# Nộp notebook lên GPU T4 (mặc định)
multikaggle run ./model.ipynb --title "Train Model"

# Nộp notebook lên TPU v3-8 (128GB HBM)
multikaggle run ./jax_train.ipynb --tpu

# Nộp notebook ở chế độ JSON output (cho AI Agent parse)
multikaggle run ./pipeline.ipynb --json

# Kiểm tra & Tải các file output (weights, submission.csv) về máy
multikaggle outputs <job_id> --download ./my_outputs/

# Tìm kiếm datasets của các tài khoản đã liên kết
multikaggle datasets --search "titanic"

# Xem trạng thái tài khoản & GPU/TPU/Disk quotas
multikaggle accounts

# Thêm tài khoản mới từ terminal
multikaggle accounts add --label "Farm 1" --username "kaggle_user_1" --key "token_xyz"

# Xem các jobs đang chạy
multikaggle jobs

# Hủy job khẩn cấp để cứu quota GPU/TPU
multikaggle cancel <job_id>
```

### D. Các lệnh Telegram Bot Remote Control
- `/status` — Xem trạng thái acc, quota GPU (30h), quota TPU (20h), dung lượng Disk (100GB).
- `/jobs` — Xem danh sách các kernel jobs đang chạy hoặc gần đây.
- `/outputs <job_id>` — Lấy link tải các artifact sinh ra từ lượt chạy.
- `/datasets [search]` — Tra cứu nhanh datasets của tài khoản.
- `/cancel <job_id>` — Hủy khẩn cấp session đang chạy để bảo toàn hạn ngạch GPU/TPU.

---

## 3. Tính năng cốt lõi

- **Cổng mặc định**: `http://localhost:7890` (tránh xung đột với các web server cổng 3000 khác).
- **Direct OAuth URL**: Hỗ trợ endpoint `/auth` cho phép mở link ở bất kỳ trình duyệt nào.
- **Hỗ trợ phần cứng đa dạng**: GPU T4x2 (30h/tuần) & TPU v3-8 128GB HBM (20h/tuần) & CPU không giới hạn.
- **Tải file Output**: Hỗ trợ tải trực tiếp các file kết quả (.pt, .csv, log) từ Web UI hoặc CLI.
- **Zero-Python Dependency**: Gọi trực tiếp Kaggle REST API v1 với Basic Auth và native Proxy.
- **Bảo mật**: Mã hóa Kaggle API Tokens bằng **AES-256-GCM** trước khi lưu vào SQLite cục bộ (`bun:sqlite`).
- **Web Dashboard**: Full-Width chuẩn **Cloudflare Tech & ShadcnBlocks**, hỗ trợ **Light / Dark Mode**.
