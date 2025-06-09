import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import axios from 'axios'

// 设置 Axios 的基础 URL
axios.defaults.baseURL = 'http://localhost:8080'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建 Vue 应用实例
const app = createApp(App)

// 添加插件
app.use(router)
app.use(store)
app.use(ElementPlus)

// 添加全局属性（相当于 Vue 2 的 Vue.prototype.$axios）
app.config.globalProperties.$axios = axios

// 注册所有图标为全局组件（推荐）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 挂载应用
app.mount('#app')
