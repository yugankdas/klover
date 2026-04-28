# Klover Project Context (V9: The Premium UI Update)

Klover is a state-aware UI system that prioritizes Developer Experience (DX) and Visual Excellence through a robust, responsive engine and a modular architecture.

## 1. V9: The Responsive & Semantic Update

### V9 Responsive Engine
The core rendering layer now features a premium "Moonlight Dark" theme by default:
- **Glassmorphism**: Built-in support for backdrop blurs and semi-transparent surfaces.
- **Ambient Lighting**: Automatic radial gradients and glow effects for a high-end look.
- **Flex-Wrap System**: Rows automatically wrap on small screens, and columns are fully responsive without media queries.

### Semantic Typography
Klover V9 implements a full typography hierarchy:
- **Variants**: `h1`, `h2`, `h3`, `h4`, `heading`, and `subheading`.
- **Scaling**: Fluid typography that scales down automatically for mobile devices.

### Page Metadata
Users can now control document-level metadata directly from the DSL:
- **`title "..."`**: Sets the browser tab title.
- **`icon "..."`**: Sets the page favicon.

## 2. Tooling & CLI

### The Klover CLI
The project includes a centralized Command Line Interface located in `./cli/index.js`.
- **`klover build`**: Executes a one-time build.
- **`klover dev [file]`**: Enables **Watch Mode** using `chokidar`.
- **`klover run <file>`**: Compiles a specific `.kv` file (e.g., `showcase.kv`).

### The Build Engine (`index.js`)
The core pipeline is a reusable **Build Engine**:
- **Exported API**: Programmatic `build(inputFile, outputFile)` function.
- **Embedded Bootstrap**: Automatically bundles the Runtime, Renderer, and State into the output HTML for a zero-dependency deployment.

## 3. Architecture Specification

### Layer 1: The Parser (`parser/parse.js`)
- **Indentation-First**: Stack-based hierarchy management.
- **Robust Tokenizer**: Handles complex expressions and nested parentheses.
- **Metadata Support**: Captures `title`, `icon`, and `theme` globally.

### Layer 2: The Runtime (`runtime/runtime.js`)
- **Logical Source of Truth**: Manages state and path-based event resolution.
- **V8 Sync**: Ensures the internal tree is resolved and initialized for instant event response.

### Layer 3: The Renderer (`renderer/render.js`)
- **Class-Based CSS**: Pure CSS architecture using a consistent design system.
- **Accessibility**: Support for `alt` text and custom `class` pass-through.

## 4. File Hierarchy (V9)

```text
klover/
├── cli/            # CLI interface
├── parser/         # DSL parser & AST generator
├── runtime/        # State management & logic engine
├── renderer/       # CSS system & HTML generation
├── shared/         # AST factory
├── plugins/        # Extensible plugin system
├── index.js        # Core build engine
├── showcase.kv     # Feature demonstration
└── package.json    # Project registry (v1.1.0)
```

## 5. Design Philosophy
- **Wow First Glance**: Every Klover app should look premium out of the box.
- **Zero Frameworks**: No React, no Vue, no Tailwind dependencies in the final output.
- **Hackable**: A modular codebase that is easy to extend with new components or plugins.
