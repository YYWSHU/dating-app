# Campus-Connect 项目分析

> **仓库**: https://github.com/Prasanna0908/Campus-Connect
> **技术栈**: React + Express + MongoDB + Passport.js + JWT
> **定位**: 校园社交论坛（非 Dating App），Reddit 风格讨论平台

---

## 1. 项目概述

Campus-Connect 是一个面向大学生的 Reddit 风格讨论论坛。虽然不是 Dating App，但它的**校园邮箱认证**、**JWT 认证**、**React 架构**和**组件化设计**值得参考。

### 技术栈
- **前端**: React 17 + Redux + styled-components
- **后端**: Express + Passport.js + JWT + bcrypt
- **数据库**: MongoDB (Mongoose)
- **测试**: Jest + Enzyme（前端170+测试用例）

---

## 2. 功能目录

### Feature 1: JWT Token 认证系统 ⭐⭐⭐⭐

**Code**: `/tmp/CampusConnect/server/auth/`

**关键实现**:

```javascript
// jwt.js — Token 签发
const token = jwt.sign({ id: user._id }, config.jwt.secret, {
  expiresIn: config.jwt.expiry  // '7d'
});

// local.js — Passport Local Strategy
const localStrategy = new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({ username });
  const valid = await user.isValidPassword(password);
  return done(null, user.toJSON());
});
```

**对 ding-app 的参考**:
- Passport.js 提供了标准的 Local Strategy 实现
- `config.js` 中 JWT 配置集中管理（secret, expiry）
- 我们的 JWT 实现已经覆盖了这些，但 Passport 模式值得参考

### Feature 2: 用户密码安全 ⭐⭐⭐

**Code**: `/tmp/CampusConnect/server/models/user.js`

```javascript
// bcrypt 自动 hash
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 验证方法
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// toJSON 自动去除密码
userSchema.options.toJSON.transform = (doc, ret) => {
  delete ret.password;
  return ret;
};
```

**对 ding-app 的参考**:
- Mongoose `pre('save')` hook 自动 hash — Prisma 中需手动调用
- `toJSON.transform` 去密码 — 我们已在 service 层用解构 `{ password, ...rest }` 实现

### Feature 3: 校园邮箱验证 ⭐⭐⭐⭐⭐

**Code**: `/tmp/CampusConnect/server/models/user.js:7-16`

```javascript
email: {
  type: String,
  trim: true,
  lowercase: true,
  // 应该在这里验证 .edu 结尾
},
confirmed: {
  type: Boolean,
  default: false  // 默认未验证
}
```

**关键设计**:
- `email` 字段支持 trim + lowercase
- `confirmed` 字段标记邮箱是否已验证（默认 false）
- 结合 CampusDate 的 Nodemailer 验证码，可以构建完整的校园邮箱验证流程

**对 ding-app 的价值**: 如果我们要做校园版 dating app，这个 `.edu` 验证方案可以直接采用。

### Feature 4: Redux 状态管理 ⭐⭐

**Code**: `/tmp/CampusConnect/client/src/`

```
actions/     auth.js, error.js, posts.js, theme.js
reducers/    auth.js, error.js, form.js, posts.js, theme.js
middleware/   auth.js, error.js, theme.js
store.js
```

**对 ding-app 的参考**: Redux 模式很重，我们已经用了 Zustand（更轻量）。但 actions/reducers 的划分思路可以参考。

### Feature 5: 帖子系统（CRUD + 投票）⭐⭐

**功能**: 创建帖子、分类、评论、upvote/downvote

- Post Model: title, content, category, author, upvotes, downvotes, comments[]
- Comment Model: content, author, post
- Category: ReactJS, NodeJS, MongoDB, Express (技术分类)

**对 ding-app 的参考**: 用户生成内容和互动模式可以参考，但不是核心需求

### Feature 6: 前端表单校验 ⭐⭐⭐

**Code**: `/tmp/CampusConnect/client/src/components/SignupForm/validate.js`

- 用户名长度、密码复杂度、email 格式
- 统一错误消息格式

### Feature 7: JWT 前端中间件 ⭐⭐⭐

**Code**: `/tmp/CampusConnect/client/src/middleware/auth.js`

- 检查 localStorage 中的 JWT Token
- 未登录时自动跳转登录页
- 与我们 `api/client.ts` 的 interceptor 思路一致

---

## 3. 架构亮点

### 3.1 组件文件组织
每个组件独立目录，包含 Component.js + Container.js：
```
components/Post/
├── Content/         # 子组件
├── Vote/            # 子组件
│   ├── Component.js # 展示层
│   ├── Container.js # 逻辑层 (connect Redux)
│   ├── Upvote.js
│   └── Downvote.js
└── index.js
```

### 3.2 测试覆盖率高
前端 60+ 测试文件（每个组件有对应 `.test.js`）、后端 3 个测试文件

### 3.3 完整的 Shared 组件库
```
components/shared/
├── Author.js, Button.js, Empty.js, DeleteButton.js
├── form/          # 表单组件库
│   ├── Form/Wrapper.js, Input.js, Label.js, SubmitButton.js
│   ├── RadioGroup/, SelectWrapper.js
│   └── renderField.js
└── Markdown/      # Markdown 渲染器
```

---

## 4. 值得借鉴的设计

| 设计 | 说明 | 优先级 |
|------|------|--------|
| **email.confirmed 字段** | 布尔标记邮箱验证状态，简单有效 | ⭐⭐⭐⭐ |
| **email trim+lowercase** | Prisma schema 中应加此约束 | ⭐⭐⭐ |
| **Shared 表单组件库** | 统一 Input/Label/Submit/Error 的 UI | ⭐⭐⭐ |
| **pre('save') 自动 hash** | Prisma 不适合 mongoose middleware，但思路可参考 | ⭐⭐ |
| **toJSON 去密码** | 我们已在 service 层做了，保持即可 | ⭐⭐ |
| **Empty/Loading/Error 组件** | 与 Complete-Dating-App 的建议一致 | ⭐⭐⭐ |
| **测试文化** | 每个组件都有测试 | ⭐⭐ |

---

## 5. 不应借鉴的问题

| 问题 | 说明 |
|------|------|
| **email 校验未实现** | Schema 定义了 email 字段但无 .edu 正则校验 |
| **Redux 过于复杂** | 一个论坛不需要 Redux，用 Zustand 足够 |
| **Container/Component 分离** | React Hooks 出现后此模式已过时 |
| **MongoDB 没有 mongodb+srv** | 连接字符串使用了普通 mongodb://，不安全 |
