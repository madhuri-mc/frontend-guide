---
title: "React Lifecycle, Explained"
description: "A simple breakdown of the three stages every React component goes through: mount, update, and unmount."
category: "React"
tags: ["react", "lifecycle", "rendering", "hooks", "useEffect"]
coreTakeaway: "Every React component goes through three stages — mount, update, and unmount — and useEffect lets you hook into each one."
publishDate: 2026-07-11
difficulty: "Beginner"
relatedArticles: ["react-render-cycle-explained","why-does-useeffect-exist"]
---

## What "lifecycle" means

A React component isn't just a one-time function call — it exists on the page for a while, and during that time it goes through predictable stages. "Lifecycle" is just the name for those stages: a component is **born** (added to the page), it **grows and changes** (updates as data changes), and eventually it **dies** (gets removed from the page). Every component you write goes through some or all of these stages, whether you think about it explicitly or not.

## When developers actually run into this

This usually comes up when you need to run code at a very specific moment — "only when this component first appears," or "only right before this component disappears," or "every time this specific piece of data changes." Without understanding the three stages clearly, it's easy to put code in the wrong place and get confusing bugs, like a timer that never stops, or data that never loads.

## The three stages

**1. Mount** — the component is being added to the page for the first time. This happens once.

**2. Update** — the component re-renders because its props or state changed. This can happen many times, or not at all.

**3. Unmount** — the component is being removed from the page. This also happens once, at the end of its life.

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    console.log('mounted');

    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => {
      console.log('unmounted');
      clearInterval(interval);
    };
  }, []);

  return <p>{seconds} seconds</p>;
}
```

Here's what runs, and when:
- **"mounted"** logs once, when the component first appears.
- The interval keeps the component **updating** every second (`seconds` state changes, triggering a re-render).
- **"unmounted"** logs once, right before the component is removed — this is where `clearInterval` runs, preventing the timer from continuing to run in the background after the component is gone.

## Why this happens (the deeper reason)

React needs a way to let you plug into these stages because your component's job is bigger than "return some JSX." Real components need to set things up when they appear (start a timer, open a connection, fetch initial data) and tear things down when they leave (stop that timer, close that connection) — otherwise you get memory leaks and bugs that only show up after a component has already unmounted. `useEffect` is the modern hook-based way to run setup and cleanup logic across mount, update, and unmount: the effect function itself runs on mount and on every update where its dependencies changed, and the function you `return` from inside it runs on unmount and before each re-run to clean up the previous effect first. Understanding the three stages isn't just theory — it's what tells you exactly where to put setup code and where to put its matching cleanup.