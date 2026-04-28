const fs = require("fs");
const path = require("path");
const { parse } = require("./parser/parse");
const Runtime = require("./runtime/runtime");
const { render } = require("./renderer/render");

function build(inputFile = "input.kv", outputFile = "output.html", options = {}) {
    try {
        console.log("Klover Build Engine");

        // 1. Read and parse
        console.log(`Reading: ${inputFile}`);
        const input = fs.readFileSync(inputFile, "utf-8");
        const parsed = parse(input);
        console.log("Parse complete");

        // 2. Initialize runtime
        const runtime = new Runtime(parsed.tree, parsed.components);
        runtime.init();
        console.log("Runtime initialized");

        // 3. Resolve initial tree (Expand loops, variables, components)
        const resolvedTree = runtime.resolveTree();
        console.log("Tree resolved");

        // 4. Initial Render
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
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${parsed.title || `Klover App - ${path.basename(inputFile)}`}</title>
    ${parsed.icon ? `<link rel="icon" href="${parsed.icon}">` : ""}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* ===== RESET ===== */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ===== BASE ===== */
        :root {
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --danger: #ef4444;
            --danger-hover: #dc2626;
            --bg: #0f172a;
            --surface: rgba(15, 23, 42, 0.8);
            --border: rgba(255, 255, 255, 0.08);
            --text: #f8fafc;
            --text-muted: #94a3b8;
            --radius: 12px;
            --font: 'Inter', system-ui, -apple-system, sans-serif;
        }

        body {
            background: radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 20px;
            font-family: var(--font);
            color: var(--text);
            margin: 0;
            overflow-x: hidden;
        }

        /* Ambient Glow */
        body::before {
            content: "";
            position: fixed;
            top: -10%;
            right: -10%;
            width: 50%;
            height: 50%;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
            z-index: -1;
            pointer-events: none;
        }

        /* ===== APP CONTAINER ===== */
        .kv-app {
            max-width: 1100px;
            width: 100%;
            margin: 0 auto;
            padding: 48px;
            background: var(--surface);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border);
            border-radius: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            animation: kvFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes kvFadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ===== TYPOGRAPHY ===== */
        .kv-text {
            margin: 0;
            line-height: 1.6;
            font-size: 16px;
            color: var(--text);
        }

        .kv-text.h1 {
            font-size: 40px;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.02em;
        }

        .kv-text.h2 {
            font-size: 30px;
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.015em;
        }

        .kv-text.h3 {
            font-size: 22px;
            font-weight: 600;
            line-height: 1.3;
        }

        .kv-text.h4 {
            font-size: 18px;
            font-weight: 600;
            line-height: 1.4;
        }

        .kv-text.heading {
            font-size: 40px;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.02em;
        }

        .kv-text.subheading {
            font-size: 18px;
            font-weight: 400;
            color: var(--text-muted);
            line-height: 1.5;
        }

        /* ===== LAYOUT ===== */
        .kv-column {
            display: flex;
            flex-direction: column;
            gap: 20px;
            width: 100%;
        }

        .kv-row {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 16px;
            width: 100%;
        }

        .kv-row > * {
            flex: 1;
            min-width: 240px;
        }

        /* ===== BUTTON ===== */
        .kv-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            background: rgba(255, 255, 255, 0.06);
            color: var(--text);
            font-family: var(--font);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .kv-button:hover {
            background: rgba(255, 255, 255, 0.12);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .kv-button:active {
            transform: translateY(0);
        }

        .kv-button.kv-primary {
            background: var(--primary);
            border-color: transparent;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
        }

        .kv-button.kv-primary:hover {
            background: var(--primary-hover);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        .kv-button.kv-danger {
            background: var(--danger);
            border-color: transparent;
        }

        .kv-button.kv-danger:hover {
            background: var(--danger-hover);
        }

        /* ===== IMAGE ===== */
        .kv-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            border-radius: var(--radius);
            object-fit: cover;
        }

        /* ===== VIDEO ===== */
        .kv-video {
            width: 100%;
            max-width: 100%;
            border-radius: var(--radius);
        }

        /* ===== TRANSITIONS ===== */
        [data-kv-path] {
            transition: all 0.25s ease;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
            body { padding: 16px; }

            .kv-app { padding: 24px; border-radius: 16px; }

            .kv-row { flex-direction: column; }
            .kv-row > * { min-width: 100%; }

            .kv-text.h1, .kv-text.heading { font-size: 28px; }
            .kv-text.h2 { font-size: 24px; }
            .kv-text.h3 { font-size: 20px; }
            .kv-text.h4 { font-size: 17px; }
            .kv-text.subheading { font-size: 16px; }
        }
    </style>
</head>
<body>
    <div id="root">
        ${initialHtml}
    </div>

    <script>
        (function() {
            try {
                // --- EMBEDDED SCRIPTS ---
                
                // 1. Runtime
                ${runtimeCode.split(/if\s*\(typeof\s*module/)[0]}
                
                // 2. Renderer
                ${rendererCode.split(/if\s*\(typeof\s*module/)[0]}

                // --- BOOTSTRAP ---
                const state = ${JSON.stringify(runtime.state)};
                const rawAst = ${JSON.stringify(parsed.tree)};
                const theme = ${JSON.stringify(parsed.theme || {})};
                const components = ${JSON.stringify(parsed.components || {})};

                // Initialize client-side runtime
                const kRuntime = new Runtime(rawAst, components);
                kRuntime.state = state;
                kRuntime.resolveTree(); // MANDATORY: Initialize the internal tree for path lookups

                // Always do full re-render (reliable across all state changes)
                function refresh(newTree) {
                    try {
                        const root = document.getElementById("root");
                        const resolvedTree = newTree || kRuntime.resolveTree();
                        
                        // Call renderNode directly to avoid getting the .kv-app wrapper again
                        const html = renderNode(resolvedTree, kRuntime, theme, "");
                        
                        if (root.firstElementChild) {
                            root.firstElementChild.innerHTML = html;
                        } else {
                            root.innerHTML = render(resolvedTree, { runtime: kRuntime, theme });
                        }
                    } catch (err) {
                        console.error("Refresh Error:", err);
                        // Fallback: full re-render
                        const html = render(kRuntime.resolveTree(), { runtime: kRuntime, theme });
                        document.getElementById("root").innerHTML = html;
                    }
                }

                // Link runtime to refresh
                kRuntime.onRender = refresh;

                // Global state updaters
                window.__klover_executeEvent = function(path, type) {
                    try {
                        kRuntime.executeEvent(path, type);
                    } catch (err) {
                        console.error("Klover Event Error:", err);
                    }
                };

                window.__klover_setState = function(target, expr) {
                    kRuntime.setState(target, expr);
                };

                console.log("Klover Live V9 Ready");
            } catch (bootstrapErr) {
                console.error("Klover Bootstrap Error:", bootstrapErr);
            }
        })();
    </script>
</body>
</html>`;

        fs.writeFileSync(outputFile, html);
        console.log(`Build complete: ${outputFile}`);
        return true;

    } catch (error) {
        console.error("Error:", error.message);
        console.error(error.stack);
        return false;
    }
}

if (require.main === module) {
    build("input.kv", "output.html");
}

module.exports = { build };
