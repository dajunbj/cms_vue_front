<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit" /> 部門責任者編集画面
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
              label="部門"
              prop="department_id"
            >
              <el-select
                v-model="form.department_id"
                placeholder="部門を選択してください"
                style="width: 100%;"
                clearable
                @change="handleDepartmentChange"
              >
                <el-option
                  v-for="dept in departmentOptions"
                  :key="dept.department_id"
                  :label="dept.department_name"
                  :value="dept.department_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="責任者レベル"
              prop="level"
            >
              <el-radio-group v-model="form.level">
                <el-radio label="部長">
                  部長
                </el-radio>
                <el-radio label="副部長">
                  副部長
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item
              label="責任者（社員）"
              prop="employee_id"
            >
              <el-select
                v-model="form.employee_id"
                placeholder="部門を選択後に責任者を選択してください"
                style="width: 100%;"
                clearable
                :disabled="!form.department_id"
              >
                <el-option
                  v-for="emp in employeeOptions"
                  :key="emp.employee_id"
                  :label="emp.name"
                  :value="emp.employee_id"
                />
              </el-select>
              <div class="form-tip">
                ※ 部門は先に指定してください。責任者は後から指定できますが、保存時には必ず指定が必要です。
              </div>
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
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const departmentOptions = ref([])
const employeeOptions = ref([])

const form = reactive({
  responsible_id: '',
  department_id: '',
  employee_id: '',
  level: '部長'
})

const rules = {
  department_id: [{ required: true, message: '部門を選択してください', trigger: 'change' }],
  employee_id: [{ required: true, message: '責任者（社員）を選択してください', trigger: 'change' }],
  level: [{ required: true, message: '責任者レベルを選択してください', trigger: 'change' }]
}

const fetchDepartments = async () => {
  try {
    const response = await axios.get('/departmentresponsible/departments')
    departmentOptions.value = response.data.data
  } catch (error) {
    ElMessage.error('部門情報の取得に失敗しました')
  }
}

const fetchEmployeesByDepartment = async (departmentId) => {
  if (!departmentId) {
    employeeOptions.value = []
    return
  }
  try {
    const response = await axios.get(`/departmentresponsible/employees/${departmentId}`)
    employeeOptions.value = response.data.data
  } catch (error) {
    ElMessage.error('社員情報の取得に失敗しました')
  }
}

const handleDepartmentChange = (departmentId) => {
  form.employee_id = ''
  fetchEmployeesByDepartment(departmentId)
}

const fetchResponsibleDetails = async (id) => {
  try {
    const response = await axios.get(`/departmentresponsible/edit/${id}`)
    Object.assign(form, response.data.data)
    // 現在指定されている部門の社員一覧を取得し、既存の責任者が選択肢に含まれるようにする
    await fetchEmployeesByDepartment(form.department_id)
  } catch (error) {
    ElMessage.error('部門責任者情報の取得に失敗しました')
  }
}

onMounted(() => {
  const id = route.params.id
  fetchDepartments()
  fetchResponsibleDetails(id)
})

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await axios.put('/departmentresponsible/update', form)
        ElMessage.success('更新が成功しました')
        router.push('/departmentResponsible')
      } catch (error) {
        ElMessage.error('更新に失敗しました: ' + error.message)
      }
    }
  })
}

const goBack = () => {
  router.push('/departmentresponsible')
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
.form-tip {
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style>
