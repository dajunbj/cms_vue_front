<template>
  <div style="width: 100%; max-width: 800px; margin: auto;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-upload2" /> 領収書アップロード
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="fileForm"
        :model="form"
        label-width="120px"
      >
        <el-form-item
          label="ファイル"
          prop="file"
        >
          <el-upload
            class="upload-demo"
            action="about:blank"
            :on-change="handleChange"
            :on-remove="handleRemove"
            multiple
            :file-list="fileList"
            :auto-upload="false"
          >
            <el-button
              size="small"
              type="primary"
            >
              クリックしてアップロード
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传 jpg/png 文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitFiles"
          >
            アップロード
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const fileForm = ref(null);
const fileList = ref([]);
const form = reactive({ fileList });

const handleChange = (file, files) => {
  console.log("Selected file:", file);
  console.log("File list updated:", files);
  fileList.value = files;
};

const handleRemove = (file, files) => {
  console.log("Removed file:", file);
  console.log("Updated file list:", files);
  fileList.value = files;
};

const submitFiles = async () => {
  if (!fileList.value.length) {
    ElMessage.error("ファイルを選択してください！");
    return;
  }

  const formData = new FormData();
  fileList.value.forEach((file) => {
    formData.append("files", file.raw || file);
  });

  try {
    const response = await axios.post("/api/s3/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    ElMessage.success("ファイルが正常にアップロードされました！");
    console.log("Response:", response.data);
    fileList.value = [];
  } catch (error) {
    ElMessage.error("アップロードに失敗しました: " + error.message);
  }
};
</script>

<style scoped>
.header-container {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #333333;
  display: flex;
  align-items: center;
}
.header-title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.section-container {
  background-color: #FFFFFF;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.upload-demo {
  width: 100%;
}
</style>