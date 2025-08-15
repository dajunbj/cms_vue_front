<template>
  <div class="p-4">
    <!-- 検索フォーム + 一括申請 -->
    <el-card class="mb-4">
      <el-form :inline="true" :model="query">
        <el-form-item label="店名">
          <el-input v-model="query.storeName" placeholder="店名で検索" clearable />
        </el-form-item>
        <el-form-item label="状態">
          <el-select v-model="query.status" placeholder="状態を選択" clearable style="width: 180px">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="fetchList(1)">検索</el-button>
          <el-button @click="reset">リセット</el-button>
        </el-form-item>

        <el-form-item style="margin-left: 12px">
          <el-button
            type="success"
            :disabled="selectedRows.length === 0 || !allSelectable"
            @click="openBulkApply"
          >一括申請</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 一覧テーブル -->
    <el-card>
      <el-table
        :data="items"
        v-loading="loading"
        border
        :row-key="row => row.id"
        @selection-change="onSelectionChange"
      >
        <!-- 选择列 -->
        <el-table-column type="selection" width="48" reserve-selection />

        <!-- 画像 -->
        <el-table-column label="画像" width="110">
          <template #default="{ row }">
            <el-image
              v-if="row.imagePath"
              :src="resolveImageUrl(row.imagePath)"
              :preview-src-list="[resolveImageUrl(row.imagePath)]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px;"
            >
              <template #error>
                <div style="font-size:12px; color:#999; width:80px;">No Image</div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <el-table-column prop="storeName" label="店名" min-width="180" />
        <el-table-column prop="issueDate" label="発行日" width="130" />
        <el-table-column label="金額" width="120" align="right">
          <template #default="{ row }">￥{{ formatYen(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="状態" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="登録日時" min-width="160" />

        <!-- 操作 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goEdit(row.id)">編集</el-button>
            <el-divider direction="vertical" />
            <el-button
              v-if="canApply(row.status)"
              type="success" link
              @click="applyOne(row.id)"
            >申請</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3" style="display:flex; justify-content:flex-end;">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :total="total"
          :current-page="page"
          :page-size="size"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 一括申請ダイアログ -->
    <el-dialog v-model="dlg.visible" title="一括申請" width="520px">
      <div style="margin-bottom: 12px;">
        選択件数: <b>{{ selectedRows.length }}</b> 件 /
        合計金額: <b>￥{{ formatYen(totalSelectedAmount) }}</b>
      </div>
      <el-input
        v-model="dlg.summary"
        type="textarea"
        :rows="4"
        placeholder="摘要（任意）"
      />
      <template #footer>
        <el-button @click="dlg.visible=false">キャンセル</el-button>
        <el-button type="primary" :loading="dlg.loading" @click="doBulkApply">申請</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 一覧・検索
const items = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

const query = ref({
  storeName: '',
  status: ''
})

const statusOptions = ['草稿', '確認済', '申請済', '承認済', '差し戻し']

const statusTagType = (s) => {
  switch (s) {
    case '確認済': return 'success'
    case '申請済': return 'warning'
    case '承認済': return 'success'
    case '差し戻し': return 'danger'
    default: return ''
  }
}

// 你已配置了 /uploads 代理到后端，因此这里直接原样返回
const resolveImageUrl = (p) => p || ''

const formatYen = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0))

const fetchList = async (toPage = page.value) => {
  loading.value = true
  try {
    page.value = toPage
    const { data } = await axios.get('/api/ocr/receipts/list', {
      params: {
        page: page.value,
        size: size.value,
        storeName: query.value.storeName || undefined,
        status: query.value.status || undefined
      }
    })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e) {
    console.error(e)
    ElMessage.error('一覧の取得に失敗しました')
  } finally {
    loading.value = false
  }
}

const reset = () => {
  query.value.storeName = ''
  query.value.status = ''
  fetchList(1)
}

// 选择 & 一括申請
const selectedRows = ref([])
const onSelectionChange = (rows) => { selectedRows.value = rows }
const canApply = (s) => ['草稿', '確認済'].includes(s)
const allSelectable = computed(() => selectedRows.value.length > 0 && selectedRows.value.every(r => canApply(r.status)))
const totalSelectedAmount = computed(() => selectedRows.value.reduce((sum, r) => sum + Number(r.amount || 0), 0))

const dlg = ref({ visible: false, summary: '', loading: false })

const openBulkApply = () => {
  if (!allSelectable.value) {
    ElMessage.warning('申請不可の状態が含まれています')
    return
  }
  dlg.value.summary = ''
  dlg.value.visible = true
}

const doBulkApply = async () => {
  try {
    dlg.value.loading = true
    const ids = selectedRows.value.map(r => r.id)
    await axios.post('/api/expense/requests', {
      receiptIds: ids,
      summary: dlg.value.summary
    }, {
      headers: { 'X-User-Id': '1' }
    })
    ElMessage.success('一括申請しました')
    dlg.value.visible = false
    selectedRows.value = []
    fetchList(page.value)
  } catch (e) {
    console.error(e)
    ElMessage.error('申請に失敗しました')
  } finally {
    dlg.value.loading = false
  }
}

// 单条申請 & 編集
const applyOne = async (id) => {
  try {
    await axios.post('/api/expense/requests', { receiptIds: [id], summary: '' }, {
      headers: { 'X-User-Id': '1' }
    })
    ElMessage.success('申請しました')
    fetchList(page.value)
  } catch (e) {
    console.error(e)
    ElMessage.error('申請に失敗しました')
  }
}

const goEdit = (id) => {
  router.push(`/expense/receipt-edit/${id}`)
}

onMounted(() => fetchList(1))
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }
</style>
