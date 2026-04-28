# Klover Language Guide (V9)

Klover is a lightweight, indentation-based DSL designed for building modern, responsive, and reactive web interfaces. This guide covers the core concepts, syntax nuances, and advanced features of the language.

---

## 1. Core Syntax & Indentation

Klover uses significant indentation (4 spaces) to define the hierarchy of your UI. There are no closing tags or curly braces.

### The Rule of Hierarchy
If a node is indented relative to another, it becomes a child of that node.
```klover
column:
    text "I am a child of column"
    row:
        text "I am a child of row"
```

---

## 2. State & Reactivity

State is the "source of truth" for your application. When state changes, Klover automatically patches the DOM to reflect the new data.

### Defining State
State must be defined at the top level using the state keyword.
```klover
state count = 0
state user = {"name": "Guest", "id": 1}
```

### Updating State
State is updated using the set(target, expression) function within an event.
```klover
button "Increment" onClick=set(count, count + 1)
```

**Nuance: Chained Updates**
You can perform multiple updates in a single event using the & operator.
```klover
button "Reset All" onClick=set(count, 0) & set(likes, 0)
```

---

## 3. Layout System

Klover abstracts complex CSS Flexbox into two primary containers: column and row.

### Column
Stacks children vertically.
- Props: align (start, center, end), gap (px or string).
```klover
column center gap=40:
    text "Centered"
```

### Row
Stacks children horizontally and automatically wraps them on smaller screens.
- Props: gap.
```klover
row gap=20:
    button "A"
    button "B"
```

---

## 4. Components

Components allow you to define reusable UI patterns.

### Definition
Use the component keyword followed by the name and a colon.
```klover
component MyCard:
    column:
        text title h2
        text description
```

### Usage & Props
Pass data to components as named properties.
```klover
MyCard title="Hello" description="This is a prop"
```

**Nuance: Implicit Scope**
Inside a component, props are available as direct variables (e.g., title instead of props.title).

---

## 5. Logic & Control Flow

### Conditional Rendering (if)
The if block evaluates an expression. If truthy, the children are rendered.
```klover
if count > 10:
    text "Wow, high score!"
```

### Lists (repeat)
Iterates over an array. Supports custom item naming using as.
```klover
repeat products as p:
    text p.name
    text p.price
```
**Available Variables**:
- p: The current item (or whatever name you choose after as).
- index: The current 0-based index.

---

## 6. Typography Variants

Klover provides a semantic typography system that scales perfectly across devices.

### Headings
Add the variant name after the text content:
```klover
text "Big Title" h1
text "Subtitle" subheading
text "Section" h3
```
**Supported Variants**: h1, h2, h3, h4, heading, subheading, body (default).

---

## 7. Media & Assets

### Images
```klover
image "path/to/img.png" alt="Description"
```

### Videos
Supports standard video attributes as flags.
```klover
video "demo.mp4" controls autoplay muted loop
```

---

## 8. Page Metadata

Set document-level properties at the top of your file.
- theme: Currently supports dark (default).
- title: Sets the browser tab title.
- icon: Sets the favicon URL.

```klover
theme dark
title "My Klover App"
icon "https://example.com/logo.png"
```

---

## 9. Advanced: Expressions & Scopes

### JavaScript Expressions
Almost any valid JavaScript expression can be used inside dynamic text or set() functions.
```klover
text "Price: $" + (item.price * 1.2).toFixed(2)
```

### Path-Based Events
Klover uses a "Surgical Path" system. Every interactive element is assigned a path (e.g., children[0].children[2]). When you click a button, the engine resolves this path against the virtual tree to find the correct local scope, ensuring that repeat items always update the correct data.

---
**Build lean. Build fast. Build Klover.**
