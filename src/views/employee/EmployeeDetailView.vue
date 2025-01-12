<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <!-- 添加标题部分 -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-view"></i> 社員情報参照画面
      </h2>
    </div>

    <!-- 表单部分 -->
    <div class="section-container">
      <el-form :model="form" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社員ID">
              <el-input v-model="form.employeeId" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名前">
              <el-input v-model="form.name" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性別">
              <el-input v-model="form.sex" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生年月日">
              <el-input v-model="form.birthday" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="住所">
              <el-input v-model="form.address" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="携帯">
              <el-input v-model="form.phone" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入社年月日">
              <el-input v-model="form.joiningDate" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="メール">
              <el-input v-model="form.mail" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="職種">
              <el-input v-model="form.jobType" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="給料">
              <el-input v-model="form.salary" readonly class="readonly-input"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="default" @click="goBack">戻る</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeDetailView",
  data() {
    return {
      form: {
        employeeId: "",
        name: "",
        sex: "",
        birthday: "",
        address: "",
        phone: "",
        joiningDate: "",
        mail: "",
        jobType: "",
        salary: 0,
      },
    };
  },
  created() {
    const id = this.$route.params.id; // URL から ID を取得
    this.fetchEmployeeDetails(id);
  },
  methods: {
    async fetchEmployeeDetails(id) {
      try {
        const response = await axios.get(`/employee/detail/${id}`);
        this.form = response.data;
      } catch (error) {
        this.$message.error("社員情報の取得に失敗しました");
      }
    },
    goBack() {
      this.$router.push("/employee");
    },
  },
};
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
