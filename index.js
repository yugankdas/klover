const fs = require("fs");
const { parse } = require("./parser/parse");
const { render } = require("./renderer/render");
const Runtime = require("./runtime/runtime");

const input = fs.readFileSync("input.kv", "utf-8");

// 1. Parse
const result = parse(input);
const tree = result.tree;
const theme = result.theme;
const components = result.components;

// 2. Runtime
const runtime = new Runtime(tree);
runtime.init();

// 3. Render (Pass runtime to teammate's renderer)
const body = render(tree, {
    theme,
    components,
    runtime
});

// 4. Styles
const styles = `
<style>
body { margin: 0; font-family: sans-serif; }
.app { padding: 40px; }
.dark { background: #111; color: white; }
.column { display: flex; flex-direction: column; gap: 20px; }
.row { display: flex; gap: 10px; }
.center { align-items: center; }
.heading { font-size: 28px; font-weight: bold; }
.kv-button { padding: 10px; border-radius: 8px; background: green; color: white; }
.kv-image { max-width: 100%; border-radius: 10px; }
</style>
`;

// 5. Output
const html = `
<html>
<head>${styles}</head>
<body>${body}</body>
</html>
`;

fs.writeFileSync("output.html", html);
console.log("✅ Build complete");