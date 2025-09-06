<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 顧客登録
      </h2>
    </div>
    <div class="section-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客名"
              prop="customer_name"
            >
              <el-input
                v-model="form.customer_name"
                placeholder="顧客名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客の電話番号"
              prop="customer_phone"
            >
              <el-input
                v-model="form.customer_phone"
                placeholder="顧客の電話番号"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="メールアドレス"
              prop="customer_email"
            >
              <el-input
                v-model="form.customer_email"
                placeholder="顧客のメールアドレス"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客タイプ"
              prop="customer_type"
            >
              <el-radio-group v-model="form.customer_type">
                <el-radio label="個人">
                  個人
                </el-radio>
                <el-radio label="法人">
                  法人
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客代表者名"
              prop="customer_represent"
            >
              <el-input
                v-model="form.customer_represent"
                placeholder="顧客代表者名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客FAX"
              prop="customer_fax"
            >
              <el-input
                v-model="form.customer_fax"
                placeholder="顧客FAX"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客住所"
              prop="customer_address"
            >
              <el-input
                v-model="form.customer_address"
                placeholder="顧客住所"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客郵便番号"
              prop="customer_mail"
            >
              <el-input
                v-model="form.customer_mail"
                placeholder="顧客郵便番号"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col
            :span="20"
            style="text-align: center; margin-top: 20px;"
          >
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitForm"
            >
              登録
            </el-button>
            <el-button @click="goBack">
              戻る
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <el-dialog
        v-model="dialogVisible"
        title="確認"
        width="30%"
        @close="goBack"
      >
        <span>このまま責任者登録へ進みますか？</span>
        <template #footer>
          <el-button @click="goBack">
            キャンセル
          </el-button>
          <el-button
            type="primary"
            @click="handleDialogConfirm"
          >
            確認
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const isLoading = ref(false)
const dialogVisible = ref(false)

const form = reactive({
  customer_id: '',
  customer_phone: '',
  customer_name: '',
  customer_type: '個人',
  customer_email: '',
  customer_fax: '',
  customer_represent: '',
  customer_mail: '',
  customer_address: ''
})

const rules = {
  customer_phone: [{ required: true, message: '顧客の電話番号は必須です', trigger: 'blur' }],
  customer_name: [{ required: true, message: '顧客名は必須です', trigger: 'blur' }],
  customer_type: [{ required: true, message: '顧客タイプは必須です', trigger: 'change' }],
  customer_email: [{ required: true, message: '顧客のメールアドレスは必須です', trigger: 'blur' }],
  customer_fax: [{ required: true, message: '顧客FAXは必須です', trigger: 'blur' }],
  customer_represent: [{ required: true, message: '顧客代表者名は必須です', trigger: 'blur' }],
  customer_mail: [{ required: true, message: '顧客郵便番号は必須です', trigger: 'blur' }],
  customer_address: [{ required: true, message: '顧客住所は必須です', trigger: 'blur' }]
}

const goBack = () => {
  router.push('/customer')
}

const handleDialogConfirm = () => {
  router.push({ path: `/customer/registerRes/${form.customer_id}` })
}

const submitForm = () => {
  isLoading.value = true
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/customer/registerCustomer', form)
        if (response.data.status === 'success') {
          ElMessage.success('更新が成功しました')
          form.customer_id = response.data.customer_id
          dialogVisible.value = true
        } else if (response.data.status === 'error') {
          ElMessage.error('更新に失敗しました: ' + response.data.message)
        } else {
          ElMessage.error('更新に失敗しました')
        }
      } catch (error) {
        ElMessage.error('登録に失敗しました: ' + error.message)
      }
    } else {
      ElMessage.error('入力内容を確認してください')
    }
    isLoading.value = false
  })
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
