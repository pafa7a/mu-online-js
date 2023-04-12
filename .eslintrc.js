module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es2021': true,
    'mocha': true
  },
  'extends': 'eslint:recommended',
  'overrides': [
  ],
  'parserOptions': {
    'ecmaVersion': 'latest'
  },
  'globals': {
    'process': true,
    'Buffer': true
  },
  'rules': {
    'indent': [
      'error',
      2
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ],
    'no-control-regex': 'off',
  },
  'ignorePatterns': ['node_modules/**'],
};
