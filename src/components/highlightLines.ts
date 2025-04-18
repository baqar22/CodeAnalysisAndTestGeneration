export const highlightLines = (
    editor: any,
    monaco: typeof import('monaco-editor'),
    lines: number[]
) => {
    const decorations = lines.map((line) => ({
        range: new monaco.Range(line, 1, line, 1),
        options: {
            isWholeLine: true,
            className: 'bg-yellow-100',
            marginClassName: 'highlight-margin',
        },
    }));

    editor.deltaDecorations([], decorations);
};
