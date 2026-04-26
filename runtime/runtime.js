class Runtime {
    constructor(ast) {
        this.ast = ast;
        this.state = {};
    }

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

    evaluate(expr) {
        const keys = Object.keys(this.state);
        const values = Object.values(this.state);
        try {
            const func = new Function(...keys, `return ${expr}`);
            return func(...values);
        } catch (e) {
            console.error(`Failed to evaluate expression: ${expr}`, e);
            return null;
        }
    }

    setState(key, expr) {
        const result = this.evaluate(expr);
        if (result !== null) {
            this.state[key] = result;
        }
    }
}

module.exports = Runtime;