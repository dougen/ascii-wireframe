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
a markdown code block on GitHub. The skill also ships `scripts/canvas.mjs`, a
grid canvas that draws by coordinate and verifies alignment before you present.

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
代码块里都成立。技能附带 `scripts/canvas.mjs`：按坐标绘制并校验对齐的网格
画布。

### 安装

```
npx skills add dougen/ascii-wireframe
```

### 许可证

MIT
