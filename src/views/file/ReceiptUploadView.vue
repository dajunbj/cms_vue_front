<template>
  <div style="width: 100%; max-width: 800px; margin: auto;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-upload2"></i> ファイルアップロード
      </h2>
    </div>

    <div class="section-container">
      <el-form :model="form" ref="fileForm" label-width="120px">
        <el-form-item label="ファイル種別" prop="fileType">
          <el-select v-model="form.fileType" placeholder="ファイル種別を選択してください" @change="clearFile">
            <el-option label="画像ファイル" value="image"></el-option>
            <el-option label="PDFファイル" value="pdf"></el-option>
            <el-option label="Excelファイル" value="excel"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="ファイルアップロード" prop="file">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :before-upload="beforeUpload"
            :file-list="fileList"
            @change="handleFileChange"
          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">ファイルをドラッグまたはクリックして選択</div>
          </el-upload>
        </el-form-item>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="primary" @click="submitFile">アップロード</el-button>
            <el-button type="default" @click="resetForm">キャンセル</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FileUploadComponent",
  data() {
    return {
      form: {
        fileType: "",
        file: null,
      },
      fileList: [],
      acceptedFormats: {
        image: ['image/jpeg', 'image/png', 'image/gif'],
        pdf: ['application/pdf'],
        excel: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      }
    };
  },
  methods: {
    beforeUpload(file) {
      if (!this.form.fileType) {
        this.$message.warning("ファイル種別を選択してください。");
        return false;
      }
      if (!this.acceptedFormats[this.form.fileType].includes(file.type)) {
        this.$message.error("選択したファイル形式が適切ではありません。");
        return false;
      }
      this.form.file = file;
      return true;
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList;
    },
    async submitFile() {
      if (!this.form.file) {
        this.$message.error("アップロードするファイルを選択してください。");
        return;
      }

      const formData = new FormData();
      formData.append("file", this.form.file);
      formData.append("fileType", this.form.fileType);

      try {
        await axios.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        this.$message.success("ファイルが正常にアップロードされました。");
        this.resetForm();
      } catch (error) {
        this.$message.error("アップロードに失敗しました: " + error.message);
      }
    },
    resetForm() {
      this.form.fileType = "";
      this.form.file = null;
      this.fileList = [];
    },
    clearFile() {
      this.fileList = [];
      this.form.file = null;
    }
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