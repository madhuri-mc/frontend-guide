---
title: "useContext and the Re-render Trap"
description: "Every consumer of a context re-renders when any part of its value changes, even if they only read one field. Here's why, and how to split contexts to avoid it."
category: "React"
tags: ["hooks", "useContext", "performance", "state-management"]
coreTakeaway: "Context consumers re-render on any change to the context value, not just the specific field they read — splitting contexts by what changes together fixes it."
publishDate: 2026-08-24
difficulty: "Advanced"
relatedArticles: ["use-state-vs-use-reducer", "react-memo-doesnt-do-what-you-think"]
---

## What useContext actually subscribes to

`useContext` doesn't subscribe to a specific field inside the context value — it subscribes to the value *reference* as a whole. When a `Provider`'s value prop changes (by reference), every component calling `useContext` on that context re-renders, full stop, regardless of which part of the object they actually destructure and use in their JSX.

## When developers actually run into this

Context gets reached for as "global state, React's way," which encourages bundling several loosely related pieces of state — user info, theme, notification count — into one provider for convenience. That convenience is exactly what causes the problem: a component that only reads `theme` still re-renders every time `user` changes, because from React's perspective it's all one value.

## The problem

```jsx
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

function LoginButton() {
  const { setUser } = useContext(AppContext);
  return <button onClick={() => setUser({ name: 'Alex' })}>Log in</button>;
}

function ThemeToggleButton() {
  const { theme, setTheme } = useContext(AppContext);
  console.log('ThemeToggleButton rendered');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

Trace what happens when `LoginButton` is clicked:

```
1. User clicks LoginButton -> setUser({ name: 'Alex' }) runs
2. React re-renders AppProvider, since `user` state lives there
3. AppProvider's render creates a brand-new object: { user, setUser, theme, setTheme }
   -> this object is a new reference, even though `theme` itself is still "light"
4. Every consumer of AppContext re-renders, because the value reference changed
   -> logs: "ThemeToggleButton rendered" — despite theme never actually changing
```

A natural next thought: what if `ThemeToggleButton` were wrapped in `React.memo` instead of splitting the context? It wouldn't help:

```jsx
const ThemeToggleButton = React.memo(function ThemeToggleButton() {
  const { theme, setTheme } = useContext(AppContext);
  console.log('ThemeToggleButton rendered');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
});
// Still re-renders when setUser is called, exactly as before
```

`React.memo`'s shallow comparison only runs on the *props* React passes into a component from its parent. `ThemeToggleButton` takes no props at all here — the changing value comes from `useContext` reading a new object reference internally, which memo has no visibility into. There's nothing for memo to compare, so it can't bail out of anything.

## The fix

Splitting contexts improves update isolation, but if both states still live in the same provider component, that component still re-renders whenever either state changes. To fully isolate updates, each state should be owned by its own provider component.

```jsx
const UserContext = createContext();
const ThemeContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

function AppProviders({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </UserProvider>
  );
}

function LoginButton() {
  const { setUser } = useContext(UserContext);
  return <button onClick={() => setUser({ name: 'Alex' })}>Log in</button>;
}

function ThemeToggleButton() {
  const { theme, setTheme } = useContext(ThemeContext);
  console.log('ThemeToggleButton rendered');
  return <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

The same click now traces very differently:

```
1. User clicks LoginButton -> setUser({ name: 'Alex' }) runs
2. React re-renders UserProvider, since `user` state lives there
3. ThemeProvider's function body never runs at all — its state wasn't touched,
   and nothing forced its parent to re-render it
4. ThemeContext's value object is never recreated
   -> ThemeToggleButton does not re-render, no log line at all
```

## Why this happens (the deeper reason)

React's re-render granularity is per component function, not per hook or per state variable — calling a state setter re-runs the *entire* function that owns that state, and every value your component computes during that run, including object literals passed to a `Provider`, gets recreated along with it. Two `<Context.Provider>` tags rendered from the same function don't change that: both are still recomputed on every run of that one function, regardless of which state inside it actually changed. Genuinely decoupling two pieces of state means putting each in a component whose *only* re-render trigger is that state (plus its own props) — which is exactly what separate provider components give you, and a single provider juggling several `useState` calls never can.
