const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: true, // 开启生产环境的 source map
  configureWebpack: {
    devtool: 'source-map', // 在开发环境启用 source map
  },
});
