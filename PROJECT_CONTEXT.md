# Klover Project Context

Klover is a lightweight, state-aware domain-specific language (DSL) and compiler for building structured UI layouts.

## Core Objective
To provide a declarative syntax for building interactive UI components that cleanly separates structure (AST), logic (Runtime), and presentation (Renderer).

## V4 Clean Architecture

### 1. Source Input (`input.kv`)
Uses an indentation-based syntax with first-class state and event support:
- `state [key] = [value]`: Defines a reactive state variable.
- `text [key]`: References a state variable (becomes a variable node in AST).
- `button "[label]" onClick=set([expr])`: Defines an interactive button with a structured event.
- `column [align]` / `row`: Standard layout containers.
- `component [Name]:`: Reusable UI component definitions.

### 2. Parser (`/parser/parse.js`)
- **Pure Extraction**: Transforms KV text into a semantic AST.
- **Event System**: Parses `onClick` into a structured object:
  ```js
  events: { click: { target: "count", expression: "count + 1" } }
  ```
- **Variable Flagging**: Automatically identifies state references in text nodes via `isVariable: true`.

### 3. Runtime (`/runtime/runtime.js`)
- **Logic Engine**: Manages the application's logic state and expression evaluation.
- **State Inventory**: Traverses the AST to extract initial `state` values.
- **Methods**:
  - `evaluate(expr)`: Evaluates expressions in the context of the current state.
  - `setState(key, expr)`: Updates state values dynamically.

### 4. Shared Layer (`/shared/schema.js`)
- Contains consistent factory functions (`createState`, `createButton`, etc.) for AST nodes.

### 5. Entry Point (`index.js`)
- Orchestrates the pipeline: Read → Parse → Runtime Init → Render → Write.
- **Handover**: Passes the `tree`, `components`, and `runtime` object to the renderer.

## File Hierarchy & Descriptions

```text
klover/
├── parser/
│   └── parse.js          # Semantic DSL parser (Produces Clean AST)
├── runtime/
│   └── runtime.js        # Logic engine and state manager
├── renderer/
│   └── render.js         # (Teammate Managed) Transforms AST to HTML
├── shared/
│   └── schema.js         # AST node factory functions
├── input.kv              # Primary DSL source file
├── index.js              # Compiler entry point
├── package.json          # Project configuration
└── PROJECT_CONTEXT.md    # Technical documentation (this file)
```

## Technical Stack
- **Runtime**: Node.js
- **Logic**: Clean, decoupled JavaScript AST processing.
- **Dependencies**: Native `fs` only.

## Current Status
- [x] **V4 Architecture**: Full separation of concerns achieved.
- [x] **Stateful AST**: Parser correctly identifies states and variable references.
- [x] **Structured Events**: Events are parsed into data objects, not strings.
- [ ] **Renderer Integration**: The renderer is currently being updated by a teammate to support the new `runtime` and `events` data.

## Design Philosophy
- **Clean Separation**: No rendering hacks in the parser; no logic in the renderer.
- **Machine Readable**: The AST is a pure data structure that can be rendered to any target (HTML, Mobile, TUI).
- **Declarative Logic**: Interactivity is defined via simple expressions, not inline JavaScript.
