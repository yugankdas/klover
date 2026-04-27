#!/usr/bin/env node

const { build } = require("../index");
const chokidar = require("chokidar");

const args = process.argv.slice(2);
const command = args[0];

// 🔥 FLAGS
const isDebug = args.includes("--debug");
const noRender = args.includes("--no-render");

// helper
function runBuild(file = "input.kv") {
    build(file, "output.html", {
        debug: isDebug,
        noRender
    });
}

// ------------------
// BUILD
// ------------------
if (command === "build") {
    runBuild();
}

// ------------------
// RUN FILE
// ------------------
else if (command === "run") {
    const file = args[1] && !args[1].startsWith("--") ? args[1] : "input.kv";
    runBuild(file);
}

// ------------------
// DEV MODE
// ------------------
else if (command === "dev") {
    const file = args[1] && !args[1].startsWith("--") ? args[1] : "input.kv";

    console.log(`👀 Watching ${file}...`);
    console.log(`Debug: ${isDebug} | NoRender: ${noRender}`);

    runBuild(file);

    chokidar.watch(file).on("change", () => {
        console.log("🔁 Rebuilding...");
        runBuild(file);
    });
}

// ------------------
// DEBUG SHORTCUT (🔥 USE THIS)
// ------------------
else if (command === "debug") {
    runBuild("input.kv");
}

// ------------------
// DEFAULT
// ------------------
else {
    console.log(`
Klover CLI

Commands:
  klover build
  klover dev [file]
  klover run <file>

Debug:
  klover debug --no-render
  klover build --debug
`);
}