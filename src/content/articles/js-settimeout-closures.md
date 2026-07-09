---
title: "Why Your setTimeout Loop Logs the Wrong Number"
description: "A classic closure gotcha with var inside loops and setTimeout, and how let fixes it."
category: "JavaScript"
tags: ["javascript", "closures", "settimeout", "var", "let"]
coreTakeaway: "var is function-scoped, so every setTimeout callback shares the same variable — let creates a new binding per loop iteration."
publishDate: 2026-07-08
difficulty: "Intermediate"
---

This is one of the most common closure surprises in JavaScript.

## The problem

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// logs: 3, 3, 3
```

You'd expect `0, 1, 2` — instead you get `3` three times.

## Why it happens

`var` is **function-scoped**, not block-scoped. All three `setTimeout` callbacks close over the *same* `i` variable. By the time the callbacks actually run (100ms later), the loop has already finished, and `i` is `3`.

## The fix

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// logs: 0, 1, 2
```

`let` is **block-scoped** — each loop iteration gets its own fresh `i`, so each callback closes over a different value.

## The takeaway

This isn't really about `setTimeout` — it's about understanding that closures capture *variables*, not *values*. `var` gives every closure the same variable; `let` gives each one its own.