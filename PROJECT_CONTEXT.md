# Klover Project Context

Klover is a lightweight, state-aware domain-specific language (DSL) and compiler for building interactive UI layouts.

## Core Objective
To provide a declarative syntax for building interactive UI components that cleanly separates structure (AST) and logic.

## V5 Hydration Architecture

The project has shifted to a **Client-Side Hydration** model where the Node.js compiler prepares the data, and the browser handles the live reactivity.

### 1. Source Input (`input.kv`)
Uses an indentation-based syntax:
- `state count = 0`: Defines a reactive state variable.
- `text count`: References a state variable.
- `button "Add" onClick=set(count + 1)`: Interactive button with a structured event.

### 2. Compiler (Node.js / `index.js`)
- **Parsing**: `parser/parse.js` transforms KV text into a semantic AST.
- **Serialization**: The compiler serializes the `tree` (AST) and the initial `state` into JSON blocks within the final HTML.
- **Bundling**: It embeds a browser-compatible `Runtime` and `Renderer` directly into the `<script>` tags of `output.html`.

### 3. Client Runtime (Browser)
- **Logic Engine**: A browser-side `Runtime` class manages state and expression evaluation using `new Function`.
- **Reactivity**: When `setState` is called, the runtime triggers a full re-render of the app via `renderApp`.

### 4. Client Renderer (Browser / `renderer/render.js`)
- **DOM-Based**: Uses `document.createElement` and DOM APIs instead of string concatenation.
- **Dynamic Variable Binding**: Text nodes check `isVariable` and pull live values from the browser runtime.
- **Event Binding**: Uses `addEventListener` to hook up the `onClick` event data to the live runtime.

## File Hierarchy & Descriptions

```text
klover/
├── parser/
│   └── parse.js          # Semantic DSL parser (Produces Clean AST)
├── runtime/
│   └── runtime.js        # Logic engine (Node-side reference)
├── renderer/
│   └── render.js         # DOM-based renderer (Browser-ready)
├── shared/
│   └── schema.js         # AST node factory functions
├── input.kv              # Primary DSL source file
├── index.js              # Compiler & Bundler (Generates output.html)
└── PROJECT_CONTEXT.md    # Technical documentation (this file)
```

## Current Status
- [x] **V5 Hydration Model**: Full end-to-end interactivity achieved.
- [x] **Stateful DOM**: Renderer correctly visualizes runtime state changes.
- [x] **Live Events**: Buttons successfully trigger state updates in the browser.
- [ ] **Component System**: The browser-side renderer needs to be updated to support the custom component definitions parsed in `parser/parse.js`.

## Design Philosophy
- **Clean Source**: The `.kv` file remains pure and declarative.
- **Single-File Output**: The compiler produces a standalone `output.html` that contains everything needed to run the app (Data + Runtime + UI).
- **DOM Reactivity**: UI updates are driven by state changes, moving away from static server-side rendering.
