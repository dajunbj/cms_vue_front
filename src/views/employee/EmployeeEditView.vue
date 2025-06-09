<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit" /> 社員情報編集画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="formRef"
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
              label="年齢"
              prop="age"
            >
              <el-input-number
                v-model="form.age"
                :min="0"
                style="width: 100%;"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
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
        </el-row>

        <el-row :gutter="20">
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
          <el-col :span="12">
            <el-form-item
              label="在留カード番号"
              prop="residence_card_number"
            >
              <el-input
                v-model="form.residence_card_number"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="在留資格"
              prop="residence_status"
            >
              <el-input
                v-model="form.residence_status"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="プランCD"
              prop="plan_code"
            >
              <el-input
                v-model="form.plan_code"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="在留期限（開始）"
              prop="residence_expiry_date_from"
            >
              <el-date-picker
                v-model="form.residence_expiry_date_from"
                type="date"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="在留期限（終了）"
              prop="residence_expiry_date_end"
            >
              <el-date-picker
                v-model="form.residence_expiry_date_end"
                type="date"
                style="width: 100%;"
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
            <el-button @click="goBack">
              キャンセル
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)

const form = reactive({
  name: '',
  gender: '男',
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
  residence_card_number: [{ required: true, message: '在留カード番号を入力してください', trigger: 'blur' }],
  residence_status: [{ required: true, message: '在留資格を入力してください', trigger: 'blur' }],
  plan_code: [{ required: true, message: 'プランCDを入力してください', trigger: 'blur' }],
  residence_expiry_date_from: [{ required: true, message: '在留期限（開始）を選択してください', trigger: 'change' }],
  residence_expiry_date_end: [{ required: true, message: '在留期限（終了）を選択してください', trigger: 'change' }]
}

onMounted(() => {
  const id = route.params.id
  fetchEmployeeDetails(id)
})

const fetchEmployeeDetails = async (id) => {
  try {
    const response = await axios.get(`/employee/detail/${id}`)
    Object.assign(form, response.data.data)
  } catch (error) {
    ElMessage.error('社員情報の取得に失敗しました')
  }
}

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

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await axios.put('/employee/update', form)
        ElMessage.success('更新が成功しました')
        router.push('/employee')
      } catch (error) {
        ElMessage.error('更新に失敗しました: ' + error.message)
      }
    }
  })
}

const goBack = () => {
  router.push('/employee')
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
