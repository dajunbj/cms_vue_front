<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 新ユーザー誘う画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="employeeForm"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="名前"
              prop="name"
            >
              <el-input
                v-model="form.name"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="性別"
              prop="gender"
            >
              <el-radio-group v-model="form.gender">
                <el-radio label="男">
                  男性
                </el-radio>
                <el-radio label="女">
                  女性
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="生年月日"
              prop="date_of_birth"
            >
              <el-date-picker
                v-model="form.date_of_birth"
                type="date"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="電話番号"
              prop="phone_number"
            >
              <el-input
                v-model="form.phone_number"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="メールアドレス"
              prop="email"
            >
              <el-input
                v-model="form.email"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="ログインID"
              prop="login_id"
            >
              <el-input
                v-model="form.login_id"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="権限"
              prop="role"
            >
              <el-select
                v-model="form.role"
                clearable
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>   
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="部門"
              prop="department_id"
            >
              <el-select
                v-model="form.department_id"
                clearable
              >
                <el-option
                  v-for="item in departmentOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
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
              招待
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
import axios from 'axios';
import { ElMessage } from 'element-plus';

const employeeForm = ref(null);

const form = reactive({
  name: '',
  gender: '男',
  date_of_birth: '',
  phone_number: '',
  email: '',
  login_id: '',
  role: '',
  department_id: ''
});

const roleOptions = [
  { value: 'admin', label: '管理者' },
  { value: 'employee', label: '社員' }
];

const departmentOptions = [
  { value: '1', label: '人事部' },
  { value: '2', label: '営業部' },
  { value: '3', label: '技術部' },
  { value: '4', label: '総務部' }
];

const rules = {
  name: [{ required: true, message: '名前を入力してください', trigger: 'blur' }],
  gender: [{ required: true, message: '性別を選択してください', trigger: 'change' }],
  date_of_birth: [{ required: true, message: '生年月日を選択してください', trigger: 'blur' }],
  phone_number: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],
  email: [
    { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
    { type: 'email', message: '正しい形式で入力してください', trigger: 'blur' }
  ],
  login_id: [{ required: true, message: 'ログインIDを入力してください', trigger: 'blur' }],
  role: [{ required: true, message: '権限を入力してください', trigger: 'blur' }],
  department_id: [{ required: true, message: '部門を選択してください', trigger: 'change' }]
};

const submitForm = () => {
  employeeForm.value.validate((valid) => {
    if (valid) {
      axios.post('/invite/send', form)
        .then(() => {
          ElMessage.success('招待発送成功しました。');
          resetForm();
        })
        .catch((error) => {
          ElMessage.error('招待発送失敗しました: ' + error.message);
        });
    }
  });
};

const resetForm = () => {
  employeeForm.value.resetFields();
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