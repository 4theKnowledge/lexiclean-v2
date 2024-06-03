module.exports = {
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^\\/]+$"],
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  globalTeardown: "./tests/utils/teardown.js",
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
};
