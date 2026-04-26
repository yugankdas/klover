# Klover Project Context (V7)

Klover is a high-performance, state-aware Domain-Specific Language (DSL) and compiler designed for building complex, interactive UI systems with a rigorous separation of concerns.

## Core Objective
To establish a production-grade pipeline that transforms declarative KV syntax into a semantic, machine-readable Abstract Syntax Tree (AST), managed by a dedicated logic runtime.

## V7 Professional Architecture (Latest)

### 1. The Language Specification (`input.kv`)
The DSL implements an indentation-based hierarchy:
- **State Definitions**: `state [identifier] = [literal]`
- **Reactive Nodes**: `text [expression]` (Supports complex math and ternary logic).
- **Interactive Nodes**: `button "[label]" onClick=set([op1]) & set([op2])` (Supports batch operations).
- **Layout Logic**: `column [alignment]` and `row` for structural composition.
- **Visual Nodes**: `image "[url]"` and `video "[url]"` with hardware-accelerated playback props.

### 2. The Semantic Parser (`parser/parse.js`)
A deterministic state-machine with refined expression awareness:
- **Expression Extraction**: Uses a prefix-based logic to distinguish between node content and properties, allowing for spaces in math (e.g., `count * 5`).
- **Whitelisted Properties**: Prop extraction is now guarded by a whitelist to prevent expression tokens from being misidentified as flags.
- **Batch Event Serialization**: Multiple `set()` calls are serialized into an `operations` array:
  ```js
  events: { 
    click: { 
      operations: [
        { target: "count", expression: "count + 1" },
        { target: "score", expression: "score + 10" }
      ]
    } 
  }
  ```

### 3. The Logic Runtime (`runtime/runtime.js`)
A standalone class serving as the "source of truth":
- **Expression Engine**: Uses a dynamic function constructor for safe, context-aware evaluation of DSL math/logic.
- **Batch State Updates**: Implements `executeOperations()` to process multiple state changes in a single atomic cycle, reducing re-render overhead.
- **State Discovery**: Recursively inventories all `state` nodes during initialization.

### 4. The Presentation Layer (`renderer/render.js`)
- **Abstracted Styles**: Uses a mapping system (`sizeMap`, `weightMap`) to translate DSL tokens into valid CSS.
- **Dynamic Mounting**: Automatically clears and re-populates the `#app` container based on runtime state changes.
- **Theme Persistence**: Styles are driven by a global `theme` object passed through the pipeline.

### 5. Pipeline Orchestration (`index.js`)
- **Bundling**: Aggregates the runtime, renderer, and generated AST into a single `output.html`.
- **Environment Agnostic**: Code includes safety wrappers for `module.exports`, making it compatible with both Node.js (build-time) and modern Browsers (run-time).

## File Hierarchy

```text
klover/
├── parser/
│   └── parse.js          # DSL Parser with refined expression logic
├── runtime/
│   └── runtime.js        # Logic Engine (Supports batch operations)
├── renderer/
│   └── render.js         # Presentation Layer (Theme aware)
├── shared/
│   └── schema.js         # Unified AST Schema
├── index.js              # Production Pipeline Orchestrator
├── input.kv              # Primary DSL Source
├── output.html           # Generated Live Application
├── debug.json            # Parsed AST (Internal inspection)
└── PROJECT_CONTEXT.md    # Detailed Technical Specification (V7)
```

## V7 Status
- [x] **Math Maturity**: Full support for complex expressions in text nodes.
- [x] **Batch Interactions**: "RESET ALL" and other multi-state buttons are fully functional.
- [x] **Prop Integrity**: Whitelist-based parsing prevents prop/expression collisions.
- [x] **Cross-Platform**: Script bundled files now execute correctly in browsers without ReferenceErrors.
- [x] **Theme Persistence**: Style context is maintained throughout the reactive lifecycle.
