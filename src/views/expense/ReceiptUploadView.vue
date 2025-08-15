<template>
  <div class="p-4">
    <el-card>
      <h2 class="text-xl font-bold mb-4">領収書アップロード</h2>

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

      <el-button class="mt-4" type="primary" @click="runOcr" :disabled="!rawFile">OCR読み取り</el-button>
    </el-card>

    <el-card class="mt-6" v-if="receipt">
      <h2 class="text-lg font-semibold mb-2">OCR結果の確認・修正</h2>
      <img :src="previewUrl" alt="領収書プレビュー" style="max-width: 300px; margin-bottom: 16px;" />
      <el-form :model="receipt" label-width="120px">
        <el-form-item label="店名">
          <el-input v-model="receipt.issuer" />
        </el-form-item>
        <el-form-item label="発行日">
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
          <el-input v-model="receipt.amount" />
        </el-form-item>
        <el-form-item label="全文（OCR）">
          <el-input type="textarea" v-model="receipt.full_text" :rows="6" />
        </el-form-item>
        <el-button type="primary" @click="confirmReceipt">保存</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const fileList = ref([])
const rawFile = ref(null)
const previewUrl = ref(null)
const receipt = ref(null)

const handleFileChange = (file) => {
  rawFile.value = file.raw
  previewUrl.value = URL.createObjectURL(file.raw)
  receipt.value = null
}

const runOcr = async () => {
  if (!rawFile.value) return
  const formData = new FormData()
  formData.append('file', rawFile.value)

  try {
    const { data } = await axios.post('/api/ocr', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    receipt.value = {
      issuer: data.issuer ?? data['発行元'] ?? '',
      date: data.date ?? data['発行日'] ?? '',
      amount: data.amount ?? data['金額'] ?? '',
      full_text: data.full_text ?? data['OCR全文'] ?? ''
    }
    ElMessage.success('OCR解析完了')
  } catch (e) {
    ElMessage.error('OCR解析に失敗しました')
  }
}

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
        'X-User-Id': '1' // TODO: 替换为登录用户ID
      }
    })
    ElMessage.success('保存成功')
    receipt.value = null
    rawFile.value = null
    fileList.value = []
    previewUrl.value = null
  } catch (e) {
    ElMessage.error('保存に失敗しました')
  }
}
</script>

<style scoped>
.upload-demo { border: 1px dashed #dcdfe6; border-radius: 6px; padding: 20px; text-align: center; }
</style>
