module.exports = {
  root: true,
  extends: ["@react-native-community", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": [
      "warn",
      {
        singleQuote: true,
        trailingComma: "all",
        semi: true,
        printWidth: 100,
      },
    ],
  },
};
