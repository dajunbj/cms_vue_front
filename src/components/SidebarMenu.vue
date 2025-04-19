<template>
  <div style="width: 100%; max-width: 1000px; overflow-y: hidden;">


    <div class="menu-section-container">

      <div class="logo-container">
        <img :src="require('@/assets/company1.png')" alt="会社ロゴ" class="company-logo" />
        <span class="company-title">営業支援</span>
      </div>

      <div class="menu-container">
        <el-menu
          default-active="2"
          router
          @open="handleOpen"
          @close="handleClose"
          unique-opened style="border-right:none;background-color: transparent;">
          <el-submenu index="1"  style="border-right:none;background-color: transparent;">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span>社員管理</span>
            </template>
            <el-menu-item-group style="border-right:none;background-color: transparent;">
              <el-menu-item index="/employee" style="border-right:none;background-color: transparent;">社員一覧</el-menu-item>
              <el-menu-item index="/setting" style="border-right:none;background-color: transparent;">休暇一覧</el-menu-item>
              <el-menu-item index="/employee">履歴</el-menu-item>
            </el-menu-item-group>

          </el-submenu>

          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-date"></i>
              <span>勤怠管理</span>
            </template>
            <el-menu-item-group>
              
              <el-menu-item index="/attendance/listview">勤怠一覧</el-menu-item>
              <el-menu-item index="/attendance/registview">勤怠登録</el-menu-item>
              <el-menu-item index="/setting">休暇申請</el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-postcard"></i>
              <span>契約管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/contract">契約一覧</el-menu-item>
              <el-menu-item index="/contract/register">新規契約</el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="4">
            <template slot="title">
              <i class="el-icon-wallet"></i>
              <span>給料</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/employee">給料一覧</el-menu-item>
              <el-menu-item index="/setting">休暇一覧</el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="5" v-if="handleCanAccess">
            <template slot="title">
              <i class="el-icon-wallet"></i>
              <span>顧客管理</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/customer">総合一覧</el-menu-item>
              <el-menu-item index="/customer/register">顧客登録</el-menu-item>
              <el-menu-item index="/customer/registerRes">責任者登録</el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="6">
            <template slot="title">
              <i class="el-icon-date"></i>
              <span>費用申請</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/file/receipt">費用申請</el-menu-item>
              <el-menu-item index="/file/receipt">領収書</el-menu-item>
              <el-menu-item index="/setting">ファイル一覧</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SidebarMenu",
  data() {
    return {
      canAccess: false,
    };
  },
  methods: {

    handleCanAccess() {
      if(sessionStorage.getItem("right")==="社員"){
        this.canAccess = false;
      }
      else{
        this.canAccess = true;
      }
    },
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
.header-container {
  background-color: #F5F7FA;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}

.menu-section-container {
  background-color: #F5F7FA;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: transparent; /* 背景变为透明 */
}
.company-logo {
  max-width: 40px;
  height: auto;
  margin-right: 10px;
}
.company-title {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
  color: #333333;
}

.el-menu{
  background-color: transparent; /* 背景变为透明 */
}
.el-menu-item.is-active {
  background-color: #D8E6F3 !important;
  color: #333333 !important;
}
.el-menu-item span {
  color: #333333;
}
</style>