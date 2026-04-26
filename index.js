const fs = require("fs");
const path = require("path");
const { parse } = require("./parser/parse");

// 1. READ INPUT
console.log("Reading input.kv...");
const input = fs.readFileSync("input.kv", "utf8");

// 2. PARSE
console.log("Parsing DSL...");
const result = parse(input);
const ast = result.tree;
const theme = result.theme || {};

// 3. READ CLIENT SCRIPTS
console.log("Bundling scripts...");
const runtimeCode = fs.readFileSync(path.join(__dirname, "runtime/runtime.js"), "utf8");
const rendererCode = fs.readFileSync(path.join(__dirname, "renderer/render.js"), "utf8");

// 4. GENERATE HTML
const html = `<!DOCTYPE html>
<html>
<head>
    <title>Klover V5 — Live App</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: #f8f9fa; 
            color: #333;
            line-height: 1.6;
        }
        #app { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        h1, h2 { color: #2c3e50; }
        p { margin: 8px 0; }
        button {
            padding: 10px 20px;
            font-size: 15px;
            cursor: pointer;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            transition: all 0.2s;
            margin: 5px;
        }
        button:hover {
            background: #0056b3;
            transform: translateY(-1px);
        }
        button:active {
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div id="app"></div>

    <script>
        // --- EMBEDDED RUNTIME ---
        ${runtimeCode}

        // --- EMBEDDED RENDERER ---
        ${rendererCode}

        // --- BOOTSTRAP ---
        const ast = ${JSON.stringify(ast, null, 2)};
        const theme = ${JSON.stringify(theme, null, 2)};
        
        console.log("Initializing Klover Runtime...");
        const runtime = new Runtime(ast);
        runtime.init();

        // Connect Runtime to Renderer
        runtime.onRender = (resolvedTree) => {
            console.log("Re-rendering...");
            renderApp(resolvedTree, runtime, theme);
        };

        // Initial Render
        const initialResolvedTree = runtime.resolveTree();
        renderApp(initialResolvedTree, runtime, theme);
        
        console.log("✅ Klover App Ready!");
    </script>
</body>
</html>`;

fs.writeFileSync("output.html", html);
fs.writeFileSync("debug.json", JSON.stringify(ast, null, 2));

console.log("✅ output.html generated");
console.log("✅ debug.json updated");