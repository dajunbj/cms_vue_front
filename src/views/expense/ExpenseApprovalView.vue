<template>
  <div class="p-4">
    <el-card>
      <h2 class="text-xl font-bold mb-4">経費申請の承認</h2>
      <el-table :data="requests" style="width: 100%" @row-click="selectRequest">
        <el-table-column prop="id" label="申請ID" width="100" />
        <el-table-column prop="applicant" label="申請者" />
        <el-table-column prop="summary" label="摘要" />
        <el-table-column prop="total_amount" label="金額" />
        <el-table-column prop="created_at" label="申請日" />
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="申請詳細" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="摘要">{{ selected.summary }}</el-descriptions-item>
        <el-descriptions-item label="合計金額">¥{{ selected.total_amount }}</el-descriptions-item>
        <el-descriptions-item label="申請日">{{ selected.created_at }}</el-descriptions-item>
      </el-descriptions>

      <h3 class="mt-4 mb-2 font-semibold">領収書一覧</h3>
      <el-table :data="selected.receipts">
        <el-table-column prop="store_name" label="店名" />
        <el-table-column prop="issue_date" label="日付" />
        <el-table-column prop="amount" label="金額" />
      </el-table>

      <template #footer>
        <el-button @click="dialogVisible = false">閉じる</el-button>
        <el-button type="danger" @click="reject">差し戻し</el-button>
        <el-button type="primary" @click="approve">承認する</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const requests = ref([]);
const selected = ref({ receipts: [] });
const dialogVisible = ref(false);

onMounted(async () => {
  const res = await axios.get('/api/expenses/pending');
  requests.value = res.data;
});

const selectRequest = (row) => {
  selected.value = row;
  dialogVisible.value = true;
};

const approve = async () => {
  await axios.post(`/api/expenses/${selected.value.id}/approve`);
  ElMessage.success('承認しました');
  dialogVisible.value = false;
  requests.value = requests.value.filter((r) => r.id !== selected.value.id);
};

const reject = async () => {
  await axios.post(`/api/expenses/${selected.value.id}/reject`);
  ElMessage.info('差し戻しました');
  dialogVisible.value = false;
  requests.value = requests.value.filter((r) => r.id !== selected.value.id);
};
</script>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}
.mb-2 {
  margin-bottom: 0.5rem;
}
</style>
