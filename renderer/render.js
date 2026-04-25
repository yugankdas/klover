function renderNode(node) {
    if (!node) return "";

    // 🟡 TEXT
    if (node.type === "text") {
        return `<p class="kv-text ${node.style || ""}">${node.value}</p>`;
    }

    // 🔵 BUTTON
    if (node.type === "button") {
        return `<button class="kv-button ${node.style || ""}">${node.label}</button>`;
    }

    // 🟢 COLUMN
    if (node.type === "column") {
        return `
        <div class="column ${node.align || ""}">
            ${(node.children || []).map(renderNode).join("")}
        </div>
        `;
    }

    // 🔴 ROW
    if (node.type === "row") {
        return `
        <div class="row">
            ${(node.children || []).map(renderNode).join("")}
        </div>
        `;
    }

    // ⚠️ FUTURE-PROOF (unknown types like image/component)
    if (node.type === "image") {
        return `<img src="${node.src}" class="kv-image ${node.style || ""}" />`;
    }

    if (node.type === "component") {
        return `<!-- component ${node.name} not supported yet -->`;
    }

    return "";
}

// Wrapper (for future theme support)
function render(tree, options = {}) {
    const content = renderNode(tree);

    const themeClass = options.theme ? options.theme : "";

    return `
    <div class="app ${themeClass}">
        ${content}
    </div>
    `;
}

module.exports = { render };