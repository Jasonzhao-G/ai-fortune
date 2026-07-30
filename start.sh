#!/bin/bash
cd "$(dirname "$0")"

echo "🛑 停止旧进程..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

echo "🧹 清理缓存..."
rm -rf .next

if [ ! -f "node_modules/.bin/next" ]; then
  echo "📦 安装依赖..."
  npm install --no-audit --no-fund
fi

echo ""
echo "🚀 启动中，请等待出现 ✓ Ready"
echo "   然后打开: http://localhost:3000"
echo "   按 Ctrl+C 停止"
echo ""

npm run dev
