---
title: "Controlled vs Uncontrolled Inputs"
description: "The cryptic React warning about inputs changing from uncontrolled to controlled, explained by what actually owns the input's value."
category: "React"
tags: ["forms", "inputs", "fundamentals", "hooks"]
coreTakeaway: "A controlled input's value is owned by React state; an uncontrolled input's value lives in the DOM and you only ask for it when you need it."
publishDate: 2026-07-18
difficulty: "Beginner"
relatedArticles: ["use-ref-mutable-box"]
---

## What controlled vs uncontrolled actually is

A controlled input is an input whose value is owned by React state. The DOM element is just a reflection of that state, and every keystroke is handled through `onChange`.

An uncontrolled input is the opposite: the browser owns the value, and React only reads it when you need it, usually through a ref. The important distinction is not “which one is more React,” but who owns the current value.

## When developers actually run into this

Controlled inputs are the default choice for many forms because they make it easy to validate as the user types, disable a submit button, format values, or show live feedback. The warning appears when an input flips ownership unexpectedly, usually because the initial value is `undefined` and later becomes a real string.

## The problem

```jsx
function ProfileForm() {
  const [name, setName] = useState(); // undefined until fetchUser resolves

  useEffect(() => {
    fetchUser().then(user => setName(user.name));
  }, []);

  return <input value={name} onChange={e => setName(e.target.value)} />;
}
// Console warning:
// "A component is changing an uncontrolled input to be controlled."
```

On the first render, `value={undefined}` tells React, “I’m not managing this input’s value.” React lets the DOM keep control. Once `name` becomes a string, the input suddenly looks controlled from React’s point of view, and the warning appears. The issue is not that the value changed — it is that the ownership model changed midstream.

## The fix

```jsx
function ProfileForm() {
  const [name, setName] = useState(''); // controlled from the first render

  useEffect(() => {
    fetchUser().then(user => setName(user.name));
  }, []);

  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

Starting with an empty string makes the intent explicit from the very beginning. React sees a controlled input from render one, and the warning goes away.

## When uncontrolled is actually the right choice

```jsx
function SearchForm() {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(inputRef.current.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="" />
    </form>
  );
}
```

This is useful when React does not need to know the current value on every keystroke. The browser keeps the input value locally, and you only read it when the form is submitted. That can be simpler and cheaper for forms that do not need live interaction.

## A simple rule of thumb

Use a controlled input when the UI needs to react to the user’s typing in real time. Use an uncontrolled input when you only need the value later, such as when the user submits the form.

That means controlled inputs are usually the better fit for:

- Live search
- Autocomplete
- Instant validation
- Character counters
- Input masking
- Formatting while typing
- Enabling or disabling buttons based on current input

Uncontrolled inputs are usually the better fit for:

- Login forms
- Registration forms
- Contact forms
- Feedback forms
- Large forms where you collect values once and process them later


## Why this happens (the deeper reason)

React decides whether an input is controlled based on whether the `value` prop is present and whether it is `undefined` or not. `undefined` means “I’m not managing this input,” while any other value means “I am.” That decision is made on each render, so a value that starts as `undefined` and later becomes a string looks like a genuine ownership change to React.

The deeper takeaway is that controlled and uncontrolled are really about ownership. Controlled inputs make React the source of truth. Uncontrolled inputs make the DOM the source of truth. Neither is universally better — the right choice depends on whether your UI needs the latest value immediately or only when the form is submitted.

