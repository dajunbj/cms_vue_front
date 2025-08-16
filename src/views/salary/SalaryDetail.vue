<template>
  <div class="page-container">
    <!-- フィルター条件 -->
    <el-row class="toolbar" justify="start" :gutter="20">
      <el-col :span="6">
        <el-select
          v-model="selectedEmployeeId"
          placeholder="社員名を選択"
          style="width: 100%;"
          :loading="loadingEmployees"
          @change="onSelectionChange"
          filterable
          clearable
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
          v-model="selectedFiscalYear"
          type="year"
          placeholder="給料年"
          format="YYYY年"
          value-format="YYYY"
          style="width: 100%;"
          @change="onSelectionChange"
          :disabled="!selectedEmployeeId"
        />
      </el-col>

      <el-col :span="4">
        <el-button
          type="primary"
          :icon="Document"
          :disabled="!combinedTable.length"
          @click="downloadCSV"
        >
          給与明細を出力
        </el-button>
      </el-col>
    </el-row>

    <!-- 明細表示テーブル -->
    <el-card shadow="never" body-class="table-card-body">
      <div class="table-scroll">
        <el-table
          :data="combinedTable"
          border
          style="width: 100%; font-size: 12px;"
          :row-class-name="rowClassName"
          :empty-text="tableEmptyText"
          v-loading="loadingDetails"
        >
          <el-table-column label="カテゴリ" width="150" fixed>
            <template #default="{ row, $index }">
              <span v-if="shouldShowGroup($index, row.group)">
                {{ row.group }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="item" label="項目" width="220" fixed />

          <el-table-column
            v-for="(month, colIndex) in months"
            :key="colIndex"
            :label="month"
            :prop="'month_' + (colIndex + 1)"
            width="120"
            align="right"
          >
            <!-- 作用域插槽可访问父作用域的 colIndex -->
            <template #default="{ row }">
              <template v-if="colIndex >= currentMonthIndex && !row.total">
                <el-input-number
                  v-model="row['month_' + (colIndex + 1)]"
                  :min="0"
                  size="small"
                  controls-position="right"
                  @change="onCellEdit(row, colIndex)"
                />
              </template>
              <template v-else>
                <strong v-if="row.total">{{ format(row['month_' + (colIndex + 1)]) }}</strong>
                <span v-else>{{ format(row['month_' + (colIndex + 1)]) }}</span>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { Document } from '@element-plus/icons-vue'

/** =========================
 *    UI 状态
 * ========================= */
const loadingEmployees = ref(false)
const loadingDetails   = ref(false)

const selectedFiscalYear = ref(null)  // '2024' 这样的字符串
const selectedEmployeeId = ref(null)  // 绑定社員ID
const employeeList       = ref([])    // [{ id: string, name: string }]

// 9月〜翌8月（会计年度）
const months = ['9月','10月','11月','12月','1月','2月','3月','4月','5月','6月','7月','8月']

// 以 员工ID → 年度 为 key 的明细缓存
// { [employeeId]: { [fiscalYear]: { personal:[], company:[] } } }
const salaryDataByYear = reactive({})

/** 当期月份在会计年度内的列序号（0..11）
 * 9=0,10=1,11=2,12=3,1=4,...,8=11
 */
const currentMonthIndex = computed(() => {
  const today = new Date()
  const m = today.getMonth() + 1 // 1..12
  return m >= 9 ? (m - 9) : (m + 3)
})

/** 选中社員名（用于导出文件名） */
const selectedEmployeeName = computed(() => {
  const emp = employeeList.value.find(e => e.id === selectedEmployeeId.value)
  return emp?.name || ''
})

/** 表格无数据时文案 */
const tableEmptyText = computed(() => {
  if (loadingDetails.value) return '読込中...'
  if (!selectedEmployeeId.value) return '社員を選択してください'
  if (!selectedFiscalYear.value) return '年を選択してください'
  return 'データがありません'
})

/** =========================
 *    定义项（后端字段→显示）
 * ========================= */
const ITEM_DEFS = {
  base_salary:         { label: '基本給',     group: '支給',   bucket: 'personal' },
  position_allowance:  { label: '職務手当',   group: '支給',   bucket: 'personal' },
  commuting_allowance: { label: '通勤手当',   group: '支給',   bucket: 'personal' },

  // 如需扩展控除/会社負担字段，在此增加：
  // income_tax:        { label: '所得税',     group: '控除',   bucket: 'personal' },
  // resident_tax:      { label: '住民税',     group: '控除',   bucket: 'personal' },
  // health_insurance:  { label: '健康保険',   group: '控除',   bucket: 'personal' },
  // welfare_pension:   { label: '厚生年金',   group: '控除',   bucket: 'personal' },
  // company_health_insurance: { label: '会社負担 健康保険', group: '会社負担', bucket: 'company' },
}

/** =========================
 *    工具函数
 * ========================= */

/** 解析 salary_month → 会计年度 + 月序号 */
function parseMonthIndexAndFiscalYear(salary_month) {
  const m = String(salary_month).match(/(\d{4})\D?(\d{1,2})/)
  if (!m) return { fiscalYear: 'Unknown', monthIndex: 0 }
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) // 1..12

  const monthIndex = mo >= 9 ? (mo - 9) : (mo + 3)
  const fiscalYear = String(mo >= 9 ? y : (y - 1))
  return { fiscalYear, monthIndex }
}

/** 生成某一分组的合计行 */
function makeTotalRow(rows, groupLabel, totalItemLabel) {
  if (!rows.length) return null
  const sum = Array(12).fill(0)
  rows.forEach(r => {
    for (let i = 0; i < 12; i++) sum[i] += Number(r.data[i] || 0)
  })
  return { type: groupLabel, item: totalItemLabel, total: true, data: sum }
}

/** =========================
 *    数据获取
 * ========================= */

/** 取得社員列表 */
async function fetchEmployeeList() {
  loadingEmployees.value = true
  try {
    alert("l1");
    const res = await axios.post('/salarydetail/listEmployees');
    alert("22");
    const raw = res.data?.data ?? []
    alert("33:"+raw.Id+"_"+raw.name);
    employeeList.value = raw.map((r, idx) => {
      if (typeof r === 'string') return { id: String(idx + 1), name: r }
      const id   = r.id ?? r.employee_id ?? r.emp_id ?? String(idx + 1)
      const name = r.name ?? r.employee_name ?? r.emp_name ?? `未命名(${id})`
      return { id: String(id), name: String(name) }
    })
    if (employeeList.value.length && !selectedEmployeeId.value) {
      selectedEmployeeId.value = employeeList.value[0].id
    }
  } catch (e) {
    console.error('社員取得エラー:', e)
  } finally {
    loadingEmployees.value = false
  }
}

/** 取得并构建某社員/年度的明细（支持仅传社員，后端返回多年度我们会缓存） */
async function fetchSalaryDataFromBackend(empId = selectedEmployeeId.value, fiscalYear = selectedFiscalYear.value) {
  if (!empId) return
  loadingDetails.value = true
  try {
    const response = await axios.post('/salarydetail/initSalaryDetail', {
      employee_id: empId || undefined,
      fiscal_year: fiscalYear || undefined,
      // 你的后端若要求其他参数，请在此补充
    })
    const list = response.data?.data || []

    const structured = {}
    for (const rec of list) {
      const emp = String(rec.employee_id || empId || '未指定')
      const { fiscalYear: fy, monthIndex } = parseMonthIndexAndFiscalYear(rec.salary_month)

      if (!structured[emp]) structured[emp] = {}
      if (!structured[emp][fy]) structured[emp][fy] = { personal: [], company: [] }

      // 扫描金额字段 → 填充到分桶
      for (const key of Object.keys(ITEM_DEFS)) {
        const def = ITEM_DEFS[key]
        const val = rec[key]
        if (val == null) continue

        const arr = structured[emp][fy][def.bucket] // 'personal' | 'company'
        let row = arr.find(r => r.type === def.group && r.item === def.label)
        if (!row) {
          row = { type: def.group, item: def.label, total: false, data: Array(12).fill(0) }
          arr.push(row)
        }
        row.data[monthIndex] += Number(val) || 0
      }
    }

    // 计算合计、差引
    Object.values(structured).forEach(yearMap => {
      Object.values(yearMap).forEach(bucketMap => {
        // personal
        const personal = bucketMap.personal
        const payRows   = personal.filter(r => r.type === '支給' && !r.total)
        const dedRows   = personal.filter(r => r.type === '控除' && !r.total)

        const payTotal = makeTotalRow(payRows, '支給', '総支給')
        const dedTotal = makeTotalRow(dedRows, '控除', '控除合計')
        if (payTotal) personal.push(payTotal)
        if (dedTotal) personal.push(dedTotal)
        if (payTotal && dedTotal) {
          const net = payTotal.data.map((v, i) => v - dedTotal.data[i])
          personal.push({ type: '支給', item: '差引支給額', total: true, data: net })
        }

        // company
        const company = bucketMap.company
        const compRows = company.filter(r => r.type === '会社負担' && !r.total)
        const compTotal = makeTotalRow(compRows, '会社負担', '会社負担合計')
        if (compTotal) company.push(compTotal)
      })
    })

    // 写入缓存
    const empKey = Object.keys(structured)[0]
    if (empKey) {
      if (!salaryDataByYear[empKey]) salaryDataByYear[empKey] = {}
      Object.assign(salaryDataByYear[empKey], structured[empKey])
    }

    // 初始化/校正 年度选择（优先当前会计年度）
    const years = Object.keys(salaryDataByYear[empId] || {})
    if (years.length > 0) {
      const now = new Date()
      const nowFY = String((now.getMonth() + 1) >= 9 ? now.getFullYear() : (now.getFullYear() - 1))
      if (!selectedFiscalYear.value || !years.includes(selectedFiscalYear.value)) {
        selectedFiscalYear.value = years.includes(nowFY) ? nowFY : years[0]
      }
    }
  } catch (e) {
    console.error('明細取得エラー:', e)
  } finally {
    loadingDetails.value = false
  }
}

/** =========================
 *    组合表数据
 * ========================= */
const combinedTable = computed(() => {
  const empId = selectedEmployeeId.value
  const fy    = selectedFiscalYear.value
  const personal = salaryDataByYear[empId]?.[fy]?.personal || []
  const company  = salaryDataByYear[empId]?.[fy]?.company  || []

  const build = (list, type) =>
    list.map(row => {
      const r = { group: row.type, item: row.item, total: row.total, type }
      for (let i = 0; i < 12; i++) r[`month_${i + 1}`] = row.data[i] || 0
      return r
    })

  return [...build(personal, 'personal'), ...build(company, 'company')]
})

/** =========================
 *    生命周期
 * ========================= */
onMounted(async () => {
  await fetchEmployeeList()
  if (selectedEmployeeId.value) {
    await fetchSalaryDataFromBackend(selectedEmployeeId.value, selectedFiscalYear.value)
  }
})

/** =========================
 *    事件处理
 * ========================= */
function onSelectionChange() {
  // 切换社員或年度时重新拉取（年度可能为空，让后端返多年度也可）
  fetchSalaryDataFromBackend(selectedEmployeeId.value, selectedFiscalYear.value)
}

function onCellEdit(row, colIndex) {
  // 此处仅前端修改单元格的显示值；如需“联动实时重算合计”，
  // 可在这里根据 row.group / row.total == false 找到原桶并重算合计行。
  // 推荐：编辑完成后调用保存API，成功后重新 fetch 一次，保证口径一致。
  console.log('Cell edited:', { item: row.item, monthIndex: colIndex })
}

/** =========================
 *    表格辅助
 * ========================= */
function shouldShowGroup(index, group) {
  if (index === 0) return true
  return combinedTable.value[index - 1]?.group !== group
}

function rowClassName({ row }) {
  if (row.total) return 'row-total'
  if (row.group === '支給') return 'row-pay'
  if (row.group === '控除') return 'row-deduction'
  if (row.group === '勤務情報') return 'row-attendance'
  if (row.group === '会社負担') return 'row-company'
  return ''
}

function format(value) {
  const v = Number(value || 0)
  return '¥' + v.toLocaleString()
}

/** =========================
 *    CSV 导出
 * ========================= */
function downloadCSV() {
  const rows = combinedTable.value.map(row => {
    return [row.group, row.item, ...Array(12).fill(0).map((_, i) => row[`month_${i + 1}`] || 0)]
  })

  let csvContent = 'カテゴリ,項目,' + months.join(',') + '\n'
  rows.forEach(r => {
    // 简单转义逗号/引号
    const escaped = r.map(cell => {
      const s = String(cell ?? '')
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    })
    csvContent += escaped.join(',') + '\n'
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)

  const emp = selectedEmployeeName.value || '未指定'
  const fy  = selectedFiscalYear.value || '年度不明'
  link.download = `${emp}_${fy}_給与明細.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f9f9f9;
}
.toolbar {
  margin-bottom: 16px;
}
.table-card-body {
  padding: 0;
}
.table-scroll {
  max-height: 900px;
  overflow-y: auto;
}

/* 行着色 */
::v-deep(.row-pay) {
  background-color: #e3f2fd !important;
}
::v-deep(.row-deduction) {
  background-color: #ffebee !important;
}
::v-deep(.row-attendance) {
  background-color: #eeeeee !important;
}
::v-deep(.row-company) {
  background-color: #fff8e1 !important;
}
::v-deep(.row-total) {
  background-color: #e8f5e9 !important;
  font-weight: bold;
}
</style>
