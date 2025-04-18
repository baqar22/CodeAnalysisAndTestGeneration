export function analyzeAST(code) {
    const insights = [];
    const highlightLines = [];

    try {
        const output = window.Babel.transform(code, {
            ast: true,
            code: false,
            filename: 'legacy.js',
            presets: ['react'],
        });

        const ast = output.ast;
        console.log("ast", ast);

        const reactLifecycleMethods = new Set([
            'componentDidMount',
            'componentDidUpdate',
            'componentWillUnmount',
            'componentWillMount',
            'shouldComponentUpdate',
            'getDerivedStateFromProps',
            'getSnapshotBeforeUpdate',
            'componentWillReceiveProps',
            'componentWillUpdate',
            'UNSAFE_componentWillMount',
            'UNSAFE_componentWillReceiveProps',
            'UNSAFE_componentWillUpdate',
        ]);

        const addInsight = ({ type, label, status, line }) => {
            if (typeof line !== 'number') return;

            // ❌ Skip modern functional component insights
            if (type === 'component' && status === 'modern') return;

            insights.push({ type, label, status, line });
            highlightLines.push(line);
        };

        const visitNode = (node) => {
            if (!node || typeof node !== 'object') return;

            if (node.type === 'CallExpression') {
                const callee = node.callee?.name || node.callee?.property?.name;
                if (callee === 'useState') {
                    addInsight({
                        type: 'hook',
                        label: 'useState hook found',
                        status: 'modern',
                        line: node.loc?.start?.line,
                    });
                }
            }

            if (node.type === 'ClassDeclaration' && node.superClass?.type === 'MemberExpression') {
                const line = node.loc?.start?.line;
                addInsight({
                    type: 'component',
                    label: 'Class-based component detected',
                    status: 'outdated',
                    line,
                });

                node.body?.body?.forEach((methodNode) => {
                    const methodName = methodNode.key?.name;
                    const methodLine = methodNode.loc?.start?.line;

                    if (methodName === 'render') {
                        addInsight({
                            type: 'method',
                            label: 'Class method "render" found',
                            status: 'outdated',
                            line: methodLine,
                        });
                    }

                    if (reactLifecycleMethods.has(methodName)) {
                        addInsight({
                            type: 'method',
                            label: `Lifecycle method "${methodName}" found`,
                            status: 'deprecated',
                            line: methodLine,
                        });
                    }
                });
            }

            if (
                node.type === 'FunctionDeclaration' ||
                node.type === 'FunctionExpression' ||
                node.type === 'ArrowFunctionExpression'
            ) {
                // Only add if it's not a modern component
                const line = node.loc?.start?.line;
                addInsight({
                    type: 'component',
                    label: 'Function-based component detected',
                    status: 'modern',
                    line,
                });
            }

            if (['Identifier', 'Literal', 'JSXText'].includes(node.type)) return;

            for (const key in node) {
                const value = node[key];
                if (Array.isArray(value)) {
                    value.forEach((child) => visitNode(child));
                } else if (typeof value === 'object') {
                    visitNode(value);
                }
            }
        };

        ast.program.body.forEach((node) => visitNode(node));
    } catch (err) {
        console.error('AST parsing failed:', err);
    }

    return {
        messages: insights,
        highlightLines,
    };
}
