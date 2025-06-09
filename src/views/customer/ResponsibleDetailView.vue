<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 責任者明細
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
              label="ユニーク識別子"
              prop="responsible_id"
            >
              <el-input
                v-model="form.responsible_id"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="責任者の電話番号"
              prop="responsible_phone"
            >
              <el-input
                v-model="form.responsible_phone"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="対応する顧客のID"
              prop="customer_id"
            >
              <el-input
                v-model="form.customer_id"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="責任者の役割"
              prop="responsible_type"
            >
              <el-input
                v-model="form.responsible_type"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="責任者所属部門ID"
              prop="department_id"
            >
              <el-input
                v-model="form.department_id"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="責任者名"
              prop="responsible_name"
            >
              <el-input
                v-model="form.responsible_name"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="メールアドレス"
              prop="responsible_email"
            >
              <el-input
                v-model="form.responsible_email"
                readonly
                class="el-input-disabled"
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// refs
const formRef = ref(null)

// router
const route = useRoute()
const router = useRouter()

// form model
const form = reactive({
  responsible_id: '',
  responsible_phone: '',
  customer_id: '',
  responsible_type: '',
  department_id: '',
  responsible_name: '',
  responsible_email: '',
})

// rules
const rules = {
  responsible_id: [{ required: true, message: '責任者のユニーク識別子は必須です', trigger: 'blur' }],
  responsible_phone: [{ required: true, message: '責任者の電話番号は必須です', trigger: 'blur' }],
  customer_id: [{ required: true, message: '対応する顧客のIDは必須です', trigger: 'blur' }],
  responsible_type: [{ required: true, message: '責任者の役割は必須です', trigger: 'change' }],
  department_id: [{ required: true, message: '責任者所属部門IDは必須です', trigger: 'blur' }],
  responsible_name: [{ required: true, message: '責任者名は必須です', trigger: 'blur' }],
  responsible_email: [{ required: true, message: 'メールアドレスは必須です', trigger: 'blur' }],
}

// fetch detail
const fetchResponsibleDetails = async (responsible_id) => {
  try {
    const response = await axios.get(`/customer/responsibleDetail/${responsible_id}`)
    Object.assign(form, response.data)
  } catch (error) {
    ElMessage.error("顧客情報の取得に失敗しました")
  }
}

// on mounted
onMounted(() => {
  const id = route.params.id
  if (id) {
    fetchResponsibleDetails(id)
  }
})

// go back
const goBack = () => {
  router.push('/customer')
}
</script>
