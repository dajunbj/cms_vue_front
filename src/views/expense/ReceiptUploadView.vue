<template>
  <div class="p-4">
    <el-card>
      <h2 class="text-xl font-bold mb-4">領収書アップロード</h2>
      <el-upload
        class="upload-demo"
        drag
        action="/api/receipts/upload"
        :on-success="handleUploadSuccess"
        :file-list="fileList"
        :auto-upload="true"
        name="file"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">画像ファイルをここにドラッグ、またはクリックして選択</div>
      </el-upload>
    </el-card>

    <el-card class="mt-6" v-if="receipt">
      <h2 class="text-lg font-semibold mb-2">OCR結果の確認</h2>
      <el-form :model="receipt" label-width="120px">
        <el-form-item label="店名">
          <el-input v-model="receipt.store_name" />
        </el-form-item>
        <el-form-item label="発行日">
          <el-date-picker v-model="receipt.issue_date" type="date" placeholder="選択" />
        </el-form-item>
        <el-form-item label="金額">
          <el-input-number v-model="receipt.amount" :min="0" :step="100" />
        </el-form-item>
        <el-form-item label="全文（OCR）">
          <el-input type="textarea" v-model="receipt.full_text" :rows="4" disabled />
        </el-form-item>
        <el-button type="primary" @click="confirmReceipt">確認済として保存</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const fileList = ref([])
const receipt = ref(null)

const handleUploadSuccess = (response) => {
  receipt.value = response.data // OCR結果を取得
  ElMessage.success('アップロード成功・OCR完了')
}

const confirmReceipt = async () => {
  await axios.post(`/api/receipts/${receipt.value.id}/confirm`, receipt.value)
  ElMessage.success('確認済として保存しました')
  receipt.value = null
}
</script>

<style scoped>
.upload-demo {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
}
</style>
