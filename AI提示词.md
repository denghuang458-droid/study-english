# 🤖 AI 助手提示词 · 四六级英语学习网站

> 复制以下内容发给 AI 助手，即可快速上手维护本项目。

---

## 项目背景

这是一个**本地纯前端**的四六级英语学习网站，包含单词学习（跟打/听写）、记忆复习系统、桌宠养成（衣橱/投喂）等多功能。全部代码在本地文件夹，双击或通过 VS Code 内置浏览器打开 `index.html` 即可运行，无需服务器、无需构建。

## 项目位置

```
C:\Users\Hms13\Desktop\typing-site\
```

## 文件结构

| 文件 | 作用 |
|------|------|
| `index.html` | 页面结构（学习视图、弹窗、桌宠） |
| `style.css` | 全部样式 |
| `script.js` | 全部逻辑（约 3000+ 行） |
| `cet4.tsv` | 四级词汇库（475 词，**7 列**） |
| `cet6.tsv` | 六级词汇库（100 词，5 列） |
| `phrases.tsv` | 常用短语（20 条，5 列） |
| `cet4_import.tsv` / `cet6_import.tsv` | 旧版导入模板（仅参考） |
| `script.js.bak` | 旧版备份 |

## 词库格式（重要）

**TSV = Tab 分隔**，首行为表头。`cet4.tsv` 为 7 列，`cet6.tsv`/`phrases.tsv` 为 5 列（解析器兼容）：

```
en  phonetic  cn  example  exampleCn  synonym  root
```

- `synonym` = 同义反义（如 `同义：desert, give up反义：retain, hold on`）
- `root` = 词根记忆（如 `a - 脱离 + band 束缚；挣脱束缚→抛弃`）

**加词**：用文本编辑器在对应 `.tsv` 末尾加一行即可，无需改代码。运行时通过 `fetch` 异步加载（file:// 下可用，已验证）。

## 核心功能

### 学习模式
- **分类**：四级核心(cet4) / 六级核心(cet6) / 常用短语(phrases) / 四级长难句 / 六级长难句 / 错题本
- **单词跟打**（type）：输完自动下一个，实时判定
- **听写测试**（dict）：单拼写模式——输入+Enter 直接判定，打对 600ms 自动下一个、打错显示答案 1200ms 自动下一个；**纯默写界面**（隐藏例句/同义反义/词根记忆）；只对普通词表可用（长难句/错题本仅支持跟打）
- **记忆度**：打对自动标记掌握(2)，打错自动标记薄弱(0)（存 `learn-mastery-{分类}`）；**已掌握概念不显示**，只显示「⏳ 待复习 N」
- **🎯 复习模式**（reviewToggle 按钮）：只复习打错过的薄弱词（level<2），进度显示「🎯 复习 1/3」
- **例句高亮**：例句中当前单词用 `<mark>` 高亮
- **快捷键**：按 Shift 播放当前词发音（输入框无内容时）
- **词形变化**：📚 按钮弹窗（复数/时态/派生词，基于 DERIVED）

### 错题本
- 只记录**听写打错**的词（跟打失败不入错题本）
- 连续做对 3 次自动移出；错题本分类下显示「🗑️ 错题管理」按钮（单个/全部移除）

### 桌宠（canvas 像素头像）
- 12 星座形象 + 13 发饰，按学习时间解锁（localStorage：`pet-time`/`pet-balance`/`pet-unlocked` 等）
- **破解检测**：`pet-time >= 500000` 会被重置清零，破解值应 < 500000
- 投喂 6 种食物（有「叮咚」音效）

### 账号系统
- localStorage：`acc-current` + `acc-{用户名}`，各账号进度独立
- 进度键含 `ACC_PROGRESS_KEYS`（新增键需加入该数组才会随账号保存）

## 数据存储（localStorage 键）

| 键 | 用途 |
|----|------|
| `pet-time` / `pet-balance` / `pet-unlocked` / `pet-outfit` / `pet-decor` / `pet-feed` | 桌宠解锁进度 |
| `learn-wrong` | 错题本 |
| `learn-mastery-{cet4/cet6/phrases}` | 记忆度（0=薄弱/2=掌握） |
| `learn-progress-*` | 各分类历史最佳成绩 |
| `learn-sound` / `learn-key-sound` | 发音/音效开关 |
| `acc-current` / `acc-{用户}` | 账号 |

## 注意事项

1. 网站用 **file:// 协议**直接打开，`fetch` 本地 TSV 可用（已验证）；如换其他打开方式需本地服务器
2. `script.js` 约 3000+ 行，修改前先 `grep` 定位，大块数据/行删除可用脚本精确处理
3. 改 HTML 新增元素时务必核对 `id` 与 JS 引用一致，否则 init 会报错
4. `VOCAB` 中普通词表从 TSV 加载（`loadVocab()` 异步），长难句内联在 JS；`init` 里 `loadVocab().then(startLearn)`
5. 词库 docx 来源《四级高频词汇.docx》（437 词条，仅覆盖 A-F 字母），如需扩充 G-Z 需新素材

## 常用任务示例（可直接复用）

**1. 补充词库**（把新单词加进 cet4.tsv）：
```
把以下单词按 cet4.tsv 的 7 列格式（en\phonetic\cn\example\exampleCn\synonym\root）补充进去：
[列出单词和内容]
```

**2. 修改界面**：
```
在 [index.html/script.js/style.css] 中 [具体需求]，保持现有风格
```

**3. 排查问题**：
```
[描述现象]，先检查 script.js 中 [相关函数]，定位并修复
```

**4. 新增功能**：
```
给网站加一个 [功能]，说明：数据存储用 localStorage、UI 风格参考现有组件、完成后在浏览器实测
```

---

*生成日期：2026-08-08*
