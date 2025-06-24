const config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.(test|spec).[jt]s'],
    moduleFileExtensions: ['ts', 'js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'modules/**/*.{js,ts}',
        '!**/__tests__/**'
    ],
    coverageReporters: ['text', 'html', 'json-summary'],
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: './tsconfig.json'
        }
    },
    transform: {},
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'Test Report',
            outputPath: 'reports/test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true
        }]
    ]
};


export default config;