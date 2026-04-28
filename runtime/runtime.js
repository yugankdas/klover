// runtime/runtime.js - V8 with Diffing Support
class Runtime {
    constructor(ast, components = {}) {
        this.ast = ast;
        this.components = components;
        this.state = {};
        this.onRender = null;

        // V8: Track previous tree for diffing
        this.previousTree = null;
        this.currentTree = null;
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
    // -------------------------
    // EVALUATE EXPRESSIONS
    // -------------------------
    evaluate(expr, scope = {}) {
        if (expr === null || expr === undefined) return null;
        
        const context = { ...this.state, ...scope };
        const keys = Object.keys(context).filter(k => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k));
        const values = keys.map(k => context[k]);

        try {
            const cleanExpr = String(expr).trim();
            
            // Handle chained operations (a & b & c)
            if (cleanExpr.includes('&')) {
                const parts = cleanExpr.split('&');
                let lastResult = null;
                for (const part of parts) {
                    const fn = new Function(...keys, "return " + part.trim());
                    lastResult = fn(...values);
                }
                return lastResult;
            }

            // Standard evaluation
            const fn = new Function(...keys, "return " + cleanExpr);
            return fn(...values);
        } catch (e) {
            console.error("Evaluation Error:", e.message, "| Expression:", expr);
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
        if (newValue !== null && newValue !== undefined) {
            // Support nested state updates: set(user.name, 'bob')
            if (actualTarget.includes('.')) {
                const parts = actualTarget.split('.');
                let obj = this.state;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (!obj[parts[i]]) obj[parts[i]] = {};
                    obj = obj[parts[i]];
                }
                obj[parts[parts.length - 1]] = newValue;
            } else {
                this.state[actualTarget] = newValue;
            }
            console.log(`State updated: ${actualTarget} = ${JSON.stringify(newValue)}`);
        }

        if (this.onRender) {
            const newTree = this.resolveTree();
            this.onRender(newTree);
        }
    }

    executeOperations(operations, scope = {}) {
        if (!Array.isArray(operations)) return;
        
        let changed = false;
        operations.forEach(op => {
            const newValue = this.evaluate(op.expression, scope);
            if (newValue !== null && newValue !== undefined) {
                const cleanTarget = op.target.trim();
                
                // Get current value for comparison
                let currentVal;
                if (cleanTarget.includes('.')) {
                    currentVal = cleanTarget.split('.').reduce((o, i) => o?.[i], this.state);
                } else {
                    currentVal = this.state[cleanTarget];
                }

                if (JSON.stringify(currentVal) !== JSON.stringify(newValue)) {
                    if (cleanTarget.includes('.')) {
                        const parts = cleanTarget.split('.');
                        let obj = this.state;
                        for (let i = 0; i < parts.length - 1; i++) {
                            if (!obj[parts[i]]) obj[parts[i]] = {};
                            obj = obj[parts[i]];
                        }
                        obj[parts[parts.length - 1]] = newValue;
                    } else {
                        this.state[cleanTarget] = newValue;
                    }
                    console.log(`Operation: ${cleanTarget} = ${JSON.stringify(newValue)}`);
                    changed = true;
                }
            }
        });

        if (changed && this.onRender) {
            const newTree = this.resolveTree();
            this.onRender(newTree);
        }
    }

    // -------------------------
    // V8: DIFF TWO TREES
    // -------------------------
    diffTree(oldTree, newTree, changes = [], path = "") {
        if (!oldTree && !newTree) return changes;
        if (!oldTree) {
            changes.push({ type: "added", path, node: newTree });
            return changes;
        }
        if (!newTree) {
            changes.push({ type: "removed", path, node: oldTree });
            return changes;
        }

        if (oldTree.type !== newTree.type) {
            changes.push({ type: "replaced", path, old: oldTree, new: newTree });
            return changes;
        }

        if (oldTree.type === "text" && oldTree.value !== newTree.value) {
            changes.push({
                type: "changed",
                path: path ? `${path}.value` : "value",
                old: oldTree.value,
                new: newTree.value
            });
        }

        if (oldTree.type === "button" && oldTree.label !== newTree.label) {
            changes.push({
                type: "changed",
                path: path ? `${path}.label` : "label",
                old: oldTree.label,
                new: newTree.label
            });
        }

        const oldChildren = oldTree.children || [];
        const newChildren = newTree.children || [];
        const maxLen = Math.max(oldChildren.length, newChildren.length);

        for (let i = 0; i < maxLen; i++) {
            const newPath = path ? `${path}.children[${i}]` : `children[${i}]`;
            this.diffTree(oldChildren[i], newChildren[i], changes, newPath);
        }

        return changes;
    }

    // -------------------------
    // CORE: RESOLVE NODE
    // -------------------------
    resolveNode(node, scope = {}) {
        if (!node) return null;

        let resolved = null;

        if (node.type === "state") {
            return null;
        }
        
        else if (node.type === "component") {
            const comp = this.components[node.name];
            if (!comp || !comp.root) return null;

            const resolvedProps = {};
            if (node.props) {
                for (const [key, expr] of Object.entries(node.props)) {
                    const val = this.evaluate(String(expr), scope);
                    resolvedProps[key] = val !== null ? val : expr;
                }
            }

            const mergedScope = { ...scope, ...resolvedProps };
            resolved = this.resolveNode(comp.root, mergedScope);
        }

        else if (node.type === "text" && node.isVariable) {
            const value = this.evaluate(node.value, scope);
            resolved = {
                ...node,
                value: value !== null && value !== undefined ? value : "",
                isVariable: false
            };
        }

        else if ((node.type === "image" || node.type === "video") && node.isVariable) {
            const value = this.evaluate(node.src, scope);
            resolved = {
                ...node,
                src: value !== null && value !== undefined ? value : "",
                isVariable: false
            };
        }

        else if (node.type === "if") {
            const result = this.evaluate(node.condition, scope);
            if (!result) return null;

            resolved = {
                type: "fragment",
                children: node.children
                    .map(child => this.resolveNode(child, scope))
                    .filter(Boolean)
            };
        }

        else if (node.type === "repeat") {
            // FIX: Evaluate source in current scope (supports expressions/nested data)
            const list = this.evaluate(node.source, scope) || [];
            const expanded = [];

            if (Array.isArray(list)) {
                list.forEach((item, index) => {
                    const newScope = {
                        ...scope,
                        [node.itemName]: item,
                        index: index
                    };

                    node.children.forEach(child => {
                        const resChild = this.resolveNode(child, newScope);
                        if (resChild) expanded.push(resChild);
                    });
                });
            }

            resolved = {
                type: "fragment",
                children: expanded
            };
        }

        else if (node.children) {
            resolved = {
                ...node,
                children: node.children
                    .map(child => this.resolveNode(child, scope))
                    .filter(Boolean)
            };
        }

        else {
            resolved = { ...node };
        }

        if (resolved && node.events) {
            resolved._scope = { ...scope };
        }

        return resolved;
    }

    // -------------------------
    // V8: ENTRY POINT with tracking
    // -------------------------
    resolveTree() {
        const oldTree = this.currentTree;
        const newTree = this.resolveNode(this.ast);

        this.previousTree = oldTree;
        this.currentTree = newTree;

        let changes = null;
        if (this.previousTree && this.currentTree) {
            changes = this.diffTree(this.previousTree, this.currentTree);
            if (changes.length > 0) {
                console.log(`📊 V8 Diff: ${changes.length} change(s) detected`);
            }
        }

        if (changes && changes.length > 0) {
            newTree._changes = changes;
        }

        return newTree;
    }


    // -------------------------
    // EVENT EXECUTION (Path-Based)
    // -------------------------
    getNodeByPath(path, tree = this.currentTree) {
        if (!path || !tree) return tree;
        
        const parts = path.split(/[.\[\]]+/).filter(Boolean);
        let current = tree;

        for (const part of parts) {
            if (!current) return null;
            if (part === "children" || part === "root") continue;
            
            if (current.children && !isNaN(part)) {
                current = current.children[parseInt(part)];
            } else if (current[part]) {
                current = current[part];
            } else {
                return null;
            }
        }
        return current;
    }

    executeEvent(path, eventType) {
        const node = this.getNodeByPath(path);
        if (!node || !node.events || !node.events[eventType]) return;

        const { operations } = node.events[eventType];
        const scope = node._scope || {};
        
        console.log(`⚡ Executing ${eventType} event at path: ${path}`);
        this.executeOperations(operations, scope);
    }

    // -------------------------
    // HELPER: Get current state
    // -------------------------
    getState() {
        return { ...this.state };
    }

    // -------------------------
    // HELPER: Set multiple states at once
    // -------------------------
    setMultipleState(updates) {
        let changed = false;
        for (const [key, value] of Object.entries(updates)) {
            if (this.state[key] !== value) {
                this.state[key] = value;
                changed = true;
            }
        }
        if (changed && this.onRender) {
            const newTree = this.resolveTree();
            this.onRender(newTree);
        }
    }

    // -------------------------
    // HELPER: Reset all state
    // -------------------------
    resetState() {
        const keys = Object.keys(this.state);
        for (const key of keys) {
            delete this.state[key];
        }
        this.extractState(this.ast);
        if (this.onRender) {
            const newTree = this.resolveTree();
            this.onRender(newTree);
        }
    }
}

if (typeof module !== "undefined") {
    module.exports = Runtime;
}