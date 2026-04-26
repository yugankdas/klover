const fs = require("fs");
const { parse } = require("./parser/parse");
const { render } = require("./renderer/render");
const Runtime = require("./runtime/runtime");

// 🔹 Read input
const input = fs.readFileSync("input.kv", "utf-8");

// 🔹 Parse DSL → AST
const parsed = parse(input);

// 🔹 Initialize runtime (state extraction)
const runtime = new Runtime(parsed.tree);
runtime.init();

// 🔹 Resolve dynamic logic (V5.5)
const resolvedTree = runtime.resolveTree();

// 🔹 Render final HTML body
const body = render(resolvedTree, {
    theme: parsed.theme,
    components: parsed.components,
    runtime
});

// 🔹 Basic HTML shell
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Klover App</title>
</head>
<body>
    ${body}
</body>
</html>
`;

// 🔹 Write output
fs.writeFileSync("output.html", html);

console.log("✅ Build complete");