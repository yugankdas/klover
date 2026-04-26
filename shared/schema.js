function createText(value, isVariable = false, style = null) {
    return { type: "text", value, isVariable, style };
}

function createButton(label, style = null, events = null) {
    return { type: "button", label, style, events };
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

function createComponentNode(name) {
    return {
        type: "component",
        name
    };
}

function createState(key, value) {
    return {
        type: "state",
        key,
        value
    };
}

// 🔥 V5 ADDITIONS
function createRepeat(source, itemName = "item", children = []) {
    return {
        type: "repeat",
        source,
        itemName,
        children
    };
}

function createIf(condition, children = []) {
    return {
        type: "if",
        condition,
        children
    };
}

module.exports = {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createTheme,
    createComponentNode,
    createState,
    createRepeat,
    createIf
};