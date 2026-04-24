const fs = require("fs");

function readInput() {
    return fs.readFileSync("input.kv", "utf-8");
}

function cleanLines(input) {
    return input
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);
}


const { createText, createButton } = require("../shared/schema");

function parseLines(lines) {
    const elements = [];

    for (let line of lines) {

        if (line.startsWith("text")) {
            const match = line.match(/"(.*?)"/);
            if (!match) continue;

            elements.push(createText(match[1]));
        }

        else if (line.startsWith("button")) {
            const match = line.match(/"(.*?)"/);
            if (!match) continue;

            elements.push(createButton(match[1]));
        }
    }

    return elements;
}


function parse(input) {
    const lines = cleanLines(input);
    return parseLines(lines);
}

module.exports = { parse };