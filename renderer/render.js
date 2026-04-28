// renderer/render.js - V9 Class-Based Renderer

// Helper: Escape HTML to prevent XSS attacks
function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Helper: Build class list from node props
function buildClasses(node) {
    if (!node || !node.props) return [];
    const classes = [];
    const props = node.props;

    if (props.primary === true || props.primary === "true") classes.push("kv-primary");
    if (props.danger === true || props.danger === "true") classes.push("kv-danger");
    
    // Support custom classes from props
    if (props.class) classes.push(props.class);
    if (props.className) classes.push(props.className);

    return classes;
}

// Helper: Build gap style (only inline style we allow — gap is layout-specific)
function buildGapStyle(node) {
    if (!node || !node.props || node.props.gap === undefined) return "";
    const gap = typeof node.props.gap === "number" ? node.props.gap + "px" : node.props.gap;
    return ` style="gap:${gap}"`;
}

// Main render function - converts node to HTML string
function renderNode(node, runtime, theme, path) {
    if (!node) return "";

    const pathAttr = path ? ` data-kv-path="${path}"` : "";

    // TEXT NODE
    if (node.type === "text") {
        const value = escapeHtml(node.value !== undefined ? node.value : "");
        const variant = node.variant || "body";
        const extraClasses = buildClasses(node);
        const allClasses = ["kv-text", ...extraClasses].join(" ").trim();
        
        if (variant === "h1") return `<h1${pathAttr} class="${allClasses} h1">${value}</h1>`;
        if (variant === "h2") return `<h2${pathAttr} class="${allClasses} h2">${value}</h2>`;
        if (variant === "h3") return `<h3${pathAttr} class="${allClasses} h3">${value}</h3>`;
        if (variant === "h4") return `<h4${pathAttr} class="${allClasses} h4">${value}</h4>`;
        if (variant === "heading") return `<h1${pathAttr} class="${allClasses} heading">${value}</h1>`;
        if (variant === "subheading") return `<p${pathAttr} class="${allClasses} subheading">${value}</p>`;
        
        return `<p${pathAttr} class="${allClasses}">${value}</p>`;
    }

    // BUTTON NODE
    if (node.type === "button") {
        const label = escapeHtml(node.label || "Button");
        const extraClasses = buildClasses(node);
        const allClasses = ["kv-button", ...extraClasses].join(" ").trim();

        let onclick = "";
        if (node.events?.click) {
            onclick = ` onclick="window.__klover_executeEvent('${path}', 'click')"`;
        }

        return `<button${pathAttr} class="${allClasses}"${onclick}>${label}</button>`;
    }

    // VIDEO NODE
    if (node.type === "video") {
        const src = escapeHtml(node.src || "");
        let videoAttrs = ` src="${src}"`;
        if (node.props?.controls) videoAttrs += " controls";
        if (node.props?.autoplay) videoAttrs += " autoplay";
        if (node.props?.loop) videoAttrs += " loop";
        if (node.props?.muted) videoAttrs += " muted";
        return `<video${pathAttr} class="kv-video"${videoAttrs}></video>`;
    }

    // IMAGE NODE
    if (node.type === "image") {
        const src = escapeHtml(node.src || "");
        const alt = escapeHtml(node.props?.alt || "");
        const extraClasses = buildClasses(node);
        const allClasses = ["kv-image", ...extraClasses].join(" ").trim();
        return `<img${pathAttr} class="${allClasses}" src="${src}" alt="${alt}" />`;
    }

    // COLUMN & ROW
    if (node.type === "column" || node.type === "row") {
        const isColumn = node.type === "column";
        const baseClass = isColumn ? "kv-column" : "kv-row";
        const gapStyle = buildGapStyle(node);

        let childrenHtml = "";
        if (node.children && Array.isArray(node.children)) {
            childrenHtml = node.children.map((child, i) => {
                const childPath = path ? `${path}.children[${i}]` : `children[${i}]`;
                return renderNode(child, runtime, theme, childPath);
            }).join("");
        }

        return `<div${pathAttr} class="${baseClass}"${gapStyle}>${childrenHtml}</div>`;
    }

    // FRAGMENT NODE
    if (node.type === "fragment") {
        if (node.children && Array.isArray(node.children)) {
            return node.children.map((child, i) => {
                const childPath = path ? `${path}.children[${i}]` : `children[${i}]`;
                return renderNode(child, runtime, theme, childPath);
            }).join("");
        }
        return "";
    }

    return "";
}

// Entry point
function render(node, options = {}) {
    const { runtime, theme = {} } = options;

    if (!runtime) {
        console.error("No runtime provided to renderer");
        return "<div>Error: No runtime provided</div>";
    }

    let resolvedTree = node;
    if (runtime.currentTree === null || node === runtime.ast) {
        resolvedTree = runtime.resolveTree();
    }

    const html = renderNode(resolvedTree, runtime, theme, "");
    return `<div class="kv-app">${html || ""}</div>`;
}

// Export functions
if (typeof module !== "undefined") {
    module.exports = { render, renderNode, escapeHtml };
}