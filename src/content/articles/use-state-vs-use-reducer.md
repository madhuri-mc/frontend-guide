---
title: "useState vs useReducer: Picking the Right Tool"
description: "useReducer isn't useState for big apps — it's the right call when state fields update together or the next state depends on structured logic, not scale."
category: "React"
tags: ["hooks", "useReducer", "useState", "state-management"]
coreTakeaway: "useReducer earns its place when state fields change together as one transition, not simply when a component 'feels complex.'"
publishDate: 2026-08-27
difficulty: "Intermediate"
relatedArticles: ["use-ref-mutable-box", "use-context-rerender-trap"]
---

## What useReducer actually is

`useReducer` stores state the same way `useState` does, but instead of calling a setter with a new value directly, you dispatch an *action* — a plain object describing what happened — and a reducer function decides what the new state should be based on that action and the current state. The state itself isn't more powerful; what changes is that updates go through one centralized function instead of being scattered across every place that calls a setter.

## When developers actually run into this

Tutorials frame `useReducer` as "useState for complex state" or a lightweight Redux, which leads to two opposite mistakes: some developers avoid it entirely because it looks like overhead for a simple toggle, while others reach for it on every component past a certain line count, treating it as a maturity milestone rather than a fit for a specific problem. The real trigger is narrower: does this component have several state values that must change *together*, in a way where an invalid combination would be a bug?

## The problem

```jsx
function DataFetcher() {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    setStatus('loading');
    try {
      const result = await fetchData();
      setData(result);
      setStatus('success');
      // if this next line is ever forgotten or a race condition hits, error can stay stale
    } catch (e) {
      setError(e);
      setStatus('error');
    }
  }
  // Nothing stops status='success' from coexisting with a leftover error from a previous failed call —
  // three independent setters means three independent chances to get out of sync
}
```

## The fix

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', data: null, error: null };
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.payload, error: null };
    case 'FETCH_ERROR':
      return { status: 'error', data: null, error: action.error };
    default:
      return state;
  }
}

function DataFetcher() {
  const [state, dispatch] = useReducer(reducer, { status: 'idle', data: null, error: null });

  async function load() {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await fetchData();
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', error: e });
    }
  }
  // Every valid state combination is defined in exactly one place — the reducer.
  // It's structurally impossible to end up with status='success' and a leftover error.
}
```

## Why this happens (the deeper reason)

With separate `useState` calls, every place in the component that updates state is a place where the invariant between fields *could* be broken — there's no single spot enforcing that `status`, `data`, and `error` always make sense together. A reducer collapses every possible transition into one function that returns a complete, valid state object every time, which makes invalid in-between states structurally impossible rather than just something you have to remember to avoid. That's the actual signal for reaching for `useReducer`: not component size, but whether state fields have rules about how they can change *relative to each other*.

## When useState is still the better call

```jsx
// Independent, unrelated pieces of state don't benefit from centralizing —
// this is more naturally readable as separate useState calls
const [isModalOpen, setIsModalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedTab, setSelectedTab] = useState('overview');
// None of these values have a "must change together" relationship — useReducer here
// would just add indirection without removing any actual risk of invalid state
```
