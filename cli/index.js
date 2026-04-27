#!/usr/bin/env node
const chokidar = require("chokidar");
const path = require("path");
const { build } = require("../index.js");

const command = process.argv[2];
const file = process.argv[3] || "input.kv";

function showHelp() {
    console.log(`
🚀 Klover CLI V7

Usage:
  klover build <file>   - Build a .kv file to output.html
  klover dev <file>     - Watch a .kv file and re-build on changes
  klover help           - Show this message

Example:
  klover build input.kv
  klover dev input.kv
    `);
}

switch (command) {
    case "build":
        build(file, "output.html");
        break;
    case "dev":
        console.log(`👀 Watching for changes in: ${file}`);
        // Initial build
        build(file, "output.html");
        
        // Watch
        chokidar.watch(file, { usePolling: true }).on("change", (event) => {
            console.log(`\n🔄 Change detected in ${path.basename(file)}, rebuilding...`);
            build(file, "output.html");
        });
        break;
    case "help":
    default:
        showHelp();
}