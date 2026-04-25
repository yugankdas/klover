# Klover Project Context

Klover is a lightweight domain-specific language (DSL) and compiler designed to simplify the creation of structured web layouts. It transforms `.kv` files into styled HTML documents.

## Core Objective
To provide a human-readable, declarative syntax for building UI components that abstracts away the complexities of HTML/CSS for simple layouts.

## Current Architecture

### 1. Source Input (`input.kv`)
Uses a simple line-based syntax:
- `text "Content"`: Renders a paragraph.
- `button "Label"`: Renders a styled button.

### 2. Parser (`/parser/parse.js`)
- Cleans input lines and filters empty ones.
- Uses regex to extract values from `text` and `button` declarations.
- Converts raw strings into structured JSON objects using shared schemas.

### 3. Shared Layer (`/shared/schema.js`)
- Defines the data structures (schemas) for all Klover elements.
- Ensures consistency between the parser and the renderer.

### 4. Renderer (`/renderer/render.js`)
- Iterates through the structured elements.
- Maps each element type to its corresponding HTML representation.
- Wraps elements in a `.column` container for layout.

### 5. Entry Point (`index.js`)
- Orchestrates the full lifecycle: Read -> Parse -> Render -> Wrap -> Write.
- Injects a standard CSS theme into the final HTML output.

## Technical Stack
- **Language**: Node.js (JavaScript)
- **Output**: HTML5 / CSS3
- **Dependencies**: Native `fs` module.

## Future Roadmap (Planned)
- [ ] Add support for `image "url"` element.
- [ ] Implement nested containers (e.g., `row { ... }`).
- [ ] Allow inline styling or classes via KV syntax.
- [ ] Add a development server with hot-reloading for `.kv` files.

## Design Philosophy
- **Simplicity**: No complex nesting or logic in the DSL.
- **Visual Excellence**: Default output should look modern and professional (Glassmorphism, clean typography).
- **Extensibility**: Easy to add new element types by updating schema, parser, and renderer.
