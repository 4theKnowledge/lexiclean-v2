export default {
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
  testEnvironment: "node",
  globalTeardown: "./tests/teardown.js",
};
