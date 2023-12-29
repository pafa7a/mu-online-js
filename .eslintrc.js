module.exports = {
  'env': {
    'browser': true,
    'node': true,
    'commonjs': true,
    'es2016': true,
    'mocha': true
  },
  'extends': ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  'parser': '@typescript-eslint/parser',
  'plugins': ['@typescript-eslint'],
  'overrides': [],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'globals': {
    'process': true,
    'Buffer': true
  },
  'rules': {
    'indent': [
      'error',
      2,
      {
        'SwitchCase': 1
      }
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
