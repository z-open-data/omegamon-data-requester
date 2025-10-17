/* eslint-disable */
const eslintReactConfig = require('devtools-configs/eslintReact.cjs');

module.exports = {
  ...eslintReactConfig,
  rules: {
    ...eslintReactConfig.rules,
    'no-empty-pattern': 'off',
    'react/jsx-uses-react': 'off',
  },
};
