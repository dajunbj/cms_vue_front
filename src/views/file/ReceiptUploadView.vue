<template>
  <div style="width: 100%; max-width: 800px; margin: auto;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-upload2"></i> ファイルアップロード
      </h2>
    </div>

    <div class="section-container">
      <el-form :model="form" ref="fileForm" label-width="120px">
        <!-- 文件上传 -->
        <el-form-item label="ファイル" prop="file">
          <el-upload
            class="upload-demo"
            action="about:blank"
            :on-change="handleChange"
            :on-remove="handleRemove"
            multiple
            :file-list="fileList"
            :auto-upload="false" 
          >
            <el-button size="small" type="primary">クリックしてアップロード</el-button>
            <div slot="tip" class="el-upload__tip">只能上传 jpg/png 文件</div>
          </el-upload>
        </el-form-item>

        <!-- 上传按钮 -->
        <el-form-item>
          <el-button type="primary" @click="submitFiles">アップロード</el-button>
        </el-form-item>
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
      fileList: [], // 存储上传的文件列表
      }
    };
  },
  methods: {
    // 文件选择变化时触发
    handleChange(file, fileList) {
      console.log("Selected file:", file);
      console.log("File list updated:", fileList);
      this.fileList = fileList; // 更新文件列表
    },
    // 文件被移除时触发
    handleRemove(file, fileList) {
      console.log("Removed file:", file);
      console.log("Updated file list:", fileList);
      this.fileList = fileList; // 更新文件列表
    },
    // 点击上传按钮
    async submitFiles() {
      // 判断是否选择了文件
      if (!this.fileList.length) {
        this.$message.error("ファイルを選択してください！");
        return;
      }

      // 创建 FormData 对象
      const formData = new FormData();
      this.fileList.forEach((file) => {
        formData.append("files", file.raw || file); // 获取文件的原始内容
      });

      // 发起上传请求
      try {
        
        const response = await axios.post("/api/s3/upload", // 替换为后端接口
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        this.$message.success("ファイルが正常にアップロードされました！");
        console.log("Response:", response.data);

        // 清空文件列表
        this.fileList = [];
      } catch (error) {
        this.$message.error("アップロードに失敗しました: " + error.message);
      }
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
.upload-demo {
  width: 100%;
}
</style>
