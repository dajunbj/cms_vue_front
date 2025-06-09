module.exports = {
  root: true,
  env: {
    browser: true,
    node: true, // ← 如果你有 vue.config.js 或使用 require/module
    es2020: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    requireConfigFile: false,
  },
  globals: {
    defineOptions: 'readonly',
  },
  plugins: ['vue'],
  extends: [
    'eslint:recommended',
    'plugin:vue/recommended', // 若你升级 CLI 后可换成 vue3-recommended
  ],
  rules: {
    // 你可以按需关闭警告
    // 'no-console': 'off',
    // 'no-unused-vars': 'warn',
  },
}
