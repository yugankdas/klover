# Klover (V7: The DX Update)

Klover is a high-performance UI system that combines a state-aware DSL with professional-grade developer tools. V7 introduces a unified CLI and live-reloading to streamline the development workflow.

## Core DX Features (V7)

- **Unified CLI**: New `klover` command for builds, debugging, and development.
- **Watch Mode**: Live-reloading via `klover dev` keeps your UI in sync with your code.
- **Improved Error Handling**: Clearer console feedback for faster debugging.
- **Modular Pipeline**: Reusable build engine for advanced integrations.

## Getting Started

1.  **Define your UI** (`input.kv`):
    ```kv
    state count = 0
    column center:
        text count
        button "Increase" onClick=set(count, count + 1)
    ```
2.  **Run Dev Mode**:
    ```bash
    npm run dev
    ```
    *Note: `npm run dev` is a shortcut for `node cli/index.js dev`.*
3.  **Hot Reload**: Every time you save `input.kv`, your `output.html` will automatically update.

## Architecture

- **CLI**: The command-line interface and watcher.
- **Parser**: Translates DSL to semantic AST.
- **Runtime**: Manages logic, scoping, and state.
- **Renderer**: Transforms data to UI (Teammate-managed).

For full technical specifications, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).
