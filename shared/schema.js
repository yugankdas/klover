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

function createImage(src, style = null) {
    return {
        type: "image",
        src,
        style
    };
}

function createTheme(value) {
    return {
        type: "theme",
        value
    };
}
module.exports = {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createTheme
};
