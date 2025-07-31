<template>
  <div class="p-4">
    <el-card>
      <h2 class="text-xl font-bold mb-4">経費申請作成</h2>
      <el-form :model="form" label-width="120px">
        <el-form-item label="申請摘要">
          <el-input v-model="form.summary" placeholder="例: 出張費用" />
        </el-form-item>

        <el-form-item label="領収書選択">
          <el-table :data="receipts" style="width: 100%">
            <el-table-column type="selection" width="50" />
            <el-table-column prop="store_name" label="店名" />
            <el-table-column prop="issue_date" label="日付" />
            <el-table-column prop="amount" label="金額" />
          </el-table>
        </el-form-item>

        <el-button type="primary" @click="submitExpense">申請する</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const form = ref({ summary: '' })
const receipts = ref([])
const selectedReceipts = ref([])

onMounted(async () => {
  const res = await axios.get('/api/receipts?status=確認済')
  receipts.value = res.data
})

const submitExpense = async () => {
  const selected = receipts.value.filter(r => r.selected)
  if (selected.length === 0) return ElMessage.warning('領収書を選択してください')

  const payload = {
    summary: form.value.summary,
    receipt_ids: selected.map(r => r.id)
  }
  await axios.post('/api/expenses/apply', payload)
  ElMessage.success('申請しました')
  form.value.summary = ''
}
</script>
