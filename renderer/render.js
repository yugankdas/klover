// renderer/render.js
// V5: PURE RENDERER - NO LOGIC, NO VARIABLE RESOLUTION

function renderNode(node, runtime) {
    if (!node) return document.createTextNode("");

    // TEXT
    if (node.type === "text") {
        const el = document.createElement("p");
        el.innerText = node.value;
        return el;
    }

    // BUTTON
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

    // IMAGE
    if (node.type === "image") {
        const el = document.createElement("img");
        el.src = node.src;
        return el;
    }

    // COLUMN
    if (node.type === "column") {
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.gap = "12px";
        el.style.marginTop = "50px";

        node.children?.forEach(child => {
            el.appendChild(renderNode(child, runtime));
        });

        return el;
    }

    // ROW
    if (node.type === "row") {
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.gap = "10px";

        node.children?.forEach(child => {
            el.appendChild(renderNode(child, runtime));
        });

        return el;
    }

    // FRAGMENT (for repeat/if expansion)
    if (node.type === "fragment") {
        const fragment = document.createDocumentFragment();
        node.children?.forEach(child => {
            fragment.appendChild(renderNode(child, runtime));
        });
        return fragment;
    }

    return document.createTextNode("");
}

function renderApp(tree, runtime) {
    const root = document.getElementById("app");
    if (!root) return;

    root.innerHTML = "";
    root.appendChild(renderNode(tree, runtime));
}

if (typeof module !== "undefined") {
    module.exports = { renderApp };
}