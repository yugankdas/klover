function createText(value, isVariable = false, props = {}) {
    return { type: "text", value, isVariable, props };
}

function createButton(label, props = {}, events = null) {
    return { type: "button", label, props, events };
}

function createColumn(children = [], align = "start", props = {}, responsive = null) {
    return { type: "column", align, children, props, responsive };
}

function createRow(children = [], props = {}, responsive = null) {
    return { type: "row", children, props, responsive };
}

function createImage(src, props = {}) {
    return {
        type: "image",
        src,
        props
    };
}

// 🔥 UPDATED THEME (TOKENS, NOT STRING)
function createTheme(tokens = {}) {
    return {
        type: "theme",
        tokens
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

// 🔥 V5
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

// 🔥 V6 NEW
function createVideo(src, props = {}) {
    return {
        type: "video",
        src,
        props
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
    createIf,
    createVideo
};