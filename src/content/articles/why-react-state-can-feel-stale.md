---
title: "Why React State Can Feel Stale"
description: "A stale closure is usually the reason React state looks one render behind — and when you actually need to guard against it."
category: "React"
tags: ["react", "hooks", "usestate", "closures", "stale-state"]
coreTakeaway: "State can look stale when a callback created in one render captures an older snapshot instead of reading React's actual current value."
publishDate: 2026-07-11
difficulty: "Intermediate"
relatedArticles: ["why-does-useeffect-exist", "react-render-cycle-explained"]
---

## What "stale state" actually is

When your component function runs, `useState` hands you a local variable holding a snapshot of the current state. If a function created during that render — an event handler, a timer callback — runs later, after more renders have happened, it can still be holding onto that older snapshot. That's what makes state feel like it's one render behind: it isn't lagging, it's just that an old closure never got refreshed in the first place.

## When developers actually run into this

This shows up most often with event handlers, timers, and async code — anywhere a function is created during one render but actually runs later, after further renders may have already happened.

## The problem

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setTimeout(() => {
      setCount(count + 1);
    }, 3000);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

Click the button, then click it again before the first timeout finishes. Both callbacks were created while `count` was still `0`, so both compute `setCount(0 + 1)`. Three seconds later, the count only goes up by one — the second click's update is silently lost, even though you clicked twice.

## The fix

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setTimeout(() => {
      setCount((currentCount) => currentCount + 1);
    }, 3000);
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

Instead of reading `count` from the closure, this passes a function to `setCount`. React calls that function itself, right when it processes the update, and hands it the true current state — not whatever value was captured back when the closure was created. Because each call now builds on the real current value instead of an old snapshot, both clicks correctly produce two increments instead of overwriting each other.

## Why this happens (the deeper reason)

It's worth being precise here: React does not forget state between renders. State itself lives in a persistent structure React maintains for each component instance, entirely outside your component function — it survives across renders without issue. What gets recreated on every render is your component function's *local view* of that state: the `count` variable you get back from `useState` is a fresh snapshot, copied out of React's storage at that specific moment.

A closure created during one render — like the `handleClick` function above — captures that snapshot, not a live connection to React's actual storage. If time passes and more renders happen before the closure runs, the snapshot it's holding can fall behind what React's storage now actually contains. The functional update form sidesteps this entirely: instead of relying on the closure's snapshot, it asks React to hand over the real, current value at the moment the update is processed — which is why `currentCount` is never stale, even when `count` in the same closure would be.

## When you actually need this

You don't need the functional form everywhere — only when the new state depends on the previous state:

```js
setCount((prev) => prev + 1);           // depends on prior count — needs it
setIsOpen((prev) => !prev);              // depends on prior boolean — needs it
setName(event.target.value);             // doesn't depend on old state — plain form is fine
setUser(fetchedUserObject);              // comes from elsewhere — plain form is fine
```

A useful rule of thumb: if you find yourself typing the state variable's own name inside the `setX(...)` call — `setCount(count + 1)`, `setItems([...items, x])` — that's the exact signature of "this depends on the previous value," and it's cheap enough to just default to the functional form whenever you notice that pattern. It becomes non-optional, not just good practice, inside `setTimeout`/`setInterval` callbacks, inside async functions after an `await`, or whenever a setter might be called more than once before the next render — exactly the situations this article walks through above.