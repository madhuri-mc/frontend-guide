---
title: "Why Does useEffect Exist?"
description: "Understanding the actual problem useEffect solves in React, not just its syntax."
category: "React"
tags: ["react", "hooks", "useEffect", "rendering"]
coreTakeaway: "useEffect exists to sync your component with the outside world — not to run logic on every render."
publishDate: 2026-07-06
difficulty: "Intermediate"
relatedArticles: ["react-lifecycle-explained", "react-render-cycle-explained", "why-react-state-can-feel-stale"]
---

## What useEffect actually is

React components are meant to be pure functions of their props and state. Given the same props and state, they should render the same output, without causing unrelated work along the way. But real apps need things that are not pure: fetching data, subscribing to events, updating the DOM, and talking to APIs.

`useEffect` exists for that kind of work. It gives React a controlled place to run code that has side effects after React has committed the UI.

## Pure functions vs. side effects

A **pure function** is simple: it takes input and returns output. Given the same input, it always gives the same result, and it does not change anything outside itself.

```js
function add(a, b) {
  return a + b;
}

add(2, 3); // 5
add(2, 3); // 5
```

That is pure because it does not mutate anything else and does not depend on hidden state.

A more React-like example is a function that formats a user profile based on props:

```js
function getDisplayName(user) {
  return `${user.firstName} ${user.lastName}`;
}

getDisplayName({ firstName: 'Maddy', lastName: 'FG' });
// "Maddy FG"
```

If you pass the same `user` object, you always get the same display name. It does not change any external state, and it does not perform any side effects.

A **side effect** is anything that reaches outside that simple input-to-output model. Writing to a variable, logging to the console, sending a network request, or touching the DOM are all side effects because they change something beyond the function's return value.

```js
let count = 0;

function increment() {
  count = count + 1;
  return count;
}

increment(); // 1
increment(); // 2
```

This is not pure, because each call changes the external `count` variable.

Here is another simple example:

```js
function greetUser(name) {
  console.log(`Hello, ${name}!`);
}

greetUser('Sam');
// Console output: Hello, Sam!
```

This is also not pure because it produces output through the console. A pure version would simply return a string instead of printing it.

## Why useEffect is needed in React

A component renders when React first mounts it, and it re-renders when something relevant changes, such as its props, state, or context. In other words, rendering is not a one-time thing — it can happen again whenever React decides the UI needs to reflect new data.

In React, rendering should stay as close to pure as possible. A component should be able to render the same UI for the same props and state without triggering unrelated work. That is why `useEffect` exists: it gives you a safe place to run the impure work that React cannot do during the render itself. In short, `useEffect` is for syncing with the outside world, not for deciding what the UI should render.

## When developers actually run into this

This usually happens when someone tries to fetch data or sync with something external directly inside a component body. It feels natural to write the request right where the data is needed, but component bodies run during rendering, and most side effects should not.

## The problem

```jsx
function Profile() {
  const [user, setUser] = useState(null);

  fetch('/api/user')
    .then(res => res.json())
    .then(setUser);

  return <div>{user?.name}</div>;
}
```

This runs on every render because the fetch is placed directly in the component body. Since `setUser` triggers a re-render, and the re-render triggers another fetch, you end up in an infinite loop of requests.

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

The empty dependency array `[]` tells React: only run this once, after the first render, not on every subsequent one. In real apps, you may also want to clean up pending work or subscriptions in the effect’s cleanup function so nothing continues after the component unmounts.

## Why this happens (the deeper reason)

React's rendering model assumes your component function can be called any number of times, in any order, without consequence — that's what makes features like concurrent rendering possible. Side effects break that assumption, because they have real-world consequences (a network request actually fires, a subscription actually opens) that shouldn't happen just because React decided to re-render. `useEffect` exists as a controlled escape hatch: it runs *after* React has already updated the screen, and only when the specific values you declare in the dependency array have actually changed — keeping your component's render logic pure while still letting you do the necessary, impure work of talking to the outside world.