// renderer/render.js - V7 String Renderer (FIXED)
function escapeHtml(str) {
    // FIX: Handle undefined/null
    if (str === undefined || str === null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function applyProps(node, theme = {}) {
    let classes = [];
    let styleRules = [];

    if (!node || !node.props) return { class: "", style: "" };

    const props = node.props;

    // Size mapping
    const sizeMap = {
        xs: "text-xs", sm: "text-sm", md: "text-base",
        lg: "text-lg", xl: "text-xl", "2xl": "text-2xl",
        "3xl": "text-3xl", "4xl": "text-4xl"
    };

    const weightMap = {
        normal: "font-normal", medium: "font-medium",
        semibold: "font-semibold", bold: "font-bold", extrabold: "font-extrabold"
    };

    if (props.size && sizeMap[props.size]) classes.push(sizeMap[props.size]);
    if (props.weight && weightMap[props.weight]) classes.push(weightMap[props.weight]);

    if (props.primary) {
        classes.push("bg-primary", "text-white");
        classes.push("px-4", "py-2", "rounded-lg", "cursor-pointer");
    }

    if (props.gap !== undefined) {
        styleRules.push(`gap: ${typeof props.gap === 'number' ? props.gap + 'px' : props.gap}`);
    }

    return {
        class: classes.length ? ` class="${classes.join(' ')}"` : "",
        styleRules: styleRules
    };
}

function renderNode(node, runtime, theme = {}) {
    if (!node) return "";

    // TEXT
    if (node.type === "text") {
        const attrs = applyProps(node, theme);
        let value = node.value;
        if (value === undefined || value === null) value = "";
        const styleAttr = attrs.styleRules.length ? ` style="${attrs.styleRules.join('; ')}"` : "";
        return `<p${attrs.class}${styleAttr}>${escapeHtml(value)}</p>`;
    }

    // BUTTON
    if (node.type === "button") {
        const attrs = applyProps(node, theme);
        const label = node.label || "Button";
        let onclick = "";

        // Default classes for a polished look if not primary
        const classes = attrs.class || ' class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all duration-200"';
        
        if (node.events?.click) {

            const click = node.events.click;
            
            if (click.operations) {
                // Multi-operation (V6+)
                const opsJson = JSON.stringify(click.operations).replace(/"/g, "&quot;");
                onclick = ` onclick="window.updateOperations(${opsJson})"`;
            } else if (click.target && click.expression) {
                // Simple operation
                onclick = ` onclick="window.updateState('${escapeHtml(click.target)}', '${escapeHtml(click.expression).replace(/'/g, "\\'")}')"`;
            }
        }
        const styleAttr = attrs.styleRules.length ? ` style="${attrs.styleRules.join('; ')}"` : "";
        return `<button${classes}${styleAttr}${onclick}>${escapeHtml(label)}</button>`;
    }



    // VIDEO
    if (node.type === "video") {
        const attrs = applyProps(node, theme);
        const src = node.src || "";
        let videoAttrs = ` src="${escapeHtml(src)}"`;
        if (node.props?.controls) videoAttrs += " controls";
        if (node.props?.autoplay) videoAttrs += " autoplay";
        if (node.props?.loop) videoAttrs += " loop";
        if (node.props?.muted) videoAttrs += " muted";
        const styleAttr = attrs.styleRules.length ? ` style="${attrs.styleRules.join('; ')}"` : "";
        return `<video${videoAttrs}${attrs.class}${styleAttr}></video>`;
    }

    // IMAGE
    if (node.type === "image") {
        const attrs = applyProps(node, theme);
        const src = node.src || "";
        const styleAttr = attrs.styleRules.length ? ` style="${attrs.styleRules.join('; ')}"` : "";
        return `<img src="${escapeHtml(src)}"${attrs.class}${styleAttr} />`;
    }

    // COLUMN
    if (node.type === "column") {
        const attrs = applyProps(node, theme);
        let children = "";
        if (node.children && Array.isArray(node.children)) {
            children = node.children.map(c => renderNode(c, runtime, theme)).join("");
        }
        const styles = ["display:flex", "flex-direction:column", "align-items:center", ...attrs.styleRules];
        return `<div${attrs.class} style="${styles.join('; ')}">${children}</div>`;
    }

    // ROW
    if (node.type === "row") {
        const attrs = applyProps(node, theme);
        let children = "";
        if (node.children && Array.isArray(node.children)) {
            children = node.children.map(c => renderNode(c, runtime, theme)).join("");
        }
        const styles = ["display:flex", "flex-direction:row", "align-items:center", "flex-wrap:wrap", ...attrs.styleRules];
        return `<div${attrs.class} style="${styles.join('; ')}">${children}</div>`;
    }

    // FRAGMENT
    if (node.type === "fragment") {
        if (node.children && Array.isArray(node.children)) {
            return node.children.map(c => renderNode(c, runtime, theme)).join("");
        }
        return "";
    }

    return "";
}

function render(tree, options = {}) {
    const { runtime, theme = {} } = options;
    if (!runtime) return "<div>Error: No runtime</div>";

    const resolved = runtime.resolveTree ? runtime.resolveTree() : tree;
    const html = renderNode(resolved, runtime, theme);
    return `<div class="klover-app">${html || ""}</div>`;
}

if (typeof module !== "undefined") {
    module.exports = { render, renderNode, applyProps, escapeHtml };
}