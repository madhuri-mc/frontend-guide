---
title: "Why You Can't Call a Hook Inside a Condition"
description: "The actual mechanical reason behind React's Rules of Hooks — not just that it's forbidden, but why."
category: "React"
tags: ["react", "hooks", "rules-of-hooks", "rendering"]
coreTakeaway: "React tracks hooks by the order they're called in, not by name — calling one conditionally shifts every hook after it, silently corrupting your component's state."
publishDate: 2026-07-11
difficulty: "Advanced"
relatedArticles: ["react-render-cycle-explained", "react-lifecycle-explained"]
---

## What a hook actually is

A hook is just a regular JavaScript function — `useState`, `useEffect`, `useRef`, and the rest — with one special power: it lets a component tap into React's internal machinery for things like state, effects, and refs, which a plain function couldn't otherwise do. If you've read [The Complete React Render Cycle](/articles/react-render-cycle-explained), you already know React re-runs your entire component function on every render. This article explains why that matters for hooks.

## The problem

Imagine you write this:

```jsx
function Profile({ user, showBio }) {
  const [name, setName] = useState(user.name);

  if (showBio) {
    const [bio, setBio] = useState(user.bio);
  }

  const [avatar, setAvatar] = useState(user.avatar);

  return <div>{name}</div>;
}
```

On the first render, React sees three hook calls in this order: `name`, `bio`, `avatar`.

On the next render, if `showBio` is `false`, React only sees two hook calls: `name`, `avatar`.

That is the problem. React has no way to know that the second hook was skipped. It just assumes the next hook belongs in the next slot, so the state for `avatar` gets attached to the wrong position. The result is confusing bugs and broken state.

## The fix

```jsx
function Profile({ user, showBio }) {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);

  return (
    <div>
      {name}
      {showBio && <p>{bio}</p>}
    </div>
  );
}
```

The rule is simple: call hooks in the same order on every render. Put the condition around the UI you render, or around the data you use, not around the hook call itself.

The same rule applies to other hooks too. For example, this is also a problem:

```jsx
function Example({ enabled }) {
  if (enabled) {
    useEffect(() => {
      console.log('run effect');
    }, []);
  }

  return null;
}
```

Even though the hook is `useEffect`, the same issue appears: React expects the hook call order to stay stable across renders.

## Why this happens (the deeper reason)

React does not track hooks by name. It cannot. `useState` is just one function, and many different calls need to be distinguished.

Instead, React keeps an internal list of hook values for each component instance. The first hook call uses the first slot, the second uses the second slot, and so on. That system only works if those hook calls happen in the same order every time.

If one hook is skipped, every hook after it shifts into the wrong slot. That is why the rule exists. The rule is not arbitrary — it protects React's internal bookkeeping from getting out of sync.