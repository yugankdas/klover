// renderer/render.js - V6 Complete
// Bhumi: This is the ONLY file you need to edit

// Style mapping based on props
function applyProps(element, props, theme = {}) {
    if (!props) return;

    // Size mapping
    const sizeMap = {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px"
    };

    // Weight mapping
    const weightMap = {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700"
    };

    // Apply font size
    if (props.size) {
        element.style.fontSize = sizeMap[props.size] || props.size;
    }

    // Apply font weight
    if (props.weight) {
        element.style.fontWeight = weightMap[props.weight] || props.weight;
    }

    // Apply font family
    if (props.font) {
        element.style.fontFamily = props.font;
    } else if (theme.font) {
        element.style.fontFamily = theme.font;
    }

    // Apply colors
    if (props.primary) {
        element.style.backgroundColor = theme.primary || "#007bff";
        element.style.color = "white";
        element.style.border = "none";
        element.style.padding = "10px 20px";
        element.style.borderRadius = "6px";
        element.style.cursor = "pointer";
    }

    // Apply gap for flex containers
    if (props.gap !== undefined) {
        element.style.gap = typeof props.gap === "number" ? `${props.gap}px` : props.gap;
    }

    // Apply custom styles
    if (props.style) {
        Object.assign(element.style, props.style);
    }
}

function renderNode(node, runtime, theme = {}) {
    if (!node) return document.createTextNode("");

    // TEXT node
    if (node.type === "text") {
        const el = document.createElement("p");
        el.innerText = node.value || "";
        applyProps(el, node.props, theme);
        return el;
    }

    // BUTTON node
    if (node.type === "button") {
        const el = document.createElement("button");
        el.innerText = node.label || "Button";
        applyProps(el, node.props, theme);

        if (node.events?.click) {
            el.addEventListener("click", () => {
                if (node.events.click.operations) {
                    runtime.executeOperations(node.events.click.operations);
                } else {
                    runtime.setState(
                        node.events.click.target,
                        node.events.click.expression
                    );
                }
            });
        }
        return el;
    }

    // VIDEO node (NEW in V6)
    if (node.type === "video") {
        const el = document.createElement("video");
        el.src = node.src;
        el.style.maxWidth = "100%";
        el.style.borderRadius = "8px";

        // Apply video-specific props
        if (node.props) {
            if (node.props.controls) el.controls = true;
            if (node.props.autoplay) el.autoplay = true;
            if (node.props.loop) el.loop = true;
            if (node.props.muted) el.muted = true;
            if (node.props.width) el.width = node.props.width;
            if (node.props.height) el.height = node.props.height;
        }

        applyProps(el, node.props, theme);
        return el;
    }

    // IMAGE node
    if (node.type === "image") {
        const el = document.createElement("img");
        el.src = node.src;
        el.style.maxWidth = "100%";
        el.style.borderRadius = "8px";
        applyProps(el, node.props, theme);
        return el;
    }

    // COLUMN node
    if (node.type === "column") {
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";

        // Default styles
        el.style.padding = "20px";
        el.style.backgroundColor = theme.background || "#f5f5f5";
        el.style.borderRadius = "12px";

        applyProps(el, node.props, theme);

        if (node.children) {
            node.children.forEach(child => {
                const rendered = renderNode(child, runtime, theme);
                if (rendered) el.appendChild(rendered);
            });
        }
        return el;
    }

    // ROW node
    if (node.type === "row") {
        const el = document.createElement("div");
        el.style.display = "flex";
        el.style.flexDirection = "row";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.flexWrap = "wrap";
        applyProps(el, node.props, theme);

        if (node.children) {
            node.children.forEach(child => {
                const rendered = renderNode(child, runtime, theme);
                if (rendered) el.appendChild(rendered);
            });
        }
        return el;
    }

    // FRAGMENT node
    if (node.type === "fragment") {
        const fragment = document.createDocumentFragment();
        if (node.children) {
            node.children.forEach(child => {
                const rendered = renderNode(child, runtime, theme);
                if (rendered) fragment.appendChild(rendered);
            });
        }
        return fragment;
    }

    return document.createTextNode("");
}

function renderApp(tree, runtime, theme = {}) {
    const root = document.getElementById("app");
    if (!root) {
        console.error("❌ No element with id='app' found!");
        return;
    }

    root.innerHTML = "";
    const rendered = renderNode(tree, runtime, theme);
    if (rendered) root.appendChild(rendered);
}

function render(tree, options = {}) {
    const { runtime, theme = {} } = options;
    if (!runtime) {
        console.error("❌ No runtime provided!");
        return;
    }
    renderApp(tree, runtime, theme);
}

if (typeof module !== "undefined") {
    module.exports = { render, renderApp, renderNode };
}