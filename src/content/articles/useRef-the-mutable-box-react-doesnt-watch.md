---
title: "useRef: The Mutable Box React Doesn't Watch"
description: "How `useRef` gives you a mutable value that survives re-renders but doesn't trigger them — when to use it and common pitfalls."
category: React
tags: ["React", "hooks", "useRef"]
coreTakeaway: "`useRef` gives you a value that survives re-renders but changing it never triggers one — it's an escape hatch from React's render cycle, not a state replacement."
publishDate: 2026-07-15
difficulty: Beginner
relatedArticles: ["why-does-useeffect-exist", "why-react-state-can-feel-stale", "react-lifecycle-explained"]
---

## What `useRef` actually is

`useRef` returns a plain JavaScript object with a single mutable property: `current`. The ref object identity stays the same between renders — only `current` changes when you set it. React does not watch `current` for changes, so updating it never triggers a re-render.

## When developers actually run into this

Beginners often reach for `useRef` to "store a value" like a counter and then wonder why the UI doesn't update. Others use `useState` for things that shouldn't cause renders (timer IDs, previous values, DOM node handles). Knowing which to use keeps your app efficient and predictable.

## The problem

Expecting a `ref` update to update the UI:

```jsx
// The problem — expecting a ref update to re-render the count on screen
function Counter() {
  const countRef = useRef(0);
  return (
    <button onClick={() => { countRef.current++; }}>
      Clicked {countRef.current} times {/* never updates on screen */}
    </button>
  );
}
```

This looks reasonable, but the visible number never changes because changing `countRef.current` does not tell React to render again.

## The fix

Use state for anything the UI needs to reflect:

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}
```

Use `useRef` when you need a stable, mutable container that should not trigger renders.

## Good real use cases

- Storing a `setTimeout`/`setInterval` ID so you can clear it later without causing renders:

```jsx
function Timer() {
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    timeoutIdRef.current = setTimeout(() => { /* ... */ }, 1000);
    return () => clearTimeout(timeoutIdRef.current);
  }, []);

  return <div>Timer running</div>;
}
```

- Tracking the previous prop or state value without forcing a render (useful for comparisons inside effects):

```jsx
function Example({ value }) {
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      // value changed — do something
    }
    prevRef.current = value;
  }, [value]);

  return <div>{value}</div>;
}
```

## Why this happens (the deeper reason)

React re-renders a component when its state or props change. `useRef` deliberately avoids participating in that system: refs are a low-level, mutable box whose updates are invisible to React's scheduler. This makes them perfect for storing values that must persist across renders but whose changes shouldn't re-run rendering (timeouts, external library instances, previous values, DOM nodes).

If you want the UI to react to a value change, use `useState` or another reactive mechanism. If you only need a stable place to keep mutable data across renders, `useRef` is the right tool.

## See also

- Related reads: [Why Does useEffect Exist?](./why-does-useeffect-exist.md), [Why React State Can Feel Stale](./why-react-state-can-feel-stale.md), and [React Lifecycle, Explained](./react-lifecycle-explained.md)
