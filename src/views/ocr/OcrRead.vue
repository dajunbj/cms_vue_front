<template>
  <div class="ocr-page">
    <el-card class="ocr-read-card">
      <!-- 文件上传区域 -->
      <el-upload
        drag
        :http-request="beforeUpload"
        :show-file-list="false"
        accept="image/*"
      >
        <el-icon><Upload /></el-icon>
        <div class="el-upload__text">画像をドラッグまたはクリックしてアップロード</div>
        <div class="el-upload__tip" style="margin-top: 8px;">JPG/PNG のみ対応</div>
      </el-upload>

      <!-- 图片预览 -->
      <div v-if="previewUrl" class="image-preview">
        <p class="preview-title">アップロード画像プレビュー：</p>
        <img :src="previewUrl" alt="preview" class="preview-img" />
      </div>

      <!-- OCR 执行按钮 -->
      <el-button type="primary" :disabled="!selectedFile" style="margin-top: 1em;" @click="triggerOcr">
        OCR 読取
      </el-button>

      <!-- OCR 结果展示 -->
      <el-form
        v-if="result"
        :model="result"
        label-width="100px"
        class="ocr-result-form"
      >
        <el-form-item label="発行元">
          <el-input v-model="result['発行元']" />
        </el-form-item>
        <el-form-item label="発行日">
          <el-input v-model="result['発行日']" />
        </el-form-item>
        <el-form-item label="金額">
          <el-input v-model="result['金額']" />
        </el-form-item>
        <el-form-item label="OCR全文">
          <el-input type="textarea" :rows="8" v-model="result['OCR全文']" />
        </el-form-item>
      </el-form>

      <el-button
  type="success"
  style="margin-top: 1em;"
  @click="saveToDatabase"
>
  確認
</el-button>

    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'

const result = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

const beforeUpload = ({ file }) => {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

const triggerOcr = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('ファイルを選択してください')
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const response = await axios.post('/api/ocr', formData)
    result.value = response.data
  } catch (error) {
    console.error(error)
    ElMessage.error('OCR 解析失敗')
  }
}

const saveToDatabase = async () => {
  if (!result.value) {
    ElMessage.warning('OCR結果がありません')
    return
  }

  try {
    await axios.post('/api/ocr/save', result.value)
    ElMessage.success('保存しました')
  } catch (error) {
    console.error(error)
    ElMessage.error('保存に失敗しました')
  }
}

</script>

<style scoped>
.ocr-read-card {
  max-width: 800px;
  margin: 2em auto;
  padding: 2em;
}
.image-preview {
  margin-top: 1em;
  text-align: center;
}
.preview-title {
  font-weight: bold;
  margin: 0.5em 0;
}
.preview-img {
  max-width: 100%;
  border: 1px solid #ccc;
  padding: 4px;
  border-radius: 6px;
}
.ocr-result-form {
  margin-top: 2em;
}
</style>
