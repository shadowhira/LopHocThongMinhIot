module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "react-native-css-interop" }],
      "nativewind/babel",
    ],
  };
};