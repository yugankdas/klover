const {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage
} = require("../shared/schema");


// -----------------------------
// CLEAN INPUT
// -----------------------------
function cleanLines(input) {
    return input
        .split("\n")
        .map(line => line.replace(/\t/g, "    ")) // tabs → spaces
        .map(line => line.replace(/\r$/, ""))     // remove Windows CR
        .filter(line => line.trim().length > 0);  // remove empty lines
}


// -----------------------------
// INDENTATION
// -----------------------------
function getIndent(line) {
    return line.match(/^ */)[0].length;
}


// -----------------------------
// STYLE EXTRACTION
// -----------------------------
function extractStyle(parts) {
    return parts.length > 2 ? parts[2] : null;
}


// -----------------------------
// MAIN PARSER
// -----------------------------
function parse(input) {
    const lines = cleanLines(input);

    const stack = [];
    let root = null;
    let theme = null;

    for (let line of lines) {
        let node = null;

        const trimmed = line.trim();
        const parts = trimmed.split(" ");

        // -------------------------
        // THEME (GLOBAL)
        // -------------------------
        if (trimmed.startsWith("theme")) {
            if (parts[1]) {
                theme = parts[1];
            }
            continue;
        }

        // -------------------------
        // TEXT
        // -------------------------
        if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                const style = extractStyle(parts);
                node = createText(match[1]);
                node.style = style;
            }
        }

        // -------------------------
        // BUTTON
        // -------------------------
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) {
                const style = extractStyle(parts);
                node = createButton(match[1]);
                node.style = style;
            }
        }

        // -------------------------
        // IMAGE (NEW)
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
        // INVALID LINE → SKIP
        // -------------------------
        if (!node) continue;

        const indent = getIndent(line);

        // -------------------------
        // ROOT NODE
        // -------------------------
        if (!root) {
            root = node;
            stack.push({ node, indent });
            continue;
        }

        // -------------------------
        // MOVE UP TREE
        // -------------------------
        while (
            stack.length &&
            indent <= stack[stack.length - 1].indent
        ) {
            stack.pop();
        }

        // -------------------------
        // ATTACH TO PARENT
        // -------------------------
        const parent = stack[stack.length - 1];

        if (parent && parent.node.children) {
            parent.node.children.push(node);
        }

        // -------------------------
        // PUSH CURRENT NODE
        // -------------------------
        stack.push({ node, indent });
    }

    // -----------------------------
    // FINAL OUTPUT
    // -----------------------------
    return {
        tree: root,
        theme
    };
}

module.exports = { parse };