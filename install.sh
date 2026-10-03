#!/bin/sh
set -e

# Multi-Kaggle 1-line installer for macOS & Linux
REPO="mncuchiinhuttt/multi-kaggle"
INSTALL_DIR="/usr/local/bin"

echo "==> Multi-Kaggle Installer"

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Linux)
    TARGET_OS="linux"
    ;;
  Darwin)
    TARGET_OS="darwin"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

case "$ARCH" in
  x86_64)
    TARGET_ARCH="x64"
    ;;
  aarch64|arm64)
    TARGET_ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

BINARY_NAME="multikaggle-${TARGET_OS}-${TARGET_ARCH}"
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${BINARY_NAME}"

echo "==> Target: ${TARGET_OS}-${TARGET_ARCH}"
echo "==> Downloading latest standalone binary from GitHub..."

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/multikaggle" || {
    echo "Download failed from: $DOWNLOAD_URL"
    exit 1
  }
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$TMP_DIR/multikaggle" "$DOWNLOAD_URL" || {
    echo "Download failed from: $DOWNLOAD_URL"
    exit 1
  }
else
  echo "Error: curl or wget is required to install."
  exit 1
fi

chmod +x "$TMP_DIR/multikaggle"

echo "==> Installing to ${INSTALL_DIR}/multikaggle..."
if [ -w "$INSTALL_DIR" ]; then
  mv "$TMP_DIR/multikaggle" "${INSTALL_DIR}/multikaggle"
else
  sudo mv "$TMP_DIR/multikaggle" "${INSTALL_DIR}/multikaggle"
fi

echo ""
echo "Multi-Kaggle installed successfully!"
echo "Run 'multikaggle' to launch the Web UI Dashboard."
echo "Run 'multikaggle --help' to inspect CLI options."
