class Runtime {
    constructor(ast) {
        this.ast = ast;
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
    }

    // -------------------------
    // EVALUATE EXPRESSIONS
    // -------------------------
    evaluate(expr, scope = {}) {
        const context = { ...this.state, ...scope };

        const keys = Object.keys(context);
        const values = Object.values(context);

        try {
            // Clean up common DSL artifacts like trailing commas or multiple set calls 
            // though the parser should have handled most.
            let cleanExpr = expr.trim();
            
            // If it's a comma-separated operation list (e.g., "count, count + 1"), 
            // Javascript's comma operator will work, but we should make sure it doesn't 
            // break if we expect a single value.
            
            return new Function(...keys, "return " + cleanExpr)(...values);
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
        
        console.log(`State Update: ${actualTarget} =`, newValue);

        // Notify render
        if (this.onRender) {
            this.onRender(this.resolveTree());
        }
    }

    executeOperations(operations) {
        if (!Array.isArray(operations)) return;

        operations.forEach(op => {
            const { target, expression } = op;
            let finalExpr = expression;
            let actualTarget = target;

            if (expression.includes("=")) {
                const parts = expression.split("=");
                actualTarget = parts[0].trim();
                finalExpr = parts[1].trim();
            }

            const newValue = this.evaluate(finalExpr);
            this.state[actualTarget] = newValue;
            console.log(`Op Update: ${actualTarget} =`, newValue);
        });

        if (this.onRender) {
            this.onRender(this.resolveTree());
        }
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

if (typeof module !== "undefined") {
    module.exports = Runtime;
}