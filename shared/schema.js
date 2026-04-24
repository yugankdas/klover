function createText(value) {
    return {
        type: "text",
        value
    };
}

function createButton(label) {
    return {
        type: "button",
        label
    };
}

module.exports = {
    createText,
    createButton
};