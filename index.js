const fs = require("fs");
const { parse } = require("./parser/parse");
const { renderNode } = require("./renderer/render");

// 📥 READ INPUT
const input = fs.readFileSync("input.kv", "utf-8");

// 🧠 PARSE → TREE
const tree = parse(input);

// 🎨 RENDER → HTML BODY
const body = renderNode(tree);

// 🎨 GLOBAL STYLES
const styles = `
<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0f0f0f;
    color: white;
}

/* CONTAINER */
.column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 40px;
}

/* ROW */
.row {
    display: flex;
    flex-direction: row;
    gap: 12px;
}

/* ALIGNMENT */
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
    border-radius: 6px;
    border: none;
    background: #4CAF50;
    color: white;
    cursor: pointer;
    transition: 0.2s ease;
}

.kv-button:hover {
    background: #45a049;
}
</style>
`;

// 📦 FINAL HTML
const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Klover Output</title>
${styles}
</head>
<body>
${body}
</body>
</html>
`;

// 💾 WRITE OUTPUT
fs.writeFileSync("output.html", html);

console.log("✅ HTML generated successfully!");