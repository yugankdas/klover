const fs = require("fs");
const path = require("path");
const { parse } = require("./parser/parse");
const Runtime = require("./runtime/runtime");
const { render } = require("./renderer/render");

function build(inputFile = "input.kv", outputFile = "output.html") {
    try {
        console.log("🔨 Klover Build Engine");

        // 1. Read and parse
        console.log(`📖 Reading: ${inputFile}`);
        const input = fs.readFileSync(inputFile, "utf-8");
        const parsed = parse(input);
        console.log("✅ Parse complete");

        // 2. Initialize runtime
        const runtime = new Runtime(parsed.tree, parsed.components);
        runtime.init();
        console.log("✅ Runtime initialized");

        // 3. Resolve initial tree
        const resolvedTree = runtime.resolveTree();
        console.log("✅ Tree resolved");

        // 4. Initial Render (for static SEO or just verification)
        const initialHtml = render(resolvedTree, {
            runtime,
            theme: parsed.theme
        });

        // 5. Read scripts for injection
        const runtimeCode = fs.readFileSync(path.join(__dirname, "runtime/runtime.js"), "utf8");
        const rendererCode = fs.readFileSync(path.join(__dirname, "renderer/render.js"), "utf8");

        // 6. Generate final HTML
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Klover V7 App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            DEFAULT: '#3b82f6',
                            hover: '#2563eb',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body { 
            background-color: #f1f5f9; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
            margin: 0;
            font-family: 'Inter', sans-serif;
        }
        .klover-app { 
            background: white; 
            border-radius: 1.5rem; 
            padding: 3rem; 
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
            min-width: 400px;
            max-width: 90%;
        }
        /* Default spacing for nodes */
        p { margin-bottom: 0.5rem; }
        button { 
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
        }
        button:active { transform: scale(0.95); }
    </style>
</head>
<body>
    <div id="root">
        ${initialHtml}
    </div>

    
    <script>
        try {
            // --- EMBEDDED SCRIPTS ---
            
            // 1. Runtime
            ${runtimeCode.split(/if\s*\(typeof\s*module/)[0]}
            window.Runtime = Runtime;

            // 2. Renderer
            ${rendererCode.split(/if\s*\(typeof\s*module/)[0]}
            window.render = render;
            window.renderNode = renderNode;

            // --- BOOTSTRAP ---


        let state = ${JSON.stringify(runtime.state)};
        const rawAst = ${JSON.stringify(parsed.tree)};
        const theme = ${JSON.stringify(parsed.theme || {})};
        const components = ${JSON.stringify(parsed.components || {})};

        // Initialize client-side runtime
        const kRuntime = new Runtime(rawAst, components);
        kRuntime.state = state;

        // Shared render function
        function refresh() {
            try {
                const root = document.getElementById("root");
                const html = render(rawAst, { runtime: kRuntime, theme });
                root.innerHTML = html;
                console.log("UI Refreshed. State:", kRuntime.state);
            } catch (err) {
                console.error("Refresh Error:", err);
            }
        }

        // Global state updaters called by HTML event listeners
        window.updateState = function(target, expr) {
            kRuntime.setState(target, expr);
        };

        window.updateOperations = function(ops) {
            kRuntime.executeOperations(ops);
        };

        // Bind update to render cycle
        kRuntime.onRender = refresh;

        console.log("Klover V7 Live");
    } catch (bootstrapErr) {
        console.error("Klover V7 Bootstrap Error:", bootstrapErr);
    }
    </script>


</body>
</html>`;

        fs.writeFileSync(outputFile, html);
        console.log(`✅ Build complete: ${outputFile}`);
        return true;

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
        return false;
    }
}

if (require.main === module) {
    build("input.kv", "output.html");
}

module.exports = { build };