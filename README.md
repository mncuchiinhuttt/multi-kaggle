<div align="center">

# Multi-Kaggle

**A lightweight, cross-platform Kaggle multi-account orchestrator and compute farm manager.**  
Manage GPU & TPU quotas across multiple Kaggle accounts, dispatch notebooks with automated anti-collision watermarking, control training remotely via Telegram Bot, and monitor execution through a Cloudflare Tech & Shadcn-styled dashboard.

[![Release](https://img.shields.io/github/v/release/mncuchiinhuttt/multi-kaggle?color=f6821f&label=Release&style=flat-square)](https://github.com/mncuchiinhuttt/multi-kaggle/releases/latest)
[![Bun](https://img.shields.io/badge/Runtime-Bun%201.4-black?style=flat-square&logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue?style=flat-square)](https://github.com/mncuchiinhuttt/multi-kaggle)

</div>

---

## ⚡ Highlights

- **Zero Python Dependencies**: Calls Kaggle REST API v1 directly via native Bun HTTP fetch with Basic Auth and per-account proxy tunneling. No `python`, `pip`, or official `kaggle` package required.
- **Smart Compute Pooling**:
  - Aggregates **30h/week GPU** (Nvidia Tesla T4x2 / P100) and **20h/week TPU** (v3-8 with 128GB HBM) across all connected accounts.
  - Automatically routes tasks using **`MAX_QUOTA`** (chooses account with most remaining hours) or **`ROUND_ROBIN`** balance cycling.
  - Enforces Kaggle's 2 concurrent sessions limit per account.
  - Injects dynamic runtime watermarks (`# Run-ID: <uuid> - <timestamp>`) to bypass duplicate SHA-256 hash collision detection.
- **Multi-Interface Control**:
  - **Interactive TUI**: Arrow-key terminal menu with real-time GitHub release update checks.
  - **Web Dashboard**: Full-width Cloudflare Zero Trust aesthetic, dark/light mode toggle, custom Shadcn popovers, and a 52-week GitHub-style commit heatmap.
  - **CLI for AI Agents**: Native machine-readable JSON flags (`--json`) for seamless integration with Codex, Claude Code, or autonomous agent loops.
  - **Telegram Bot Bridge**: Long-polling remote daemon for `/status`, `/jobs`, `/outputs`, and emergency `/cancel` triggers.
- **Bank-Grade Local Security**: All Kaggle API tokens and session keys are encrypted with **AES-256-GCM** using PBKDF2 key derivation and stored locally in embedded `bun:sqlite`.

---

## 🚀 One-Line Installation

No manual git cloning or runtime configuration needed. Install the pre-compiled standalone binary with a single command:

### macOS & Linux
```bash
curl -fsSL https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/mncuchiinhuttt/multi-kaggle/main/install.ps1 | iex
```

*The installer auto-detects system architecture (Apple Silicon `arm64`, Intel `x64`, Linux `x64/arm64`, Windows `x64`) and links the `multikaggle` binary to your system PATH.*

---

## 🖥️ Usage

### 1. Interactive Terminal Menu (TUI)
Simply run:
```bash
multikaggle
```
An interactive terminal dashboard opens with arrow-key navigation:
```text
┌────────────────────────────────────────────────────────┐
│  MULTI-KAGGLE ORCHESTRATOR & FARM DAEMON (v1.0.0)      │
│  Daemon status: ONLINE at http://localhost:6767        │
└────────────────────────────────────────────────────────┘
 ● Version v1.0.0 · Latest Release · Standalone Runtime

 Use ↑/↓ (or j/k) to navigate, Enter to select:

  ❯ Open Web UI Dashboard
    Launch browser & manage accounts, farm compute & logs

    Print CLI Manual & Commands
    Inspect available CLI dispatch, datasets & account options

    Detach & Run in Background
    Keep daemon active while freeing current terminal window

    Shutdown Server & Exit
    Gracefully stop daemon and close database connections
```

To run directly as a background daemon on a custom port:
```bash
multikaggle serve --port 6767 --no-open
```

---

### 2. Web UI Dashboard
Open **`http://localhost:6767`** in your browser:

- **Accounts View**: Visual quota tracking (Kaggle GPU 30h, TPU 20h, Private Datasets 214.75GB, Private Models 214.75GB). Supports **1-click `kaggle.json` drag-and-drop import** or manual credential entry.
- **Browser OAuth Flow**: Access `http://localhost:6767/auth` in any browser or private incognito window to authenticate Kaggle accounts via official OAuth with automatic callback.
- **Dispatch View**: Select `.ipynb` or `.py` files, pick routing strategy, configure hardware accelerators, and deploy to Kaggle servers.
- **Jobs & Telemetry**: Real-time status polling, full terminal output streams, and 1-click artifact download buttons (`.pt`, `.csv`, `.png`).
- **Usage & Heatmap**: 52-week compute heatmap with active streak counters and hardware utilization charts.

---

### 3. CLI Command Reference (for Developers & AI Agents)

#### Dispatching Notebooks
```bash
# Deploy to dual Nvidia Tesla T4 GPU (default)
multikaggle run ./train_model.ipynb --title "DeepSeek-R1-LoRA"

# Deploy to Nvidia Tesla P100 GPU (16GB HBM2)
multikaggle run ./train_p100.ipynb --p100

# Deploy to Cloud TPU v3-8 (128GB HBM)
multikaggle run ./jax_pretrain.ipynb --tpu

# Deploy to Standard CPU (Zero quota deduction)
multikaggle run ./data_pipeline.py --cpu

# Machine-readable JSON output for AI Agent integration
multikaggle run ./agent_task.ipynb --json
```

#### Inspecting & Downloading Output Artifacts
```bash
# View downloadable output files and tail stdout logs
multikaggle outputs <job_id>

# Download all output weights and files to a local directory
multikaggle outputs <job_id> --download ./artifacts/
```

#### Managing Datasets & Accounts
```bash
# Search datasets across connected accounts
multikaggle datasets --search "imagenet"

# List account statuses & remaining quotas
multikaggle accounts

# Add credentials via CLI
multikaggle accounts add --label "Node-1" --username "user_one" --key "token_abc" --proxy "http://proxy.host:8080"

# Emergency abort running session
multikaggle cancel <job_id>

# Update Multi-Kaggle binary to latest release (keeps all local data intact)
multikaggle update
```
---

### 4. Telegram Bot Remote Daemon

Configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in the Settings tab to control your farm from your phone:

| Command | Action |
| :--- | :--- |
| `/status` | Summary of account health, remaining GPU (30h), TPU (20h), and disk quotas. |
| `/jobs` | List active sessions, run duration, and assigned hardware. |
| `/outputs <id>` | Direct download links to generated artifacts sent to your chat. |
| `/datasets [query]` | Query private and public datasets across accounts. |
| `/cancel <id>` | Immediately terminate a running kernel to rescue GPU/TPU allowance. |

*The bot runs via native **Long-Polling** (`grammY`), requiring zero public IP, domain, or webhook configuration.*

---

## 🛠️ Architecture & Tech Stack

```text
[Telegram Client]           [Browser / AI Agent]           [Terminal CLI]
        │                            │                           │
        ▼                            ▼                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Multi-Kaggle Unified Daemon (Bun 1.4 Runtime)                         │
│  ├─ Hono HTTP & API Server (:6767)                                     │
│  ├─ Interactive TUI Engine (Raw TTY Navigation)                        │
│  ├─ grammY Telegram Bot (Long-Polling Bridge)                          │
│  ├─ Background Poller Service (Telemetry Sync & Alerts)                │
│  ├─ Native Kaggle REST Client (HTTP Basic Auth & Proxy Tunneling)      │
│  └─ Embedded SQLite with WAL Mode & AES-256-GCM Encryption             │
└────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Kaggle Compute Infrastructure (api.kaggle.com)                        │
│  ├─ Nvidia Tesla T4 (2x 16GB GDDR6)                                    │
│  ├─ Nvidia Tesla P100 (16GB HBM2)                                      │
│  └─ Google Cloud TPU v3-8 (128GB HBM)                                  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Runtime**: [Bun](https://bun.sh)
- **Backend Framework**: [Hono](https://hono.dev)
- **Frontend Dashboard**: React 19 + Tailwind CSS + Lucide Icons + React Router v7
- **Database Engine**: Native `bun:sqlite` with WAL mode
- **Cryptographic Engine**: Node/Bun `crypto` AES-256-GCM with PBKDF2 salt

---

## 📦 Building from Source

```bash
# Clone repository
git clone https://github.com/mncuchiinhuttt/multi-kaggle.git
cd multi-kaggle

# Install backend dependencies
bun install

# Build frontend bundle
bun run build:frontend

# Run full test suite (14/14 automated tests)
bun test

# Start development server
bun run dev
```

---

## 🔒 Security & Privacy

1. **No External Telemetry**: Multi-Kaggle operates 100% locally. Zero metrics or credentials leave your machine except direct HTTPS requests to `api.kaggle.com`.
2. **Encrypted at Rest**: API keys and tokens are encrypted before being written to SQLite using a 32-byte master key.
3. **Network Isolation**: Supports optional HTTP/SOCKS5 proxy per account to avoid IP correlation across multi-account farming.

---

## ☕ Support the Project

Multi-Kaggle is free and open-source software. If this tool helped maximize your GPU compute research:

- ⭐ **Star the repository on [GitHub](https://github.com/mncuchiinhuttt/multi-kaggle)**
- ☕ **Buy me a coffee**: Click the **Donate** button on the dashboard navbar to support server infrastructure via VietQR.

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.
