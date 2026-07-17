---
title: "Why Index Keys Break Your List"
description: "React uses key to track identity across renders, not position. Using the array index means those two get conflated, and reordering or deleting items scrambles state."
category: "React"
tags: ["lists", "keys", "reconciliation", "fundamentals"]
coreTakeaway: "React uses key to match list items across renders — an index key tracks position, not identity, so deleting or reordering items attaches old state to the wrong row."
publishDate: 2026-07-24
difficulty: "Intermediate"
relatedArticles: ["mutating-array-inside-map"]
---

## What the key prop actually is

When React re-renders a list, it needs to decide which DOM nodes to reuse, which to update, and which to throw away and recreate. `key` is the hint you give it to make that decision — it tells React "this specific list item, across renders, is the same logical thing," so React can match old items to new ones by identity instead of guessing from position in the array.

## When developers actually run into this

Lists rendered with `.map()` need a `key`, and React will warn you if you forget one — so almost every developer has typed `key={index}` at some point because it's right there and makes the warning go away. It works perfectly fine as long as the list is static or only ever appends to the end. The bugs show up the moment items are deleted, inserted, or reordered anywhere but the end.

## The problem

```jsx
function TodoList({ todos, onDelete }) {
  return todos.map((todo, index) => (
    <label key={index}>
      <input type="checkbox" checked={todo.done} />
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </label>
  ));
}
// todos = [{id: 1, text: 'Buy milk', done: false}, {id: 2, text: 'Walk dog', done: false}, {id: 3, text: 'Read book', done: false}]
// Step 1: the user checks the second item.
// Step 2: the user deletes the first item.
// Result: React reuses the DOM node for the wrong row, so the checkbox state appears on the wrong todo.
```

React doesn't match list items by their data—it matches them by their keys. After deleting the first item, the row that now sits at the top receives the old `key={0}`. React assumes it is still the same row as before, so it reuses the old DOM node and keeps the checkbox state attached to the wrong todo.

## The fix

```jsx
function TodoList({ todos, onDelete }) {
  return todos.map(todo => (
    <label key={todo.id}>
      <input type="checkbox" checked={todo.done} />
      {todo.text}
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </label>
  ));
}
// With a stable id, React can tell that the second row is still the same todo.
// It reuses the correct DOM node and the checked state stays with the right item.
```

## The one case where index keys are fine

```jsx
// A list that's rendered once and never reordered, filtered, or has items removed
// from the middle — e.g. a static list of terms and conditions bullet points
{sections.map((text, index) => <li key={index}>{text}</li>)}
// Safe here specifically because the list is immutable after the initial render
```

## Why this happens (the deeper reason)

React's reconciliation doesn't diff list contents deeply — it diffs by key first, then only checks props/children within a matched pair. An index-based key is really saying "position 0 is always the same item," which is only true if the list never changes shape. A stable identifier (a database id, a UUID generated once) is the only thing that stays true to a specific piece of data regardless of where it moves in the array, which is exactly the guarantee React needs to reuse DOM nodes — and any component state living inside them — correctly.

