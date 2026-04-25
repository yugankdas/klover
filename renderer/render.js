function renderNode(node) {
    if (!node) return "";

    // 🟡 TEXT
    if (node.type === "text") {
        return `<p class="kv-text">${node.value}</p>`;
    }

    // 🔵 BUTTON
    if (node.type === "button") {
        return `<button class="kv-button">${node.label}</button>`;
    }

    // 🟢 COLUMN
    if (node.type === "column") {
        return `
        <div class="column ${node.align}">
            ${node.children.map(renderNode).join("")}
        </div>
        `;
    }

    // 🔴 ROW
    if (node.type === "row") {
        return `
        <div class="row">
            ${node.children.map(renderNode).join("")}
        </div>
        `;
    }

    return "";
}

module.exports = { renderNode };
