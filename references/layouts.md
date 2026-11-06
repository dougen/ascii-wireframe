# Layout library

Screens worth lifting from. Each diagram is drawn with `scripts/canvas.mjs` and
passes the verifier as a whole, so copy the shape and change the labels instead
of redrawing from scratch. The notes under each one say what the layout is
buying you.

## Dashboard

```
+----------------------------------------------------------------------------+
| ACME                  Dashboard       Projects      Reports          [JD]  |
|                                                                            |
+------------------+---------------------------------------------------------+
|                  |                                                         |
|                  |    Overview                                  [+ New]    |
| Overview         |                                                         |
|                  |  +--------------+  +--------------+  +--------------+   |
| Projects         |  |              |  |              |  |              |   |
|                  |  | 1,284        |  | 36           |  | 99.9%        |   |
| Tasks            |  | Users        |  | Active       |  | Uptime       |   |
|                  |  +--------------+  +--------------+  +--------------+   |
| Settings         |                                                         |
|                  |                                                         |
|                  |  +--------------------------------------------------+   |
|                  |  | Traffic                           ###            |   |
|                  |  |                       ###         ###            |   |
|                  |  |           ###         ###         ###            |   |
|                  |  |           ###         ###   ###   ###            |   |
|                  |  |     ###   ###         ###   ###   ###   ###      |   |
|                  |  |     ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  |     ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  | 0   ###   ###   ###   ###   ###   ###   ###      |   |
|                  |  +--------------------------------------------------+   |
|                  |                                                         |
+----------------------------------------------------------------------------+
```

The sidebar divider runs the full height and joins the header rule at a `+`.
Nested frames inside a frame work as long as no two rectangles touch: the gap
between the stat cards is a column of its own, and the chart sits a row below
them.

## Data table

```
+--------------------------------------------------------------------------+
| Users                                                                    |
| +------------------------+                             +--------------+  |
| | Search...              |                             |  [+ New]     |  |
| +------------------------+                             +--------------+  |
|  +----------------------+-------------+-------------+----------------+   |
|  | Name                 | Role        | Status      | Actions        |   |
|  +----------------------+-------------+-------------+----------------+   |
|  | Alice Chen           | Admin       | [x] Active  | [E] [D]        |   |
|  | Bob Liu              | Editor      | [x] Active  | [E] [D]        |   |
|  | Carol Wang           | Viewer      | [ ] Pending | [E] [D]        |   |
|  | Dan Zhou             | Viewer      | [ ] Invited | [E] [D]        |   |
|  |                      |             |             |                |   |
|  +----------------------+-------------+-------------+----------------+   |
|                                                                          |
| [x] select all          Delete selected                                  |
|                                                                          |
| Showing 1-4 of 128                  < Prev   1 2 3 ... 32   Next >       |
|                                                                          |
+--------------------------------------------------------------------------+
```

Draw the vertical rules for every data row first, then the separator rules, so
each `+` lands on the intersections. Column x-positions must match the rule
columns exactly; `colGrid(cols, y)` does both from one list.

## Mobile list

```
+----------------------------------+
| <            Inbox            ...|
|                                  |
+----------------------------------+
|                                  |
| +------------------------------+ |
| | Search...                    | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 1 title                 | |
| | preview text             1m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 2 title                 | |
| | preview text             2m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 3 title                 | |
| | preview text             3m  | |
| +------------------------------+ |
|                                  |
| +------------------------------+ |
| | Item 4 title                 | |
| | preview text             4m  | |
| +------------------------------+ |
|                                  |
+----------------------------------+
|                                  |
|  Home    Feed    Saved   Me      |
|                                  |
+----------------------------------+
```

Leave one blank row between stacked cards. A phone frame around 36 columns reads
as mobile; a wide frame reads as a desktop page squeezed.

## Dialog over content

```
+--------------------------------------------------------+
|                                                        |
|                                                        |
|     +============================================+     |
|     | New Project                             [X]|     |
|     +============================================+     |
|     |                                            |     |
|     | Name                                       |     |
|     | +------------------------------------+     |     |
|     | | My project                         |     |     |
|     | +------------------------------------+     |     |
|     |                                            |     |
|     | Cancel                       [ Create ]    |     |
|     +============================================+     |
|                                                        |
+--------------------------------------------------------+
```

A dialog is a heavier frame: `box(x, y, w, h, { h: '=' })`. Draw the background
screen first, then the dialog on top; the rows around it stay blank to read as
the dimmed backdrop. Never let the dialog touch the frame it sits in.

## Review sketch with callouts

```
+--------------------------------------------------------------+
|  ACME                                                 [?]    |
|                                                              |
|            +------------------------------------+            |
|            |              Sign In               |  [1]       |
|            +------------------------------------+            |
|                                                              |
|            Email                                             |
|            +------------------------------------+            |
|            | you@example.com                    |  [2]       |
|            +------------------------------------+            |
|                                                              |
|            Password                                          |
|            +------------------------------------+            |
|            | **************                     |  [3]       |
|            +------------------------------------+            |
|                                                              |
|            [x] Remember me               Forgot?             |
|                                                              |
|            +------------------------------------+            |
|            |              Sign In               |  [4]       |
|            +------------------------------------+            |
|                                                              |
+--------------------------------------------------------------+
```

Markers go in the margin at the same row as the element they point at, never
over a rule. Below the fence, one numbered line per marker:

1. Email + password sign-in, no SSO
2. Validation errors appear here, not in a toast
3. Password manager icon goes on the right edge of this field
4. Primary action; disabled until both fields are valid

Brackets tell the verifier the marker is a label, so `[1]` never registers as a
dangling corner.

## Flow across screens

```
+------------------------------------+           +------------------------------------+
|                Cart                |           |              Payment               |
|                                    |           |                                    |
| 1 item                             |           | Card number                        |
|                                    |           | +--------------------------------+ |
| +--------------------------------+ |           | | 4242 ...                       | |
| | Running shoes                  | |           | +--------------------------------+ |
| +--------------------------------+ |    -->    |                                    |
|                                    |           |                                    |
| +--------------------------------+ |           | +--------------------------------+ |
| |          [ Checkout ]          | |           | |            [ Pay ]             | |
| +--------------------------------+ |           | +--------------------------------+ |
|                                    |           |                                    |
|                                    |           |                                    |
+------------------------------------+           +------------------------------------+
```

Two screens fit side by side at about 88 columns. Past that, stack them top to
bottom with the arrow column removed; the `-->` belongs in the gap between
frames, not across a border. Three screens at desktop width exceed 100 columns,
so stack them, or shrink each frame to about 28 columns if the whole flow must
be visible at once.
