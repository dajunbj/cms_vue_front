<template>
  <el-row class="tac" style="text-align:left;width:100%;">
    <!-- 左侧菜单：默认样式 -->
    <el-col :span="24">
      <!-- 添加公司图标和公司标题区域 -->
      <div class="logo-container">
        <img :src="require('@/assets/company1.png')" alt="会社ロゴ" class="company-logo" />
        <span class="company-title">共栄ソフト</span>
      </div>

      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        router
        @open="handleOpen"
        @close="handleClose"
        unique-opened>
        <el-submenu index="1">
          <template slot="title">
            <i class="el-icon-user-solid"></i>
            <span>社員管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">社員一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
          </el-menu-item-group>
          <el-menu-item-group>
            <el-menu-item index="1-1">选项１－１</el-menu-item>
            <el-menu-item index="1-2">选项１－２</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <el-submenu index="2">
          <template slot="title">
            <i class="el-icon-date"></i>
            <span>勤怠管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">社員一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <el-submenu index="3">
          <template slot="title">
            <i class="el-icon-postcard"></i>
            <span>契約管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">社員一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
          </el-menu-item-group>
        </el-submenu>

        <el-submenu index="4">
          <template slot="title">
            <i class="el-icon-wallet"></i>
            <span>給料</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">社員一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
          </el-menu-item-group>
        </el-submenu>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "SidebarMenu",
  methods: {
    handleOpen(key, keyPath) {
      console.log("打开菜单:", key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log("关闭菜单:", key, keyPath);
    },
  },
};
</script>

<style scoped>
.el-menu-vertical-demo {
  width: 220px;
  height: 100vh;
  border-right: 1px solid #e6e6e6;
}
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%; /* 确保宽度覆盖整个区域 */
  padding: 15px 0;
  background-color: #f4f4f4; /* 浅灰色背景 */
  box-sizing: border-box;
}

.company-logo {
  max-width: 40px;
  height: auto;
  margin-right: 10px; /* 图标与文字间距 */
}
.company-title {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  color: #333; /* 深灰色字体 */
}
.tac {
  text-align: center;
}
h5 {
  margin: 10px 0;
}
</style>
