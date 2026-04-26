# Klover Project Context (V6)

Klover is a high-performance, state-aware Domain-Specific Language (DSL) and compiler designed for building complex, interactive UI systems with a rigorous separation of concerns.

## Core Objective
To establish a production-grade pipeline that transforms declarative KV syntax into a semantic, machine-readable Abstract Syntax Tree (AST), managed by a dedicated logic runtime.

## V6 Professional Architecture

### 1. The Language Specification (`input.kv`)
The DSL implements an indentation-based hierarchy:
- **State Definitions**: `state [identifier] = [literal]`
- **Reactive Nodes**: `text [identifier]` (Marks node with `isVariable: true`)
- **Interactive Nodes**: `button "[label]" onClick=set([expression])`
- **Layout Logic**: `column [alignment]` and `row` for structural composition.
- **Modularity**: `component [Name]:` defines reusable sub-trees.

### 2. The Semantic Parser (`parser/parse.js`)
A deterministic state-machine that processes source text into a structured tree:
- **Syntax Analysis**: Regular expression-based extraction of tags, labels, and styles.
- **Hierarchy Mapping**: Indentation-level tracking ensures correct parent-child relationships.
- **Event Serialization**: `onClick` events are serialized into data objects rather than string fragments:
  ```js
  events: { 
    click: { 
      target: "count", 
      expression: "count + 1" 
    } 
  }
  ```
- **Context Awareness**: Distinguishes between static strings and state-variable references during the parse phase.

### 3. The Logic Runtime (`runtime/runtime.js`)
A standalone class that serves as the "source of truth" for the application:
- **State Discovery**: On initialization, it recursively scans the AST to inventory all `state` nodes.
- **Expression Engine**: Implements a safe `evaluate()` method using dynamic function constructors to compute DSL logic.
- **State Synchronization**: `setState(key, expr)` allows for programmatic updates to the application's data model without coupling to any specific rendering target.

### 4. Pipeline Orchestration (`index.js`)
The central entry point that executes the end-to-end lifecycle:
1. **Read**: Loads the raw `.kv` source.
2. **Parse**: Generates the initial AST and component registry.
3. **Runtime Init**: Instantiates the runtime and populates the data model.
4. **Render Handover**: Passes the `tree`, `components`, and `runtime` to the presentation layer.
5. **Assembly**: Packages the rendered output with embedded styles into the final artifact.

## File Hierarchy & Detailed Descriptions

```text
klover/
├── parser/
│   └── parse.js          # High-performance DSL parser (AST Generator)
├── runtime/
│   └── runtime.js        # Decoupled Logic & State Management Engine
├── renderer/
│   └── render.js         # Presentation Layer (Abstracted from logic)
├── shared/
│   └── schema.js         # Unified AST Schema & Factory functions
├── index.js              # Production Pipeline Orchestrator
├── input.kv              # Primary DSL Source
├── package.json          # Node.js Project Configuration
└── PROJECT_CONTEXT.md    # Detailed Technical Specification (V6)
```

## Design Philosophy
- **Strict Decoupling**: No logic resides in the renderer; no rendering logic resides in the parser.
- **Target Agnostic**: The AST produced in V6 is designed to be render-target agnostic (HTML, JSON, Native).
- **Data-First**: Interactivity is treated as a first-class data property, not a side-effect.

## Current Status (V6)
- [x] **Semantic Purity**: Parser produces zero rendering artifacts.
- [x] **Logic Autonomy**: Runtime operates independently of the DOM.
- [x] **Standardized Events**: All interactions follow the target/expression schema.
- [ ] **Renderer Integration**: Final styling and DOM binding are handled in the teammate-managed presentation layer.
