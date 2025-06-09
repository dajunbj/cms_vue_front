<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 責任者編集
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
          <el-col
            :span="10"
            :offset="2"
          >
            <el-form-item
              label="責任者の電話番号"
              prop="responsible_phone"
            >
              <el-input
                v-model="form.responsible_phone"
                placeholder="顧客の電話番号"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="対応する顧客"
              prop="customer_id"
            >
              <el-input
                v-model="form.customer_name"
                placeholder="対応する顧客"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button
              icon="el-icon-search"
              @click="showCustomerDialog"
            />
          </el-col>
          <el-col :span="1">
            <el-input
              v-model="form.customer_id"
              :disabled="true"
            />
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="責任者の役割"
              prop="responsible_type"
            >
              <el-input
                v-model="form.responsible_type"
                placeholder="責任者の役割"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item
              label="責任者所属部門"
              prop="department_name"
            >
              <el-input
                v-model="form.department_name"
                placeholder="責任者所属部門"
              />
            </el-form-item>
          </el-col>
          <el-col :span="1">
            <el-button
              icon="el-icon-search"
              @click="showDepartmentDialog"
            />
          </el-col>
          <el-col :span="1">
            <el-input
              v-model="form.department_id"
              :disabled="true"
            />
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="責任者名"
              prop="responsible_name"
            >
              <el-input
                v-model="form.responsible_name"
                placeholder="責任者名"
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
                placeholder="メールアドレス"
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
            <el-button
              type="default"
              @click="goBack"
            >
              戻る
            </el-button>
          </el-col>
        </el-row>
      </el-form>

      <CaseSearchDialog
        v-model:visible="dialogVisible"
        :title="dialogTitle"
        :table-data="dialogData"
        :columns="dialogColumns"
        :filters="dialogFilters"
        :type="dialogType"
        @select-case="handleSelectCase"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import CaseSearchDialog from '@/components/CaseSearchDialog.vue'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const isLoading = ref(false)

const form = reactive({
  responsible_id: '',
  responsible_phone: '',
  customer_name: '',
  customer_id: '',
  responsible_type: '',
  department_id: '',
  department_name: '',
  responsible_name: '',
  responsible_email: '',
})

const dialogTitle = ref('')
const dialogVisible = ref(false)
const dialogData = ref([])
dialogData.value = []
const dialogColumns = ref([])
const dialogFilters = ref([])
const dialogType = ref('')

const rules = {
  responsible_id: [{ required: true, message: '責任者のユニーク識別子は必須です', trigger: 'blur' }],
  responsible_phone: [{ required: true, message: '責任者の電話番号は必須です', trigger: 'blur' }],
  customer_id: [{ required: true, message: '対応する顧客のIDは必須です', trigger: 'blur' }],
  responsible_type: [{ required: true, message: '責任者の役割は必須です', trigger: 'change' }],
  department_id: [{ required: true, message: '責任者所属部門IDは必須です', trigger: 'blur' }],
  responsible_name: [{ required: true, message: '責任者名は必須です', trigger: 'blur' }],
  responsible_email: [{ required: true, message: 'メールアドレスは必須です', trigger: 'blur' }],
}

const showCustomerDialog = () => {
  dialogTitle.value = '顧客選択画面'
  dialogColumns.value = [
    { prop: 'customer_name', label: '顧客名', width: '220' },
    { prop: 'customer_id', label: 'ユニーク識別子', width: '220' },
  ]
  dialogFilters.value = [
    {
      prop: 'customer_name',
      label: '顧客名',
      type: 'el-input',
      width: 300,
      props: { placeholder: '顧客名を入力してください', clearable: true },
    },
  ]
  dialogType.value = 'customerSearch'
  dialogVisible.value = true
}

const showDepartmentDialog = () => {
  dialogTitle.value = '部門選択画面'
  dialogColumns.value = [
    { prop: 'department_name', label: '部門名', width: '220' },
    { prop: 'department_id', label: '部門ID', width: '220' },
  ]
  dialogFilters.value = [
    {
      prop: 'department_name',
      label: '部門名',
      type: 'el-input',
      width: 300,
      props: { placeholder: '部門名を入力してください', clearable: true },
    },
  ]
  dialogType.value = 'departmentSearch'
  dialogVisible.value = true
}

const handleSelectCase = (selectedCase) => {
  if (dialogType.value === 'customerSearch') {
    form.customer_id = selectedCase.customer_id
    form.customer_name = selectedCase.customer_name
  } else if (dialogType.value === 'departmentSearch') {
    form.department_id = selectedCase.department_id
    form.department_name = selectedCase.department_name
  }
  dialogVisible.value = false
}

const fetchResponsibleDetails = async (responsible_id) => {
  try {
    const response = await axios.get(`/customer/responsibleDetail/${responsible_id}`)
    Object.assign(form, response.data)
  } catch (error) {
    ElMessage.error('顧客情報の取得に失敗しました')
  }
}

const submitForm = () => {
  isLoading.value = true
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/customer/updateResponsible', form)
        if (response.data.status === 'success') {
          ElMessage.success('更新が成功しました')
          router.push('/customer')
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

const goBack = () => {
  router.push('/customer')
}

onMounted(() => {
  const id = route.params.id
  if (id) fetchResponsibleDetails(id)
})
</script>

<style scoped>
.el-input-disabled {
  background-color: #f5f7fa;
}
</style>
