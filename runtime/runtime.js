class Runtime {
    constructor(ast, components = {}) {
        this.ast = ast;
        this.components = components;
        this.state = {};
        this.onRender = null;
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

        // Also extract from components
        if (node.type === "component" && this.components[node.name]) {
            this.extractState(this.components[node.name].root);
        }
    }

    // -------------------------
    // EVALUATE EXPRESSIONS
    // -------------------------
    evaluate(expr, scope = {}) {
        const context = { ...this.state, ...scope };
        const keys = Object.keys(context);
        const values = Object.values(context);

        try {
            return new Function(...keys, "return " + expr.trim())(...values);
        } catch (e) {
            console.error("Evaluation Error:", e, "Expression:", expr);
            return null;
        }
    }

    // -------------------------
    // STATE MANAGEMENT
    // -------------------------
    setState(target, expression) {
        let finalExpr = expression;
        let actualTarget = target;

        if (expression.includes("=")) {
            const parts = expression.split("=");
            actualTarget = parts[0].trim();
            finalExpr = parts[1].trim();
        }

        const newValue = this.evaluate(finalExpr);
        this.state[actualTarget] = newValue;

        if (this.onRender) this.onRender(this.resolveTree());
    }

    executeOperations(operations) {
        if (!Array.isArray(operations)) return;
        operations.forEach(op => {
            const newValue = this.evaluate(op.expression);
            // Robust target extraction: op.target might still have spaces or operators if the parser was loose
            const cleanTarget = op.target.trim();
            this.state[cleanTarget] = newValue;
            console.log(`Update: ${cleanTarget} =`, newValue);
        });
        if (this.onRender) this.onRender(this.resolveTree());
    }

    // -------------------------
    // CORE: RESOLVE NODE
    // -------------------------
    resolveNode(node, scope = {}) {
        if (!node) return null;

        // -------------------------
        // COMPONENT
        // -------------------------
        if (node.type === "component") {
            const comp = this.components[node.name];
            if (!comp || !comp.root) return null;
            return this.resolveNode(comp.root, scope);
        }

        // -------------------------
        // TEXT (VARIABLE/EXPRESSION)
        // -------------------------
        if (node.type === "text" && node.isVariable) {
            const value = this.evaluate(node.value, scope);

            return {
                ...node,
                value: value !== null ? value : "",
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

if (typeof module !== "undefined") {
    module.exports = Runtime;
}
