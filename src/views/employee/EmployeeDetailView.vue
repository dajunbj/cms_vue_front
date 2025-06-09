<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-view" /> 社員情報参照画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        :model="form"
        label-width="150px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名前">
              <el-input
                v-model="form.name"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性別">
              <el-input
                v-model="form.gender"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生年月日">
              <el-input
                v-model="form.date_of_birth"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年齢">
              <el-input
                v-model="form.age"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="電話番号">
              <el-input
                v-model="form.phone_number"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="メールアドレス">
              <el-input
                v-model="form.email"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="ログインID">
              <el-input
                v-model="form.login_id"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在留カード番号">
              <el-input
                v-model="form.residence_card_number"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在留資格">
              <el-input
                v-model="form.residence_status"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="プランCD">
              <el-input
                v-model="form.plan_code"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="在留期限（開始）">
              <el-input
                v-model="form.residence_expiry_date_from"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="在留期限（終了）">
              <el-input
                v-model="form.residence_expiry_date_end"
                readonly
                class="readonly-input"
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
              type="default"
              @click="goBack"
            >
              戻る
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const form = reactive({
  name: '',
  gender: '',
  date_of_birth: '',
  age: null,
  phone_number: '',
  email: '',
  login_id: '',
  residence_card_number: '',
  residence_status: '',
  plan_code: '',
  residence_expiry_date_from: '',
  residence_expiry_date_end: ''
})

// fetch data
const fetchEmployeeDetails = async (id) => {
  try {
    const response = await axios.get(`/employee/detail/${id}`)
    Object.assign(form, response.data.data)
  } catch (error) {
    ElMessage.error('社員情報の取得に失敗しました')
  }
}

// calculate age
watch(() => form.date_of_birth, (newDate) => {
  if (newDate) {
    const today = new Date()
    const birthDate = new Date(newDate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    form.age = age
  } else {
    form.age = null
  }
})

// mounted
const id = route.params.id
if (id) fetchEmployeeDetails(id)

const goBack = () => {
  router.push('/employee')
}
</script>

<style scoped>
.readonly-input >>> .el-input__inner {
  background-color: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed !important;
  border-color: #dcdfe6 !important;
}
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
