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
.layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 220px;
  background: linear-gradient(180deg, #FFFFFF, #F0F4F8); /* 简约浅色渐变背景 */
  color: #333333;
}
.content {
  flex: 1;
  padding: 20px;
  background: linear-gradient(180deg, #FFFFFF, #F0F4F8); /* 简约浅色渐变背景 */
  color: #333333; /* 深灰色字体 */
}
</style>