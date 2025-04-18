export function formatCode(code) {
    if (window.prettier && window.prettierPlugins && window.prettierPlugins.babel) {
        try {
            return window.prettier.format(code, {
                parser: "babel",
                plugins: [window.prettierPlugins.babel],
                semi: true,
                singleQuote: true,
                trailingComma: "all",
            });
        } catch (err) {
            console.error("Prettier formatting error:", err);
            return code; // fallback to original code
        }
    } else {
        console.warn("Prettier or Babel parser not loaded.");
        return code;
    }
}
