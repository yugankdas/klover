const {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createComponent
} = require("../shared/schema");

function cleanLines(input) {
    return input
        .split("\n")
        .map(line => line.replace(/\t/g, "    "))
        .map(line => line.replace(/\r$/, ""))
        .filter(line => line.trim().length > 0);
}

function getIndent(line) {
    return line.match(/^ */)[0].length;
}

function extractStyle(parts) {
    return parts.length > 2 ? parts[2] : null;
}

function extractEvent(line) {
    const match = line.match(/onClick=(.*)/);
    return match ? match[1] : null;
}

function extractProps(line) {
    const match = line.match(/\((.*?)\)/);
    if (!match) return [];
    return match[1]
        .split(",")
        .map(p => p.trim().replace(/"/g, ""));
}

function parse(input) {
    const lines = cleanLines(input);

    const stack = [];
    let root = null;
    let theme = null;

    const components = {};
    let currentComponent = null;

    for (let line of lines) {
        let node = null;

        const trimmed = line.trim();
        const parts = trimmed.split(" ");

        // -------------------------
        // COMPONENT DEFINITION
        // -------------------------
        if (trimmed.startsWith("component")) {
            const def = trimmed.replace("component", "").replace(":", "").trim();

            const name = def.split("(")[0];
            const props = extractProps(def);

            currentComponent = {
                name,
                props,
                root: null,
                stack: []
            };

            continue;
        }

        // -------------------------
        // THEME
        // -------------------------
        if (trimmed.startsWith("theme")) {
            if (parts[1]) theme = parts[1];
            continue;
        }

        // -------------------------
        // TEXT (supports variables)
        // -------------------------
        if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);
            const style = extractStyle(parts);

            if (match) {
                node = createText(match[1]);
                node.isVariable = false;
            } else {
                const value = parts[1];
                node = createText(value);
                node.isVariable = true;
            }

            node.style = style;
        }

        // -------------------------
        // BUTTON
        // -------------------------
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                const style = extractStyle(parts);
                const event = extractEvent(trimmed);

                node = createButton(match[1]);
                node.style = style;

                if (event) node.onClick = event;
            }
        }

        // -------------------------
        // IMAGE
        // -------------------------
        else if (trimmed.startsWith("image")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                const style = extractStyle(parts);
                node = createImage(match[1], style);
            }
        }

        // -------------------------
        // COLUMN
        // -------------------------
        else if (trimmed.startsWith("column")) {
            const parts = trimmed.replace(":", "").split(" ");
            const align = parts[1] || "start";
            node = createColumn([], align);
        }

        // -------------------------
        // ROW
        // -------------------------
        else if (trimmed.startsWith("row")) {
            node = createRow([]);
        }

        // -------------------------
        // COMPONENT USAGE WITH PROPS
        // -------------------------
        else if (trimmed.includes("(")) {
            const name = trimmed.split("(")[0];
            const props = extractProps(trimmed);

            if (components[name]) {
                node = createComponent(name, props);
            }
        }

        // -------------------------
        // SIMPLE COMPONENT USAGE
        // -------------------------
        else if (components[trimmed]) {
            node = createComponent(trimmed);
        }

        if (!node) continue;

        const indent = getIndent(line);

        // -------------------------
        // INSIDE COMPONENT
        // -------------------------
        if (currentComponent) {
            if (!currentComponent.root) {
                currentComponent.root = node;
                currentComponent.stack.push({ node, indent });
                continue;
            }

            while (
                currentComponent.stack.length &&
                indent <= currentComponent.stack[currentComponent.stack.length - 1].indent
            ) {
                currentComponent.stack.pop();
            }

            const parent = currentComponent.stack[currentComponent.stack.length - 1];

            if (parent && parent.node.children) {
                parent.node.children.push(node);
            }

            currentComponent.stack.push({ node, indent });

            if (indent === 0) {
                components[currentComponent.name] = currentComponent;
                currentComponent = null;
            }

            continue;
        }

        // -------------------------
        // MAIN TREE
        // -------------------------
        if (!root) {
            root = node;
            stack.push({ node, indent });
            continue;
        }

        while (
            stack.length &&
            indent <= stack[stack.length - 1].indent
        ) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];

        if (parent && parent.node.children) {
            parent.node.children.push(node);
        }

        stack.push({ node, indent });
    }

    if (currentComponent) {
        components[currentComponent.name] = currentComponent;
    }

    return {
        tree: root,
        theme,
        components
    };
}

module.exports = { parse };