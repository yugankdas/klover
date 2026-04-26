const {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createComponentNode,
    createState,
    createRepeat,
    createIf
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

        // THEME
        if (trimmed.startsWith("theme")) {
            theme = parts[1] || null;
            continue;
        }

        // 🔥 STATE (V5 READY)
        if (trimmed.startsWith("state")) {
            const key = parts[1];
            let rawValue = parts.slice(3).join(" ");

            let value;
            try {
                value = JSON.parse(rawValue);
            } catch {
                value = isNaN(rawValue) ? rawValue : Number(rawValue);
            }

            node = createState(key, value);
        }

        // COMPONENT DEF
        else if (trimmed.startsWith("component")) {
            const name = parts[1].replace(":", "");
            currentComponent = name;
            components[name] = { root: null };
            stack.length = 0;
            continue;
        }

        if (indent === 0 && currentComponent && !trimmed.startsWith("component")) {
            currentComponent = null;
            stack.length = 0;
        }

        // 🔁 REPEAT (V5)
        if (trimmed.startsWith("repeat")) {
            const source = parts[1].replace(":", "");
            node = createRepeat(source, "item", []);
        }

        // 🔀 IF (V5)
        else if (trimmed.startsWith("if")) {
            const condition = trimmed.replace("if", "").replace(":", "").trim();
            node = createIf(condition, []);
        }

        // TEXT
        else if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                node = createText(match[1], false, extractStyle(parts));
            } else {
                node = createText(parts[1], true, null);
            }
        }

        // BUTTON
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                let events = null;

                if (trimmed.includes("onClick=set(")) {
                    const exprMatch = trimmed.match(/onClick=set\((.*?)\)/);

                    if (exprMatch) {
                        const expr = exprMatch[1];
                        const target = expr.split(/[\s+\-*/]/)[0].trim();

                        events = {
                            click: {
                                target,
                                expression: expr
                            }
                        };
                    }
                }

                node = createButton(match[1], extractStyle(parts), events);
            }
        }

        // IMAGE
        else if (trimmed.startsWith("image")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                node = createImage(match[1], extractStyle(parts));
            }
        }

        // COLUMN
        else if (trimmed.startsWith("column")) {
            const align = parts[1]?.replace(":", "") || "start";
            node = createColumn([], align);
        }

        // ROW
        else if (trimmed.startsWith("row")) {
            node = createRow([]);
        }

        // COMPONENT USAGE
        else if (components[parts[0]]) {
            node = createComponentNode(parts[0]);
        }

        if (!node) continue;

        // HIERARCHY
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
                parent.node?.children?.push?.(node);

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