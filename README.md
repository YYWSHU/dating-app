# 💕 遇见 - 在线 Dating App

一个功能完整的在线约会 Web 应用，基于 React + Node.js/Express + PostgreSQL 构建。

## 📋 目录

- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [技术栈](#技术栈)
- [数据库设计](#数据库设计)
- [API 文档](#api-文档)
- [前端页面](#前端页面)
- [实时通信](#实时通信)
- [部署指南](#部署指南)

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 14（推荐使用已安装 PostGIS 扩展的版本）
- npm >= 9

### 一键启动

```bash
# 克隆项目
git clone https://github.com/YYWSHU/dating-app.git
cd dating-app

# 一键启动
./start.sh
```

### 手动启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example packages/server/.env
# 编辑 packages/server/.env 中的数据库连接等信息

# 3. 创建数据库并运行迁移
cd packages/server
npx prisma migrate dev --name init --schema=src/prisma/schema.prisma

# 4. 填充测试数据
npx tsx --env-file=.env src/prisma/seed.ts

# 5. 启动后端（终端1）
cd packages/server
npm run dev            # http://localhost:3001

# 6. 启动前端（终端2）
cd packages/web
npm run dev            # http://localhost:5173
```

### 测试账号

| 邮箱 | 密码 | 昵称 | 性别 | 偏好 |
|------|------|------|------|------|
| alice@test.com | 123456 | Alice | 女 | 男 |
| bob@test.com | 123456 | Bob | 男 | 女 |
| carol@test.com | 123456 | Carol | 女 | 男 |
| dave@test.com | 123456 | Dave | 男 | 女 |
| eve@test.com | 123456 | Eve | 女 | 不限 |

---

## 🏗 项目架构

```
dating-app/
├── start.sh                    # 一键启动脚本
├── package.json                # Monorepo 根配置
├── docker-compose.yml          # PostgreSQL + PostGIS（可选）
├── packages/
│   ├── server/                 # 后端 Express + TypeScript
│   │   ├── src/
│   │   │   ├── index.ts        # 入口：HTTP Server + Socket.io
│   │   │   ├── app.ts          # Express 应用配置
│   │   │   ├── config/env.ts   # 环境变量校验（Zod）
│   │   │   ├── middleware/     # 中间件
│   │   │   │   ├── auth.ts     # JWT 认证
│   │   │   │   ├── error.ts    # 全局错误处理
│   │   │   │   └── validate.ts # 请求校验
│   │   │   ├── modules/        # 业务模块
│   │   │   │   ├── auth/       # 注册/登录/刷新
│   │   │   │   ├── user/       # 个人资料/照片
│   │   │   │   ├── match/      # 发现/喜欢/匹配
│   │   │   │   ├── chat/       # 消息(REST + Socket)
│   │   │   │   └── location/   # 地理位置
│   │   │   ├── lib/            # 工具函数
│   │   │   └── prisma/         # Schema + 迁移 + 种子
│   │   └── uploads/            # 用户照片存储
│   └── web/                    # 前端 React + Vite
│       └── src/
│           ├── api/            # API 客户端（axios）
│           ├── components/     # UI 组件
│           │   ├── ui/         # 基础组件（Button/Card/Input/Avatar）
│           │   ├── layout/     # 布局（AppLayout/BottomNav）
│           │   ├── auth/       # 登录/注册表单
│           │   ├── profile/    # 个人资料
│           │   ├── match/      # 发现卡片/匹配列表
│           │   └── chat/       # 聊天窗口/消息气泡
│           ├── hooks/          # 自定义 Hooks
│           │   ├── useAuth.ts
│           │   ├── useSocket.ts
│           │   └── useGeolocation.ts
│           ├── pages/          # 7个页面
│           ├── stores/         # Zustand 状态管理
│           └── types/          # TypeScript 类型定义
```

---

## 🔧 技术栈

### 后端
| 技术 | 用途 |
|------|------|
| Express 4 | HTTP 框架 |
| TypeScript 5 | 类型安全 |
| Prisma 6 | ORM + 数据库迁移 |
| Socket.io 4 | WebSocket 实时通信 |
| JWT (jsonwebtoken) | 无状态认证 |
| bcryptjs | 密码哈希（12轮） |
| Zod | 运行时数据校验 |
| Multer | 文件上传 |

### 前端
| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript 5 | 类型安全 |
| Vite 6 | 构建工具（HMR极速热更新） |
| Tailwind CSS 3 | 原子化CSS |
| shadcn/ui 风格 | UI 组件系统 |
| Zustand 5 | 轻量状态管理 |
| React Router 6 | 客户端路由 |
| React Hook Form | 表单管理 |
| Socket.io Client | 实时消息 |
| Axios | HTTP 请求 + 拦截器 |

### 基础设施
| 技术 | 用途 |
|------|------|
| PostgreSQL 16 | 关系数据库 |
| PostGIS 3.4 | 地理空间扩展（可选） |
| Docker Compose | 容器化（可选） |
| npm Workspaces | Monorepo 管理 |

---

## 🗄 数据库设计

### ER 图（简化）

```
┌──────────────────────────────────────────────────────────┐
│                          User                             │
│──────────────────────────────────────────────────────────│
│ id: UUID (PK)                                            │
│ email: String (UNIQUE)                                   │
│ password: String (hashed)                                │
│ nickname: String                                         │
│ gender: Enum (male|female|other)                         │
│ interestedIn: Enum (male|female|both)                    │
│ birthDate: DateTime                                      │
│ bio: Text?                                               │
│ tags: String[]                                           │
│ avatarUrl: String?                                       │
│ latitude: Float?                                         │
│ longitude: Float?                                        │
│ maxDistance: Int (default: 50km)                         │
│ minAge: Int (default: 18)                                │
│ maxAge: Int (default: 60)                               │
└────────┬──────────────────────┬──────────────────────────┘
         │                      │
         │ 1:N                  │ 1:N
         ▼                      ▼
┌─────────────────┐   ┌─────────────────────────────────────┐
│     Photo       │   │              Like                    │
│─────────────────│   │─────────────────────────────────────│
│ id: UUID (PK)   │   │ id: UUID (PK)                       │
│ url: String     │   │ likerId: UUID (FK → User)           │
│ order: Int      │   │ likedId: UUID (FK → User)           │
│ userId: UUID    │   │ @@unique([likerId, likedId])        │
└─────────────────┘   └──────────────┬──────────────────────┘
                                     │
                                     │ (互相 Like 触发)
                                     ▼
                    ┌────────────────────────────────────────┐
                    │               Match                    │
                    │────────────────────────────────────────│
                    │ id: UUID (PK)                          │
                    │ user1Id: UUID (FK → User)              │
                    │ user2Id: UUID (FK → User)              │
                    │ lastMessageAt: DateTime?               │
                    │ @@unique([user1Id, user2Id])           │
                    └──────────────────┬─────────────────────┘
                                       │
                                       │ 1:N
                                       ▼
                    ┌────────────────────────────────────────┐
                    │              Message                   │
                    │────────────────────────────────────────│
                    │ id: UUID (PK)                          │
                    │ content: Text                          │
                    │ matchId: UUID (FK → Match)             │
                    │ senderId: UUID (FK → User)             │
                    │ isRead: Boolean                        │
                    │ createdAt: DateTime                    │
                    └────────────────────────────────────────┘
```

### 匹配逻辑

1. 用户 A 浏览发现页，看到用户 B
2. 用户 A 点击 💕 Like → 创建 `Like(A→B)`
3. 系统检测 B 是否已经 Like 了 A
4. 如果是 → 创建 `Match(A, B)`，配对成功 🎉
5. 如果否 → 等待 B 操作，暂时不匹配

### 发现算法

```
发现条件（筛选）:
  - 排除已 Like / 已 Pass 的用户
  - 性别匹配 preferred gender
  - 年龄范围 minAge ~ maxAge
  - 地理位置 ≤ maxDistance (50km 默认)

排序:
  - 按注册时间倒序（简单模式）
  - 按 Haversine 距离升序（位置模式）
```

---

## 📡 API 文档

### 基础信息

- Base URL: `http://localhost:3001/api`
- 认证方式: `Authorization: Bearer <accessToken>`
- Content-Type: `application/json`
- Token 过期: Access 15分钟, Refresh 7天

### Auth 认证

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| POST | `/api/auth/register` | 注册新用户 | ❌ |
| POST | `/api/auth/login` | 邮箱密码登录 | ❌ |
| POST | `/api/auth/refresh` | 刷新 Token | ❌ (需refreshToken) |

<details>
<summary>POST /api/auth/register — 请求示例</summary>

```json
{
  "email": "newuser@test.com",
  "password": "123456",
  "nickname": "New User",
  "gender": "male",
  "interestedIn": "female",
  "birthDate": "2000-01-01"
}
```

响应:
```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@test.com",
    "nickname": "New User",
    "gender": "male"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```
</details>

### User 用户

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | `/api/users/me` | 获取自己的资料 | ✅ |
| PATCH | `/api/users/me` | 更新资料 | ✅ |
| POST | `/api/users/me/photos` | 上传照片 (multipart) | ✅ |
| DELETE | `/api/users/me/photos/:id` | 删除照片 | ✅ |
| PATCH | `/api/users/me/photos/reorder` | 照片排序 | ✅ |
| GET | `/api/users/:id` | 查看他人资料 | ✅ |

### Match 匹配

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | `/api/discover?limit=20` | 发现附近用户 | ✅ |
| POST | `/api/likes/:userId` | 喜欢某人 | ✅ |
| DELETE | `/api/likes/:userId` | 跳过某人 | ✅ |
| GET | `/api/matches` | 匹配列表 | ✅ |
| GET | `/api/matches/:matchId` | 匹配详情 | ✅ |

<details>
<summary>POST /api/likes/:userId — 响应示例</summary>

```json
{
  "isMatch": true     // true = 双向匹配成功
}
```
</details>

### Chat 聊天

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| GET | `/api/matches/:matchId/messages` | 聊天历史（游标分页） | ✅ |
| POST | `/api/matches/:matchId/messages` | 发送消息 (REST) | ✅ |
| PATCH | `/api/messages/:id/read` | 标记已读 | ✅ |

### Location 位置

| Method | Endpoint | 描述 | 认证 |
|--------|----------|------|------|
| PATCH | `/api/users/me/location` | 更新经纬度 | ✅ |
| GET | `/api/nearby?distance=50&limit=50` | 附近用户 | ✅ |

### Socket.io 事件

| 事件 | 方向 | 描述 |
|------|------|------|
| `chat:send` | Client → Server | 发送消息 `{matchId, content}` |
| `chat:receive` | Server → Client | 接收消息 |
| `chat:sent` | Server → Sender | 发送确认 |
| `chat:typing` | Client → Server | 正在输入 |
| `chat:read` | Client → Server | 标记已读 `{messageId}` |

---

## 📱 前端页面

| 路径 | 页面 | 说明 |
|------|------|------|
| `/auth/login` | 登录页 | 渐变粉色主题，Heart Logo |
| `/auth/register` | 注册页 | 完整资料填写表单 |
| `/discover` | 发现页 | 卡片浏览，❤/✕/⭐ 操作 |
| `/matches` | 匹配列表 | 互相匹配的用户列表 |
| `/chat` | 消息列表 | 按最近消息排序 |
| `/chat/:matchId` | 聊天窗口 | 实时消息，气泡样式 |
| `/profile` | 我的资料 | 编辑资料、照片管理 |

### 页面特性

- **发现页** — 3:4 比例卡片，Like/Pass/SuperLike 三按钮，匹配成功弹窗动画
- **聊天页** — 渐变粉色发送气泡，已读标记，输入中提示，自动滚动
- **底部导航** — 4 Tab（发现/匹配/消息/我），粉色激活态
- **响应式** — 最大宽度 448px (max-w-lg)，移动端优先

---

## 🔌 实时通信

### 架构

```
┌─────────┐  chat:send   ┌──────────────┐  chat:receive  ┌─────────┐
│ Client A │ ────────────→│   Socket.io  │ ──────────────→│ Client B │
│ (Sender) │ ←────────────│    Server    │                │(Receiver)│
└─────────┘  chat:sent    └──────────────┘                └─────────┘
                                 │
                                 │ REST
                                 ▼
                         ┌──────────────┐
                         │  PostgreSQL  │
                         │  (持久化)     │
                         └──────────────┘
```

### 认证流程

1. 客户端连接时在 `auth.token` 中发送 JWT accessToken
2. 服务端 `io.use()` 中间件验证 Token
3. 验证通过后绑定 `socket.userId`，加入 `user:<userId>` 房间

### Token 刷新流程

```
API 请求 → axios 拦截器 → 检测401
    → 使用 refreshToken 换取新 accessToken
    → 重试原请求
    → 失败则跳转登录页
```

---

## 🚢 部署指南

### 生产环境准备

1. **环境变量**
   ```bash
   NODE_ENV=production
   JWT_ACCESS_SECRET=<生成强随机字符串>
   JWT_REFRESH_SECRET=<生成强随机字符串>
   DATABASE_URL=postgresql://...
   CLIENT_URL=https://your-domain.com
   ```

2. **数据库**
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;  -- 地理位置支持
   CREATE INDEX idx_users_location ON "User" USING GIST (location);
   ```

3. **构建前端**
   ```bash
   cd packages/web && npm run build
   # 输出到 packages/web/dist/
   ```

4. **启动生产模式**
   ```bash
   cd packages/server && npm run build && npm start
   ```

### 反向代理 (Nginx 示例)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/packages/web/dist;
        try_files $uri /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 上传文件
    location /uploads/ {
        proxy_pass http://localhost:3001;
    }
}
```

---

## 🔐 安全措施

- [x] 密码 bcrypt 12轮哈希
- [x] JWT 双Token机制（短access + 长refresh）
- [x] 文件上传类型白名单（仅图片）
- [x] 单文件大小限制 5MB
- [x] 照片数量上限 6 张
- [x] 数据库密码仅出现在 .env
- [x] CORS 限制
- [ ] 邮箱验证（待实现）
- [ ] 请求频率限制（待实现）
- [ ] HTTPS 强制（生产环境）

---

## 📝 后续改进

- [ ] 滑动卡片手势支持（touch events）
- [ ] 推送通知（Service Worker + Web Push）
- [ ] 图片裁剪（cropper.js）
- [ ] AI 智能推荐算法
- [ ] 举报/拉黑功能
- [ ] VIP 会员系统
- [ ] 国际化 i18n
- [ ] E2E 测试（Playwright）
- [ ] PostGIS ST_DWithin 距离查询优化
- [ ] 图片存储迁移至 S3/Cloudinary
