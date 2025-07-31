<template>
  <div class="p-4">
    <el-card>
      <h2 class="text-xl font-bold mb-4">申請履歴</h2>
      <el-form :inline="true" :model="filters" class="mb-4">
        <el-form-item label="期間">
          <el-date-picker v-model="filters.range" type="daterange" start-placeholder="開始日" end-placeholder="終了日" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadHistory">検索</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="exportCsv">CSV出力</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="history" style="width: 100%">
        <el-table-column prop="id" label="申請ID" width="100" />
        <el-table-column prop="summary" label="摘要" />
        <el-table-column prop="total_amount" label="金額" />
        <el-table-column prop="status" label="状態" />
        <el-table-column prop="created_at" label="申請日" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

const filters = ref({ range: [] })
const history = ref([])

const loadHistory = async () => {
  const [start, end] = filters.value.range || []
  const params = {
    start_date: start ? dayjs(start).format('YYYY-MM-DD') : '',
    end_date: end ? dayjs(end).format('YYYY-MM-DD') : ''
  }
  const res = await axios.get('/api/expenses/history', { params })
  history.value = res.data
}

const exportCsv = async () => {
  const res = await axios.get('/api/expenses/export', { responseType: 'blob' })
  const blob = new Blob([res.data], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = 'expense_history.csv'
  link.click()
}
</script>
