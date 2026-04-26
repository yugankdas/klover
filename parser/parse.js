const {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createComponentNode,
    createState,
    createRepeat,
    createIf,
    createVideo
} = require("../shared/schema");

// -----------------------------
// CLEAN INPUT
// -----------------------------
function cleanLines(input) {
    return input
        .split("\n")
        .map(line => line.replace(/\t/g, "    "))
        .map(line => line.replace(/\r$/, ""))
        .filter(line => line.trim().length > 0);
}

// -----------------------------
// INDENT
// -----------------------------
function getIndent(line) {
    return line.match(/^ */)[0].length;
}

// -----------------------------
// 🔥 NEW: PROP PARSER
// -----------------------------
function extractProps(parts) {
    const props = {};

    parts.forEach(p => {
        if (p.includes("=")) {
            let [key, value] = p.split("=");

            // number conversion
            if (!isNaN(value)) {
                value = Number(value);
            }

            // strip quotes
            if (value?.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            props[key] = value;
        } else if (!p.includes('"') && p !== "") {
            // flag props (autoplay, controls)
            props[p] = true;
        }
    });

    return props;
}

// -----------------------------
// MAIN PARSER
// -----------------------------
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

        // -------------------------
        // THEME (simple for now)
        // -------------------------
        if (trimmed.startsWith("theme")) {
            theme = parts[1] || null;
            continue;
        }

        // -------------------------
        // STATE
        // -------------------------
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

        // -------------------------
        // COMPONENT DEF
        // -------------------------
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

        // -------------------------
        // REPEAT
        // -------------------------
        else if (trimmed.startsWith("repeat")) {
            const source = parts[1].replace(":", "");
            node = createRepeat(source, "item", []);
        }

        // -------------------------
        // IF
        // -------------------------
        else if (trimmed.startsWith("if")) {
            const condition = trimmed.replace("if", "").replace(":", "").trim();
            node = createIf(condition, []);
        }

        // -------------------------
        // TEXT
        // -------------------------
        else if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                const after = trimmed.slice(match.index + match[0].length).trim();
                const propParts = after.split(" ");

                node = createText(match[1], false, extractProps(propParts));
            } else {
                // variable reference
                node = createText(parts[1], true, {});
            }
        }

        // -------------------------
        // BUTTON
        // -------------------------
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                const after = trimmed.slice(match.index + match[0].length).trim();
                const propParts = after.split(" ");

                let props = extractProps(propParts);
                let events = null;

                if (trimmed.includes("onClick=set(")) {
                    const exprMatch = trimmed.match(/onClick=set\((.*?)\)/);

                    if (exprMatch) {
                        let expr = exprMatch[1];
                        let target = expr.split(/[\s+\-*/=]/)[0].trim();

                        events = {
                            click: {
                                target,
                                expression: expr
                            }
                        };

                        delete props.onClick;
                    }
                }

                node = createButton(match[1], props, events);
            }
        }

        // -------------------------
        // IMAGE
        // -------------------------
        else if (trimmed.startsWith("image")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                const after = trimmed.slice(match.index + match[0].length).trim();
                const propParts = after.split(" ");

                node = createImage(match[1], extractProps(propParts));
            }
        }

        // -------------------------
        // 🎬 VIDEO (NEW)
        // -------------------------
        else if (trimmed.startsWith("video")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                const after = trimmed.slice(match.index + match[0].length).trim();
                const propParts = after.split(" ");

                node = createVideo(match[1], extractProps(propParts));
            }
        }

        // -------------------------
        // COLUMN
        // -------------------------
        else if (trimmed.startsWith("column")) {
            const align = parts[1]?.replace(":", "") || "start";

            node = createColumn([], align, {});
        }

        // -------------------------
        // ROW
        // -------------------------
        else if (trimmed.startsWith("row")) {
            node = createRow([], {});
        }

        // -------------------------
        // COMPONENT USAGE
        // -------------------------
        else if (components[parts[0]]) {
            node = createComponentNode(parts[0]);
        }

        if (!node) continue;

        // -------------------------
        // TREE STRUCTURE
        // -------------------------
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