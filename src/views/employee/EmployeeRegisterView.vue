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
            <el-form-item label="性別" prop="sex">
              <el-radio-group v-model="form.sex">
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
          <el-col :span="12" dis>
            <el-form-item label="年齢" prop="age">
              <el-input-number v-model="form.age" :min="0" style="width: 100%;" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="住所" prop="address">
              <el-input v-model="form.address" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技術者の技術説明" prop="technic_description">
              <el-input type="textarea" v-model="form.technic_description" rows="2" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="電話番号" prop="phone_number">
              <el-input v-model="form.phone_number" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="メール" prop="email">
              <el-input v-model="form.email" clearable />
            </el-form-item>
          </el-col>
        </el-row>
         
        <!-- ----------BP不要項目---------- -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社員タイプ" prop="employee_type">
            <el-select v-model="form.employee_type" placeholder="選択">
            <el-option label="社員" value="DE" />
            <el-option label="パートナー" value="BP" />
            </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10" v-if="form.employee_type === 'BP'">
            <el-form-item label="BP会社ID" prop="bp_company_id">
            <el-input v-model="form.bp_company_id" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.employee_type === 'DE'">
            <el-form-item label="部門ID" prop="department_id">
            <el-input v-model="form.department_id" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.employee_type === 'DE'">
          <el-col :span="12">
            <el-form-item label="ボーナス" prop="bonus">
              <el-input-number v-model="form.bonus" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="契約タイプ" prop="contract_type">
              <el-select v-model="form.contract_type" placeholder="選択" clearable style="width: 100%;">
                <el-option label="正社員" value="正社員" />
                <el-option label="契約社員" value="契約社員" />
                <el-option label="個人事業主" value="個人事業主" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.employee_type === 'DE'">
          <el-col :span="12">
            <el-form-item label="役職" prop="position">
              <el-input v-model="form.position" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基本給" prop="salary">
              <el-input-number v-model="form.salary" :min="0" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="form.employee_type === 'DE'">
          <el-col :span="12">
            <el-form-item label="入社日" prop="hire_date">
              <el-date-picker v-model="form.hire_date" type="date" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="退社日" prop="resignation_date">
              <el-date-picker v-model="form.resignation_date" type="date" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 同样样式继续加入其他字段，可按功能组块：緊急連絡先・在留資格など -->

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
        employee_id: '',
        name: '',
        sex: '男',
        work_years: null,
        specialty_skills: '',
        age: null,
        address: '',
        technic_description: '',
        employee_type: '',
        company_id: '',
        bp_company_id: '',
        department_id: '',
        hire_date: '',
        resignation_date: '',
        phone_number: '',
        email: '',
        position: '',
        salary: null,
        bonus: null,
        contract_type: ''
        // 其他字段（emergency、residence等）请按需继续补充
      },
      rules: {
        employee_id: [{ required: true, message: '社員IDを入力してください', trigger: 'blur' }],
        name: [{ required: true, message: '名前を入力してください', trigger: 'blur' }],
        sex: [{ required: true, message: '性別を選択してください', trigger: 'change' }],
        work_years: [{ type: 'number', required: true, message: '勤務年数を入力してください', trigger: 'blur' }],
        date_of_birth: [{required: true,message: '生年月日を選択してください',trigger: 'blur'}],
        address: [{ required: true, message: '住所を入力してください', trigger: 'blur' }],
        employee_type: [{ required: true, message: '社員タイプを選択してください', trigger: 'change' }],

        bp_company_id: [{
                  validator: (rule, value, callback) => {
                    if (this.form.employee_type === 'BP' && !value) {
                      return callback(new Error('BP会社を入力してください'));
                    }
                    callback();
                  },
                  trigger: 'blur'
                }],


        department_id: [{
                          validator: (rule, value, callback) => {
                            if (this.form.employee_type === 'DE' && !value) {
                              return callback(new Error('部門IDを入力してください'));
                            }
                            callback();
                          },
                          trigger: 'blur'
                        }],

        hire_date: [
            {
              validator: (rule, value, callback) => {
                if (this.form.employee_type === 'DE') {
                  if (!value) {
                    return callback(new Error('入社日を選択してください'));
                  }
                }
                callback();
              },
              trigger: 'change'
            }
          ],

        phone_number: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],

        email: [
          { required: true, message: 'メールを入力してください', trigger: 'blur' },
          { type: 'email', message: '正しいメール形式を入力してください', trigger: 'blur' }
        ],

        position: [{validator: (rule, value, callback) => {
                      if (this.form.employee_type === 'DE' && !value) {
                        return callback(new Error('役職を入力してください'));
                      }
                      callback();
                    },
                    trigger: 'blur'
                  }],

        bonus: [{
                validator: (rule, value, callback) => {
                  if (this.form.employee_type === 'DE') {
                    if (value === null || value === undefined || value === '') {
                      return callback(new Error('ボーナスを入力してください'));
                    }
                    if (value <= 1) {
                      return callback(new Error('ボーナスは1以上を入力してください'));
                    }
                  }
                  callback();
                },
                trigger: 'blur'
              }],

        contract_type: [{ validator: (rule, value, callback) => {
                            if (this.form.employee_type === 'DE' && !value) {
                              return callback(new Error('契約タイプを選択してください'));
                            }
                            callback();
                          },
                          trigger: 'blur'
                        }],

        resignation_date: [
          {
            validator: (rule, value, callback) => {
              if (this.form.employee_type !== 'DE') return callback();
              if (!value) return callback(); // NULL可能
              if (value < this.form.hire_date) {
                return callback(new Error('退社日は入社日以降の日付を選択してください'));
              }
              callback();
            },
            trigger: 'change'
          }
        ],

      }
    }
  },

  watch: {
    //年齢計算
    'form.date_of_birth'(newDate) {
      if (newDate) {
        const today = new Date();
        const birthDate = new Date(newDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        this.form.age = age;
      } else {
        this.form.age = null;
      }
    }
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
