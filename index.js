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
    <title>Klover App</title>
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
        :root {
            --primary: #3b82f6;
            --primary-dark: #2563eb;
            --bg: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --text: #f8fafc;
            --text-muted: #94a3b8;
        }
        body { 
            background: radial-gradient(circle at top left, #1e293b, #0f172a);
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh;
            margin: 0;
            font-family: 'Inter', sans-serif;
            color: var(--text);
            overflow-x: hidden;
        }
        .klover-app { 
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 2rem; 
            padding: 3rem; 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            min-width: 500px;
            max-width: 95%;
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        p { margin-bottom: 0.5rem; line-height: 1.5; }
        button { 
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.6rem 1.2rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            color: white;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }
        button:hover { 
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        button:active { transform: translateY(0); }
        
        .btn-primary {
            background: var(--primary) !important;
            border: none !important;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39);
        }
        .btn-primary:hover {
            background: var(--primary-dark) !important;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.23);
        }
        
        .btn-danger {
            background: #ef4444 !important;
            border: none !important;
        }
        .btn-danger:hover { background: #dc2626 !important; }

        img {
            border-radius: 1rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        img:hover { transform: scale(1.02); }

        /* V9 Patching Animation */
        [data-kv-path] {
            transition: all 0.3s ease;
        }
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
        function refresh(preResolvedTree) {
            try {
                const root = document.getElementById("root");
                const newTree = preResolvedTree || kRuntime.resolveTree();
                
                if (newTree._changes && newTree._changes.length > 0) {
                    console.log("⚡ Klover V9: Applying surgical patches...");
                    applyPatches(newTree._changes, root.firstElementChild);
                } else {
                    console.log("🔄 Klover V9: Full re-render triggered");
                    const html = render(rawAst, { runtime: kRuntime, theme });
                    root.innerHTML = html;
                }
                console.log("UI Updated. State:", kRuntime.state);
            } catch (err) {
                console.error("Refresh Error:", err);
            }
        }

        function applyPatches(changes, rootEl) {
            changes.forEach(change => {
                try {
                    const el = rootEl.querySelector(\`[data-kv-path="\${change.path}"]\`) || 
                               (rootEl.getAttribute("data-kv-path") === change.path ? rootEl : null);

                    if (change.type === "changed") {
                        const pathParts = change.path.split('.');
                        const baseElPath = pathParts[0];
                        const targetEl = rootEl.querySelector(\`[data-kv-path="\${baseElPath}"]\`) || 
                                         (rootEl.getAttribute("data-kv-path") === baseElPath ? rootEl : null);
                        
                        if (targetEl) {
                            if (change.path.endsWith(".value") || change.path.endsWith(".label")) {
                                targetEl.textContent = change.new;
                            }
                        }
                    } else if (change.type === "replaced") {
                        if (el) {
                            const newHtml = renderNode(change.new, kRuntime, theme, change.path);
                            const temp = document.createElement('div');
                            temp.innerHTML = newHtml;
                            el.replaceWith(temp.firstElementChild);
                        }
                    } else if (change.type === "added" || change.type === "removed") {
                        // For add/remove in lists, we still trigger a re-render of the parent for safety
                        // but we could optimize this later.
                        const parentPath = change.path.substring(0, change.path.lastIndexOf('.children['));
                        const parentEl = rootEl.querySelector(\`[data-kv-path="\${parentPath}"]\`) || 
                                         (rootEl.getAttribute("data-kv-path") === parentPath ? rootEl : null);
                        if (parentEl) {
                            // Find the parent node in the AST to re-render it
                            // For now, let's just do a full refresh of the whole app if add/remove happens
                            // because managing child indices in DOM is complex.
                            throw new Error("Complex change: falling back to full render");
                        }
                    }
                } catch (e) {
                    // Fallback to full render if patching fails
                    const html = render(rawAst, { runtime: kRuntime, theme });
                    document.getElementById("root").innerHTML = html;
                }
            });
        }

        // Global state updaters called by HTML event listeners
        window.__klover_executeOperations = function(opsJson, scopeJson) {
            try {
                // The renderer escapes quotes in JSON.stringify
                const ops = typeof opsJson === 'string' ? JSON.parse(opsJson.replace(/&quot;/g, '"')) : opsJson;
                const scope = typeof scopeJson === 'string' ? JSON.parse(scopeJson.replace(/&quot;/g, '"')) : (scopeJson || {});
                kRuntime.executeOperations(ops, scope);
            } catch (err) {
                console.error("Klover Ops Error:", err);
            }
        };

        window.__klover_setState = function(target, expr) {
            kRuntime.setState(target, expr);
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
