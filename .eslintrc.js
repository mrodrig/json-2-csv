module.exports = {
    root: true,
    env: {
        es2022: true,
        node: true,
        mocha: true,
    },
    parserOptions: {
        ecmaVersion: 13,
        project: ['tsconfig.json'],
        sourceType: 'module',
        tsconfigRootDir: __dirname,
    },
    extends: [
        'eslint:recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: '@typescript-eslint/parser',
    ignorePatterns: [
        '/lib/**/*', // Ignore built files.
    ],
    plugins: [
        '@typescript-eslint',
        'import',
    ],
    rules: {
        // Basic ES6
        indent: [
            'error', 4, { // use 4 spaces for indents
                'SwitchCase': 1, // indent case within switch
            }
        ],
        'linebreak-style': 0, // mixed environment let git config enforce line endings
        quotes: ['error', 'single'],
        semi: ['error', 'always'],
        'no-var': 'error',
        'no-console': 0, // allow use of console.log,
        'arrow-body-style': [0, 'always'],
        'max-len': 0,
        'camelcase': 1,
        'import/no-unresolved': [
            'error', {
                // https://github.com/firebase/firebase-admin-node/discussions/1359
                ignore: ['^firebase-admin/.+'],
            },
        ],
        '@typescript-eslint/consistent-type-definitions': 'warn'
    },
};