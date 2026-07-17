---
title: "useMemo and useCallback Are Not Free Performance Boosters"
description: "Why wrapping everything in useMemo or useCallback often costs more than it saves."
category: "React"
tags: ["react", "hooks", "usememo", "usecallback", "performance", "memoization"]
coreTakeaway: "useMemo and useCallback only help when the thing they're protecting is expensive enough to outweigh the cost of memoization itself — otherwise you're just adding overhead."
publishDate: 2026-07-11
difficulty: "Advanced"
relatedArticles: ["react-render-cycle-explained", "why-does-useeffect-exist"]
---

## What memoization actually is

Memoization is a general programming technique: instead of recalculating something every time, you save the result and reuse it as long as the inputs haven't changed. `useMemo` applies this to a **value** — it skips recalculating that value on renders where its dependencies haven't changed. `useCallback` applies the same idea to a **function** — it skips creating a brand-new function on renders where its dependencies haven't changed, instead handing back the same function reference as before.

The important part is that memoization is a tradeoff, not a default optimization. It only helps if the work being skipped is expensive enough to justify the extra bookkeeping.

## When developers actually run into this

The instinct usually goes: "re-renders are expensive, so wrapping things in `useMemo`/`useCallback` must make my component faster." This leads to wrapping nearly everything — every function, every derived value — regardless of whether it's actually expensive to recompute. The result is often the opposite of the intended effect: more code, harder-to-read components, and, in many cases, genuinely worse performance than not memoizing at all.

## The problem

A common mistake is to reach for these hooks anytime a component re-renders. But the cost of memoization is real: React still has to compare dependencies, store the previous result, and keep track of the cached value or function. For tiny work, that cost can easily be bigger than just doing the work again.

```jsx
function ProductCard({ name, price }) {
  const formattedPrice = useMemo(() => `$${price.toFixed(2)}`, [price]);
  const handleClick = useCallback(() => {
    console.log('clicked', name);
  }, [name]);

  return <div onClick={handleClick}>{name}: {formattedPrice}</div>;
}
```

This looks like a performance optimization, but `price.toFixed(2)` is a trivial, near-instant operation — cheaper than the memoization machinery itself. Every render, React still has to: check whether `price` changed, compare it to the previous dependency, and manage the memoized value in memory. For work this cheap, that bookkeeping costs more than just recalculating the string directly would have.

## When memoization is actually worth it

```jsx
function ProductList({ products, filters }) {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => matchesAllFilters(p, filters)); // expensive on a large list
  }, [products, filters]);

  return <div>{filteredProducts.map((p) => <ProductCard key={p.id} {...p} />)}</div>;
}
```

Here, `useMemo` earns its keep — filtering a large array is genuinely expensive relative to the cost of memoization, so skipping that work on renders where `products` and `filters` haven't changed is a real win. 

`useCallback` follows the same logic, but its most common legitimate use isn't about the function's own cost — it's about **referential stability**: preventing a memoized child component (wrapped in `React.memo`) from re-rendering unnecessarily just because it received a new function reference that does the exact same thing as before.


````jsx
const ExpensiveChild = React.memo(function ExpensiveChild({ onSave }) {
  // expensive render logic
});

function Parent() {
  const handleSave = useCallback(() => {
    saveData();
  }, []);

  return <ExpensiveChild onSave={handleSave} />;
}
````

Here, `React.memo` can skip the child render only if the prop reference stays stable. Without `useCallback`, the handler would be recreated on every render and the memo bailout would fail.

A practical mental model is: `useMemo` saves a computed value, and `useCallback` saves a function identity. Both only make sense when the saved result is useful enough to justify the extra logic around it.

## Why this happens (the deeper reason)

`useMemo` and `useCallback` are not free — every render, React still has to check the dependency array, compare each value to the previous render's values, and manage the memoized result in memory. That bookkeeping has a real, if small, cost. Whether memoizing something is worth it comes down to a straightforward comparison: is the cost of the dependency check and storage smaller than the cost of just redoing the work? For simple calculations and small functions, redoing the work is almost always cheaper than the memoization machinery meant to avoid it. Memoization pays off specifically when the protected work is expensive — heavy computation over large data, or preventing an expensive child component from re-rendering — not as a blanket rule for "wrap things that get recreated." Treating every render as something to be avoided at all costs, rather than something React is already fast at handling by default, is the actual misconception underneath the overuse of these two hooks.