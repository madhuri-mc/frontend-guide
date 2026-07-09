---
title: "Why Does useEffect Exist?"
description: "Understanding the actual problem useEffect solves in React, not just its syntax."
category: "React"
tags: ["react", "hooks", "useEffect", "rendering"]
coreTakeaway: "useEffect exists to sync your component with the outside world — not to run logic on every render."
publishDate: 2026-07-06
difficulty: "Intermediate"
---

Most explanations of `useEffect` jump straight to syntax. But the real question is: why does it need to exist at all?

## The problem without useEffect

Imagine fetching data directly inside a component, with no `useEffect`:

```jsx
function Profile() {
  const [user, setUser] = useState(null);

  fetch('/api/user')
    .then(res => res.json())
    .then(setUser);

  return <div>{user?.name}</div>;
}
```

This looks harmless, but it runs on **every single render**. Since `setUser` triggers a re-render, and the re-render triggers another fetch, you end up in an infinite loop of requests.

## The fix

```jsx
function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

The empty dependency array `[]` tells React: only run this once, after the first render.

## The actual takeaway

useEffect exists to **sync your component with the outside world** — API calls, subscriptions, timers, manual DOM changes — not to run logic every time the component re-renders. That distinction is the whole reason the hook exists. 