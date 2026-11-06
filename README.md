# ascii-wireframe

[中文](#中文)

An agent skill for drawing UI wireframes, screen mockups, page layouts, and
terminal UI sketches as pure-ASCII text diagrams that stay aligned under any
monospace font.

## Example

Describe a sign-in screen and you get a diagram like this:

```
+--------------------------------------------------+
| ACME                                             |
|                                                  |
|           +--------------------------+           |
|           |         Sign In          |           |
|           +--------------------------+           |
|                                                  |
|           Email                                  |
|           +--------------------------+           |
|           | you@example.com          |           |
|           +--------------------------+           |
|                                                  |
|           Password                               |
|           +--------------------------+           |
|           | **************           |           |
|           +--------------------------+           |
|           [x] Remember me     Forgot?            |
|                                                  |
|           +--------------------------+           |
|           |         Sign In          |           |
|           +--------------------------+           |
+--------------------------------------------------+
```

Every glyph is ASCII, so the alignment holds in Consolas, in a terminal, and in
a markdown code block on GitHub.

## What's inside

| Path | What it is |
| --- | --- |
| `SKILL.md` | The rules, the canvas API, sizing, and the workflow |
| `references/layouts.md` | Dashboard, table, mobile list, dialog, callout sketch, screen flow |
| `scripts/canvas.mjs` | Grid canvas that draws by coordinate and verifies alignment |
| `evals/evals.json` | Three test prompts with verifiable expectations |

`canvas.mjs` renders by coordinate so lines cannot drift, then checks the result
before you present it:

```sh
node scripts/canvas.mjs diagram.txt   # exit 1 on any finding
```

It reports non-ASCII glyphs, tabs, floating vertical rules, dangling corners,
rows that never close, and right edges that land on no corner column.

## Install

```
npx skills add dougen/ascii-wireframe
```

## License

MIT

---

## 中文

用纯 ASCII 文本绘制 UI 线框图、界面草稿、页面布局和终端界面草图，在任何
等宽字体下都保持对齐。

### 示例

描述一个登录界面，得到的是这样的图：

```
+--------------------------------------------------+
| ACME                                             |
|                                                  |
|           +--------------------------+           |
|           |         Sign In          |           |
|           +--------------------------+           |
|                                                  |
|           Email                                  |
|           +--------------------------+           |
|           | you@example.com          |           |
|           +--------------------------+           |
|                                                  |
|           Password                               |
|           +--------------------------+           |
|           | **************           |           |
|           +--------------------------+           |
|           [x] Remember me     Forgot?            |
|                                                  |
|           +--------------------------+           |
|           |         Sign In          |           |
|           +--------------------------+           |
+--------------------------------------------------+
```

图中每个字符都是 ASCII，所以对齐在 Consolas、在终端、在 GitHub 的 markdown
代码块里都成立。

### 目录结构

| 路径 | 内容 |
| --- | --- |
| `SKILL.md` | 规则、画布 API、尺寸约束与工作流 |
| `references/layouts.md` | 仪表盘、表格、移动端列表、弹窗、带编号标注的草图、多屏流程 |
| `scripts/canvas.mjs` | 按坐标绘制并校验对齐的网格画布 |
| `evals/evals.json` | 三个测试用例及其可验证的期望 |

`canvas.mjs` 按坐标渲染，行不会漂移，出稿前再校验一次：

```sh
node scripts/canvas.mjs diagram.txt   # 有任何问题退出码为 1
```

它会报告非 ASCII 字符、制表符、悬空竖线、孤立拐角、未闭合的行，以及右端
落不到拐角列的行。

### 安装

```
npx skills add dougen/ascii-wireframe
```

### 许可证

MIT
