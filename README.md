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

### C. Điều phối Notebook từ CLI (cho AI Agent hoặc Terminal)
```bash
# Nộp notebook, tự động chọn acc còn nhiều GPU quota nhất
multikaggle run ./my_notebook.ipynb --title "Train Model Stage 1"

# Chế độ JSON Output (dành riêng cho AI Agent parse)
multikaggle run ./pipeline.ipynb --json

# Tùy chọn accelerator & internet
multikaggle run ./script.py --no-gpu --no-internet
```

### D. Quản lý tài khoản & Jobs qua CLI
```bash
# Xem danh sách tài khoản, trạng thái & GPU hours còn lại
multikaggle accounts

# Thêm tài khoản mới từ terminal
multikaggle accounts add --label "Farm 1" --username "kaggle_user_1" --key "token_xyz"

# Xem các jobs đang chạy
multikaggle jobs

# Hủy job khẩn cấp để cứu quota GPU
multikaggle cancel <job_id>
```

---

## 3. Tính năng cốt lõi

- **Cổng mặc định**: `http://localhost:7890` (tránh xung đột với các web server cổng 3000 khác).
- **Direct OAuth URL**: Hỗ trợ endpoint `/auth` cho phép mở link ở bất kỳ trình duyệt nào.
- **Zero-Python Dependency**: Gọi trực tiếp Kaggle REST API v1 với Basic Auth và native Proxy.
- **Bảo mật**: Mã hóa Kaggle API Tokens bằng **AES-256-GCM** trước khi lưu vào SQLite cục bộ (`bun:sqlite`).
- **GPU Farm & Quota Optimization**:
  - Quản lý hạn mức 30 giờ GPU/tuần cho từng tài khoản.
  - Tự động trừ quota dựa trên thời gian chạy thực tế của kernel.
  - Điều phối (dispatch) thông minh: Auto chọn account còn nhiều GPU nhất (`max_quota`) hoặc theo vòng (`round_robin`).
  - Kiểm soát giới hạn Kaggle concurrency (tối đa 2 session GPU/tài khoản).
  - Tự động gán Watermark Run-ID để tránh trùng mã hash khi nộp nhiều acc.
- **Telegram Bot Remote Controller (grammY)**:
  - Chạy cơ chế **Long-polling** (không cần IP tĩnh, không cần domain hay webhook).
  - Các lệnh: `/status`, `/jobs`, `/cancel <job_id>`.
  - Tự động push notification báo kết quả `[SUCCESS]` hoặc `[FAILED]` kèm log tóm tắt.
- **Web Dashboard**:
  - Giao diện Full-Width chuẩn **Cloudflare Tech & ShadcnBlocks**.
  - Hỗ trợ đầy đủ **Light / Dark Mode**.
  - Tích hợp kiểm tra phiên bản và thông báo cập nhật GitHub Release tự động.
