const fs = require("fs");
const { parse } = require("./parser/parse");
const { render } = require("./renderer/render");

// 1. Read input file
const input = fs.readFileSync("input.kv", "utf-8");

// 2. Parse input into structured data
const elements = parse(input);

// 3. Render structured data into HTML body
const body = render(elements);

// 4. Wrap into full HTML
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

        .kv-text {
            font-size: 20px;
        }

        .kv-button {
            padding: 10px 16px;
            border: none;
            background: #4f46e5;
            color: white;
            border-radius: 6px;
            cursor: pointer;
        }
    </style>
</head>
<body>
${body}
</body>
</html>
`;

// 5. Write output file
fs.writeFileSync("output.html", fullHTML);

console.log("✅ output.html generated");