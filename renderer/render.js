function renderNode(node, components) {
    if (!node) return "";

    // 🧩 COMPONENT
    if (node.type === "component") {
        const comp = components[node.name];
        if (!comp || !comp.root) return "";
        return renderNode(comp.root, components);
    }

    // TEXT
    if (node.type === "text") {
        return `<p class="kv-text ${node.style || ""}">${node.value}</p>`;
    }

    // BUTTON
    if (node.type === "button") {
        return `<button class="kv-button ${node.style || ""}">${node.label}</button>`;
    }

    // IMAGE
    if (node.type === "image") {
        return `<img src="${node.src}" class="kv-image ${node.style || ""}" />`;
    }

    // COLUMN
    if (node.type === "column") {
        return `
        <div class="column ${node.align || ""}">
            ${(node.children || []).map(child => renderNode(child, components)).join("")}
        </div>
        `;
    }

    // ROW
    if (node.type === "row") {
        return `
        <div class="row">
            ${(node.children || []).map(child => renderNode(child, components)).join("")}
        </div>
        `;
    }

    return "";
}

function render(tree, options = {}) {
    const content = renderNode(tree, options.components || {});
    const themeClass = options.theme || "";

    return `
    <div class="app ${themeClass}">
        ${content}
    </div>
    `;
}

module.exports = { render };