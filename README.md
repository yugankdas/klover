# Klover (V4)

Klover is a lightweight, state-aware Domain-Specific Language (DSL) and compiler for building interactive UI layouts. It transforms `.kv` files into structured ASTs, manages state through a logic runtime, and compiles to modern HTML.

## Key Features

- **State Management**: Built-in `state` keyword for reactive variables.
- **Interactivity**: Structured event handling via `onClick=set(...)`.
- **Decoupled Architecture**: Strict separation of concern between Parsing, Logic (Runtime), and Presentation (Renderer).
- **Indentation-based Syntax**: Clean, human-readable DSL inspired by Python and KV.

## Getting Started

1.  **Define your UI** in `input.kv`:
    ```kv
    state count = 0
    column center:
        text count
        button "Increase" onClick=set(count + 1)
    ```
2.  **Run the compiler**:
    ```bash
    npm start
    ```
3.  **View the result**: Open `output.html` in your browser.

## Architecture Overview

- **Parser**: Converts `.kv` source into a semantic AST.
- **Runtime**: Extracts state and handles expression evaluation.
- **Renderer**: Transforms the AST into the final HTML output.

For a deeper dive into the technical implementation, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
