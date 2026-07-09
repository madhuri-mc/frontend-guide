---
title: "You Don't Need a Library to Lazy-Load Images"
description: "The native loading attribute handles lazy-loading images without any JavaScript."
category: "Performance"
tags: ["performance", "images", "lazy-loading", "core-web-vitals"]
coreTakeaway: "loading=\"lazy\" is a native HTML attribute — no JS library needed for basic image lazy-loading."
publishDate: 2026-07-08
difficulty: "Beginner"
---

Lazy-loading images used to mean pulling in a JavaScript library and an Intersection Observer setup. For most cases, you don't need either anymore.

## The native way

```html
<img src="photo.jpg" loading="lazy" alt="A description" />
```

That's it. The browser handles deferring the image load until it's near the viewport — no JavaScript, no bundle size cost.

## When this matters for Core Web Vitals

Every image that loads before it's needed competes for bandwidth with content that actually affects your Largest Contentful Paint (LCP). Lazy-loading offscreen images means the browser prioritizes what's actually visible first.

## The one gotcha

Don't lazy-load your **above-the-fold** hero image — that one should load immediately, since it's likely your LCP element. Adding `loading="lazy"` to it can actually hurt your LCP score by delaying the most important image on the page.

## The takeaway

Use `loading="lazy"` on below-the-fold images by default. Leave above-the-fold images (especially your likely LCP candidate) without it, or explicitly set `loading="eager"` on that one.