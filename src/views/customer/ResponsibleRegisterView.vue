<template>
    <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
        <div class="header-container">
        <h2 class="header-title">
            <i class="el-icon-user"></i> 責任者登録
        </h2>
        </div>
        <!-- 标签页主体 -->
        <div class="section-container">
            <el-form :model="form" :rules="rules" ref="form" label-width="150px">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="ユニーク識別子" prop="responsible_id">
                            <el-input v-model="form.responsible_id" placeholder="ユニーク識別子" clearable></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10" :offset="2">
                        <el-form-item label="責任者の電話番号" prop="responsible_phone">
                            <el-input v-model="form.responsible_phone" placeholder="顧客の電話番号" clearable></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="対応する顧客" prop="customer_name">
                            <el-input v-model="form.customer_name" placeholder="対応する顧客" clearable></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="1">
                            <el-button  icon="el-icon-search" @click="showCustomerDialog"></el-button>
                    </el-col>
                    <el-col :span="1">
                        <el-input v-model="form.customer_id" :disabled="true"></el-input>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="責任者の役割" prop="responsible_type">
                            <el-input v-model="form.responsible_type" placeholder="責任者の役割" clearable></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="責任者所属部門" prop="department_name">
                            <el-input v-model="form.department_name" placeholder="責任者所属部門"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="1">
                            <el-button  icon="el-icon-search" @click="showDepartmentDialog"></el-button>
                    </el-col>
                    <el-col :span="1">
                        <el-input v-model="form.department_id" :disabled="true"></el-input>
                    </el-col>
                    <el-col :span="10" :offset="2">
                        <el-form-item label="責任者名" prop="responsible_name">
                            <el-input v-model="form.responsible_name" placeholder="責任者名"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="メールアドレス" prop="responsible_email">
                            <el-input v-model="form.responsible_email" placeholder="メールアドレス"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="20" style="text-align: center; margin-top: 20px;">
                            <el-button type="primary" :loading="isLoading" @click="submitForm">登録</el-button>
                            <el-button type="default" @click="goBack">戻る</el-button>
                    </el-col>
                </el-row> 
            </el-form>

                <!-- 使用通用弹窗 -->
                <CaseSearchDialog
                :visible.sync="dialogVisible"
                :title="dialogTitle"
                :tableData="dialogData"
                :columns="dialogColumns"
                :filters="dialogFilters"
                :type="dialogType"
                @select-case="handleSelectCase" 
                />
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
                customer_id: [
                    { required: true, message: '対応する顧客のIDは必須です', trigger: 'blur' },
                ],
                responsible_type: [
                    { required: true, message: '責任者の役割は必須です', trigger: 'change' },
                ],
                department_id: [
                    { required: true, message: '責任者所属部門IDは必須です', trigger: 'blur' },
                ],
                responsible_name: [
                    { required: true, message: '責任者名は必須です', trigger: 'blur' },
                ],
                responsible_email: [
                    { required: true, message: 'メールアドレスは必須です', trigger: 'blur' },
                ],
            }
        }
    },

  created() {
    const customer_id = this.$route.params.id; // URL から ID を取得
    this.form.customer_id = customer_id;
  },

  methods: {
    goBack() {
      this.$router.push("/customer");
    },

    showCustomerDialog() {
      this.dialogVisible = true;
      this.dialogTitle = "顧客選択画面";
      this.dialogColumns= [
                    { prop: "customer_name", label: "顧客名", width: "220" },
                    { prop: "customer_id", label: "ユニーク識別子", width: "220" },
                ];
      this.dialogFilters= [
                    {
                    prop: "customer_name",
                    label: "顧客名",
                    type: "el-input",
                    width: 300,
                    props: { placeholder: "顧客名を入力してください", clearable: true },
                    },
                ];
      this.dialogType="customerSearch";
    },

    showDepartmentDialog() {
      this.dialogVisible = true;
      this.dialogTitle = "部門選択画面";
      this.dialogColumns= [
                    { prop: "department_name", label: "部門名", width: "220" },
                    { prop: "department_id", label: "部門ID", width: "220" },
                ];
      this.dialogFilters= [
                    {
                    prop: "department_name",
                    label: "部門名",
                    type: "el-input",
                    width: 300,
                    props: { placeholder: "部門名を入力してください", clearable: true },
                    },
                ];
      this.dialogType="departmentSearch";
    },

    async handleSelectCase(selectedCase) {
      if(this.dialogType=="customerSearch"){
      this.form.customer_id = selectedCase.customer_id;
      this.form.customer_name = selectedCase.customer_name;
      }
      else if(this.dialogType=="departmentSearch"){
       this.form.department_id = selectedCase.department_id; 
       this.form.department_name = selectedCase.department_name;
      }
      this.dialogVisible = false;
    },

    async submitForm() {
      this.form.employee_id=sessionStorage.getItem("id");
      this.isLoading = true;
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const response = await axios.post("/customer/registerResponsible", this.form);
            if(response.data.status === "success"){
            this.$message.success("更新が成功しました") ;
            this.$router.push("/customer");
            }
            else if(response.data.status === "error"){
              this.$message.error("更新に失敗しました: " + response.data.message);
            }
            else{
              this.$message.error("更新に失敗しました");
            }
          } catch (error) {
            this.$message.error("登録に失敗しました: " + error.message);
          }
        } else {
          this.$message.error("入力内容を確認してください");
        }
      });
      this.isLoading = false;
    },
  }
}
</script>