module.exports = {
    preset: 'react',
    transform: {
        '^.+\\.jsx?$': 'babel-jest', // Ensure Babel is set up to handle JSX
    },
    testEnvironment: 'jsdom',
    verbose: true,
};
