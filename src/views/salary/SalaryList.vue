<template>
  <div class="page-container">
    <!-- フィルター -->
    <el-card shadow="never" class="card">
      <el-form :inline="true" :model="query" label-width="90px" class="filter-form">
        <el-form-item label="会社名">
          <el-select v-model="query.companyId" placeholder="会社を選択" clearable filterable style="width:220px"
                     :loading="loadingOptions" @change="handleSearch">
            <el-option v-for="opt in options.companies" :key="opt.id" :label="opt.name" :value="opt.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="部署">
          <el-select v-model="query.departmentId" placeholder="部署を選択" clearable filterable style="width:220px"
                     :loading="loadingOptions" @change="handleSearch">
            <el-option v-for="opt in options.departments" :key="opt.id" :label="opt.name" :value="opt.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="社員名">
          <el-select v-model="query.employeeId" placeholder="社員名を選択" clearable filterable style="width:220px"
                     :loading="loadingOptions" @change="handleSearch">
            <el-option v-for="opt in options.employees" :key="opt.id" :label="opt.name" :value="opt.id"/>
          </el-select>
        </el-form-item>

        <el-form-item label="給与年月">
          <el-date-picker v-model="query.salaryMonth" type="month" value-format="YYYY-MM-01" format="YYYY年MM月"
                          placeholder="選択" style="width:180px" @change="handleSearch"/>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">検索</el-button>
          <el-button @click="reset">リセット</el-button>
          <el-button type="success" :icon="Document" :loading="exporting" @click="exportCSV">CSV出力</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 一覧 -->
    <el-card shadow="never" class="card">
      <el-table :data="rows" border v-loading="loading" @sort-change="onSortChange">
        <el-table-column prop="employeeCode" label="社員番号" width="110" sortable="custom"/>
        <el-table-column prop="employeeName" label="氏名" width="140" sortable="custom"/>
        <el-table-column prop="companyName" label="会社" width="180" sortable="custom"/>
        <el-table-column prop="departmentName" label="部署" width="160" sortable="custom"/>
        <el-table-column prop="salaryMonth" label="年月" width="110" sortable="custom">
          <template #default="{row}">{{ row.salaryMonth?.substring(0,7) }}</template>
        </el-table-column>
        <el-table-column prop="totalPayment" label="総支給額" width="140" align="right" sortable="custom">
          <template #default="{row}">{{ formatYen(row.totalPayment) }}</template>
        </el-table-column>
        <el-table-column prop="totalDeduction" label="総控除額" width="140" align="right" sortable="custom">
          <template #default="{row}">{{ formatYen(row.totalDeduction) }}</template>
        </el-table-column>
        <el-table-column prop="netPayment" label="差引支給額" width="150" align="right" sortable="custom">
          <template #default="{row}"><strong>{{ formatYen(row.netPayment) }}</strong></template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="140">
          <template #default="{row}">
            <el-button size="small" @click="openDetail(row)">明細を見る</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10,20,50,100]"
          :current-page="page.page"
          :page-size="page.size"
          :total="page.total"
          @size-change="val => { page.size = val; fetchList(); }"
          @current-change="val => { page.page = val; fetchList(); }"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { Document, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 検索条件
const query = reactive({
  companyId: null,
  departmentId: null,
  employeeId: null,
  salaryMonth: null, // 'YYYY-MM-01'
  sort: 'salaryMonth', // 後端字段
  order: 'desc'
})

const options = reactive({
  companies: [],
  departments: [],
  employees: []
})

const loadingOptions = ref(false)
const loading = ref(false)
const exporting = ref(false)
const rows = ref([])
const page = reactive({ page: 1, size: 20, total: 0 })

function formatYen(v){ return '¥' + Number(v||0).toLocaleString() }

async function fetchOptions(){
  loadingOptions.value = true
  try{
    const res = await axios.get('/salarydetail/options')
    options.companies = res.data?.data?.companies ?? []
    options.departments = res.data?.data?.departments ?? []
    options.employees = res.data?.data?.employees ?? []
  } finally { loadingOptions.value = false }
}

async function fetchList(){
  loading.value = true
  try{
    const res = await axios.post('/salary/list', {
      ...query,
      page: page.page,
      size: page.size
    })
    rows.value = res.data?.data?.items ?? []
    page.total = res.data?.data?.total ?? 0
  } finally { loading.value = false }
}

function onSortChange({ prop, order }){
  // Element-Plus: order 'ascending' | 'descending' | null
  const map = { ascending: 'asc', descending: 'desc' }
  query.sort = prop || 'salaryMonth'
  query.order = map[order] || 'desc'
  fetchList()
}

function handleSearch(){ page.page = 1; fetchList() }

function reset(){
  query.companyId = null
  query.departmentId = null
  query.employeeId = null
  query.salaryMonth = null
  query.sort = 'salaryMonth'
  query.order = 'desc'
  page.page = 1
  fetchList()
}

async function exportCSV(){
  exporting.value = true
  try{
    const res = await axios.post('/salary/export', {
      ...query
    }, { responseType: 'blob' })

    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = '給与一覽.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  } finally { exporting.value = false }
}

function openDetail(row){
  // 跳到你已有的「給与明細」页面，带上参数（示例）
  router.push({
    path: '/salary/detail',
    query: {
      employee_id: row.employeeId,
      salary_month: row.salaryMonth // 'YYYY-MM-01'
    }
  })
}

onMounted(async ()=>{
  await fetchOptions()
  // 默认当月
  if(!query.salaryMonth){
    const d = new Date()
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0')
    query.salaryMonth = `${y}-${m}-01`
  }
  await fetchList()
})
</script>

<style scoped>
.page-container{ padding:16px; background:#f7f8fa; }
.card{ margin-bottom:12px; }
.filter-form :deep(.el-form-item){ margin-right:16px; margin-bottom:10px; }
.pager{ display:flex; justify-content:flex-end; margin-top:12px; }
</style>