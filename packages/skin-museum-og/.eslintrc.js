module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // This package generates OG images using <img>
    "@next/next/no-img-element": "off",
  },
};
