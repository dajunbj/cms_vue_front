<template>
  <el-row class="tac">
    <el-col :span="24">
      <div class="logo-title-row">
        <img :src="logo" alt="会社ロゴ" class="company-logo" />
        <h3 class="company-title">精算支援システム</h3>
      </div>

      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        router
        unique-opened
        @open="handleOpen"
        @close="handleClose"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><User /></el-icon>
            <span>社員管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">社員一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
            <el-menu-item index="/employee">履歴</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu v-if="permissions.showPayroll" index="2">
          <template #title>
            <el-icon><Wallet /></el-icon>
            <span>給料管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/employee">給料一覧</el-menu-item>
            <el-menu-item index="/setting">休暇一覧</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu v-if="permissions.showExpenseApproval" index="3">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>費用OCR</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/file/receipt">費用申請</el-menu-item>
            <el-menu-item index="/file/receipt">領収書</el-menu-item>
            <el-menu-item index="/setting">ファイル一覧</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu v-if="permissions.showSettlement" index="4">
          <template #title>
            <el-icon><DataAnalysis /></el-icon>
            <span>会社決算</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/settlement/summary">損益表</el-menu-item>
            <el-menu-item index="/settlement/statement">決算書類</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu v-if="permissions.showFinalAdjustment" index="5">
          <template #title>
            <el-icon><DocumentChecked /></el-icon>
            <span>年末調整</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/final-adjustment">年末調整一覧</el-menu-item>
            <el-menu-item index="/final-adjustment/entry"
              >申告入力</el-menu-item
            >
          </el-menu-item-group>
        </el-sub-menu>

        <el-sub-menu v-if="permissions.showExpense" index="9">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>経費管理</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/expense/receipt-upload">領収書アップロード</el-menu-item>
            <el-menu-item index="/expense/receipt-list">経費申請</el-menu-item>
            <el-menu-item index="/expense/approval">経費承認</el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </el-col>
  </el-row>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { PLAN_PERMISSIONS } from "@/permissions/plan";
import logo from "@/assets/company1.png";

// 图标
import {
  User,
  Wallet,
  Document,
  DocumentChecked,
  DataAnalysis,
  Search,
} from "@element-plus/icons-vue";

const store = useStore();
const planCode = computed(() => store.state.planCode);
const permissions = computed(() => PLAN_PERMISSIONS[planCode.value] || {});

const canAccess = ref(false);
onMounted(() => {
  canAccess.value = sessionStorage.getItem("right") !== "社員";
});

const handleOpen = (key, keyPath) => {
  console.log("打开菜单:", key, keyPath);
};
const handleClose = (key, keyPath) => {
  console.log("关闭菜单:", key, keyPath);
};
</script>

<style scoped>
.logo-title-row {
  display: flex;
  align-items: center;
  padding: 10px 20px;
}

.company-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.company-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}
</style>
