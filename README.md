# 🚀 Klover

Klover is a lightweight domain-specific language (DSL) for building UI using simple, readable `.kv` files.
It compiles your code into clean HTML with built-in layout, styling, and state handling.

---

## ✨ Why Klover?

* 🧠 **Declarative UI** — write *what* you want, not how to structure HTML
* ⚡ **Fast iteration** — minimal syntax, instant results
* 🎨 **Built-in layout system** — column, row, alignment out of the box
* 🔁 **Reactive state** — simple state + events
* 🧩 **Extensible architecture** — plugin-ready

---

## 📦 Installation

```bash
npm install -g klover
```

---

## 🚀 Usage

### Build UI

```bash
klover build yourfile.kv
```

Generates:

```text
output.html
```

---

### Run a file

```bash
klover run app.kv
```

---

### Dev mode (auto rebuild)

```bash
klover dev
```

---

### Debug mode

```bash
klover debug --no-render
```

---

## 🧾 Example

```klover
theme dark

state count = 0

column center:
    text "Welcome to Klover" heading

    button "Increase" primary onClick=set(count + 1)
    text count
```

---

## 🧠 Core Concepts

### Layout

```klover
column:
    text "Top"

    row:
        text "Left"
        text "Right"
```

---

### State

```klover
state count = 0
```

---

### Events

```klover
button "Increase" onClick=set(count + 1)
```

---

### Dynamic Values

```klover
text count
```

---

### Media

```klover
image "image.png"
video "demo.mp4" controls autoplay
```

---

## 🧩 Features

* ✅ Text, button, image, video components
* ✅ Column & row layout system
* ✅ State management
* ✅ Event handling (`onClick`)
* ✅ Conditional rendering (`if`)
* ✅ Lists (`repeat`)
* 🚧 Plugin system (in progress)
* 🚧 Rendering optimizations (in progress)

---

## 🎨 VS Code Extension

Klover includes a syntax highlighting extension located in:

```text
klover-vscode/
```

### Features

* Syntax highlighting for `.kv` files
* Language recognition
* Custom file icons

---

### Install Extension

You can:

* Install from the VS Code Marketplace (search **Klover**)
* OR manually install the `.vsix` file from the `klover-vscode` directory

---

### Enable File Icons

File icons require manual activation:

1. Open Command Palette (`Ctrl + Shift + P`)
2. Search: **File Icon Theme**
3. Select: **Klover Icons**

---

## 🏗 Project Structure

```text
klover/
├── cli/            # CLI interface
├── parser/         # Robust DSL parser
├── runtime/        # State + V9 execution
├── renderer/       # HTML generation
├── shared/         # Node schema
├── plugins/        # Extension system
├── index.js        # Build pipeline
```

---

## 🧪 Development

Run locally:

```bash
node cli/index.js build
```

---

## 📄 License

MIT License

---

## 👤 Author

Bhumi Jha

Yugank Das 

---

## 🚀 Status

Klover is under active development.

* ✅ **Robust Parser**: Supports complex expressions and nested parentheses.
* ✅ **V9 Runtime**: Surgical DOM patching for fast reactive updates.
* ✅ **Component Scope**: Full support for props and nested variable resolution.
* ✅ **VS Code Support**: Syntax highlighting and custom icons available.

---

## 💡 Vision

Klover aims to provide a simple, expressive way to build UI without the complexity of traditional frameworks.
