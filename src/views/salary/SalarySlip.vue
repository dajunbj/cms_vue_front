<template>
  <div class="page-container">
    <!-- フィルター -->
    <el-row
      class="toolbar"
      :gutter="16"
      justify="start"
    >
      <el-col :span="6">
        <el-select
          v-model="selectedEmployeeId"
          placeholder="社員名を選択"
          style="width: 100%"
          filterable
          clearable
          :loading="loadingEmployees"
          @change="fetchDetail"
        >
          <el-option
            v-for="emp in employeeList"
            :key="emp.id"
            :label="emp.name"
            :value="emp.id"
          />
        </el-select>
      </el-col>

      <el-col :span="6">
        <el-date-picker
          v-model="selectedMonth"
          type="month"
          placeholder="給料年月"
          value-format="YYYY-MM-01"
          format="YYYY年MM月"
          style="width: 100%"
          :disabled="!selectedEmployeeId"
          @change="fetchDetail"
        />
      </el-col>

      <el-col :span="4">
        <el-button
          type="primary"
          :icon="Document"
          :disabled="!detailLoaded"
          @click="downloadCSV"
        >
          明細票CSV出力
        </el-button>
      </el-col>
    </el-row>

    <!-- 明細票 -->
    <el-card
      class="slip"
      v-loading="loadingDetail"
      shadow="never"
      :body-style="{ padding: '16px 16px 8px' }"
    >
      <div class="slip-header">
        <div class="title">
          給与明細
        </div>
        <div class="meta">
          <div>
            <span>社員番号</span>
            <strong>{{ header.employeeNo || '—' }}</strong>
          </div>
          <div>
            <span>氏名</span>
            <strong>{{ header.employeeName || '—' }}</strong>
          </div>
          <div>
            <span>年月</span>
            <strong>{{ header.yyyymm || '—' }}</strong>
          </div>
        </div>
      </div>

      <!-- ① 勤怠 -->
      <div class="block">
        <div class="block-title">
          <span class="badge badge-blue">1</span>
          勤怠
        </div>
        <el-table
          :data="attendanceRows"
          border
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="a"
            label="就業日数"
            width="120"
            align="center"
          />
          <el-table-column
            prop="b"
            label="出勤日数"
            width="120"
            align="center"
          />
          <el-table-column
            prop="c"
            label="欠勤日数"
            width="120"
            align="center"
          />
          <el-table-column
            prop="d"
            label="特別休暇日数"
            width="140"
            align="center"
          />
          <el-table-column
            prop="e"
            label="有給休暇日数"
            width="140"
            align="center"
          />
          <el-table-column
            prop="f"
            label="有給休暇残日数"
            width="160"
            align="center"
          />
        </el-table>

        <el-table
          :data="attendanceTimeRows"
          border
          style="width: 100%; margin-top: 6px"
          size="small"
        >
          <el-table-column
            prop="a"
            label="労働時間"
            width="140"
            align="center"
          />
          <el-table-column
            prop="b"
            label="残業時間"
            width="140"
            align="center"
          />
          <el-table-column
            prop="c"
            label="深夜時間"
            width="140"
            align="center"
          />
          <el-table-column
            prop="d"
            label="休日労働時間"
            width="160"
            align="center"
          />
          <el-table-column
            prop="e"
            label="遅刻早退時間"
            width="160"
            align="center"
          />
        </el-table>
      </div>

      <!-- ② 支給 -->
      <div class="block">
        <div class="block-title">
          <span class="badge badge-orange">2</span>
          支給
        </div>
        <el-table
          :data="payRows"
          border
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="label"
            label=""
            width="220"
          />
          <el-table-column
            prop="value"
            label=""
            align="right"
          >
            <template #default="{ row }">
              <span>{{ formatYen(row.value) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ③ 控除 -->
      <div class="block">
        <div class="block-title">
          <span class="badge badge-purple">3</span>
          控除
        </div>
        <el-table
          :data="dedRows"
          border
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="label"
            label=""
            width="220"
          />
          <el-table-column
            prop="value"
            label=""
            align="right"
          >
            <template #default="{ row }">
              <span>{{ formatYen(row.value) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 集計 -->
      <div class="summary">
        <div class="cell">
          <div class="k">
            総支給額
          </div>
          <div class="v">
            {{ formatYen(totals.total_payment) }}
          </div>
        </div>
        <div class="cell">
          <div class="k">
            総控除額
          </div>
          <div class="v">
            {{ formatYen(totals.total_deduction) }}
          </div>
        </div>
        <div class="cell strong">
          <div class="k">
            差引支給額
          </div>
          <div class="v">
            {{ formatYen(totals.net_payment) }}
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { Document } from '@element-plus/icons-vue'

const loadingEmployees = ref(false)
const loadingDetail = ref(false)
const employeeList = ref([])
const selectedEmployeeId = ref(null)
const selectedMonth = ref(null) // 'YYYY-MM-01'
const detail = ref(null) // 后端返回的 salarydetail 一条记录+补充信息
const detailLoaded = computed(() => !!detail.value)

const header = computed(() => ({
  employeeNo: detail.value?.employee_code || detail.value?.employee_id,
  employeeName: detail.value?.employee_name || '',
  yyyymm: (detail.value?.salary_month?.substring(0, 7)?.replace('-', '年') || '') + (detail.value?.salary_month ? '月' : '')
}))

// === 勤怠区（无字段则显示0/00:00） ===
const attendanceRows = computed(() => [{
  a: detail.value?.working_days ?? 0,
  b: detail.value?.working_days ?? 0, // 暂与出勤日数同
  c: detail.value?.absent_days ?? 0,
  d: detail.value?.special_leave_days ?? 0,
  e: detail.value?.paid_leave_days ?? 0,
  f: detail.value?.paid_leave_remain_days ?? 0
}])

const attendanceTimeRows = computed(() => [{
  a: fmtH(detail.value?.working_hours ?? 0),
  b: fmtH(detail.value?.overtime_hours ?? 0),
  c: fmtH(detail.value?.midnight_hours ?? 0),
  d: fmtH(detail.value?.holiday_work_hours ?? 0),
  e: fmtH(detail.value?.late_early_hours ?? 0)
}])

// === 支给 ===
const payRows = computed(() => ([
  { label: '基本給', value: detail.value?.base_salary || 0 },
  { label: '残業手当', value: detail.value?.overtime_allowance || 0 },
  { label: '深夜労働手当', value: detail.value?.midnight_allowance || 0 },
  { label: '休日労働手当', value: detail.value?.holiday_allowance || 0 },
  { label: '資格手当', value: detail.value?.qualification_allowance || 0 },
  { label: '役職手当', value: detail.value?.position_allowance || 0 },
  { label: '住宅手当', value: detail.value?.housing_allowance || 0 },
  { label: '通勤手当', value: detail.value?.commuting_allowance || 0 }
].filter(r => r.value !== null && r.value !== undefined)))

// === 控除 ===
const dedRows = computed(() => ([
  { label: '健康保険', value: detail.value?.health_insurance || 0 },
  { label: '介護保険', value: detail.value?.nursing_insurance || 0 },
  { label: '厚生年金', value: detail.value?.welfare_pension || 0 },
  { label: '雇用保険', value: detail.value?.employment_insurance || 0 },
  { label: '税額合計', value: (detail.value?.income_tax || 0) + (detail.value?.resident_tax || 0) }
].filter(r => r.value !== null && r.value !== undefined)))

const totals = computed(() => ({
  total_payment: detail.value?.total_payment || sum(payRows.value.map(x => x.value)),
  total_deduction: detail.value?.total_deduction || sum(dedRows.value.map(x => x.value)),
  net_payment:
    detail.value?.net_payment
    ?? ((detail.value?.total_payment || sum(payRows.value.map(x => x.value)))
      - (detail.value?.total_deduction || sum(dedRows.value.map(x => x.value))))
}))

function sum (arr) { return arr.reduce((a, b) => a + Number(b || 0), 0) }
function fmtH (h) { // 小时数(小数) -> "H:MM"
  const v = Number(h || 0)
  const totalMin = Math.round(v * 60)
  const H = Math.floor(totalMin / 60)
  const M = String(totalMin % 60).padStart(2, '0')
  return `${H}:${M}`
}
function formatYen (v) { return '¥' + Number(v || 0).toLocaleString() }

async function fetchEmployees () {
  loadingEmployees.value = true
  try {
    const res = await axios.post('/salary/listEmployees')
    employeeList.value = (res.data?.data || []).map((r, i) => ({
      id: String(r.id ?? r.employee_id ?? (i + 1)),
      name: r.name ?? r.employee_name ?? `未命名(${i + 1})`
    }))
    if (employeeList.value.length && !selectedEmployeeId.value) {
      selectedEmployeeId.value = employeeList.value[0].id
    }
  } finally {
    loadingEmployees.value = false
  }
}

async function fetchDetail () {
  if (!selectedEmployeeId.value || !selectedMonth.value) return
  loadingDetail.value = true
  try {
    const res = await axios.post('/salary/getDetail', {
      employee_id: selectedEmployeeId.value,
      salary_month: selectedMonth.value
    })
    detail.value = res.data?.data || null
  } finally {
    loadingDetail.value = false
  }
}

function downloadCSV () {
  const lines = []
  lines.push(['社員番号', header.value.employeeNo, '氏名', header.value.employeeName, '年月', header.value.yyyymm])
  lines.push([])
  lines.push(['①勤怠'])
  lines.push(['就業日数', '出勤日数', '欠勤日数', '特別休暇日数', '有給休暇日数', '有給休暇残日数'])
  const a = attendanceRows.value[0]
  lines.push([a.a, a.b, a.c, a.d, a.e, a.f])
  lines.push(['労働時間', '残業時間', '深夜時間', '休日労働時間', '遅刻早退時間'])
  const t = attendanceTimeRows.value[0]
  lines.push([t.a, t.b, t.c, t.d, t.e])

  lines.push([])
  lines.push(['②支給'])
  payRows.value.forEach(r => lines.push([r.label, r.value]))
  lines.push(['支給計', totals.value.total_payment])

  lines.push([])
  lines.push(['③控除'])
  dedRows.value.forEach(r => lines.push([r.label, r.value]))
  lines.push(['控除計', totals.value.total_deduction])

  lines.push([])
  lines.push(['差引支給額', totals.value.net_payment])

  const csv = lines
    .map(row =>
      row
        .map(cell => {
          const s = String(cell ?? '')
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(',')
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const aTag = document.createElement('a')
  aTag.href = URL.createObjectURL(blob)
  aTag.download = `${header.value.employeeName || '未指定'}_${header.value.yyyymm || ''}_給与明細.csv`
  document.body.appendChild(aTag)
  aTag.click()
  document.body.removeChild(aTag)
  URL.revokeObjectURL(aTag.href)
}

onMounted(async () => {
  await fetchEmployees()
  // 默认选当月
  if (!selectedMonth.value) {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    selectedMonth.value = `${y}-${m}-01`
  }
  await fetchDetail()
})
</script>

<style scoped>
.page-container { padding: 16px; background: #f7f8fa; }
.toolbar { margin-bottom: 12px; }
.slip { background: #fff; }
.slip-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; }
.slip-header .title { font-size: 18px; font-weight: 600; }
.slip-header .meta { display: flex; gap: 16px; }
.slip-header .meta span { color: #666; margin-right: 6px; }
.block { margin-top: 12px; }
.block-title { font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
.badge { display: inline-flex; width: 22px; height: 22px; border-radius: 50%; color: #fff; align-items: center; justify-content: center; font-weight: 700; }
.badge-blue { background: #3f51b5; }
.badge-orange { background: #ff9800; }
.badge-purple { background: #7e57c2; }
.summary {
  margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;
  background: #f0f3f7; padding: 10px; border-radius: 6px;
}
.summary .cell { background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; }
.summary .cell .k { color: #666; }
.summary .cell.strong { background: #e8f5e9; border-color: #c8e6c9; font-weight: 700; }
</style>
