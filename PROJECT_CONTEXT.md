# Klover Project Context (V7: The DX Update)

Klover is a state-aware UI system that prioritizes Developer Experience (DX) through robust tooling and a decoupled, modular architecture.

## 1. V7: Developer Experience (DX) Features

### The Klover CLI
The project now includes a centralized Command Line Interface located in `./cli/index.js`.
- **`klover build`**: Executes a one-time build of `input.kv` to `output.html`.
- **`klover dev [file]`**: Enables **Watch Mode**. Uses `chokidar` to monitor file changes and automatically re-compiles the project.
- **`klover run <file>`**: Compiles a specific `.kv` file.
- **`klover debug`**: Compiles with internal logging enabled for troubleshooting.

### The Build Engine (`index.js`)
The core pipeline has been refactored from a standalone script into a reusable **Build Engine**:
- **Exported API**: Exports a `build(inputFile, outputFile)` function for programmatic use.
- **Error Resilience**: Implements refined `try/catch` blocks to provide user-friendly error messages in the console, replacing raw stack traces.

## 2. Language Specification (DSL)

### Component Lifecycle
- **Definition**: `component [Name]:` defines a template.
- **Initialization**: The parser stores these in a `components` registry.
- **Handover**: The registry is passed directly to the renderer to be instantiated.

### Event & Operation Logic
- **Chained Operations**: Supports `onClick=set(a, 1) & set(b, 2)`.
- **Dynamic Resolution**: Expressions are resolved at runtime in the browser (or target environment) using the logic state extracted during the parse phase.

## 3. Architecture Specification (V7)

### Layer 1: The Parser (`parser/parse.js`)
- **Indentation-First**: Stack-based hierarchy management.
- **Feature Rich**: Supports `repeat`, `if`, `video`, and advanced prop extraction.

### Layer 2: The Runtime (`runtime/runtime.js`)
- **Logical Source of Truth**: Manages state and variable resolution.
- **Scoped Execution**: Handles global and item-level scopes (for `repeat` loops).

### Layer 3: The Renderer (`renderer/render.js`)
- **Pure Presentation**: A decoupled module (Teammate Managed) that renders the pre-resolved tree.

## 4. File Hierarchy (V7)

```text
klover/
├── cli/
│   └── index.js          # Unified Command Line Interface
├── parser/
│   └── parse.js          # DSL Parser & AST Generator
├── runtime/
│   └── runtime.js        # Logic Engine & State Manager
├── renderer/
│   └── render.js         # (Teammate Managed) Resolved Tree Renderer
├── shared/
│   └── schema.js         # Unified AST Factory Layer
├── index.js              # Reusable Build Engine
├── input.kv              # Primary DSL Source
└── package.json          # Project Registry (v1.0.0 with CLI linked)
```

## 5. Design Philosophy
- **Developer First**: Tools like `dev` mode reduce the feedback loop between code and visual results.
- **Minimalist Core**: Zero external dependencies in the compiler (except `chokidar` for the CLI).
- **Extensible AST**: The V7 schema is robust enough to support advanced features like nested components and complex animations.
