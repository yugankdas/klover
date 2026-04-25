const fs = require("fs");
const { parse } = require("./parser/parse");
const { renderNode } = require("./renderer/render");

// 1. Read input
const input = fs.readFileSync("input.kv", "utf-8");

// 2. Parse
const result = parse(input);

const tree = result.tree;
const theme = result.theme;

// DEBUG (keep while developing)
console.log(JSON.stringify(result, null, 2));

// 3. Render UI
const body = renderNode(tree);

// 4. Apply theme class
const themeClass = theme ? `theme-${theme}` : "";

// 5. Full HTML
const fullHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Klover Output</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
        }

        .column {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .row {
            display: flex;
            flex-direction: row;
            gap: 12px;
        }

        .center {
            align-items: center;
        }

        /* STYLE TOKENS */
        .heading {
            font-size: 28px;
            font-weight: bold;
        }

        .primary {
            background: #4f46e5;
            color: white;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
        }

        .hero {
            width: 100%;
            border-radius: 10px;
        }

        /* THEMES */
        .theme-dark {
            background: #111;
            color: white;
        }

        .theme-light {
            background: white;
            color: black;
        }
    </style>
</head>
<body class="${themeClass}">
${body}
</body>
</html>
`;

// 6. Write output
fs.writeFileSync("output.html", fullHTML);

console.log("✅ output.html generated");