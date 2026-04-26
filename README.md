# Klover (V6)

Klover is a high-performance, state-aware Domain-Specific Language (DSL) and compiler for building structured UI systems. It implements a rigorous V6 architecture that strictly separates structural parsing, logical state management, and visual rendering.

## Core Features (V6)

- **Semantic AST**: A pure, machine-readable tree representing UI structure and intent.
- **Dedicated Runtime**: A standalone logic engine for state management and expression evaluation.
- **Production Pipeline**: A clean Read-Parse-Logic-Render workflow.
- **Strict Decoupling**: Zero rendering logic in the parser; zero business logic in the renderer.

## Getting Started

1.  **Define your Source** (`input.kv`):
    ```kv
    state count = 0
    column center:
        text count
        button "Increase" onClick=set(count + 1)
    ```
2.  **Run the Build**:
    ```bash
    npm start
    ```
3.  **Inspect Output**: Open `output.html`. Note that in V6, the UI is driven by the state provided to the renderer.

## Architecture

- **Parser**: Translates DSL to AST.
- **Runtime**: Manages application state and logic.
- **Renderer**: Transforms data to UI (Teammate-managed).

For full technical specifications, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
