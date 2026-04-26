const {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createComponentNode,
    createState
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
    return parts.length > 2 && !parts[2].includes("onClick=") ? parts[2] : null;
}

function parse(input) {
    const lines = cleanLines(input);
    const stack = [];
    const roots = [];
    const components = {};
    let theme = null;
    let currentComponent = null;

    for (let line of lines) {
        const trimmed = line.trim();
        const indent = getIndent(line);
        const parts = trimmed.split(" ");
        let node = null;

        // 1. Theme
        if (trimmed.startsWith("theme")) {
            theme = parts[1] || null;
            continue;
        }

        // 2. State
        if (trimmed.startsWith("state")) {
            const key = parts[1];
            const value = parts[3];
            node = createState(key, isNaN(value) ? value : Number(value));
        }

        // 3. Component Definition
        else if (trimmed.startsWith("component")) {
            const name = parts[1].replace(":", "");
            currentComponent = name;
            components[name] = { root: null };
            stack.length = 0;
            continue;
        }

        // Reset component context
        if (indent === 0 && currentComponent && !trimmed.startsWith("component")) {
            currentComponent = null;
            stack.length = 0;
        }

        // 4. Tags
        if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                node = createText(match[1]);
                node.style = extractStyle(parts);
            } else {
                // Variable reference
                node = createText(parts[1]);
                node.isVariable = true;
            }
        }
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                node = createButton(match[1]);
                node.style = extractStyle(parts);

                // Event System (Strict Format)
                if (trimmed.includes("onClick=set(")) {
                    const exprMatch = trimmed.match(/onClick=set\((.*?)\)/);
                    if (exprMatch) {
                        const expr = exprMatch[1];
                        const target = expr.split(/[\s+\-*/]/)[0].trim();
                        node.events = {
                            click: {
                                target,
                                expression: expr
                            }
                        };
                    }
                }
            }
        }
        else if (trimmed.startsWith("image")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                node = createImage(match[1], extractStyle(parts));
            }
        }
        else if (trimmed.startsWith("column")) {
            const align = parts[1]?.replace(":", "") || "start";
            node = createColumn([], align);
        }
        else if (trimmed.startsWith("row")) {
            node = createRow([]);
        }
        else if (components[parts[0]]) {
            node = createComponentNode(parts[0]);
        }

        if (!node) continue;

        // 5. Hierarchy
        while (stack.length && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        if (stack.length === 0) {
            if (currentComponent) {
                if (!components[currentComponent].root) {
                    components[currentComponent].root = node;
                }
            } else {
                roots.push(node);
            }
        } else {
            const parent = stack[stack.length - 1].node;
            if (parent.children) {
                parent.children.push(node);
            }
        }

        stack.push({ node, indent });
    }

    const tree = roots.length > 1 ? createColumn(roots) : roots[0];

    return {
        tree,
        theme,
        components
    };
}

module.exports = { parse };