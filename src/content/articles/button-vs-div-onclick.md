---
title: "Why a <div onClick> Is Never a Real Button"
description: "The accessibility gap between a clickable div and a real button element, and why it matters."
category: "Accessibility"
tags: ["accessibility", "html", "semantics", "keyboard-navigation"]
coreTakeaway: "A <button> gives you keyboard support, focus states, and screen reader semantics for free — a <div onClick> gives you none of it."
publishDate: 2026-07-08
difficulty: "Beginner"
---

It's common to see something like this in real codebases:

```jsx
<div onClick={handleClick} className="button-style">
  Submit
</div>
```

It looks like a button. It is not a button, for anyone not using a mouse.

## What you lose

A plain `<div>` with an `onClick` handler:
- **Isn't keyboard-focusable** — pressing Tab skips right past it.
- **Doesn't respond to Enter or Space** — even if a keyboard user manages to focus it via other means, pressing the key does nothing.
- **Isn't announced as a button** to screen readers — it's just "text," giving no indication it's interactive.

## The fix

```jsx
<button onClick={handleClick} className="button-style">
  Submit
</button>
```

A real `<button>` element gives you all three of these behaviors automatically, with zero extra code — focusability, keyboard activation, and correct semantics are built into the element itself.

## The takeaway

Reaching for a `<div>` with an `onClick` is almost always about styling convenience, not a real technical constraint — and `<button>` can be styled to look like anything a `<div>` can. The accessibility cost isn't worth the shortcut.