# Klover Project Context

Klover is a lightweight, state-aware domain-specific language (DSL) and compiler for building interactive UI layouts.

## Core Objective
To provide a declarative syntax for building interactive UI components that cleanly separates structure (AST) and logic.

## V5 Hydration Architecture (Verified)

The project uses a **Client-Side Hydration** model where the Node.js compiler prepares the data, and the browser handles the live reactivity.

### 1. Source Input (`input.kv`)
Uses an indentation-based syntax:
- `state count = 0`: Defines a reactive state variable.
- `text "Label"`: Static text.
- `text count`: References a state variable (variable: true).
- `button "Add" onClick=set(count + 1)`: Interactive button with a structured event.

### 2. Compiler (Node.js / `index.js`)
- **Parsing**: `parser/parse.js` transforms KV text into a semantic AST.
- **Serialization**: The compiler generates a JSON `debug.json` and embeds the AST directly into the HTML.
- **Bundling**: It reads `runtime/runtime.js` and `renderer/render.js` and injects them into `<script>` tags in `output.html`.

### 3. Client Runtime (Browser)
- **Logic Engine**: A `Runtime` class manages state and expression evaluation using `new Function`.
- **Reactivity**: Implements a `setState(target, expression)` method. When state changes, it triggers an `onRender` callback.
- **Variable Resolution**: Automatically resolves variable nodes against current state before rendering.

### 4. Client Renderer (Browser / `renderer/render.js`)
- **Pure DOM**: Uses `document.createElement` and DOM APIs.
- **State-Agnostic**: Renders the "Resolved Tree" provided by the Runtime.
- **Event Binding**: Uses `addEventListener` to hook up the `onClick` event data to the `runtime.setState` method.

## File Hierarchy & Descriptions

```text
klover/
├── parser/
│   └── parse.js          # Semantic DSL parser (Handles nested columns/rows/state)
├── runtime/
│   └── runtime.js        # Logic engine (Browser-compatible, handles state updates)
├── renderer/
│   └── render.js         # DOM-based renderer (Pure rendering, no logic)
├── shared/
│   └── schema.js         # AST node factory functions
├── input.kv              # Primary DSL source file
├── index.js              # Compiler & Bundler (Glues everything together)
├── output.html           # Final standalone application
├── debug.json            # Last generated AST (JSON format)
└── PROJECT_CONTEXT.md    # Technical documentation (this file)
```

## Current Status
- [x] **V5 Hydration Model**: Full end-to-end interactivity restored.
- [x] **Stateful DOM**: Renderer correctly visualizes runtime state changes.
- [x] **Live Events**: Buttons successfully trigger state updates in the browser.
- [x] **Debug Tools**: `debug.json` accurately reflects the parsed AST for verification.
- [ ] **Component System**: The browser-side renderer needs to be updated to support the custom component definitions (`type: component`) parsed in `parser/parse.js`.

## Design Philosophy
- **Zero Dependencies**: The compiler and output run on pure Node/Browser APIs.
- **Single-File Output**: One `output.html` contains everything needed (Data + Logic + Styles + UI).
- **Declarative Interactivity**: Logic is defined in the DSL but executed safely in the browser.
