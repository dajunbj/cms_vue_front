<template>
  <div class="p-4">
    <!-- ========== 検索条件フォーム ========== -->
    <el-card class="mb-4">
      <el-form :inline="true" :model="query">
        <!-- 状態セレクトボックス -->
        <el-form-item label="状態">
          <el-select v-model="query.status" style="width:180px">
            <el-option label="申請済" value="申請済" />
            <el-option label="承認済" value="承認済" />
            <el-option label="差し戻し" value="差し戻し" />
            <el-option label="（全て）" :value="''" />
          </el-select>
        </el-form-item>

        <!-- 検索・リセットボタン -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="fetchList(1)">検索</el-button>
          <el-button @click="reset">リセット</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ========== 承認処理一覧テーブル ========== -->
    <el-card>
      <el-table :data="items" v-loading="loading" border>
        <!-- 申請ID -->
        <el-table-column prop="id" label="申請ID" width="100"/>

        <!-- 申請者ID（ログインユーザーと紐づけ予定） -->
        <el-table-column prop="applicantId" label="申請者ID" width="120"/>

        <!-- 合計金額（カンマ区切り + ￥付き表示） -->
        <el-table-column label="合計金額" width="140" align="right">
          <template #default="{ row }">￥{{ formatYen(row.totalAmount) }}</template>
        </el-table-column>

        <!-- 状態（申請済／承認済／差し戻し）をタグで表示 -->
        <el-table-column prop="status" label="状態" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <!-- 作成日時 -->
        <el-table-column prop="createdAt" label="作成日時" min-width="160"/>

        <!-- 操作列（詳細ボタン） -->
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">詳細</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- ページネーション（右下配置） -->
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
  </div>
</template>

<script setup>
/**
 * 経費管理 → 承認処理一覧画面
 * フロー:
 *   1) 状態でフィルタリング（申請済／承認済／差し戻し／全件）
 *   2) /api/expense/approval/list からデータを取得
 *   3) テーブル表示 + ページング対応
 *   4) 詳細ボタン押下で詳細画面へ遷移
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 一覧データ
const items = ref([])
// 総件数（ページネーション用）
const total = ref(0)
// ページング制御
const page = ref(1)
const size = ref(10)
// ローディングフラグ
const loading = ref(false)

// 検索条件モデル
const query = ref({
  status: '申請済' // デフォルトは「申請済」を表示
})

/**
 * 状態に応じたタグ色付け
 */
const statusTagType = (s) => {
  switch (s) {
    case '申請済': return 'warning'
    case '承認済': return 'success'
    case '差し戻し': return 'danger'
    default: return ''
  }
}

/**
 * 金額フォーマット（3桁区切り）
 */
const formatYen = (n) => new Intl.NumberFormat('ja-JP').format(Number(n || 0))

/**
 * 一覧データ取得
 * @param {number} toPage - 移動先ページ番号
 */
const fetchList = async (toPage = page.value) => {
  loading.value = true
  try {
    page.value = toPage
    const { data } = await axios.get('/api/expense/approval/list', {
      params: {
        page: page.value,
        size: size.value,
        status: query.value.status || undefined
      }
    })
    items.value = data.items || []
    total.value = data.total || 0
  } catch (e) {
    console.error(e)
    ElMessage.error('一覧取得に失敗しました')
  } finally {
    loading.value = false
  }
}

/**
 * 検索条件リセット（状態を「申請済」に戻す）
 */
const reset = () => {
  query.value.status = '申請済'
  fetchList(1)
}

/**
 * 詳細画面へ遷移
 * @param {number} id - 申請ID
 */
const goDetail = (id) => {
  router.push(`/expense/approval/${id}`)
}

// 初期表示時に一覧を取得
onMounted(() => fetchList(1))
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }
.mt-3 { margin-top: 12px; }
</style>
