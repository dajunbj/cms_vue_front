<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <!-- 添加标题部分 -->
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit"></i> 社員情報編集画面
      </h2>
    </div>

    <!-- 表单部分 -->
    <div class="section-container">
      <el-form :model="form" :rules="rules" ref="employeeForm" label-width="150px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="社員ID" prop="employeeId">
              <el-input v-model="form.employeeId" readonly class="el-input-disabled"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名前" prop="name">
              <el-input v-model="form.name" placeholder="名前をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性別" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio label="1">男性</el-radio>
                <el-radio label="2">女性</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生年月日" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="生年月日を選択してください"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="住所" prop="address">
              <el-input v-model="form.address" placeholder="住所をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="携帯" prop="phone">
              <el-input v-model="form.phone" placeholder="携帯をご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入社年月日" prop="joiningDate">
              <el-date-picker
                v-model="form.joiningDate"
                type="date"
                placeholder="入社年月日を選択してください"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="メール" prop="mail">
              <el-input v-model="form.mail" placeholder="メールをご入力ください。" clearable></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="職種" prop="jobType">
              <el-select v-model="form.jobType" placeholder="職種を選択してください" clearable>
                <el-option label="営業" value="営業"></el-option>
                <el-option label="開発" value="開発"></el-option>
                <el-option label="経理" value="経理"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="給料" prop="salary">
              <el-input-number v-model="form.salary" placeholder="給料をご入力ください" :min="0" :max="1000000" style="width: 100%;"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24" style="text-align: center; margin-top: 20px;">
            <el-button type="primary" @click="submitForm">保存</el-button>
            <el-button type="default" @click="goBack">キャンセル</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeEditView",
  data() {
    return {
      form: {
        employeeId: "",
        name: "",
        sex: "1",
        birthday: "",
        address: "",
        phone: "",
        joiningDate: "",
        mail: "",
        jobType: "",
        salary: 0,
      },
      rules: {
        employeeId: [
          { required: true, message: "社員IDを入力してください", trigger: "blur" },
        ],
        name: [
          { required: true, message: "名前を入力してください", trigger: "blur" },
        ],
        sex: [
          { required: true, message: "性別を選択してください", trigger: "change" },
        ],
        birthday: [
          { required: true, message: "生年月日を選択してください", trigger: "change" },
        ],
        address: [
          { required: true, message: "住所を入力してください", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "携帯を入力してください", trigger: "blur" },
        ],
        joiningDate: [
          { required: true, message: "入社年月日を選択してください", trigger: "change" },
        ],
        mail: [
          { required: true, message: "メールを入力してください", trigger: "blur" },
          { type: "email", message: "正しいメール形式を入力してください", trigger: "blur" },
        ],
        jobType: [
          { required: true, message: "職種を選択してください", trigger: "change" },
        ],
        salary: [
          { required: true, message: "給料を入力してください", trigger: "blur" },
        ],
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
    async submitForm() {
      this.$refs.employeeForm.validate(async (valid) => {
        if (valid) {
          try {
            await axios.put(`/employee/update`, this.form);
            this.$message.success("更新が成功しました");
            this.$router.push("/employee");
          } catch (error) {
            this.$message.error("更新に失敗しました: " + error.message);
          }
        }
      });
    },
    goBack() {
      this.$router.push("/employee");
    },
  },
};
</script>

<style scoped>
.el-input-disabled >>> .el-input__inner {
  background-color: lightgray !important;
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
