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
    // 直接关闭
    'vue/max-attributes-per-line': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/attributes-order': 'off',
    'vue/html-self-closing': 'off',
    // 或者降级为提示（不算 warning）
    // 'vue/max-attributes-per-line': 0,
  },
    overrides: [
    {
      files: ['**/*.vue'],
      rules: {
        'vue/max-attributes-per-line': 'off',
        // ...按需添加
      }
    }
  ]
}
