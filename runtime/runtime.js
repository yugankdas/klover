class Runtime {
    constructor(ast) {
        this.ast = ast;
        this.state = {};
    }

    // -------------------------
    // INIT STATE
    // -------------------------
    init() {
        this.extractState(this.ast);
    }

    extractState(node) {
        if (!node) return;

        if (node.type === "state") {
            this.state[node.key] = node.value;
        }

        if (node.children) {
            node.children.forEach(child => this.extractState(child));
        }
    }

    // -------------------------
    // EVALUATE EXPRESSIONS
    // -------------------------
    evaluate(expr, scope = {}) {
        const context = { ...this.state, ...scope };

        const keys = Object.keys(context);
        const values = Object.values(context);

        return new Function(...keys, "return " + expr)(...values);
    }

    // -------------------------
    // CORE: RESOLVE NODE
    // -------------------------
    resolveNode(node, scope = {}) {
        if (!node) return null;

        // -------------------------
        // TEXT (VARIABLE)
        // -------------------------
        if (node.type === "text" && node.isVariable) {
            const value =
                scope[node.value] !== undefined
                    ? scope[node.value]
                    : this.state[node.value];

            return {
                ...node,
                value,
                isVariable: false
            };
        }

        // -------------------------
        // IF
        // -------------------------
        if (node.type === "if") {
            const result = this.evaluate(node.condition, scope);

            if (!result) return null;

            return {
                ...node,
                children: node.children
                    .map(child => this.resolveNode(child, scope))
                    .filter(Boolean)
            };
        }

        // -------------------------
        // REPEAT
        // -------------------------
        if (node.type === "repeat") {
            const list = this.state[node.source] || [];

            const expanded = [];

            list.forEach(item => {
                const newScope = {
                    ...scope,
                    [node.itemName]: item
                };

                node.children.forEach(child => {
                    const resolved = this.resolveNode(child, newScope);
                    if (resolved) expanded.push(resolved);
                });
            });

            return {
                type: "fragment",
                children: expanded
            };
        }

        // -------------------------
        // GENERIC NODE
        // -------------------------
        if (node.children) {
            return {
                ...node,
                children: node.children
                    .map(child => this.resolveNode(child, scope))
                    .filter(Boolean)
            };
        }

        return { ...node };
    }

    // -------------------------
    // ENTRY POINT
    // -------------------------
    resolveTree() {
        return this.resolveNode(this.ast);
    }
}

module.exports = Runtime;