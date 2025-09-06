<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { formatDateToMonth } from '@/utils/dateUtil'

const router = useRouter()
const route = useRoute()
const attendanceForm = ref(null)
const isLoading = ref(false)

const form = reactive({
  employee_id: '',
  contract_id: '',
  month: '',
  attendanceList: []
})

const isWeekend = (dateStr) => {
  const day = new Date(dateStr).getDay()
  return day === 0 || day === 6
}

const getDayName = (dateStr) => {
  const day = new Date(dateStr).getDay()
  return ['日', '月', '火', '水', '木', '金', '土'][day]
}

const getRowStyle = ({ row }) => {
  const day = new Date(row.workday).getDay()
  return (day === 0 || day === 6) ? { backgroundColor: '#f0f0f0' } : {}
}

const markModified = (row) => {
  row.is_modified = true
}

const fetchOrGenerateMonthlyData = async (monthStr) => {
  axios.defaults.withCredentials = true
  try {
    const res = await axios.post('/attendance/registerview/registInit', {
      month: monthStr
    })
    form.attendanceList = res.data.data.attendanceList.map(row => {
      row.enabled = !isWeekend(row.workday)
      return row
    })
    form.employee_id = res.data.data.employee_id
  } catch (error) {
    ElMessage.error('データ取得に失敗しました')
    console.error(error)
  }
}

const submitForm = async () => {
  isLoading.value = true
  try {
    const modifiedRecords = form.attendanceList.filter(item => item.is_modified)
    if (modifiedRecords.length > 0) {
      await axios.post('/attendance/register', modifiedRecords)
    }
    ElMessage.success('登録が成功しました')
    router.push('/attendance')
  } catch (e) {
    ElMessage.error('登録に失敗しました')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  form.month = formatDateToMonth(route.query.month)
  fetchOrGenerateMonthlyData(form.month)
})
</script>

<template>
  <div class="attendance-wrapper">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-date" /> 勤怠登録画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="attendanceForm"
        :model="form"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員ID">
              <el-input
                v-model="form.employee_id"
                placeholder="社員IDを入力してください"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="契約ID">
              <el-input
                v-model="form.contract_id"
                placeholder="契約IDを入力してください"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="勤怠年月">
              <el-date-picker
                v-model="form.month"
                type="month"
                format="yyyy年MM月"
                value-format="yyyy-MM"
                placeholder="年月を選択"
                @change="fetchOrGenerateMonthlyData"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="table-scroll">
          <el-table
            :data="form.attendanceList"
            border
            :row-style="getRowStyle"
            height="500"
          >
            <el-table-column
              label="日付"
              prop="workday"
            >
              <template #default="{ row }">
                {{ row.workday }}<span v-if="getDayName(row.workday)">（{{ getDayName(row.workday) }}）</span>
              </template>
            </el-table-column>

            <el-table-column
              label="休日出勤"
              width="80"
            >
              <template #default="{ row }">
                <el-checkbox
                  v-if="isWeekend(row.workday)"
                  v-model="row.enabled"
                  @change="() => markModified(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="開始時間">
              <template #default="{ row }">
                <el-time-picker
                  v-model="row.start_time"
                  placeholder="開始時間"
                  value-format="HH:mm"
                  format="HH:mm"
                  style="width: 100%;"
                  :disabled="!row.enabled"
                  @change="() => markModified(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="終了時間">
              <template #default="{ row }">
                <el-time-picker
                  v-model="row.end_time"
                  placeholder="終了時間"
                  value-format="HH:mm"
                  format="HH:mm"
                  style="width: 100%;"
                  :disabled="!row.enabled"
                  @change="() => markModified(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="案件名">
              <template #default="{ row }">
                <el-input
                  v-model="row.case_name"
                  placeholder="案件名"
                  :disabled="!row.enabled"
                  @input="() => markModified(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="休憩時間(h)">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.break_hours"
                  :min="0"
                  :step="0.25"
                  :controls="true"
                  controls-position="right"
                  style="width: 100%;"
                  :disabled="!row.enabled"
                  @change="() => markModified(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="勤怠区分">
              <template #default="{ row }">
                <span>{{ row.attendance_type }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-row>
          <el-col
            :span="24"
            style="text-align: center; margin-top: 20px;"
          >
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitForm"
            >
              登録
            </el-button>
            <el-button
              type="default"
              @click="() => router.push('/attendance')"
            >
              戻る
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.attendance-wrapper {
  width: 100%;
  max-width: 1400px;
  overflow-x: auto;
  overflow-y: hidden;
}
.header-container {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}
.header-title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.section-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.table-scroll {
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
}
</style>