function build(inputFile = "input.kv", outputFile = "output.html") {
    const fs = require("fs");
    const { parse } = require("./parser/parse");
    const render = require("./renderer/render");
    const Runtime = require("./runtime/runtime");

    try {
        // -------------------------
        // READ INPUT
        // -------------------------
        const input = fs.readFileSync(inputFile, "utf-8");

        // -------------------------
        // PARSE
        // -------------------------
        const parsed = parse(input);

        // -------------------------
        // RUNTIME INIT
        // -------------------------
        const runtime = new Runtime(parsed.tree);
        runtime.init();

        // -------------------------
        // RESOLVE TREE
        // -------------------------
        const resolvedTree = runtime.resolveTree();

        // -------------------------
        // RENDER (BHUMI’S ZONE)
        // -------------------------
        const body = render(resolvedTree, {
            theme: parsed.theme,
            components: parsed.components,
            runtime
        });

        // -------------------------
        // FINAL HTML
        // -------------------------
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Klover App</title>
</head>
<body>
${body}
</body>
</html>
`;

        fs.writeFileSync(outputFile, html);

        console.log(`✔ Built ${outputFile}`);
    } catch (err) {
        console.error("❌ Build failed:");
        console.error(err.message);
    }
}

module.exports = { build };