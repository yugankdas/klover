function createText(value) {
    return { type: "text", value };
}

function createButton(label) {
    return { type: "button", label };
}

function createColumn(children = [], align = "start") {
    return { type: "column", align, children };
}

function createRow(children = []) {
    return { type: "row", children };
}

module.exports = {
    createText,
    createButton,
    createColumn,
    createRow
};