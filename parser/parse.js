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
    const validFlags = ["primary", "controls", "autoplay", "muted", "loop"];

    parts.forEach(p => {
        if (p.includes("=")) {
            let [key, value] = p.split("=");

            // number conversion
            if (!isNaN(value) && value !== "") {
                value = Number(value);
            }

            // strip quotes
            if (value?.toString().startsWith('"') && value.toString().endsWith('"')) {
                value = value.toString().slice(1, -1);
            }

            props[key] = value;
        } else if (validFlags.includes(p)) {
            // flag props (autoplay, controls, etc.)
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
            const rest = trimmed.replace(/^text\s+/, "");
            
            if (rest.startsWith('"')) {
                // Quoted string: text "Hello world" size=md
                const match = rest.match(/"(.*?)"/);
                if (match) {
                    const content = match[1];
                    const after = rest.slice(match.index + match[0].length).trim();
                    const propParts = after.split(/\s+/).filter(Boolean);
                    node = createText(content, false, extractProps(propParts));
                }
            } else {
                // Expression or variable: text count * 2 size=md
                const allParts = rest.split(/\s+/).filter(Boolean);
                const contentParts = [];
                const propParts = [];
                const validFlags = ["primary", "controls", "autoplay", "muted", "loop"];

                allParts.forEach(p => {
                    // A prop part either has '=' or is a known flag. 
                    // To be safe, we check if it looks like a prop.
                    if (p.includes("=") || validFlags.includes(p)) {
                        propParts.push(p);
                    } else {
                        contentParts.push(p);
                    }
                });

                const expression = contentParts.join(" ");
                node = createText(expression, true, extractProps(propParts));
            }
        }

        // -------------------------
        // BUTTON
        // -------------------------
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);

            if (match) {
                const label = match[1];
                const after = trimmed.slice(match.index + match[0].length).trim();
                
                // Separate events from props
                // Example: onClick=set(count, 0) & set(score, 100) primary
                let events = null;
                let propsContent = after;

                if (after.includes("onClick=")) {
                    const clickMatch = after.match(/onClick=(set\(.*?\)(?:\s*&\s*set\(.*?\))*)/);
                    if (clickMatch) {
                        const fullAction = clickMatch[1];
                        const operations = fullAction.split(/\s*&\s*/).map(op => {
                            const opMatch = op.match(/set\((.*?)\)/);
                            if (opMatch) {
                                const expr = opMatch[1];
                                // Clean target: split by comma or space or operators, take first
                                const target = expr.split(/[\s,+\-*/=]/)[0].trim();
                                return { target, expression: expr };
                            }
                            return null;
                        }).filter(Boolean);

                        events = { click: { operations } };
                        propsContent = after.replace(clickMatch[0], "").trim();
                    }
                }

                const propParts = propsContent.split(/\s+/).filter(Boolean);
                node = createButton(label, extractProps(propParts), events);
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
            const rest = trimmed.replace(/^column\s+/, "").replace(/:$/, "");
            const allParts = rest.split(/\s+/).filter(Boolean);
            const propParts = [];
            let align = "start";

            allParts.forEach(p => {
                if (p.includes("=")) {
                    const [k, v] = p.split("=");
                    if (k === "align") align = v;
                    propParts.push(p);
                } else if (!p.includes('"')) {
                    propParts.push(p);
                }
            });

            node = createColumn([], align, extractProps(propParts));
        }

        // -------------------------
        // ROW
        // -------------------------
        else if (trimmed.startsWith("row")) {
            const rest = trimmed.replace(/^row\s+/, "").replace(/:$/, "");
            const propParts = rest.split(/\s+/).filter(Boolean);
            node = createRow([], extractProps(propParts));
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