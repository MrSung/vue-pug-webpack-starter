module.exports = {
  extends: ['./node_modules/prettier-stylelint/config.js', 'stylelint-config-standard'],
  plugins: ['stylelint-order', 'stylelint-scss'],
  ignoreFiles: ['**/node_modules/**', './dist/**'],
  rules: {
    'at-rule-no-unknown': null,
    'selector-pseudo-class-no-unknown': null,
    'order/properties-alphabetical-order': true,
  },
};
