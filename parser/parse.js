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
// -----------------------------
// 🔥 NEW: ROBUST TOKENIZER
// -----------------------------
function tokenize(line) {
    const parts = [];
    let current = "";
    let inQuotes = false;
    let depth = 0; // for parentheses

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
            current += char;
        } else if (char === '(' && !inQuotes) {
            depth++;
            current += char;
        } else if (char === ')' && !inQuotes) {
            depth--;
            current += char;
        } else if (char === ' ' && !inQuotes && depth === 0) {
            if (current.length > 0) parts.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    if (current.length > 0) parts.push(current);
    return parts;
}

// -----------------------------
// 🔥 NEW: PROP PARSER
// -----------------------------
function extractProps(parts) {
    const props = {};
    const validFlags = ["primary", "controls", "autoplay", "muted", "loop", "danger"];

    parts.forEach(p => {
        if (p.includes("=")) {
            // Handle cases like onClick=set(a, b) where split("=") would break
            const firstEqual = p.indexOf("=");
            let key = p.substring(0, firstEqual).trim();
            let value = p.substring(firstEqual + 1).trim();

            // number conversion
            if (!isNaN(value) && value !== "" && !value.startsWith("0x")) {
                value = Number(value);
            } else if (value === "true") {
                value = true;
            } else if (value === "false") {
                value = false;
            } else if (value === "null") {
                value = null;
            }

            // strip quotes
            if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            props[key] = value;
        } else if (validFlags.includes(p)) {
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
    let title = null;
    let icon = null;
    let currentComponent = null;

    for (let line of lines) {
        const trimmed = line.trim();
        const indent = getIndent(line);
        const parts = tokenize(trimmed);

        let node = null;

        // -------------------------
        // THEME
        // -------------------------
        if (trimmed.startsWith("theme")) {
            theme = parts[1] || null;
            continue;
        }

        if (trimmed.startsWith("title")) {
            title = trimmed.replace(/^title\s+/, "").replace(/"/g, "").trim();
            continue;
        }

        if (trimmed.startsWith("icon") || trimmed.startsWith("favicon")) {
            icon = trimmed.replace(/^(icon|favicon)\s+/, "").replace(/"/g, "").trim();
            continue;
        }

        // -------------------------
        // STATE
        // -------------------------
        if (trimmed.startsWith("state")) {
            const key = parts[1];
            // Find the start of the value after '='
            const rawLine = trimmed;
            const eqIndex = rawLine.indexOf("=");
            let value = null;

            if (eqIndex !== -1) {
                const rawValue = rawLine.substring(eqIndex + 1).trim();
                try {
                    value = JSON.parse(rawValue);
                } catch {
                    if (rawValue === "true") value = true;
                    else if (rawValue === "false") value = false;
                    else if (rawValue === "null") value = null;
                    else value = isNaN(rawValue) || rawValue === "" ? rawValue : Number(rawValue);
                }
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

        // Handle end of component block
        if (indent === 0 && currentComponent && !trimmed.startsWith("component")) {
            currentComponent = null;
            stack.length = 0;
        }

        // -------------------------
        // REPEAT
        // -------------------------
        else if (trimmed.startsWith("repeat")) {
            const source = parts[1].replace(":", "");
            let itemName = "item";
            
            // Support "repeat products as p:"
            if (parts[2] === "as" && parts[3]) {
                itemName = parts[3].replace(":", "");
            }
            
            node = createRepeat(source, itemName, []);
        }

        // -------------------------
        // IF
        // -------------------------
        else if (trimmed.startsWith("if")) {
            const condition = trimmed.replace(/^if\s+/, "").replace(/:$/, "").trim();
            node = createIf(condition, []);
        }

        // -------------------------
        // TEXT
        // -------------------------
        else if (trimmed.startsWith("text")) {
            const rest = trimmed.replace(/^text\s+/, "");
            const VARIANTS = ["h1", "h2", "h3", "h4", "subheading", "heading"];
            
            if (rest.startsWith('"')) {
                // Find matching end quote
                let endIdx = -1;
                for (let i = 1; i < rest.length; i++) {
                    if (rest[i] === '"' && rest[i-1] !== '\\') {
                        endIdx = i;
                        break;
                    }
                }

                if (endIdx !== -1) {
                    const content = rest.substring(1, endIdx);
                    const after = rest.substring(endIdx + 1).trim();
                    const allParts = tokenize(after);
                    
                    let variant = "body";
                    const propParts = [];
                    allParts.forEach(p => {
                        if (VARIANTS.includes(p)) {
                            variant = p;
                        } else {
                            propParts.push(p);
                        }
                    });
                    
                    node = createText(content, false, extractProps(propParts), variant);
                }
            } else {
                // Expression or variable
                const allParts = tokenize(rest);
                const contentParts = [];
                const propParts = [];
                const validFlags = ["primary", "controls", "autoplay", "muted", "loop", "danger"];
                let variant = "body";

                allParts.forEach(p => {
                    if (VARIANTS.includes(p)) {
                        variant = p; // Found a variant keyword
                    } else if (p.includes("=") || validFlags.includes(p)) {
                        propParts.push(p); // It's a property
                    } else {
                        contentParts.push(p); // It's part of the expression
                    }
                });

                const expression = contentParts.join(" ").trim();
                node = createText(expression, true, extractProps(propParts), variant);
            }
        }

        // -------------------------
        // BUTTON
        // -------------------------
        else if (trimmed.startsWith("button")) {
            const rest = trimmed.replace(/^button\s+/, "");
            let label = "Button";
            let after = rest;

            if (rest.startsWith('"')) {
                let endIdx = -1;
                for (let i = 1; i < rest.length; i++) {
                    if (rest[i] === '"' && rest[i-1] !== '\\') {
                        endIdx = i;
                        break;
                    }
                }
                if (endIdx !== -1) {
                    label = rest.substring(1, endIdx);
                    after = rest.substring(endIdx + 1).trim();
                }
            }

            // Separate events from props
            let events = null;
            let propsContent = after;

            if (after.includes("onClick=")) {
                // Find full onClick value including nested parens
                const clickIdx = after.indexOf("onClick=");
                let startIdx = clickIdx + 8;
                let endIdx = startIdx;
                let parenDepth = 0;
                let inQ = false;

                for (let i = startIdx; i < after.length; i++) {
                    const c = after[i];
                    if (c === '"') inQ = !inQ;
                    if (!inQ) {
                        if (c === '(') parenDepth++;
                        if (c === ')') parenDepth--;
                        if (parenDepth === 0 && (c === ' ' || i === after.length - 1)) {
                            endIdx = (i === after.length - 1) ? i + 1 : i;
                            break;
                        }
                    }
                }

                const fullAction = after.substring(startIdx, endIdx).trim();
                const operations = fullAction.split(/\s*&\s*/).map(op => {
                    const opMatch = op.match(/set\((.*?)\)/);
                    if (opMatch) {
                        const content = opMatch[1];
                        // First comma outside of parens/quotes is the separator
                        let commaIdx = -1;
                        let d = 0;
                        let q = false;
                        for(let i=0; i<content.length; i++) {
                            if(content[i] === '"') q = !q;
                            if(!q) {
                                if(content[i] === '(' || content[i] === '[') d++;
                                if(content[i] === ')' || content[i] === ']') d--;
                                if(d === 0 && content[i] === ',') {
                                    commaIdx = i;
                                    break;
                                }
                            }
                        }

                        if (commaIdx !== -1) {
                            const target = content.substring(0, commaIdx).trim();
                            const expression = content.substring(commaIdx + 1).trim();
                            return { target, expression };
                        }
                    }
                    return null;
                }).filter(Boolean);

                events = { click: { operations } };
                propsContent = (after.substring(0, clickIdx) + " " + after.substring(endIdx)).trim();
            }

            const propParts = tokenize(propsContent);
            node = createButton(label, extractProps(propParts), events);
        }

        // -------------------------
        // IMAGE & VIDEO
        // -------------------------
        else if (trimmed.startsWith("image") || trimmed.startsWith("video")) {
            const type = trimmed.startsWith("image") ? "image" : "video";
            const rest = trimmed.replace(new RegExp(`^${type}\\s+`), "");
            let src = "";
            let after = "";
            let isVariable = false;

            if (rest.startsWith('"')) {
                let endIdx = -1;
                for (let i = 1; i < rest.length; i++) {
                    if (rest[i] === '"' && rest[i-1] !== '\\') {
                        endIdx = i;
                        break;
                    }
                }
                if (endIdx !== -1) {
                    src = rest.substring(1, endIdx);
                    after = rest.substring(endIdx + 1).trim();
                }
            } else {
                const p = tokenize(rest);
                src = p[0];
                after = p.slice(1).join(" ");
                isVariable = true;
            }

            const propParts = tokenize(after);
            node = type === "image" 
                ? createImage(src, extractProps(propParts), isVariable)
                : createVideo(src, extractProps(propParts), isVariable);
        }

        // -------------------------
        // COLUMN & ROW
        // -------------------------
        else if (trimmed.startsWith("column") || trimmed.startsWith("row")) {
            const type = trimmed.startsWith("column") ? "column" : "row";
            const rest = trimmed.replace(new RegExp(`^${type}\\s+`), "").replace(/:$/, "");
            const propParts = tokenize(rest);
            const props = extractProps(propParts);

            if (type === "column") {
                node = createColumn([], props.align || "start", props);
            } else {
                node = createRow([], props);
            }
        }

        // -------------------------
        // COMPONENT USAGE
        // -------------------------
        else if (components[parts[0]]) {
            const name = parts[0];
            const propParts = parts.slice(1);
            node = createComponentNode(name, extractProps(propParts));
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
        title,
        icon,
        components
    };
}

module.exports = { parse };