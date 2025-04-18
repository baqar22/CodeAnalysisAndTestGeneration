export const calculateComplexity = (code: string): string => {
    const lines = code.split('\n').length;
    const nesting = (code.match(/\{/g) || []).length;
    const conditionals = (code.match(/if\s*\(/g) || []).length;

    const score = lines + nesting * 2 + conditionals * 2;

    if (score < 50) return '✅ Simple';
    if (score < 100) return '⚠️ Moderate';
    return '🚨 Complex';
};
