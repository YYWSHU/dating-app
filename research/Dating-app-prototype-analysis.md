# Dating-app-prototype 项目分析

> **仓库**: https://github.com/AthsaraFernando/Dating-app-prototype
> **技术栈**: Python Flask + scikit-learn + DeepSeek API
> **定位**: 匹配算法原型——这是 4 个项目中**最有参考价值的一个**。

---

## 1. 项目概述

这是一个 Python Flask 原型，核心价值在于**实现了完整的多维度匹配算法**：
- **MBTI 人格兼容性** (20% 权重)
- **Big Five 人格相似度** (40% 权重) — 基于 cosine similarity
- **兴趣爱好相似度** (40% 权重) — 基于 NLP embedding

项目还集成了 DeepSeek API 做 AI 聊天建议（搭讪语生成），以及一个简单的双向选择聊天系统。

---

## 2. 核心功能详解

### Feature 1: 多维度匹配算法 ⭐⭐⭐⭐⭐

**这是本项目最重要的参考功能**。

**Code**: `/tmp/DatingPrototype/matchmaking.py`（完整算法，~80行）

**算法流程**:
```
1. 加载用户 embeddings（Big Five + 爱好向量）
2. 过滤：排除同性、年龄差 >5 岁的用户
3. 逐个候选用户计算匹配分：
   match_score = MBTI * 0.2 + Big_Five_Cosine * 0.4 + Hobbies_Cosine * 0.4
4. 按分数降序排列，取 Top 10
```

**三要素详解**:

| 要素 | 权重 | 计算方法 | 数据来源 |
|------|------|----------|----------|
| MBTI 兼容性 | 20% | 查 MBTI_COMPATIBILITY 矩阵（16×16），转 [0,1] | 用户表单填 MBTI |
| Big Five 人格 | 40% | `cosine_similarity(embedding1, embedding2)` | OpenAI embedding API |
| 兴趣爱好 | 40% | `cosine_similarity(embedding1, embedding2)` | 用户选择的 hobbies 列表做 embedding |

**伪代码**:
```python
def get_match_score(user, other_user):
    mbti_score = MBTI_COMPATIBILITY[user.mbti][other_user.mbti] / 100  # [0,1]
    big_five_sim = cosine_similarity(user.big_five_embedding, other_user.big_five_embedding)
    hobbies_sim = cosine_similarity(user.hobbies_embedding, other_user.hobbies_embedding)
    return mbti_score * 0.2 + big_five_sim * 0.4 + hobbies_sim * 0.4
```

### Feature 2: GPT Embedding 向量化 ⭐⭐⭐⭐

**Code**: `/tmp/DatingPrototype/generate_embeddings.py`

- 使用 OpenAI text-embedding API 将用户的大五人格和爱好分别编码为向量
- Big Five: 将 5 个维度值拼接为 "Openness: 0.8, Conscientiousness: 0.6..." 文本后做 embedding
- Hobbies: 将爱好列表 "reading, cooking, hiking" 拼接为文本后做 embedding
- 结果存入 `user_embeddings.json`

### Feature 3: 人格问卷表单 ⭐⭐⭐⭐

**Code**: `/tmp/DatingPrototype/templates/form.html`

用户在注册时填写：
- 基本信息：name, age, gender, location
- **MBTI 人格类型**：16 种类型下拉选择
- **Big Five 人格维度**（5 个 0-10 滑条）:
  - Openness（开放性）
  - Conscientiousness（尽责性）
  - Extraversion（外向性）
  - Agreeableness（宜人性）
  - Neuroticism（神经质）
- **Hobbies 多选**：预设爱好标签列表

**对 ding-app 的启示**: 我们可以添加一个可选的"人格问卷"环节，用户可选择填写来获得更精准的匹配。

### Feature 4: AI 搭讪建议 ⭐⭐⭐

**Code**: `/tmp/DatingPrototype/app.py:225-250`

- 使用 DeepSeek API (`deepseek-chat` model)
- 获取最近 5 条聊天记录作为上下文
- 生成 "conversation starter or pick up line"
- **API endpoint**: `GET /chat/ai-suggestions/:user_id/:contact_id`

**值得借鉴**: 匹配成功后，可以有一个 AI 生成的破冰话题帮用户打开对话

### Feature 5: 双向选择聊天系统 ⭐⭐⭐

**Code**: `/tmp/DatingPrototype/app.py:159-219`

- 只有双向 Accept 的用户之间才能聊天（与我们的 Match 逻辑一致）
- Chat ID 格式: `min(a,b)_max(a,b)` 确保同一对用户只有一个聊天记录
- 消息存储在 JSON 文件中（生产环境应为数据库）

### Feature 6: 匹配分排序展示 ⭐⭐⭐⭐

**Code**: `/tmp/DatingPrototype/app.py:51-58`

```python
@app.route('/test/<user_id>')
def test(user_id):
    match_scores = load_json(MATCH_SCORES_FILE)
    user_matches = next(entry['matches'] for entry in match_scores 
                       if entry['user_id'] == user_id)
    return render_template('test.html', user_id=user_id, matches=user_matches)
```

- 展示匹配列表时按 `compatibility_score` 降序
- 每个用户可 Accept/Reject
- 我们可以在 Discover 排序中引入匹配分

---

## 3. 数据模型

### 用户数据 (fake_user_data.json)
```json
{
  "id": "user_1",
  "name": "Alice",
  "age": 24,
  "gender": "Female",
  "location": "New York",
  "mbti": "INFP",
  "big_five": {
    "Openness": 0.8,
    "Conscientiousness": 0.6,
    "Extraversion": 0.4,
    "Agreeableness": 0.9,
    "Neuroticism": 0.3
  },
  "hobbies": ["reading", "painting", "hiking"]
}
```

### 用户 Embedding (user_embeddings.json)
```json
{
  "id": "user_1",
  "big_five_embedding": [0.1, 0.2, ...],  // 1536维向量
  "hobbies_embedding": [0.3, 0.1, ...]    // 1536维向量
}
```

### 匹配分 (match_scores.json)
```json
{
  "user_id": "user_1",
  "matches": [
    {"user_id": "user_5", "name": "Bob", "compatibility_score": 0.87},
    {"user_id": "user_3", "name": "Charlie", "compatibility_score": 0.72}
  ]
}
```

---

## 4. 最值得借鉴的内容（优先级排序）

| 优先级 | 功能 | 实现复杂度 | 对 ding-app 的价值 |
|--------|------|-----------|-------------------|
| 🥇 | **多维度匹配评分** | 中 | 替代我们现有的"仅按距离排序"，大幅提升匹配质量 |
| 🥈 | **MBTI 人格兼容矩阵** | 低 | 16×16 查表即可，不需要 AI，纯算法 |
| 🥉 | **Big Five 人格问卷** | 中 | 5个滑条收集，无需 embedding，可直接做向量相似度 |
| 4 | **AI 破冰话题生成** | 中 | 需要 DeepSeek API，匹配后生成第一句话 |
| 5 | **Embedding 相似度匹配** | 高 | 需要 OpenAI API，对于生产环境成本较高 |

---

## 5. 如何集成到 ding-app

### 立即可做（< 1 天）:
1. 在 User 模型中添加 `mbti` (可选 String) 和 `big_five` (可选 JSON) 字段
2. 前端添加可选的"人格问卷"页面（form.html 可直接参考）
3. 后端实现 `get_match_score()` 函数，在 discover API 中按分排序
4. 用户不填问卷时退化为现有的距离排序

### 中期可做:
5. 接入 OpenAI/DeepSeek embedding API 做爱好向量化
6. 实现 AI 破冰建议

### 长期可做:
7. 用户行为数据训练协同过滤推荐模型

---

## 6. 不应借鉴的问题

| 问题 | 说明 |
|------|------|
| **JSON 文件做数据库** | 生产环境不可用，但我们已有 PostgreSQL |
| **明文 API Key** | `app.py:223` 直接 `os.getenv("DEEPSEEK_API_KEY")`，无 fallback |
| **MBTI 权重不合理** | 所有类型对都用同一套兼容性分数（90/85/80...），不够科学 |
| **无真正的前端** | 只有 Jinja2 模板 + jQuery，UI/UX 不可参考 |
| **年龄差硬编码为 5** | 不考虑用户偏好 |
