#!/usr/bin/env node

const { build } = require("../index");
const chokidar = require("chokidar");

const args = process.argv.slice(2);
const command = args[0];

// ------------------
// FLAGS
// ------------------
const flags = args.filter(a => a.startsWith("--"));

const options = {
    debug: flags.includes("--debug"),
    noRender: flags.includes("--no-render")
};

// helper to get file safely
function getFileArg() {
    const fileArg = args.find(a => !a.startsWith("--") && a !== command);
    return fileArg || "input.kv";
}

// helper to run build
function runBuild(file) {
    build(file, "output.html", options);
}

// ------------------
// BUILD
// ------------------
if (command === "build") {
    runBuild(getFileArg());
}

// ------------------
// RUN FILE
// ------------------
else if (command === "run") {
    runBuild(getFileArg());
}

// ------------------
// DEV MODE
// ------------------
else if (command === "dev") {
    const file = getFileArg();

    console.log(`👀 Watching ${file}...`);
    console.log(`Debug: ${options.debug} | NoRender: ${options.noRender}`);

    runBuild(file);

    chokidar.watch(file).on("change", () => {
        console.log("🔁 Rebuilding...");
        runBuild(file);
    });
}

// ------------------
// DEBUG (🔥 FIXED)
// ------------------
else if (command === "debug") {
    runBuild(getFileArg());
}

// ------------------
// DEFAULT
// ------------------
else {
    console.log(`
Klover CLI

Commands:
  klover build [file]
  klover run [file]
  klover dev [file]

Debug:
  klover debug [file] --no-render
  klover build --debug
`);
}