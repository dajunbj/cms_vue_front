import {
    defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 自动导入 Element Plus 样式
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {
    ElementPlusResolver
} from 'unplugin-vue-components/resolvers'

export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    server: {
        port: 8081, // 可自定义
        open: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8080', // 代理后端 Spring Boot
                changeOrigin: true
            }
        }
    }
})
