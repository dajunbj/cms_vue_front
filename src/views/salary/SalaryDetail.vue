<template>
  <div class="page-container">
    <!-- フィルター -->
    <el-row class="toolbar" :gutter="16" justify="start">
      <el-col :span="6">
        <el-select v-model="selectedEmployeeId"
                   placeholder="社員名を選択"
                   style="width:100%"
                   filterable clearable
                   :loading="loadingEmployees"
                   @change="fetchDetail">
          <el-option v-for="emp in employeeList"
                     :key="emp.id"
                     :label="emp.name"
                     :value="emp.id" />
        </el-select>
      </el-col>
      <el-col :span="6">
        <el-date-picker v-model="selectedMonth"
                        type="month"
                        placeholder="給料年月"
                        value-format="YYYY-MM-01"
                        format="YYYY年MM月"
                        style="width:100%"
                        :disabled="!selectedEmployeeId"
                        @change="fetchDetail" />
      </el-col>
      <el-col :span="4">
        <el-button type="primary" :icon="Document" :disabled="!detail"
                   @click="downloadCSV">明細票CSV出力</el-button>
      </el-col>
    </el-row>

    <!-- 明細票 -->
    <el-card class="slip" shadow="never" v-loading="loadingDetail">
      <div class="slip-header">
        <div class="title">給与明細</div>
        <div class="meta">
          <div><span>社員番号</span><strong>{{ detail?.employee_id || '—' }}</strong></div>
          <div><span>氏名</span><strong>{{ detail?.employee_name || '—' }}</strong></div>
          <div><span>年月</span><strong>{{ headerYyyymm }}</strong></div>
        </div>
      </div>

      <!-- ① 勤怠 -->
      <div class="block">
        <div class="block-title"><span class="badge badge-blue">1</span> 勤怠</div>
        <el-table :data="attendanceRows" border size="small" style="width:100%">
          <el-table-column prop="work_days" label="就業日数" align="center"/>
          <el-table-column prop="attend_days" label="出勤日数" align="center"/>
          <el-table-column prop="absent_days" label="欠勤日数" align="center"/>
          <el-table-column prop="special_leave" label="特別休暇日数" align="center"/>
          <el-table-column prop="paid_leave" label="有給休暇日数" align="center"/>
          <el-table-column prop="remain_leave" label="有給休暇残日数" align="center"/>
        </el-table>
        <el-table :data="attendanceTimeRows" border size="small" style="width:100%;margin-top:6px">
          <el-table-column prop="work_time" label="労働時間" align="center"/>
          <el-table-column prop="ot_time" label="残業時間" align="center"/>
          <el-table-column prop="midnight_time" label="深夜時間" align="center"/>
          <el-table-column prop="holiday_time" label="休日労働時間" align="center"/>
          <el-table-column prop="lateearly_time" label="遅刻早退時間" align="center"/>
        </el-table>
      </div>

      <!-- ② 支給 -->
      <div class="block">
        <div class="block-title"><span class="badge badge-orange">2</span> 支給</div>
        <el-row :gutter="12">
          <el-col v-for="(col,idx) in payCols" :key="idx" :span="6">
            <el-table :data="col" border size="small" style="width:100%">
              <el-table-column prop="label" label="" width="150"/>
              <el-table-column prop="value" label="" align="right">
                <template #default="{row}">{{ formatYen(row.value) }}</template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>

      <!-- ③ 控除 -->
      <div class="block">
        <div class="block-title"><span class="badge badge-purple">3</span> 控除</div>
        <el-row :gutter="12">
          <el-col v-for="(col,idx) in dedCols" :key="idx" :span="6">
            <el-table :data="col" border size="small" style="width:100%">
              <el-table-column prop="label" label="" width="150"/>
              <el-table-column prop="value" label="" align="right">
                <template #default="{row}">{{ formatYen(row.value) }}</template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </div>

      <!-- 集計 -->
      <div class="summary">
        <div class="cell"><div class="k">総支給額</div><div class="v">{{ formatYen(totals.total_payment) }}</div></div>
        <div class="cell"><div class="k">総控除額</div><div class="v">{{ formatYen(totals.total_deduction) }}</div></div>
        <div class="cell strong"><div class="k">差引支給額</div><div class="v">{{ formatYen(totals.net_payment) }}</div></div>
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
const selectedMonth = ref(null)
const detail = ref(null)

const headerYyyymm = computed(() => {
  if (!detail.value?.salary_month) return '—'
  return detail.value.salary_month.substring(0,7).replace('-', '年') + '月'
})

// 勤怠
const attendanceRows = computed(() => [{
  work_days: detail.value?.working_days ?? 0,
  attend_days: detail.value?.working_days ?? 0,
  absent_days: detail.value?.absent_days ?? 0,
  special_leave: detail.value?.special_leave_days ?? 0,
  paid_leave: detail.value?.paid_leave_days ?? 0,
  remain_leave: detail.value?.paid_leave_remain_days ?? 0
}])
const attendanceTimeRows = computed(() => [{
  work_time: fmtH(detail.value?.working_hours ?? 0),
  ot_time: fmtH(detail.value?.overtime_hours ?? 0),
  midnight_time: fmtH(detail.value?.midnight_hours ?? 0),
  holiday_time: fmtH(detail.value?.holiday_work_hours ?? 0),
  lateearly_time: fmtH(detail.value?.late_early_hours ?? 0)
}])

// 支給/控除列表
const payRows = computed(() => [
  { label:'基本給', value: detail.value?.base_salary||0 },
  { label:'残業手当', value: detail.value?.overtime_allowance||0 },
  { label:'深夜労働手当', value: detail.value?.midnight_allowance||0 },
  { label:'休日労働手当', value: detail.value?.holiday_allowance||0 },
  { label:'資格手当', value: detail.value?.qualification_allowance||0 },
  { label:'役職手当', value: detail.value?.position_allowance||0 },
  { label:'住宅手当', value: detail.value?.housing_allowance||0 },
  { label:'通勤手当', value: detail.value?.commuting_allowance||0 }
])
const dedRows = computed(() => [
  { label:'健康保険', value: detail.value?.health_insurance||0 },
  { label:'介護保険', value: detail.value?.nursing_insurance||0 },
  { label:'厚生年金', value: detail.value?.welfare_pension||0 },
  { label:'雇用保険', value: detail.value?.employment_insurance||0 },
  { label:'所得税', value: detail.value?.income_tax||0 },
  { label:'住民税', value: detail.value?.resident_tax||0 }
])

// 四列拆分
function splitFour(list){
  const size = Math.ceil(list.length/4)
  return [list.slice(0,size), list.slice(size,2*size), list.slice(2*size,3*size), list.slice(3*size)]
}
const payCols = computed(()=> splitFour(payRows.value))
const dedCols = computed(()=> splitFour(dedRows.value))

// 合计
const totals = computed(()=>{
  const total_payment = payRows.value.reduce((a,b)=>a+Number(b.value||0),0)
  const total_deduction = dedRows.value.reduce((a,b)=>a+Number(b.value||0),0)
  return {
    total_payment,
    total_deduction,
    net_payment: total_payment-total_deduction
  }
})

function formatYen(v){ return '¥'+Number(v||0).toLocaleString() }
function fmtH(h){ const m=Math.round(Number(h)*60); return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}` }

// mock数据/请求
async function fetchEmployeeList(){
  loadingEmployees.value = true
  try{
    const res = await axios.post('/salarydetail/listEmployees')
    employeeList.value = res.data?.data || []
    if(employeeList.value.length && !selectedEmployeeId.value){
      selectedEmployeeId.value = employeeList.value[0].id
    }
  }finally{ loadingEmployees.value=false }
}
async function fetchDetail(){
  if(!selectedEmployeeId.value||!selectedMonth.value) return
  loadingDetail.value=true
  try{
    const res = await axios.post('/salarydetail/getDetail',{
      employee_id:1, //selectedEmployeeId.value,
      salary_month:selectedMonth.value
    })
    detail.value = res.data?.data || {}
  }finally{ loadingDetail.value=false }
}

function downloadCSV(){
  const lines=[]
  lines.push(['社員番号',detail.value?.employee_id,'氏名',detail.value?.employee_name,'年月',headerYyyymm.value])
  lines.push([])
  lines.push(['①勤怠'])
  const a=attendanceRows.value[0]
  lines.push(['就業日数','出勤日数','欠勤日数','特別休暇日数','有給休暇日数','有給休暇残日数'])
  lines.push([a.work_days,a.attend_days,a.absent_days,a.special_leave,a.paid_leave,a.remain_leave])
  lines.push(['労働時間','残業時間','深夜時間','休日労働時間','遅刻早退時間'])
  const t=attendanceTimeRows.value[0]
  lines.push([t.work_time,t.ot_time,t.midnight_time,t.holiday_time,t.lateearly_time])
  lines.push([])
  lines.push(['②支給'])
  payRows.value.forEach(r=>lines.push([r.label,r.value]))
  lines.push(['支給計',totals.value.total_payment])
  lines.push([])
  lines.push(['③控除'])
  dedRows.value.forEach(r=>lines.push([r.label,r.value]))
  lines.push(['控除計',totals.value.total_deduction])
  lines.push([])
  lines.push(['差引支給額',totals.value.net_payment])
  const csv = lines.map(r=>r.join(',')).join('\n')
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
  const aTag=document.createElement('a')
  aTag.href=URL.createObjectURL(blob)
  aTag.download=`${detail.value?.employee_name||'未指定'}_${headerYyyymm.value}_給与明細.csv`
  document.body.appendChild(aTag); aTag.click(); document.body.removeChild(aTag)
  URL.revokeObjectURL(aTag.href)
}

onMounted(async ()=>{
  await fetchEmployeeList()
  const d=new Date(); selectedMonth.value=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`
  await fetchDetail()
})
</script>

<style scoped>
.page-container{ padding:16px; background:#f7f8fa; }
.toolbar{ margin-bottom:12px; }
.slip{ background:#fff; }
.slip-header{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:8px; }
.slip-header .title{ font-size:18px; font-weight:600; }
.slip-header .meta{ display:flex; gap:16px; }
.slip-header .meta span{ color:#666; margin-right:6px; }
.block{ margin-top:12px; }
.block-title{ font-weight:600; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
.badge{ display:inline-flex; width:22px; height:22px; border-radius:50%; color:#fff; align-items:center; justify-content:center; font-weight:700; }
.badge-blue{ background:#3f51b5; }
.badge-orange{ background:#ff9800; }
.badge-purple{ background:#7e57c2; }
.summary{
  margin-top:12px; display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;
  background:#f0f3f7; padding:10px; border-radius:6px;
}
.summary .cell{ background:#fff; border:1px solid #e5e7eb; border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; }
.summary .cell .k{ color:#666; }
.summary .cell.strong{ background:#e8f5e9; border-color:#c8e6c9; font-weight:700; }
</style>
