# Kikoscope RACE 数据导入与核心功能重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 导入 RACE 数据集（26,572 篇文章 + 真实题目），修复核心功能（单词弹窗、详情页、收藏），重构沉浸式阅读页和独立做题页。

**Architecture:**
- RACE 数据通过 `src/lib/race-data.ts` 解析为统一格式，与现有 `articles.ts` 和 `quiz-questions.ts` 集成
- 核心功能修复聚焦现有代码问题：单词弹窗、单词详情页、收藏功能
- 沉浸式阅读页扩展 `ArticleReader.tsx`，添加难词标注、问AI、开始练习按钮
- 独立做题页创建 `/articles/[slug]/quiz` 路由，左右分栏布局

**Tech Stack:** Next.js 16, React 19, TypeScript, TailwindCSS 4, Gemini API, localStorage

---

## 文件结构

### 需要修改的文件
- `src/lib/articles.ts` - 集成 RACE 数据加载
- `src/lib/quiz-questions.ts` - 集成 RACE 题目
- `src/app/articles/[slug]/page.tsx` - 重构沉浸式阅读页
- `src/components/ArticleReader.tsx` - 扩展功能
- `src/app/word/[word]/page.tsx` - 验证/修复
- `src/app/vocabulary/page.tsx` - 验证/修复
- `src/app/api/define/route.ts` - 验证
- `src/app/quiz/solve/page.tsx` - 参考后移除或重定向

### 需要创建的文件
- `src/lib/race-data.ts` - RACE 数据解析工具
- `src/app/articles/[slug]/quiz/page.tsx` - 新的独立做题页

---

## Task 1: 解析 RACE 数据格式

**Files:**
- Create: `src/lib/race-data.ts`

**RACE 数据结构（每篇 .txt 文件）:**
```json
{
  "article": "文章内容（多段落，\n 分隔）",
  "questions": ["问题1", "问题2", "问题3", "问题4"],
  "options": [
    ["选项A", "选项B", "选项C", "选项D"],
    ["选项A", "选项B", "选项C", "选项D"],
    ["选项A", "选项B", "选项C", "选项D"],
    ["选项A", "选项B", "选项C", "选项D"]
  ],
  "answers": ["A", "B", "C", "D"]
}
```

- [ ] **Step 1: 创建 RACE 数据类型定义**

```typescript
export interface RaceArticle {
  id: string;
  slug: string;
  article: string;
  questions: string[];
  options: string[][];
  answers: string[];
  level: 'middle' | 'high';
  split: 'train' | 'dev' | 'test';
}

export interface RaceQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
```

- [ ] **Step 2: 创建 RACE 数据加载函数**

```typescript
import fs from 'fs';
import path from 'path';

const RACE_DIR = path.join(process.cwd(), 'data', 'RACE');

export function getAllRaceArticles(): RaceArticle[] {
  // 遍历 train/middle, train/high, dev/middle, dev/high
  // 读取所有 .txt 文件
  // 解析 JSON 并转换为统一格式
}

export function getRaceArticleBySlug(slug: string): RaceArticle | null {
  // 根据 slug 查找文章
}

export function getRaceQuestions(slug: string): RaceQuestion[] {
  // 返回该文章的所有题目
}
```

- [ ] **Step 3: 转换现有 Article 格式**

```typescript
import { Article, ArticleParagraph, ArticleSentence } from './articles';

export function raceToArticle(race: RaceArticle): Article {
  // 将 RACE 文章转换为现有 Article 格式
  // 段落按 \n 分割
  // 句子按 .!? 分割
}
```

**验证:**
- 运行 `npm run build` 无类型错误
- 能正确加载 RACE 数据

---

## Task 2: 集成 RACE 数据到现有系统

**Files:**
- Modify: `src/lib/articles.ts`
- Modify: `src/lib/quiz-questions.ts`

- [ ] **Step 1: 修改 articles.ts，整合两种数据源**

```typescript
// 现有文章（data/articles/）
// + RACE 文章（data/RACE/）
// 返回统一的 Article[]
```

- [ ] **Step 2: 修改 quiz-questions.ts，支持 RACE 题目**

```typescript
// 硬编码题目
// + RACE 真实题目
// 按文章 slug 索引
```

- [ ] **Step 3: 更新文章列表过滤逻辑**

```typescript
// 确保 articles/[slug]/page.tsx 能访问 RACE 文章
// slug 命名：race-{split}-{level}-{id}
// 例如：race-train-high-1
```

**验证:**
- 文章列表能显示 RACE 文章
- 文章详情页能正确加载 RACE 文章内容

---

## Task 3: 验证并修复核心功能

**Files:**
- Verify: `src/app/api/define/route.ts`
- Verify: `src/components/ArticleReader.tsx`
- Verify: `src/app/word/[word]/page.tsx`
- Verify: `src/app/vocabulary/page.tsx`

- [ ] **Step 1: 测试单词定义 API**

```bash
# 测试 Free Dictionary API
curl http://localhost:3000/api/define?word=apple
```

**验证:**
- 返回单词定义
- 多层回退正常工作

- [ ] **Step 2: 测试单词弹窗**

在浏览器中：
- 打开任意文章
- 点击任意单词
- 弹窗显示：音标、定义、收藏按钮

**验证:**
- 弹窗正确显示
- 收藏功能能添加到 localStorage
- 点击"查看详情"跳转到单词详情页

- [ ] **Step 3: 测试单词详情页**

```bash
# 手动测试
# 访问 /word/[word]
```

**验证:**
- 音标、发音正常
- 近义词、搭配显示
- 真题例句显示

- [ ] **Step 4: 测试词库页面**

```bash
# 手动测试
# 收藏几个单词后访问 /vocabulary
```

**验证:**
- 已收藏单词正确显示
- 支持删除
- PDF 导出功能正常

---

## Task 4: 重构沉浸式阅读页

**Files:**
- Modify: `src/components/ArticleReader.tsx`
- Modify: `src/app/articles/[slug]/page.tsx`

**需求:**
- 句子卡片式展示
- 点击句子显示翻译
- 点击单词查词
- 难词标注（高亮）
- 问 AI 功能
- 底部"开始练习"按钮

- [ ] **Step 1: 添加难词标注功能**

```typescript
// 在 ArticleReader 中
// 1. 统计词频
// 2. 识别低频词汇（自定义列表或词频低于阈值）
// 3. 高亮显示难词
// 悬停显示提示
```

- [ ] **Step 2: 添加"问 AI"功能**

```typescript
// 添加按钮：选中句子或单词后
// 弹出"问 AI"选项
// 调用 Gemini API 进行：
// - 语法分析
// - 翻译
// - 释义
```

- [ ] **Step 3: 添加"开始练习"按钮**

```typescript
// 文章底部按钮
// 点击跳转到 /articles/[slug]/quiz
```

- [ ] **Step 4: 验证沉浸式阅读页整合

**验证:**
- 句子卡片显示正常
- 点击单词查词
- 难词高亮
- 问 AI 功能可用
- 开始练习按钮跳转正确

---

## Task 5: 重构独立做题页

**Files:**
- Create: `src/app/articles/[slug]/quiz/page.tsx`
- Reference: `src/app/quiz/solve/page.tsx`

**需求:**
- 左：原文（可折叠）
- 右：题目
- 答题交互
- 提交后显示解析

- [ ] **Step 1: 创建新路由 `/articles/[slug]/quiz`**

```typescript
// 从 slug 获取文章
// 获取题目（优先 RACE 真实题目，没有则调用 generate-questions）
```

- [ ] **Step 2: 实现左右分栏布局**

```typescript
// 左侧：文章原文（可折叠/展开）
// 右侧：题目列表
```

- [ ] **Step 3: 答题交互**

```typescript
// 选择题交互
// 选中答案高亮
// 提交按钮
```

- [ ] **Step 4: 解析展示**

```typescript
// 提交后
// 显示正确答案
// 显示解析（RACE 题目无详细解析时用 AI 生成）
```

- [ ] **Step 5: 验证做题页

**验证:**
- 左右分栏正常
- 能答题
- 提交后显示解析
- RACE 真实题目正确显示

---

## Task 6: 最终验证

- [ ] **Step 1: 端到端测试**

```bash
npm run build
# 确保无构建错误
```

- [ ] **Step 2: 手动测试流程**

1. 首页 → 文章列表 → 选择 RACE 文章
2. 阅读页：点击单词查词 → 收藏单词
3. 点击"开始练习" → 做题页
4. 提交 → 查看解析
5. 词库页查看已收藏单词

- [ ] **Step 3: 验证数据量检查
- 至少 100 篇 RACE 文章可用
- 每篇文章对应 4 道真实题目
