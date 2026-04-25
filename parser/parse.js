const {
    createText,
    createButton,
    createColumn,
    createRow
} = require("../shared/schema");


// CLEAN INPUT
function cleanLines(input) {
    return input
        .split("\n")
        .map(line => line.replace(/\t/g, "    "))
        .map(line => line.replace(/\r$/, ""))
        .filter(line => line.trim().length > 0);
}


// COUNT INDENTATION
function getIndent(line) {
    return line.match(/^ */)[0].length;
}


// MAIN PARSER
function parse(input) {
    const lines = cleanLines(input);

    const stack = [];
    let root = null;

    for (let line of lines) {
        let node = null;

        const trimmed = line.trim();

        // TEXT
        if (trimmed.startsWith("text")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) node = createText(match[1]);
        }

        // BUTTON
        else if (trimmed.startsWith("button")) {
            const match = trimmed.match(/"(.*?)"/);
            if (match) node = createButton(match[1]);
        }

        // COLUMN
        else if (trimmed.startsWith("column")) {
            const parts = trimmed.replace(":", "").split(" ");
            const align = parts[1] || "start";
            node = createColumn([], align);
        }

        // ROW
        else if (trimmed.startsWith("row")) {
            node = createRow([]);
        }

        // ignore invalid lines
        if (!node) continue;

        const indent = getIndent(line);

        // FIRST NODE
        if (!root) {
            root = node;
            stack.push({ node, indent });
            continue;
        }

        // MOVE UP TREE
        while (
            stack.length &&
            indent <= stack[stack.length - 1].indent
        ) {
            stack.pop();
        }

        // ATTACH TO PARENT
        const parent = stack[stack.length - 1];
        if (parent && parent.node.children) {
            parent.node.children.push(node);
        }

        // PUSH CURRENT NODE
        stack.push({ node, indent });
    }

    return root;
}

module.exports = { parse };