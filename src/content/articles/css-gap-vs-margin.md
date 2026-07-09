---
title: "Stop Using Margin for Flexbox Spacing — Use Gap"
description: "Why gap is the modern replacement for margin-based spacing in flex and grid layouts."
category: "CSS"
tags: ["css", "flexbox", "grid", "layout"]
coreTakeaway: "gap replaces margin-based spacing hacks — no last-child exceptions, works natively in flexbox and grid."
publishDate: 2026-07-08
difficulty: "Beginner"
---

If you're still adding `margin-right` to flex children and then overriding it on the last one, there's a simpler way.

## The old way

```css
.container { display: flex; }
.container > * { margin-right: 16px; }
.container > *:last-child { margin-right: 0; }
```

Three rules, one of them exists purely to undo the other two.

## The new way

```css
.container {
  display: flex;
  gap: 16px;
}
```

One line. No exceptions to remember. Works identically in `grid`.

## Why this matters

`gap` has been supported in all major browsers since 2021 for flexbox, and even longer for grid. There's no real reason left to reach for margin hacks — `gap` is simpler, and it doesn't leak spacing outside the container the way margin can.