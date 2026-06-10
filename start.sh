#!/bin/bash

# ============================================
# Dating App - 一键启动前后端
# ============================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$PROJECT_DIR/packages/server"
WEB_DIR="$PROJECT_DIR/packages/web"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止服务...${NC}"
    kill $SERVER_PID 2>/dev/null
    kill $WEB_PID 2>/dev/null
    echo -e "${GREEN}✅ 服务已停止${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   💕 遇见 - Dating App Launcher   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════╝${NC}"
echo ""

# 0. 清理旧进程
echo -e "${YELLOW}🧹 清理旧进程...${NC}"
kill $(lsof -ti:3001) 2>/dev/null && echo -e "   ✅ 已停止旧后端" || true
kill $(lsof -ti:5173) 2>/dev/null && echo -e "   ✅ 已停止旧前端" || true
sleep 1

# 1. 检查 PostgreSQL
echo -e "${YELLOW}📦 检查数据库...${NC}"
if pg_isready -q 2>/dev/null; then
    echo -e "${GREEN}   ✅ PostgreSQL 已运行${NC}"
else
    echo -e "${YELLOW}   ⚠️  PostgreSQL 未运行，尝试启动...${NC}"
    sudo service postgresql start 2>/dev/null || {
        echo -e "${RED}   ❌ 无法启动 PostgreSQL，请手动启动${NC}"
        exit 1
    }
    sleep 2
    echo -e "${GREEN}   ✅ PostgreSQL 已启动${NC}"
fi

# 2. 检查 node_modules
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}📦 安装依赖...${NC}"
    cd "$PROJECT_DIR" && npm install
    echo ""
fi

# 3. 启动后端
echo -e "${YELLOW}🚀 启动后端服务...${NC}"
cd "$SERVER_DIR"
npx tsx --env-file=.env src/index.ts &
SERVER_PID=$!
sleep 2

if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}   ✅ 后端已启动: http://localhost:3001${NC}"
else
    echo -e "${RED}   ❌ 后端启动失败${NC}"
    exit 1
fi

# 4. 启动前端
echo -e "${YELLOW}🎨 启动前端服务...${NC}"
cd "$WEB_DIR"
npx vite --host &
WEB_PID=$!
sleep 2

if kill -0 $WEB_PID 2>/dev/null; then
    echo -e "${GREEN}   ✅ 前端已启动: http://localhost:5173${NC}"
else
    echo -e "${RED}   ❌ 前端启动失败${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${CYAN}╔════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🎉 启动成功！                    ║${NC}"
echo -e "${CYAN}║                                  ║${NC}"
echo -e "${CYAN}║  前端: http://localhost:5173      ║${NC}"
echo -e "${CYAN}║  后端: http://localhost:3001      ║${NC}"
echo -e "${CYAN}║                                  ║${NC}"
echo -e "${CYAN}║  按 Ctrl+C 停止所有服务          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📧 测试账号: alice@test.com / 123456${NC}"
echo ""

# 等待子进程
wait
