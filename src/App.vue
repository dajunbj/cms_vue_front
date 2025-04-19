<template>
  <div id="app" class="layout">
    <!-- 登录页面不显示菜单 -->
    <div v-if="$route.path !== '/login'" class="sidebar">
      <SidebarMenu />
    </div>

    <!-- 右侧内容区域 -->
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import SidebarMenu from "./components/SidebarMenu.vue";

export default {
  name: "App",
  components: { SidebarMenu },
};
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
  overflow: hidden; /* 🚫 禁止内容整体滚动，只允许子组件内部滚动 */
  background: linear-gradient(180deg, #FFFFFF, #F0F4F8);
  color: #333333;
}
</style>
