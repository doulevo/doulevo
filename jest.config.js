module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: [
        "<rootDir>/build",
        "<rootDir>/test-project",
        "<rootDir>/node_modules"
    ]
};