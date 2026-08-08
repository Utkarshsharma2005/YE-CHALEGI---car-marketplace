
#!/usr/bin/env bash
# ─── YE CHALEGI — One-command dev startup ─────────────────────────────────────
# Usage: bash start.sh  (or  npm run dev  from project root)
# This script:
#   1. Clears any stale processes on ports 5173 & 5000
#   2. Starts the Express backend in one terminal tab
#   3. Starts the Vite frontend in another terminal tab
# ─────────────────────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  🚗  YE CHALEGI — Starting development servers"
echo ""

# 1. Kill any stale processes on our ports
echo "  ► Clearing ports 5173 & 5000..."
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true
sleep 0.5

# 2. Check .env files exist — create from examples if missing
if [ ! -f "$ROOT/server/.env" ]; then
  echo "  ► No server/.env found — copying from .env.example"
  cp "$ROOT/server/.env.example" "$ROOT/server/.env"
fi

if [ ! -f "$ROOT/client/.env" ]; then
  echo "  ► No client/.env found — copying from .env.example"
  cp "$ROOT/client/.env.example" "$ROOT/client/.env"
fi

# 3. Start backend
echo "  ► Starting backend on http://localhost:5000 ..."
cd "$ROOT/server" && npm run dev &
SERVER_PID=$!

# 4. Start frontend
echo "  ► Starting frontend on http://localhost:5173 ..."
cd "$ROOT/client" && npm run dev &
CLIENT_PID=$!

echo ""
echo "  ✅  Both servers running!"
echo "      Frontend → http://localhost:5173"
echo "      Backend  → http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop both."
echo ""

# Wait & forward Ctrl+C to both processes
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0" INT TERM
wait $SERVER_PID $CLIENT_PID
