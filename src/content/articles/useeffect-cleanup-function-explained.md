---
title: "The useEffect Cleanup Function, Explained"
description: "Cleanup isn't just for unmounting — it runs before every re-run of the same effect, which is what actually prevents duplicate subscriptions and stacked timers."
category: "React"
tags: ["hooks", "useEffect", "lifecycle", "fundamentals"]
coreTakeaway: "The function returned from useEffect runs before the next effect and on unmount — its job is to undo exactly what the effect just set up."
publishDate: 2026-08-03
difficulty: "Intermediate"
relatedArticles: ["use-ref-mutable-box"]
---

## What the cleanup function actually is

If the function you pass to `useEffect` returns another function, React treats that return value as cleanup. React calls it in two situations: right before running the effect again on a subsequent render (if the dependencies changed), and once when the component unmounts. It's easy to only remember the second case, but the first is what does most of the actual work in a component that re-renders more than once.

## When developers actually run into this

Any effect that sets something up — a subscription, an event listener, a WebSocket connection, a `setInterval` — needs a matching teardown, or every re-run of the effect adds another copy on top of the previous one without removing it. This shows up constantly in effects with a dependency that changes over time, like an effect that reconnects whenever a `roomId` prop changes.

## The problem

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    console.log('Connected to', roomId);
    // no return — nothing ever disconnects
  }, [roomId]);

  return <h1>Welcome to {roomId}</h1>;
}
```

Trace what happens as a user switches rooms:

```
1. Mounts with roomId="general"
   -> effect runs: logs "Connected to general"
   -> live connections: { general }

2. roomId changes to "random"
   -> effect re-runs (no cleanup to call first, since none was returned)
   -> logs "Connected to random"
   -> live connections: { general, random }   <- "general" was never closed

3. roomId changes back to "general"
   -> effect re-runs again
   -> logs "Connected to general"
   -> live connections: { general, general, random }   <- now THREE open sockets
```

The UI only ever shows one room at a time, so this looks completely fine on screen. Underneath it, the component has silently opened three live connections to the server, and all three will keep delivering messages, consuming server resources, and running until the component unmounts — at which point none of them get closed either, since there's still no cleanup function to call.

## The fix

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();
    console.log('Connected to', roomId);

    return () => {
      connection.disconnect();
      console.log('Disconnected from', roomId);
    };
  }, [roomId]);

  return <h1>Welcome to {roomId}</h1>;
}
```

The same sequence of room changes now traces very differently:

```
1. Mounts with roomId="general"
   -> effect runs: logs "Connected to general"
   -> live connections: { general }

2. roomId changes to "random"
   -> React calls the PREVIOUS cleanup first: logs "Disconnected from general"
   -> THEN runs the new effect: logs "Connected to random"
   -> live connections: { random }

3. roomId changes back to "general"
   -> cleanup runs: logs "Disconnected from random"
   -> effect runs: logs "Connected to general"
   -> live connections: { general }

4. Component unmounts
   -> cleanup runs one final time: logs "Disconnected from general"
   -> live connections: { }
```

Full console output, in order: `Connected to general`, `Disconnected from general`, `Connected to random`, `Disconnected from random`, `Connected to general`, `Disconnected from general`. Exactly one connection is ever open at a time, and the very last thing that happens — on unmount — is a disconnect, not a leak.

## Why this happens (the deeper reason)

React doesn't know what an effect "set up" — it only knows the effect ran and, optionally, that a cleanup function exists to undo it. Whenever the dependency array signals the effect needs to run again, React's contract is: call the previous cleanup first, *then* run the new effect. That ordering is exactly what turns "add another connection" into "replace the connection" — cleanup runs before the next setup, every single time, not just at the very end of the component's life. Skipping cleanup doesn't just risk a leftover connection when the component unmounts; it risks *n* leftover connections after *n* re-runs while the component is still mounted and actively re-rendering, which is precisely what step 3 in the broken trace shows.

## The pattern to remember

```jsx
useEffect(() => {
  const thingToClean = setUpSomething();
  return () => tearDownSomething(thingToClean);
}, [dependency]);
// Read it as: "every time this effect runs, first undo what the previous run did"
// not: "this only matters when the component goes away"
```

Once cleanup is read that way, effects with dependencies that change over time stop being a source of leaked connections and start behaving exactly like you'd expect: one active setup at a time, no matter how many times the effect re-runs — and the unmount case falls out for free, since it's just one more call to the same cleanup function.