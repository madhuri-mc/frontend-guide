---
title: "The Complete React Render Cycle: Trigger, Render, Commit, and Paint"
description: "A precise breakdown of how React actually updates the screen — from what triggers a render, through reconciliation, to the browser's own paint step."
category: "React"
tags: ["react", "rendering", "lifecycle", "reconciliation", "hooks", "useEffect", "useLayoutEffect", "browser-paint"]
coreTakeaway: "React's update cycle has four distinct steps — trigger, render (which includes reconciliation), commit, and paint — and the browser owns the last one, not React."
publishDate: 2026-07-11
difficulty: "Advanced"
relatedArticles: ["react-lifecycle-explained", "why-does-useeffect-exist", "why-you-cant-call-hooks-conditionally"]
---

## What this article builds on

If you've read [React Lifecycle, Explained](/articles/react-lifecycle-explained), you already know a component goes through mount, update, and unmount. This article goes one level deeper: what actually happens, step by step, every time React updates the screen — and where the browser's own work fits into that process.

## When developers actually run into this

This precision matters once the simple mental model of "React updates the screen" isn't enough — for example, when you need to measure a DOM element right after a change and `useLayoutEffect` is often the better fit because it runs before paint. Or when you're trying to understand why a component re-renders at all when nothing on screen visibly changed. Both come down to understanding the actual named steps React goes through, not just a vague sense that "it updates."

## The four steps, precisely

**1. Trigger** — nothing renders spontaneously. A render always starts because something triggered it: either the component's **initial mount**, or an **update** — `setState` being called, a parent re-rendering and passing new props, or a context value changing. Identifying the trigger is often the actual answer to "why did this render happen."

**2. Render** — React calls your component function (and any children affected) to calculate what the new JSX output should be. Inside this step, React uses **reconciliation** — the diffing algorithm that compares the new output against the previous render's output to figure out the *minimal* set of actual changes needed. Reconciliation isn't a separate step that happens after render; it's the mechanism React uses *during* render to avoid unnecessary work. This entire step only produces a description of what should change — nothing on screen is touched yet.

**3. Commit** — React takes the result of reconciliation and applies exactly those changes to the real DOM — inserting, updating, or removing elements. This is React's own work, and it happens synchronously.

**4. Paint** — once the DOM has changed, the **browser** — not React — does its own separate work: recalculating layout, repainting affected pixels, and compositing the final frame. In some cases, the browser may skip painting entirely if no visible change is needed. React's job is finished once commit is done; paint is the browser taking over from there.

## Seeing the trigger-to-paint chain in code

```jsx
function Box() {
  const [open, setOpen] = useState(false); // state that will act as a trigger

  console.log('render step: calculating output, open =', open);

  useLayoutEffect(() => {
    console.log('after commit, before browser paint');
  });

  useEffect(() => {
    console.log('after browser paint');
  });

  return (
    <button onClick={() => setOpen(true)}>
      {open ? 'Open' : 'Closed'}
    </button>
  );
}

// Console output on first render
// render step: calculating output, open = false
// after commit, before browser paint
// after browser paint

// Console output after clicking the button
// render step: calculating output, open = true
// after commit, before browser paint
// after browser paint
```

Clicking the button **triggers** an update. React re-renders (recalculating output, reconciling against the previous tree), commits the one changed piece of text to the DOM, and only then does the browser paint the updated button to the screen. The console logs land in exactly that order — render, then `useLayoutEffect` (post-commit, pre-paint), then `useEffect` (post-paint) — because each one is tied to a specific, named step in this chain.

## When to actually reach for each one

**Default to `useEffect`.** It doesn't block the browser from painting, so your UI stays responsive — this is the right choice for the vast majority of side effects: data fetching, subscriptions, logging, and setting up timers.

**Reach for `useLayoutEffect` only when both of these are true:**
- You're reading something from the DOM (like an element's size or position), and
- You're using that measurement to make a visual change the user should never see flicker into place

A common real example: positioning a tooltip based on the size of its target element. If you measure and adjust in `useEffect`, the browser may have already painted the tooltip in the wrong spot for one frame — a visible jump. `useLayoutEffect` runs before that paint happens, so the adjustment is invisible.

**One practical warning:** `useLayoutEffect` is synchronous and blocks the browser from painting until it finishes. Overusing it for things that don't actually need pre-paint timing can make your app feel sluggish, since you're delaying the paint the user is waiting for. If you're not measuring the DOM to prevent a visual flicker, you almost certainly want `useEffect`.

## Why this happens (the deeper reason)

React separates these four steps because each one has a different job and different constraints. Trigger identifies *that* something needs to happen. Render (with reconciliation inside it) figures out *what* needs to change, and is deliberately interruptible and repeatable — this is what enables concurrent features, since React can pause or discard a render that hasn't committed yet. Commit *applies* those changes, synchronously and without interruption, because a half-applied DOM update would leave the page in a broken state. Paint is handed off entirely to the browser, because rendering pixels to a screen is a specialized job the browser is already optimized for, and React has no need to duplicate that work. A simple way to remember it is: trigger starts the update, render decides what should change, commit applies it, and paint shows it. Once you can name which of these four steps you're in, questions like "why did this re-render," "why is my DOM measurement stale," or "should I use `useEffect` or `useLayoutEffect`" stop being memorized rules and become direct, obvious consequences of the step you're dealing with.