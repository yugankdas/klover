const fs = require("fs");
const { parse } = require("./parser/parse");
const Runtime = require("./runtime/runtime");

const input = fs.readFileSync("input.kv", "utf-8");

// 🔥 PARSE
const parsed = parse(input);

// 🔥 INIT RUNTIME
const runtime = new Runtime(parsed.tree);
runtime.init();

// ---------------------------
// SERIALIZE DATA INTO HTML
// ---------------------------
const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Klover App</title>
</head>
<body>
    <div id="app"></div>

    <script>
        const tree = ${JSON.stringify(parsed.tree)};
        const state = ${JSON.stringify(runtime.state)};
    </script>

    <script>
        class Runtime {
            constructor(tree, state) {
                this.tree = tree;
                this.state = state;
            }

            evaluate(expr) {
                const keys = Object.keys(this.state);
                const values = Object.values(this.state);
                return new Function(...keys, "return " + expr)(...values);
            }

            setState(key, expr) {
                this.state[key] = this.evaluate(expr);
                renderApp(this.tree, this);
            }
        }

        const runtime = new Runtime(tree, state);

        function renderNode(node, runtime) {
            if (!node) return document.createTextNode("");

            if (node.type === "text") {
                const el = document.createElement("p");

                if (node.isVariable && runtime.state[node.value] !== undefined) {
                    el.innerText = runtime.state[node.value];
                } else {
                    el.innerText = node.value;
                }

                return el;
            }

            if (node.type === "button") {
                const el = document.createElement("button");
                el.innerText = node.label;

                if (node.events?.click) {
                    el.addEventListener("click", () => {
                        runtime.setState(
                            node.events.click.target,
                            node.events.click.expression
                        );
                    });
                }

                return el;
            }

            if (node.type === "column") {
                const el = document.createElement("div");
                el.style.display = "flex";
                el.style.flexDirection = "column";
                el.style.alignItems = "center";
                el.style.gap = "12px";
                el.style.marginTop = "100px";

                node.children?.forEach(child => {
                    el.appendChild(renderNode(child, runtime));
                });

                return el;
            }

            if (node.type === "row") {
                const el = document.createElement("div");
                el.style.display = "flex";
                el.style.gap = "10px";

                node.children?.forEach(child => {
                    el.appendChild(renderNode(child, runtime));
                });

                return el;
            }

            return document.createTextNode("");
        }

        function renderApp(tree, runtime) {
            const root = document.getElementById("app");
            root.innerHTML = "";
            root.appendChild(renderNode(tree, runtime));
        }

        renderApp(tree, runtime);
    </script>
</body>
</html>
`;

// 🔥 WRITE OUTPUT
fs.writeFileSync("output.html", html);