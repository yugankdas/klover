function renderNode(node, components = {}, props = {}) {
    if (!node) return "";

    // -------------------------
    // TEXT
    // -------------------------
    if (node.type === "text") {
        let value = node.value;

        // variable resolution
        if (node.isVariable) {
            value = props[value] || "";
        }

        return `<p class="${node.style || ""}">${value}</p>`;
    }

    // -------------------------
    // BUTTON
    // -------------------------
    if (node.type === "button") {
        const onClick = node.onClick
            ? `onclick="console.log(${node.onClick})"`
            : "";

        return `<button class="${node.style || ""}" ${onClick}>
            ${node.label}
        </button>`;
    }

    // -------------------------
    // IMAGE
    // -------------------------
    if (node.type === "image") {
        return `<img src="${node.src}" class="${node.style || ""}" />`;
    }

    // -------------------------
    // COLUMN
    // -------------------------
    if (node.type === "column") {
        return `
        <div class="column ${node.align}">
            ${node.children.map(child =>
            renderNode(child, components, props)
        ).join("")}
        </div>`;
    }

    // -------------------------
    // ROW
    // -------------------------
    if (node.type === "row") {
        return `
        <div class="row">
            ${node.children.map(child =>
            renderNode(child, components, props)
        ).join("")}
        </div>`;
    }

    // -------------------------
    // COMPONENT
    // -------------------------
    if (node.type === "component") {
        const comp = components[node.name];

        if (!comp) return "";

        // map props
        const propMap = {};
        comp.props.forEach((p, i) => {
            propMap[p] = node.props[i];
        });

        return renderNode(comp.root, components, propMap);
    }

    return "";
}

module.exports = { renderNode };