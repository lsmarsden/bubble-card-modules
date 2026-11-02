const config = {
  testEnvironment: "jsdom",
  globalSetup: "./testing/globalSetup.js",
  globalTeardown: "./testing/globalTeardown.js",
  testMatch: ["**/__tests__/**/*.(test|spec).[jt]s"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["modules/**/*.{js,ts}", "!**/__tests__/**"],
  coverageReporters: ["text", "html", "json-summary"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts$": "./testing/tsTransform.cjs",
  },
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Test Report",
        outputPath: "reports/test-report.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};

export default config;
