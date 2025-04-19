<template>
  <div style="width: 100%; max-width: 800px; margin: auto;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-document"></i> アップロード済みファイル一覧
      </h2>
    </div>

    <div class="section-container">
      <el-table :data="fileList" style="width: 100%">
        <el-table-column prop="fileName" label="ファイル名" width="300"></el-table-column>
        <el-table-column prop="fileSize" label="サイズ (KB)" width="150"></el-table-column>
        <el-table-column label="プレビュー" width="150">
          <template slot-scope="scope">
            <el-link v-if="isImage(scope.row.fileName)" :href="scope.row.fileUrl" target="_blank">画像を表示</el-link>
          </template>
        </el-table-column>
        <el-table-column label="ダウンロード" width="150">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="downloadFile(scope.row.fileUrl)">ダウンロード</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "S3FileListComponent",
  data() {
    return {
      fileList: [],
    };
  },
  mounted() {
    this.fetchFileList();
  },
  methods: {
    async fetchFileList() {
      try {
        const response = await axios.get("/api/s3/list");
        this.fileList = response.data;
      } catch (error) {
        this.$message.error("ファイルリストの取得に失敗しました: " + error.message);
      }
    },
    isImage(fileName) {
      return fileName.match(/\.(jpeg|jpg|png|gif)$/i);
    },
    downloadFile(fileUrl) {
      window.open(fileUrl, "_blank");
    },
  },
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
</style>
