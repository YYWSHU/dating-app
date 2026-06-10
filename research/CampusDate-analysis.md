# CampusDate 项目分析

> **仓库**: https://github.com/babyspider/CampusDate
> **技术栈**: MERN (MongoDB + Express + React Native/Expo + Node.js)
> **定位**: 校园 Dating App 原型，方向最贴近我们的项目

---

## 1. 项目概述

CampusDate 是一个面向大学生的约会应用原型，采用 MERN 全栈架构。项目规模较小（核心代码约 500 行），但功能结构清晰，适合作为参考。

### 文件结构
```
mern/
├── server/                      # Express 后端
│   ├── index.js                 # 入口 + MongoDB 连接
│   ├── models/
│   │   ├── user-schema.js       # 用户模型
│   │   ├── match-schema.js      # 匹配模型
│   │   └── preferences-schema.js # 偏好模型（兴趣爱好）
│   ├── routes/
│   │   ├── user.routes.js       # 用户 API
│   │   ├── match.routes.js      # 匹配 API
│   │   ├── match.js             # (空文件)
│   │   └── preferences.routes.js # 偏好 API
│   └── resources/
│       ├── sendMail.js          # 邮件发送（Nodemailer）
│       └── config.json          # 邮件配置
└── campusdate/                 # React Native/Expo 前端
    └── src/
        ├── App.js               # 入口 + 首页（粉色主题）
        ├── index.js             # ReactDOM 渲染
        ├── useToken.js          # Token 管理 Hook
        ├── useLocalStorage.js   # LocalStorage Hook
        └── components/
            ├── login/           # 登录组件
            ├── signup/          # 注册组件
            ├── createprofile/   # 创建个人资料
            ├── editprofile/     # 编辑个人资料
            ├── profile/         # 查看他人资料
            └── matches/         # 匹配列表
```

---

## 2. 功能目录

### Feature 1: 邮箱验证码注册

- **What**: 用户注册时通过邮箱接收验证码完成验证
- **Implementation**: 调用 Nodemailer 发送硬编码验证码 `4453`，不走数据库存储验证码
- **Code**: `/tmp/CampusDate/mern/server/routes/user.routes.js:31-39`
- **API**: `GET /users/register/:email`
- **问题**: 验证码硬编码为 `4453`，不安全；前端无验证码输入框

### Feature 2: 邮箱+密码登录

- **What**: 简单的邮箱密码登录（未做密码哈希！）
- **Implementation**: URL 参数传递 `email:password`，直接 MongoDB 查询明文匹配
- **Code**: `/tmp/CampusDate/mern/server/routes/user.routes.js:41-56`
- **API**: `GET /users/login/:data`（data = `email:password`）
- **严重安全问题**:
  - 密码明文存储！user schema 中 password 是 String 类型，无 bcrypt
  - 密码在 URL 中传递，会被浏览器历史和服务器日志记录
  - 无 JWT Token，无 session 管理

### Feature 3: 用户 CRUD

- **What**: 完整的用户增删改查
- **Implementation**: 标准 Express + Mongoose CRUD
- **Code**: `/tmp/CampusDate/mern/server/routes/user.routes.js:10-101`
- **API**:
  - `POST /users/create` — 创建用户
  - `GET /users/` — 列出所有用户
  - `GET /users/get/:email` — 按邮箱查用户
  - `GET /users/edit/:id` — 获取用户（编辑用）
  - `PUT /users/update/:id` — 更新用户
  - `DELETE /users/delete/:id` — 删除用户

### Feature 4: 用户资料模型

- **What**: MongoDB Schema 定义用户属性
- **Code**: `/tmp/CampusDate/mern/server/models/user-schema.js`
- **Fields**: email, password, name, age, pictures(Array), desc

### Feature 5: 兴趣爱好偏好

- **What**: 6 个布尔字段的兴趣标签系统
- **Code**: `/tmp/CampusDate/mern/server/models/preferences-schema.js`
- **Fields**: email, anime, art, cooking, reading, sports, videogames
- **API**:
  - `POST /preferences/create` — 创建偏好
  - `GET /preferences/` — 列出所有偏好
  - `GET /preferences/find/:email` — 按邮箱查询
  - `PUT /preferences/update/:id` — 更新偏好
  - `DELETE /preferences/delete/:id` — 删除偏好

### Feature 6: 匹配系统

- **What**: 记录用户之间的匹配/不匹配关系
- **Code**: `/tmp/CampusDate/mern/server/models/match-schema.js`
- **Schema**: `from_email`, `to_email`, `is_match` (Boolean)
- **API**:
  - `POST /matches/create/:femail/:temail/:isMatch` — 创建匹配
  - `GET /matches/` — 获取所有匹配
  - `PUT /matches/update/:id` — 更新匹配状态
  - `DELETE /matches/delete/:id` — 删除匹配

### Feature 7: 前端首页

- **What**: React Native 粉色主题首页，Sign Up / Log In 两个按钮
- **Code**: `/tmp/CampusDate/mern/campusdate/src/App.js`
- **技术**: React Native (View, Text, Pressable, StyleSheet) + react-router-dom Link
- **样式**: 粉色背景，圆角按钮

### Feature 8: Token 管理

- **What**: 基于 sessionStorage 的简单 Token 存取
- **Code**: `/tmp/CampusDate/mern/campusdate/src/useToken.js`
- **实现**:
  - `setToken(userToken)`: `sessionStorage.setItem('token', JSON.stringify(userToken))`
  - `getToken()`: 从 sessionStorage 读取并解析

---

## 3. 数据模型

### User
```javascript
{ email, password, name, age, pictures[], desc }
```

### Match
```javascript
{ from_email, to_email, is_match }
```

### Preferences
```javascript
{ email, anime, art, cooking, reading, sports, videogames }
```

**注意**: 所有密码都是明文存储，无加密。

---

## 4. API 端点汇总（12个）

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /users/create | 创建用户 |
| GET | /users/ | 列出所有用户 |
| GET | /users/register/:email | 发送验证邮件 |
| GET | /users/login/:data | 登录（不安全） |
| GET | /users/get/:email | 按邮箱查用户 |
| PUT | /users/update/:id | 更新用户 |
| DELETE | /users/delete/:id | 删除用户 |
| POST | /preferences/create | 创建偏好 |
| GET | /preferences/ | 列出偏好 |
| GET | /preferences/find/:email | 查偏好 |
| POST | /matches/create/:femail/:temail/:isMatch | 创建匹配 |
| GET | /matches/ | 列出匹配 |

---

## 5. 值得借鉴的设计

| 设计点 | 说明 | 优先级 |
|--------|------|--------|
| **兴趣标签系统** | 6 个 Boolean 的简单标签，比我们的 tags[] 更结构化，方便匹配计算 | ⭐⭐ |
| **邮箱验证流程** | Nodemailer + 验证码的思路是对的（实现需要加强） | ⭐⭐⭐ |
| **匹配记录含 is_match 状态** | 记录"谁看了谁"（无论是否匹配），用于去重和提供数据 | ⭐⭐⭐ |
| **React Native 定位** | 项目目标是移动端，与我们的 Web 版互补 | ⭐ |
| **粉色主题设计** | 首页粉色调 + 大标题的品牌感 | ⭐⭐ |

## 6. 不应借鉴的问题

| 问题 | 严重程度 | 说明 |
|------|----------|------|
| **密码明文存储** | 🔴 致命 | User schema 无 bcrypt，password 直接存 String |
| **密码在 URL 中传递** | 🔴 致命 | `GET /users/login/email:password` 把密码暴露在 URL |
| **无 JWT/Session** | 🔴 严重 | 登录后无认证机制，sessionStorage 中的 token 仅前端使用 |
| **验证码硬编码** | 🟡 中等 | `4453` 写死在代码中，不是随机生成的 |
| **无输入校验** | 🟡 中等 | 所有参数直接传入 MongoDB，无 Zod/Joi 校验 |
| **MongoDB 连接串硬编码** | 🟡 中等 | 含密码的 MongoDB Atlas URL 明文写在 index.js 中 |
| **匹配算法缺失** | 🟡 中等 | 只是手动创建 match 记录，没有任何自动匹配逻辑 |
