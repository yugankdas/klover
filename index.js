const fs = require("fs");
const { parse } = require("./parser/parse");
const { render } = require("./renderer/render");

// 📥 READ
const input = fs.readFileSync("input.kv", "utf-8");

// 🧠 PARSE (DO NOT TOUCH STRUCTURE)
const result = parse(input);

// ⚠️ Support BOTH formats (array OR tree)
let tree;
let theme = null;

if (Array.isArray(result)) {
    // old parser
    tree = {
        type: "column",
        children: result
    };
} else {
    // new parser
    tree = result.tree || result;
    theme = result.theme || null;
}

// 🎨 RENDER
const body = render(tree, { theme });

// 🎨 CSS (UPGRADED UI)
const styles = `
<style>
body {
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
}

/* APP WRAPPER */
.app {
    min-height: 100vh;
}

/* DARK THEME */
.dark {
    background: #0f0f0f;
    color: white;
}

/* LIGHT THEME */
.light {
    background: #ffffff;
    color: black;
}

/* LAYOUT */
.column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 40px;
}

.row {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

.center {
    align-items: center;
}

/* TEXT */
.kv-text {
    font-size: 18px;
    line-height: 1.5;
}

/* BUTTON */
.kv-button {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    background: #4CAF50;
    color: white;
    cursor: pointer;
    transition: 0.2s;
}

.kv-button:hover {
    transform: translateY(-2px);
}

/* IMAGE (future ready) */
.kv-image {
    max-width: 100%;
    border-radius: 10px;
}
</style>
`;

// 📦 HTML
const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Klover</title>
${styles}
</head>
<body>
${body}
</body>
</html>
`;

// 💾 WRITE
fs.writeFileSync("output.html", html);

console.log("✅ Renderer V2 ready!");