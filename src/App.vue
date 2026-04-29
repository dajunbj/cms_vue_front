<template>
  <div
    id="app"
    class="layout"
  >
    <!-- 登录页面不显示菜单 -->
    <div
      v-if="route.path !== '/login' && route.path !== '/changePwd'"
      class="sidebar"
    >
      <SidebarMenu />
    </div>

    <!-- 右侧内容区域 -->
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import SidebarMenu from './components/SidebarMenu.vue'

const route = useRoute()
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden; /* 🚫 禁止全局滚动条 */
  height: 100%;
}

#app {
  height: 100%;
}

.layout {
  display: flex;
  height: 100vh;
  overflow: hidden; /* 🚫 防止外层滚动 */
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #FFFFFF, #F0F4F8); /* 浅色背景 */
  color: #333333;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto; /* ✅ 让内容区域可以滚动 */
  background: linear-gradient(180deg, #FFFFFF, #F0F4F8);
  color: #333333;
}
</style>
