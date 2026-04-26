// renderer/render.js

function renderNode(node, runtime) {
    if (!node) return document.createTextNode("");

    // -----------------------
    // TEXT
    // -----------------------
    if (node.type === "text") {
        const el = document.createElement("p");

        if (node.isVariable && runtime.state[node.value] !== undefined) {
            el.innerText = runtime.state[node.value];
        } else {
            el.innerText = node.value;
        }

        return el;
    }

    // -----------------------
    // BUTTON
    // -----------------------
    if (node.type === "button") {
        const el = document.createElement("button");
        el.innerText = node.label;

        // 🔥 EVENT BINDING
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

    // -----------------------
    // IMAGE
    // -----------------------
    if (node.type === "image") {
        const el = document.createElement("img");
        el.src = node.src;
        el.style.maxWidth = "300px";
        return el;
    }

    // -----------------------
    // COLUMN
    // -----------------------
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

    // -----------------------
    // ROW
    // -----------------------
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

// -----------------------
// MAIN RENDER FUNCTION
// -----------------------
function renderApp(tree, runtime) {
    const root = document.getElementById("app");

    // 🔥 CLEAR OLD UI
    root.innerHTML = "";

    // 🔥 RENDER NEW UI
    root.appendChild(renderNode(tree, runtime));
}

module.exports = { renderApp };