<template>
    <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
      <div class="header-container">
        <h2 class="header-title">
          <i class="el-icon-user"></i> 責任者登録
        </h2>
      </div>
  
      <div class="section-container">
        <el-form :model="form" :rules="rules" ref="form" label-width="150px">
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="ユニーク識別子" prop="responsible_id">
                <el-input v-model="form.responsible_id" placeholder="ユニーク識別子" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="責任者の電話番号" prop="responsible_phone">
                <el-input v-model="form.responsible_phone" placeholder="顧客の電話番号" clearable />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="対応する顧客" prop="customer_name">
                <div class="input-with-button">
                  <el-input v-model="form.customer_name" placeholder="対応する顧客" clearable />
                  <el-button icon="el-icon-search" @click="showCustomerDialog" />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="責任者の役割" prop="responsible_type">
                <el-input v-model="form.responsible_type" placeholder="責任者の役割" clearable />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="責任者所属部門" prop="department_name">
                <div class="input-with-button">
                  <el-input v-model="form.department_name" placeholder="責任者所属部門" />
                  <el-button icon="el-icon-search" @click="showDepartmentDialog" />
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="責任者名" prop="responsible_name">
                <el-input v-model="form.responsible_name" placeholder="責任者名" />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row :gutter="20">
            <el-col :span="10">
              <el-form-item label="メールアドレス" prop="responsible_email">
                <el-input v-model="form.responsible_email" placeholder="メールアドレス" />
              </el-form-item>
            </el-col>
          </el-row>
  
          <el-row>
            <el-col :span="24" style="text-align: center; margin-top: 20px;">
              <el-button type="primary" :loading="isLoading" @click="submitForm">登録</el-button>
              <el-button type="default" @click="goBack">戻る</el-button>
            </el-col>
          </el-row>
  
          <CaseSearchDialog
            :visible.sync="dialogVisible"
            :title="dialogTitle"
            :tableData="dialogData"
            :columns="dialogColumns"
            :filters="dialogFilters"
            :type="dialogType"
            @select-case="handleSelectCase"
          />
        </el-form>
      </div>
    </div>
  </template>
  

  <script>
import axios from 'axios';
import CaseSearchDialog from "@/components/CaseSearchDialog.vue";

export default {
  components: { CaseSearchDialog },
  data() {
    return {
      form: {
        responsible_id: '',
        responsible_phone: '',
        customer_id: '',
        customer_name: '',
        responsible_type: '',
        department_id: '',
        department_name: '',
        employee_id: '',
        responsible_name: '',
        responsible_email: '',
      },
      dialogTitle: '',
      dialogVisible: false,
      dialogData: [],
      dialogColumns: [],
      dialogFilters: [],
      dialogType: '',
      isLoading: false,
      rules: {
        responsible_id: [
          { required: true, message: '責任者のユニーク識別子は必須です', trigger: 'blur' },
        ],
        responsible_phone: [
          { required: true, message: '責任者の電話番号は必須です', trigger: 'blur' },
        ],
        customer_name: [
          { required: true, message: '対応する顧客名は必須です', trigger: 'blur' },
        ],
        responsible_type: [
          { required: true, message: '責任者の役割は必須です', trigger: 'blur' },
        ],
        department_name: [
          { required: true, message: '責任者所属部門名は必須です', trigger: 'blur' },
        ],
        responsible_name: [
          { required: true, message: '責任者名は必須です', trigger: 'blur' },
        ],
        responsible_email: [
          { required: true, message: 'メールアドレスは必須です', trigger: 'blur' },
          { type: 'email', message: '正しいメール形式で入力してください', trigger: ['blur', 'change'] }
        ],
      }
    }
  },

  created() {
    const customer_id = this.$route.params.id;
    if (customer_id) {
      this.form.customer_id = customer_id;
    }
  },

  methods: {
    goBack() {
      this.$router.push("/customer");
    },

    showCustomerDialog() {
      this.dialogTitle = "顧客選択画面";
      this.dialogColumns = [
        { prop: "customer_name", label: "顧客名", width: "220" },
        { prop: "customer_id", label: "ユニーク識別子", width: "220" },
      ];
      this.dialogFilters = [
        {
          prop: "customer_name",
          label: "顧客名",
          type: "el-input",
          width: 300,
          props: { placeholder: "顧客名を入力してください", clearable: true },
        }
      ];
      this.dialogType = "customerSearch";
      this.dialogVisible = true;
    },

    showDepartmentDialog() {
      this.dialogTitle = "部門選択画面";
      this.dialogColumns = [
        { prop: "department_name", label: "部門名", width: "220" },
        { prop: "department_id", label: "部門ID", width: "220" },
      ];
      this.dialogFilters = [
        {
          prop: "department_name",
          label: "部門名",
          type: "el-input",
          width: 300,
          props: { placeholder: "部門名を入力してください", clearable: true },
        }
      ];
      this.dialogType = "departmentSearch";
      this.dialogVisible = true;
    },

    handleSelectCase(selectedCase) {
      if (this.dialogType === "customerSearch") {
        this.form.customer_id = selectedCase.customer_id;
        this.form.customer_name = selectedCase.customer_name;
      } else if (this.dialogType === "departmentSearch") {
        this.form.department_id = selectedCase.department_id;
        this.form.department_name = selectedCase.department_name;
      }
      this.dialogVisible = false;
    },

    async submitForm() {
      this.form.employee_id = sessionStorage.getItem("id");
      this.isLoading = true;
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const response = await axios.post("/customer/registerResponsible", this.form);
            if (response.data.status === "success") {
              this.$message.success("登録が成功しました");
              this.$router.push("/customer");
            } else {
              this.$message.error("登録に失敗しました: " + (response.data.message || ""));
            }
          } catch (error) {
            this.$message.error("登録に失敗しました: " + error.message);
          }
        } else {
          this.$message.error("入力内容を確認してください");
        }
        this.isLoading = false;
      });
    }
  }
};
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
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .input-with-button {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .input-with-button .el-input {
    flex: 1;
  }
  </style>
  