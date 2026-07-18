<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit" /> 部門編集画面
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

const form = reactive({
  department_id: '',
  department_name: ''
})

const rules = {
  department_name: [{ required: true, message: '部門名を入力してください', trigger: 'blur' }]
}

onMounted(() => {
  const id = route.params.id
  fetchDepartmentDetails(id)
})

const fetchDepartmentDetails = async (id) => {
  try {
    const response = await axios.get(`/department/edit/${id}`)
    Object.assign(form, response.data.data)
  } catch (error) {
    ElMessage.error('部門情報の取得に失敗しました')
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await axios.put('/department/update', form)
        ElMessage.success('更新が成功しました')
        router.push('/department')
      } catch (error) {
        ElMessage.error('更新に失敗しました: ' + error.message)
      }
    }
  })
}

const goBack = () => {
  router.push('/department')
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
