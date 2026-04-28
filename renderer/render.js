// renderer/render.js - V8 Diff-Ready Renderer (FIXED)

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

// Helper: Convert props to CSS classes and styles
function applyProps(node, theme = {}) {
    // FIX: Check if node exists and has props
    if (!node) return { class: "", style: "" };
    if (!node.props) return { class: "", style: "" };

    const props = node.props;
    let classes = [];
    let styles = [];

    // Size mapping
    const sizeMap = {
        xs: "text-xs", sm: "text-sm", md: "text-base",
        lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
        "3xl": "text-3xl", "4xl": "text-4xl"
    };

    // Weight mapping
    const weightMap = {
        normal: "font-normal", medium: "font-medium",
        semibold: "font-semibold", bold: "font-bold",
        extrabold: "font-extrabold"
    };

    // Apply size
    if (props.size && sizeMap[props.size]) {
        classes.push(sizeMap[props.size]);
    }

    // Apply weight
    if (props.weight && weightMap[props.weight]) {
        classes.push(weightMap[props.weight]);
    }

    // Apply primary button styling
    if (props.primary === true || props.primary === "true") {
        classes.push("btn-primary");
        classes.push("px-4", "py-2", "rounded-lg", "cursor-pointer");
    }

    // Apply danger button styling
    if (props.danger === true || props.danger === "true") {
        classes.push("btn-danger");
    }

    // Apply gap for flex containers
    if (props.gap !== undefined) {
        styles.push(`gap: ${typeof props.gap === 'number' ? props.gap + 'px' : props.gap}`);
    }

    // Apply theme colors
    if (theme && theme.primary && !props.primary) {
        classes.push(`text-[${theme.primary}]`);
    }

    return {
        class: classes.length ? ` class="${classes.join(' ')}"` : "",
        style: styles.length ? ` style="${styles.join('; ')}"` : ""
    };
}

// Main render function - converts node to HTML string
// Main render function - converts node to HTML string
function renderNode(node, runtime, theme = {}, path = "") {
    if (!node) return "";

    const pathAttr = path ? ` data-kv-path="${path}"` : "";

    // --------------------------------------------
    // TEXT NODE
    // --------------------------------------------
    if (node.type === "text") {
        const attrs = applyProps(node, theme);
        const value = escapeHtml(node.value !== undefined ? node.value : "");
        return `<p${pathAttr}${attrs.class}${attrs.style}>${value}</p>`;
    }

    // --------------------------------------------
    // BUTTON NODE
    // --------------------------------------------
    if (node.type === "button") {
        const attrs = applyProps(node, theme);
        const label = escapeHtml(node.label || "Button");

        let onclick = "";
        if (node.events?.click?.operations) {
            const ops = JSON.stringify(node.events.click.operations).replace(/"/g, '&quot;');
            const scope = JSON.stringify(node._scope || {}).replace(/"/g, '&quot;');
            onclick = ` onclick="window.__klover_executeOperations('${ops}', '${scope}')"`;
        }

        return `<button${pathAttr}${attrs.class}${attrs.style}${onclick}>${label}</button>`;
    }

    // --------------------------------------------
    // VIDEO NODE
    // --------------------------------------------
    if (node.type === "video") {
        const attrs = applyProps(node, theme);
        const src = escapeHtml(node.src || "");

        let videoAttrs = ` src="${src}"`;
        if (node.props?.controls) videoAttrs += " controls";
        if (node.props?.autoplay) videoAttrs += " autoplay";
        if (node.props?.loop) videoAttrs += " loop";
        if (node.props?.muted) videoAttrs += " muted";

        return `<video${pathAttr}${videoAttrs}${attrs.class}${attrs.style}></video>`;
    }

    // --------------------------------------------
    // IMAGE NODE
    // --------------------------------------------
    if (node.type === "image") {
        const attrs = applyProps(node, theme);
        const src = escapeHtml(node.src || "");
        return `<img${pathAttr} src="${src}"${attrs.class}${attrs.style} />`;
    }

    // --------------------------------------------
    // FLEX CONTAINERS
    // --------------------------------------------
    if (node.type === "column" || node.type === "row") {
        const attrs = applyProps(node, theme);
        const isColumn = node.type === "column";

        let childrenHtml = "";
        if (node.children && Array.isArray(node.children)) {
            childrenHtml = node.children.map((child, i) => {
                const childPath = path ? `${path}.children[${i}]` : `children[${i}]`;
                return renderNode(child, runtime, theme, childPath);
            }).join("");
        }

        const baseStyle = isColumn 
            ? "display:flex;flex-direction:column;align-items:center;" 
            : "display:flex;flex-direction:row;align-items:center;flex-wrap:wrap;";
        
        const existingStyle = attrs.style ? attrs.style.replace('style="', '').replace('"', '') : '';

        return `<div${pathAttr}${attrs.class} style="${baseStyle}${existingStyle}">${childrenHtml}</div>`;
    }

    // --------------------------------------------
    // FRAGMENT NODE (No wrapper, just children)
    // --------------------------------------------
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

// V8 Diff-Ready Render Function
function render(node, options = {}) {
    const { runtime, theme = {} } = options;

    if (!runtime) {
        console.error("❌ No runtime provided to renderer");
        return "<div>Error: No runtime provided</div>";
    }

    // If node is the raw AST, we must resolve it.
    // If it's already resolved (has results of evaluate/repeat), we just render it.
    let resolvedTree = node;
    
    // We detect if it's resolved by checking for common resolved properties
    // or we just trust the caller. In Klover V9, build engine resolves first.
    // But for safety, if it's the raw AST root (type generic/column with isVariable somewhere),
    // we might need to resolve.
    // Optimization: resolveTree() is safe to call multiple times in Runtime V8.
    if (runtime.currentTree === null || node === runtime.ast) {
        resolvedTree = runtime.resolveTree();
    }

    const html = renderNode(resolvedTree, runtime, theme, "");
    return `<div class="klover-app">${html || ""}</div>`;
}

// Export functions
if (typeof module !== "undefined") {
    module.exports = { render, renderNode, applyProps, escapeHtml };
}