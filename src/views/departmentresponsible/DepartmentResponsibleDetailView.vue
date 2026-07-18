<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-view" /> 部門責任者参照画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        :model="form"
        label-width="150px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部門名">
              <el-input
                v-model="form.department_name"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="責任者レベル">
              <el-input
                v-model="form.level"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="責任者（社員）">
              <el-input
                v-model="form.employee_name"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作成日時">
              <el-input
                v-model="form.created_at"
                readonly
                class="readonly-input"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新日時">
              <el-input
                v-model="form.updated_at"
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
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const form = reactive({
  department_name: '',
  employee_name: '',
  level: '',
  created_at: '',
  updated_at: ''
})

const fetchResponsibleDetails = async (id) => {
  try {
    const response = await axios.get(`/departmentresponsible/detail/${id}`)
    Object.assign(form, response.data.data)
  } catch (error) {
    ElMessage.error('部門責任者情報の取得に失敗しました')
  }
}

const id = route.params.id
if (id) fetchResponsibleDetails(id)

const goBack = () => {
  router.push('/departmentresponsible')
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
