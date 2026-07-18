<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-office-building" /> 部門登録画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="departmentForm"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="部門名"
              prop="department_name"
            >
              <el-input
                v-model="form.department_name"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col
            :span="24"
            style="text-align: center; margin-top: 20px;"
          >
            <el-button
              type="primary"
              @click="submitForm"
            >
              保存
            </el-button>
            <el-button @click="resetForm">
              リセット
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const router = useRouter();
const departmentForm = ref(null);

const form = reactive({
  department_name: ''
});

const rules = {
  department_name: [{ required: true, message: '部門名を入力してください', trigger: 'blur' }]
};

const submitForm = () => {
  departmentForm.value.validate((valid) => {
    if (valid) {
      axios.post('/department/register', form)
        .then(() => {
          ElMessage.success('登録が成功しました');
          router.push('/department');
        })
        .catch((error) => {
          ElMessage.error('登録に失敗しました: ' + error.message);
        });
    }
  });
};

const resetForm = () => {
  departmentForm.value.resetFields();
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
  color: #333;
  display: flex;
  align-items: center;
}
.header-title i {
  margin-right: 10px;
  font-size: 28px;
  color: #409EFF;
}
.section-container {
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
