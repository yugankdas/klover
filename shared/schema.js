function createText(value, isVariable = false, props = {}) {
    return { type: "text", value, isVariable, props };
}

function createButton(label, props = {}, events = null) {
    return { type: "button", label, props, events };
}

function createColumn(children = [], align = "start", props = {}) {
    return { type: "column", align, children, props };
}

function createRow(children = [], props = {}) {
    return { type: "row", children, props };
}

function createImage(src, props = {}, isVariable = false) {
    return { type: "image", src, props, isVariable };
}

function createVideo(src, props = {}, isVariable = false) {
    return { type: "video", src, props, isVariable };
}

function createComponentNode(name, props = {}) {
    return { type: "component", name, props };
}

function createState(key, value) {
    return { type: "state", key, value };
}

function createRepeat(source, itemName = "item", children = []) {
    return { type: "repeat", source, itemName, children };
}

function createIf(condition, children = []) {
    return { type: "if", condition, children };
}

module.exports = {
    createText,
    createButton,
    createColumn,
    createRow,
    createImage,
    createVideo,
    createComponentNode,
    createState,
    createRepeat,
    createIf
};