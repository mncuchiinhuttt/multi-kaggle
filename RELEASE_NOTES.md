## @multi-kaggle/core

### Added
- Direct integration with Kaggle API v1 using native Bun HTTP fetch with Basic Auth and per-account proxy tunneling (no Python dependency).
- Hardware compute accelerator engine supporting Nvidia Tesla T4x2 (32GB GDDR6), Nvidia Tesla P100 (16GB HBM2), Cloud TPU v3-8 (128GB HBM), and standard CPU.
- Dynamic runtime watermarking (`# Run-ID: <uuid> - <timestamp>`) to eliminate duplicate code hash collisions across multi-account dispatch.
- End-to-end quota pooling engine tracking 30h/week GPU, 20h/week TPU, 214.75GB Private Datasets, and 214.75GB Private Models.
- AES-256-GCM encryption with PBKDF2 salt derivation for all stored credentials.

### Changed
- Migrated default daemon port to `6767` to prevent port collisions with standard development servers.
- Enabled SQLite WAL mode and safe schema migrations for multi-metric quota telemetry.

## @multi-kaggle/cli

### Added
- Interactive terminal TUI with raw TTY arrow-key navigation (`↑`/`↓`/`Enter`), ANSI styling, and real-time GitHub release update checks.
- Standalone single-line installers for macOS, Linux (`curl | bash`), and Windows (`irm | iex`).
- Machine-readable `--json` output across all commands for seamless integration with autonomous AI agents.
- Dedicated subcommands: `run`, `outputs`, `datasets`, `accounts`, `jobs`, `cancel`, and `serve`.

## @multi-kaggle/dashboard

### Added
- Full-width Cloudflare Zero Trust and Shadcn-inspired responsive interface with Light/Dark mode toggle.
- 52-week GitHub commit-style compute heatmap with streak tracking, hardware breakdown, and boundary-aware tooltips.
- Dedicated `/jobs/:jobId` route with real-time hardware telemetry, terminal monospace stdout streams, and 1-click artifact download buttons.
- 1-click `kaggle.json` drag-and-drop auto-import modal and native browser OAuth flow at `/auth`.
- Integrated 3-step Telegram Bot Setup Guide modal with direct links to `@BotFather` and `@userinfobot`.

## @multi-kaggle/telegram

### Added
- Long-polling daemon bridge with strict chat ID authentication guard.
- Interactive bot commands: `/status`, `/jobs`, `/outputs <id>`, `/datasets [search]`, and emergency `/cancel <id>`.
