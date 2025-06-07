<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user"></i> 社員情報登録画面
      </h2>
    </div>

    <div class="section-container">
      <el-form :model="form" :rules="rules" ref="employeeForm" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名前" prop="name">
              <el-input v-model="form.name" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性別" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男性</el-radio>
                <el-radio label="女">女性</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生年月日" prop="date_of_birth">
              <el-date-picker v-model="form.date_of_birth" type="date" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="電話番号" prop="phone_number">
              <el-input v-model="form.phone_number" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="メールアドレス" prop="email">
              <el-input v-model="form.email" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ログインID" prop="login_id">
              <el-input v-model="form.login_id" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在留カード番号" prop="residence_card_number">
              <el-input v-model="form.residence_card_number" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在留資格" prop="residence_status">
              <el-input v-model="form.residence_status" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在留期限（開始）" prop="residence_expiry_date_from">
              <el-date-picker v-model="form.residence_expiry_date_from" type="date" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在留期限（終了）" prop="residence_expiry_date_end">
              <el-date-picker v-model="form.residence_expiry_date_end" type="date" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button @click="resetForm">リセット</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        name: '',
        gender: '男',
        date_of_birth: '',
        phone_number: '',
        email: '',
        login_id: '',
        residence_card_number: '',
        residence_status: '',
        residence_expiry_date_from: '',
        residence_expiry_date_end: ''
      },
      rules: {
        name: [{ required: true, message: '名前を入力してください', trigger: 'blur' }],
        gender: [{ required: true, message: '性別を選択してください', trigger: 'change' }],
        date_of_birth: [{ required: true, message: '生年月日を選択してください', trigger: 'blur' }],
        phone_number: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],
        email: [
          { required: true, message: 'メールアドレスを入力してください', trigger: 'blur' },
          { type: 'email', message: '正しい形式で入力してください', trigger: 'blur' }
        ],
        login_id: [{ required: true, message: 'ログインIDを入力してください', trigger: 'blur' }],
        residence_card_number: [{ required: true, message: '在留カード番号を入力してください', trigger: 'blur' }],
        residence_status: [{ required: true, message: '在留資格を入力してください', trigger: 'blur' }],
        residence_expiry_date_from: [{ required: true, message: '在留期限（開始）を選択してください', trigger: 'change' }],
        residence_expiry_date_end: [{ required: true, message: '在留期限（終了）を選択してください', trigger: 'change' }]
      }
    };
  },
  methods: {
    submitForm() {
      this.$refs.employeeForm.validate((valid) => {
        if (valid) {
          axios.post('/employee/register', this.form)
            .then(() => {
              this.$message.success('登録が成功しました');
              this.resetForm();
            })
            .catch((error) => {
              this.$message.error('登録に失敗しました: ' + error.message);
            });
        }
      });
    },
    resetForm() {
      this.$refs.employeeForm.resetFields();
    }
  }
}
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
