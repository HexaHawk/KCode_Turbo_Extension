#!/bin/bash
# Load KCode Turbo Extension in a Chromium-based browser
#
# Usage:
#   ./launch-browser.sh
#   ./launch-browser.sh --browser "Google Chrome"
#   ./launch-browser.sh --url http://127.0.0.1:5494

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KIMI_URL="${KIMI_URL:-http://127.0.0.1:5494}"
BROWSER="${BROWSER:-}"

# Parse args
while [[ $# -gt 0 ]]; do
  case $1 in
    --browser)
      BROWSER="$2"
      shift 2
      ;;
    --url)
      KIMI_URL="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--browser \"Browser Name\"] [--url http://host:port]"
      exit 1
      ;;
  esac
done

# Auto-detect if not specified
if [ -z "$BROWSER" ]; then
  for candidate in "Opera" "Google Chrome" "Chromium" "Brave Browser" "Microsoft Edge" "Vivaldi"; do
    if [ -d "/Applications/${candidate}.app" ]; then
      BROWSER="$candidate"
      break
    fi
  done
fi

if [ -z "$BROWSER" ]; then
  echo "[Launcher] ERROR: No Chromium-based browser detected in /Applications."
  echo "[Launcher] Supported: Google Chrome, Chromium, Opera, Brave Browser, Microsoft Edge, Vivaldi"
  echo "[Launcher] Specify manually: BROWSER='Google Chrome' $0"
  exit 1
fi

APP_PATH="/Applications/${BROWSER}.app"
BINARY_DIR="${APP_PATH}/Contents/MacOS"

# Resolve the actual binary name inside the app bundle
BINARY=""
if [ -x "${BINARY_DIR}/${BROWSER}" ]; then
  BINARY="${BINARY_DIR}/${BROWSER}"
else
  # Some apps use a different binary name (e.g. "Brave" inside "Brave Browser")
  BINARY=$(find "${BINARY_DIR}" -maxdepth 1 -type f -perm +111 | head -1)
fi

if [ -z "$BINARY" ] || [ ! -x "$BINARY" ]; then
  echo "[Launcher] ERROR: Could not find executable binary inside ${APP_PATH}"
  exit 1
fi

# Check if browser is already running
if pgrep -f "$(basename "$BINARY")" > /dev/null 2>&1; then
  echo ""
  echo "⚠️  WARNING: ${BROWSER} is already running."
  echo "   The extension can only be loaded when the browser starts fresh."
  echo "   Please quit ${BROWSER} completely (Cmd+Q) and run this launcher again."
  echo ""
  echo "[Launcher] Opening Kimi Web URL anyway..."
  open -a "$BROWSER" "$KIMI_URL"
  exit 0
fi

echo "[Launcher] Starting ${BROWSER} with extension loaded..."
"$BINARY" --load-extension="${SCRIPT_DIR}" > /dev/null 2>&1 &

sleep 4

open -a "$BROWSER" "$KIMI_URL"

echo "[Launcher] ${BROWSER} started with KCode Turbo Extension."
