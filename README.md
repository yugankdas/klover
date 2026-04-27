# 🚀 Klover

Klover is a lightweight DSL (domain-specific language) that transforms simple, human-readable `.kv` files into structured, styled UI.

---

## ✨ Why Klover?

* 🧠 **Declarative syntax** — focus on *what* to build, not HTML boilerplate
* ⚡ **Fast iteration** — write UI in seconds
* 🎨 **Built-in styling** — clean defaults out of the box
* 🧩 **Extensible** — plugin-ready architecture

---

## 📦 Installation

```bash
npm install -g klover
```

---

## 🚀 Usage

### Build UI

```bash
klover build
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

column center:
    text "Welcome to Klover" heading
    image "https://via.placeholder.com/300"

    button "Click Me" primary
```

---

## 📁 Output

Klover generates:

```text
output.html
```

Open it in your browser to view your UI.

---

## 🎨 VS Code Extension

Klover includes syntax highlighting and file icons.

### Features

* ✅ Syntax highlighting for `.kv` files
* ✅ Keyword + string + props highlighting
* ✅ Custom file icons

---

### Enable File Icons

File icons require manual activation:

1. Open Command Palette (`Ctrl + Shift + P`)
2. Search: **File Icon Theme**
3. Select: **Klover Icons**

---

## 🧠 Core Concepts

### Layout

```klover
column:
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

### Dynamic Text

```klover
text count
```

---

## 🧩 Project Structure

```text
klover/
├── cli/
├── parser/
├── runtime/
├── renderer/
├── shared/
├── plugins/
├── index.js
```

---

## 🛠 Tech Stack

* Node.js
* Custom parser + runtime
* Vanilla HTML/CSS rendering

---

## ⚠️ Current Status

Klover is under active development.

* ✅ CLI + DSL working
* ✅ Syntax highlighting available
* 🚧 Renderer improvements ongoing

---

## 📄 License

MIT License

---

## 👤 Author

Bhumi Jha
Yugank Das
