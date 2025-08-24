<template>
  <div class="p-4">
    <!-- ========== 申請詳細カード ========== -->
    <el-card v-if="req">
      <div class="grid" style="grid-template-columns:1fr 1fr; gap:16px;">
        <!-- 左側：基本情報 -->
        <div>
          <p><b>申請ID：</b>{{ req.id }}</p>
          <p><b>申請者ID：</b>{{ req.applicantId }}</p>
          <p>
            <b>状態：</b>
            <el-tag :type="statusTagType(req.status)">{{ req.status }}</el-tag>
          </p>
          <p><b>合計金額：</b>￥{{ formatYen(req.totalAmount) }}</p>
          <p><b>作成日時：</b>{{ req.createdAt }}</p>
          <!-- 差し戻し理由がある場合のみ表示 -->
          <p v-if="req.rejectReason"><b>差し戻し理由：</b>{{ req.rejectReason }}</p>
        </div>

        <!-- 右側：摘要（自由記述） -->
        <div>
          <b>摘要：</b>
          <div class="summary-box">{{ req.summary || '（なし）' }}</div>
        </div>
      </div>

      <!-- ========== 関連する領収書一覧 ========== -->
      <el-divider content-position="left">関連領収書</el-divider>
      <el-table :data="receipts" border>
        <!-- 領収書画像（クリックで拡大プレビュー可能） -->
        <el-table-column label="画像" width="110">
          <template #default="{ row }">
            <el-image
              v-if="row.imagePath"
              :src="row.imagePath"
              :preview-src-list="[row.imagePath]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px;"
            >
              <!-- 画像が存在しない場合の表示 -->
              <template #error>
                <div style="font-size:12px;color:#999;width:80px;">No Image</div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <!-- 店名 -->
        <el-table-column prop="storeName" label="店名" min-width="180"/>
        <!-- 発行日 -->
        <el-table-column prop="issueDate" label="発行日" width="130"/>
        <!-- 金額（カンマ区切り + ￥付き表示） -->
        <el-table-column label="金額" width="120" align="right">
          <template #default="{ row }">￥{{ formatYen(row.amount) }}</template>
        </el-table-column>
        <!-- 状態 -->
        <el-table-column prop="status" label="状態" width="120"/>
      </el-table>

      <!-- ========== 操作ボタン群 ========== -->
      <div class="mt-3" style="display:flex; gap:8px;">
        <!-- 戻るボタン -->
        <el-button @click="back">戻る</el-button>

        <!-- 承認・差し戻しボタン（状態=申請済 の場合のみ表示） -->
        <el-button
          v-if="req.status === '申請済'"
          type="success"
          :loading="acting"
          @click="approve"
        >承認</el-button>
        <el-button
          v-if="req.status === '申請済'"
          type="danger"
          :loading="acting"
          @click="openReject"
        >差し戻し</el-button>
      </div>
    </el-card>

    <!-- ========== 差し戻し理由入力ダイアログ ========== -->
    <el-dialog v-model="dlg.visible" title="差し戻し理由" width="520px">
      <el-input
        v-model="dlg.reason"
        type="textarea"
        :rows="4"
        placeholder="理由を入力してください"
      />
      <template #footer>
        <el-button @click="dlg.visible=false">キャンセル</el-button>
        <el-button type="primary" :loading="acting" @click="doReject">差し戻し</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 承認処理 → 申請詳細画面
 * 
 * 機能概要：
 *   - API `/api/expense/approval/:id` から申請詳細を取得
 *   - 領収書の画像・店名・金額を一覧表示
 *   - 状態が「申請済」の場合、承認／差し戻しボタンを表示
 *   - 差し戻し時は理由入力ダイアログを表示して送信
 */
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// URLパラメータから申請IDを取得
const route = useRoute()
const router = useRouter()
const id = route.params.id

// 申請情報オブジェクト
const req = ref(null)
// 関連領収書一覧
const receipts = ref([])
// 処理中フラグ（承認/差し戻しボタンで使用）
const acting = ref(false)
// 差し戻しダイアログ制御
const dlg = ref({ visible:false, reason:'' })

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
 * 詳細データ読み込み
 */
const load = async () => {
  const { data } = await axios.get(`/api/expense/approval/${id}`)
  req.value = data.request
  receipts.value = (data.receipts || []).map(r => ({
    ...r,
    imagePath: r.imagePath || '' // /uploads へのプロキシ設定を利用
  }))
}

/**
 * 承認処理
 */
const approve = async () => {
  acting.value = true
  try {
    await axios.post(`/api/expense/approval/${id}/approve`, null, {
      headers: { 'X-User-Id': '1' } // TODO: ユーザーIDはログイン連携に差し替え予定
    })
    ElMessage.success('承認しました')
    await load() // 状態を再取得
  } catch (e) {
    ElMessage.error('承認に失敗しました')
  } finally {
    acting.value = false
  }
}

/**
 * 差し戻しダイアログ表示
 */
const openReject = () => {
  dlg.value.reason = ''
  dlg.value.visible = true
}

/**
 * 差し戻し処理
 */
const doReject = async () => {
  acting.value = true
  try {
    await axios.post(`/api/expense/approval/${id}/reject`, { reason: dlg.value.reason }, {
      headers: { 'X-User-Id': '1' }
    })
    ElMessage.success('差し戻しました')
    dlg.value.visible = false
    await load() // 状態を再取得
  } catch (e) {
    ElMessage.error('差し戻しに失敗しました')
  } finally {
    acting.value = false
  }
}

/**
 * 戻る（前画面に戻る）
 */
const back = () => router.back()

// マウント時に詳細情報を読み込み
onMounted(load)
</script>

<style scoped>
/* 摘要表示ボックス */
.summary-box {
  min-height: 80px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
  white-space: pre-wrap; /* 改行保持 */
}
.mt-3 { margin-top: 12px; }
</style>
