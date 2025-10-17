# ArkTS 文件简化验证工具

## 📖 简介

精简版验证工具，仅显示**哪些文件有问题**和**通过率统计**，支持自动生成报告和趋势分析。

### ✨ 核心特性

- ✅ **默认生成报告** - 每次运行自动保存验证结果
- ✅ **自动汇总更新** - 追踪成功率变化趋势
- ✅ **按目录分组** - 支持多项目目录对比
- ✅ **历史数据保留** - 保留最近100条验证记录

## 🚀 快速使用

### 方式1: 使用 npm scripts（推荐）

```bash
# 默认验证（自动生成报告）
npm run validate
# → 生成 reports/validation_2025-10-17T07-02-24.json
# → 更新 reports/summary.json

# 仅显示结果，不生成报告
npm run validate:no-report

# JSON格式输出（也会生成报告）
npm run validate:json

# 查看历史趋势
npm run trend
```

### 方式2: 直接运行

```bash
# 默认验证（自动生成报告）
node validate_simple.js ./examples

# 仅显示结果，不生成报告
node validate_simple.js ./examples --no-report

# JSON格式输出（也会生成报告）
node validate_simple.js ./examples --json

# 手动指定报告文件名
node validate_simple.js ./examples --output=reports/my_report.json

# 验证其他目录
node validate_simple.js /path/to/your/project
```

## 📊 报告管理

### 默认行为

每次运行 `npm run validate` 时，会自动：

1. 生成带时间戳的验证报告：`reports/validation_2025-10-17T07-02-24.json`
2. 更新汇总报告：`reports/summary.json`

### 禁用报告生成

```bash
# 仅显示结果，不保存报告
npm run validate:no-report

# 或
node validate_simple.js ./examples --no-report
```

### 汇总报告结构

`reports/summary.json` 保存所有历史验证记录：

```json
{
  "history": [
    {
      "timestamp": "2025-10-17T07:02:24.477Z",
      "datetime": "2025/10/17 15:02:24",
      "targetDir": "./examples",
      "total": 23,
      "passed": 8,
      "failed": 15,
      "passRate": "34.78"
    },
    ...
  ]
}
```

- 自动保留最近 **100 条**记录
- 按时间顺序排列
- 支持多目录分组分析

### 报告格式

**JSON 格式**（包含时间戳，便于跟踪）：

```json
{
  "timestamp": "2025-10-17T06:55:40.353Z",
  "datetime": "2025/10/17 14:55:40",
  "targetDir": "./examples",
  "summary": {
    "total": 23,
    "passed": 8,
    "failed": 15,
    "passRate": "34.78%"
  },
  "passedFiles": [...],
  "failedFiles": [...]
}
```

**文本格式**：

```
╭────────────────────────────────────────╮
│     ArkTS 文件验证结果统计             │
╰────────────────────────────────────────╯

验证时间: 2025/10/17 14:55:31
目标目录: ./examples

┌──────────────┬────────┐
│ 指标         │ 数值   │
├──────────────┼────────┤
│ 总文件数     │     23 │
│ ✅ 通过      │      8 │
│ ❌ 失败      │     15 │
│ 通过率       │ 34.78% │
└──────────────┴────────┘
```

### 趋势分析示例

```
╭────────────────────────────────────────────────────────────╮
│              验证成功率趋势分析                            │
╰────────────────────────────────────────────────────────────╯

┌────────────────────┬───────┬───────┬───────┬─────────┐
│ 验证时间           │ 总数  │ 通过  │ 失败  │ 通过率  │
├────────────────────┼───────┼───────┼───────┼─────────┤
│ 2025/10/01 10:00:00 │    23 │     5 │    18 │  21.74% │
│ 2025/10/10 12:30:00 │    23 │     7 │    16 │  30.43% │
│ 2025/10/17 14:55:00 │    23 │     8 │    15 │  34.78% │
└────────────────────┴───────┴───────┴───────┴─────────┘

📊 趋势分析:

  首次验证: 2025/10/01 10:00:00 - 21.74%
  最新验证: 2025/10/17 14:55:00 - 34.78%
  📈 提升: +13.04%
```

### 表格格式

```
╔════════════════════════════════════════╗
║     ArkTS 文件验证结果统计             ║
╚════════════════════════════════════════╝

┌──────────────┬────────┐
│ 指标         │ 数值   │
├──────────────┼────────┤
│ 总文件数     │     23 │
│ ✅ 通过      │      8 │
│ ❌ 失败      │     15 │
│ 通过率       │ 34.78% │
└──────────────┴────────┘

❌ 解析失败的文件:
   1. examples/file1.ets
   2. examples/file2.ets
   ...

✅ 解析通过的文件:
   1. examples/file3.ets
   2. examples/file4.ets
   ...
```

### JSON 格式

```json
{
  "summary": {
    "total": 23,
    "passed": 8,
    "failed": 15,
    "passRate": "34.78%"
  },
  "passedFiles": [
    "examples/file1.ets",
    "examples/file2.ets"
  ],
  "failedFiles": [
    "examples/file3.ets",
    "examples/file4.ets"
  ]
}
```

## 💡 使用场景

### 1. 日常快速检查

```bash
# 默认会生成报告，方便后续查看趋势
npm run validate
```

### 2. 跟踪修复进度

```bash
# 第1天：修复前
npm run validate
# → 通过率: 34.78%

# 第2天：修复后
npm run validate
# → 通过率: 45.00%

# 查看趋势
npm run trend
# → 📈 提升: +10.22%
```

### 3. 多项目对比

```bash
# 验证不同目录
node validate_simple.js ./project-a/src
node validate_simple.js ./project-b/src

# 查看趋势（按目录分组显示）
npm run trend
```

### 4. CI/CD 集成

```yaml
# .github/workflows/validate.yml
- name: Validate ArkTS
  run: |
    npm run validate    # 自动生成报告
    npm run trend       # 显示趋势
```

## 🎯 何时使用

**使用简化版**:
- ✅ 只需要知道哪些文件有问题
- ✅ 快速检查通过率
- ✅ 跟踪成功率变化趋势
- ✅ CI/CD 中的简单检查
- ✅ 生成历史记录

---

**版本**: 1.0.0  
**创建时间**: 2025-10-17
