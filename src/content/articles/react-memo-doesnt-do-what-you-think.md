---
title: "React.memo Doesn't Do What You Think"
description: "Wrapping a component in memo and seeing zero performance difference doesn't mean memo is broken — it almost always means a prop reference changes every render."
category: "React"
tags: ["performance", "memo", "hooks", "advanced"]
coreTakeaway: "React.memo skips a re-render only if every prop is shallowly equal to last time — new function or object props created inline defeat it silently."
publishDate: 2026-10-12
difficulty: "Advanced"
relatedArticles: ["use-context-rerender-trap"]
---

## What React.memo actually checks

`React.memo` wraps a component so that, before re-rendering it, React does a shallow comparison of its new props against its previous props. If every prop is `===` to what it was last time, React skips re-rendering that component and reuses the previous output. "Shallow" is the key word — it compares object and function props by *reference*, not by deep value, which is exactly where the tool's biggest gotcha lives.

## When developers actually run into this

Someone notices a child component re-rendering more than expected, wraps it in `React.memo`, and sees literally no change — the child keeps re-rendering every time the parent does. The instinct is to assume `memo` doesn't work or isn't worth using, when the actual cause is almost always that the parent passes a prop whose reference changes on every render, even if its contents are logically the same.

## The problem

```jsx
const Child = React.memo(({ onClick, style }) => {
  console.log('Child rendered');
  return <button onClick={onClick} style={style}>Go</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Increment: {count}</button>
      <Child
        onClick={() => console.log('clicked')}
        style={{ color: 'blue' }}
      />
    </>
  );
}
// Click "Increment" five times.
// logs: "Child rendered" — five times, once per Parent re-render
// The memo comparison never passes, because onClick and style are BOTH new
// object/function references on every single Parent render, regardless of count
```

## The fix

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => console.log('clicked'), []);
  const childStyle = useMemo(() => ({ color: 'blue' }), []);

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Increment: {count}</button>
      <Child onClick={handleClick} style={childStyle} />
    </>
  );
}
// Click "Increment" five times.
// logs: "Child rendered" — once, on the initial mount only
// useCallback and useMemo return the SAME reference across renders (given empty deps),
// so memo's shallow comparison now actually passes
```

## Why this happens (the deeper reason)

JavaScript's `===` for objects and functions compares identity, not structural equality — two objects with identical contents are still `!==` if they're different instances in memory, and an inline arrow function or object literal creates a brand-new instance on every render, no matter how identical it looks to the previous one. `React.memo`'s shallow comparison inherits this exact behavior, because doing a deep comparison of every prop on every render would often cost more than the re-render it's trying to avoid — so `memo` intentionally stays cheap and reference-based, which means it's only as effective as the stability of the references being passed into it. `useCallback` and `useMemo` exist specifically to produce a stable reference across renders (as long as their dependencies don't change), which is the missing piece that makes `memo` actually able to detect "these props are genuinely the same."
