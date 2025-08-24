<template>
  <div class="p-4">
    <!-- =============== アップロード領域 =============== -->
    <el-card>
      <h2 class="text-xl font-bold mb-4">領収書アップロード</h2>

      <!-- 画像ファイルのドラッグ&ドロップ or クリック選択
           - auto-upload=false: すぐ送信せず、OCRボタン押下で送信
           - file-list: Element Plus 側で表示用
           - on-change: 選択時にプレビュー生成＆状態リセット -->
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :file-list="fileList"
        :on-change="handleFileChange"
        accept="image/*"
        name="file"
        list-type="picture"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">画像ファイルをここにドラッグ、またはクリックして選択</div>
      </el-upload>

      <!-- 選択した画像でOCRを実行 -->
      <el-button class="mt-4" type="primary" @click="runOcr" :disabled="!rawFile">OCR読み取り</el-button>
    </el-card>

    <!-- =============== OCR結果の確認・修正フォーム =============== -->
    <el-card class="mt-6" v-if="receipt">
      <h2 class="text-lg font-semibold mb-2">OCR結果の確認・修正</h2>

      <!-- 画像プレビュー（ローカルURL） -->
      <img :src="previewUrl" alt="領収書プレビュー" style="max-width: 300px; margin-bottom: 16px;" />

      <!-- OCRで抽出した項目をユーザーが上書き修正可能 -->
      <el-form :model="receipt" label-width="120px">
        <el-form-item label="店名">
          <el-input v-model="receipt.issuer" />
        </el-form-item>

        <el-form-item label="発行日">
          <!-- value-format=YYYY-MM-DD: バックエンドの LocalDate (ISO 8601) に合わせる -->
          <el-date-picker
            v-model="receipt.date"
            type="date"
            placeholder="日付を選択"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="金額">
          <!-- JPYは整数前提。カンマや￥はバックエンドでクレンジング -->
          <el-input v-model="receipt.amount" />
        </el-form-item>

        <el-form-item label="全文（OCR）">
          <el-input type="textarea" v-model="receipt.full_text" :rows="6" />
        </el-form-item>

        <!-- ファイル＋OCR修正値をまとめて保存 -->
        <el-button type="primary" @click="confirmReceipt">保存</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
/**
 * 領収書アップロード画面
 * フロー:
 *   1) 画像選択（handleFileChange）
 *   2) OCR実行（runOcr）… /api/ocr へ画像POST → 推定項目を受け取りフォームへ反映
 *   3) 確認・修正
 *   4) 保存（confirmReceipt）… /api/ocr/save-with-image へ 画像+項目を送信
 *
 * バックエンド側仕様:
 *   - OCR実行:    POST /api/ocr (multipart/form-data: file)
 *   - 画像保存等: POST /api/ocr/save-with-image (file + issuer + date + amount + full_text)
 *   - X-User-Id は暫定の固定値。将来はログイン情報から設定する。
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// Element Plus のファイルリスト（見た目用）
const fileList = ref([])

// 実際に送る生ファイル（FormDataに詰める）
const rawFile = ref(null)

// ローカルプレビューURL（ObjectURL）
const previewUrl = ref(null)

// OCRで得た項目（ユーザーが修正できる）
const receipt = ref(null)

/**
 * 画像選択時:
 * - rawFile を保持
 * - プレビューURLを生成
 * - 直前のOCR結果（receipt）をクリア
 */
const handleFileChange = (file) => {
  rawFile.value = file.raw
  previewUrl.value = URL.createObjectURL(file.raw)
  receipt.value = null
}

/**
 * OCR実行:
 * - /api/ocr に画像をPOST
 * - 戻り値（issuer/date/amount/full_text）をフォームモデルに反映
 * - キーの揺れ（日本語キーなど）に対してフォールバック対応
 */
const runOcr = async () => {
  if (!rawFile.value) return
  const formData = new FormData()
  formData.append('file', rawFile.value)

  try {
    const { data } = await axios.post('/api/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    receipt.value = {
      issuer:    data.issuer    ?? data['発行元'] ?? '',
      date:      data.date      ?? data['発行日'] ?? '',
      amount:    data.amount    ?? data['金額']   ?? '',
      full_text: data.full_text ?? data['OCR全文'] ?? ''
    }
    ElMessage.success('OCR解析完了')
  } catch (e) {
    console.error(e)
    ElMessage.error('OCR解析に失敗しました')
  }
}

/**
 * 保存:
 * - 画像ファイルと、確認・修正済みのOCR項目を同時送信
 * - バックエンド側でディスク保存＋DB登録（status=確認済）
 * - 成功時はフォームと選択状態をリセット
 */
const confirmReceipt = async () => {
  try {
    const fd = new FormData()
    fd.append('file', rawFile.value)
    fd.append('issuer', receipt.value.issuer ?? '')
    fd.append('date', receipt.value.date ?? '')
    fd.append('amount', receipt.value.amount ?? '')
    fd.append('full_text', receipt.value.full_text ?? '')

    await axios.post('/api/ocr/save-with-image', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-User-Id': '1' // TODO: 認証導入後にログインユーザーIDへ置き換え
      }
    })
    ElMessage.success('保存成功')

    // 画面状態リセット
    receipt.value = null
    rawFile.value = null
    fileList.value = []
    previewUrl.value = null
  } catch (e) {
    console.error(e)
    ElMessage.error('保存に失敗しました')
  }
}
</script>

<style scoped>
/* アップロード領域の見た目 */
.upload-demo {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
}
</style>
