export const analyzeComplexity = (code: string): number => {
    const lines = code.split('\n');
    let maxNesting = 0;
    let currentNesting = 0;
    let functionCount = 0;

    lines.forEach((line) => {
        if (line.includes('{')) currentNesting++;
        if (line.includes('}')) currentNesting--;
        if (line.match(/\bfunction\b|\bconst\b.*=\s*\(/)) functionCount++;
        maxNesting = Math.max(maxNesting, currentNesting);
    });

    // Simple formula for complexity (range 0 to 10)
    const complexity = Math.min(10, Math.floor(maxNesting + functionCount / 2));
    return complexity;
};
