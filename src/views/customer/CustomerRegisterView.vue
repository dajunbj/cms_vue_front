<template>
    <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
        <div class="header-container">
        <h2 class="header-title">
            <i class="el-icon-user"></i> 顧客登録
        </h2>
        </div>
        <!-- 标签页主体 -->
        <div class="section-container">
            <el-form :model="form" :rules="rules" ref="form" label-width="150px">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客名" prop="customer_name">
                            <el-input v-model="form.customer_name" placeholder="顧客名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客の電話番号" prop="customer_phone">
                            <el-input v-model="form.customer_phone" placeholder="顧客の電話番号" clearable></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="メールアドレス" prop="customer_email">
                            <el-input v-model="form.customer_email" placeholder="顧客のメールアドレス"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客タイプ" prop="customer_type">
                            <el-radio v-model="form.customer_type" label="個人">個人</el-radio>
                            <el-radio v-model="form.customer_type" label="法人">法人</el-radio>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客代表者名" prop="customer_represent">
                            <el-input v-model="form.customer_represent" placeholder="顧客代表者名"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客FAX" prop="customer_fax">
                            <el-input v-model="form.customer_fax" placeholder="顧客FAX"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客住所" prop="customer_address">
                            <el-input v-model="form.customer_address" placeholder="顧客住所"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客郵便番号" prop="customer_mail">
                            <el-input v-model="form.customer_mail" placeholder="顧客郵便番号"></el-input>
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
            <!-- 删除确认弹窗 -->
            <el-dialog
                title="確認"
                :visible.sync="dialogVisible"
                width="30%"
                @close="closeDialog">
                <span>このまま責任者登録へ進みますか？</span>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="handleCancel">キャンセル</el-button>
                  <el-button type="primary" @click="handleDialogConfirm">確認</el-button>
                </span>
            </el-dialog>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return {
            form: {
                customer_id: '',
                customer_phone: '',
                customer_name: '',
                customer_type: "個人",
                customer_email: '',
                customer_fax: '',
                customer_represent: '',
                customer_mail: '',
                customer_address: '',
            },
            dialogVisible: false,
            rules: {
                customer_phone: [
                    { required: true, message: '顧客の電話番号は必須です', trigger: 'blur' },
                ],
                customer_name: [
                    { required: true, message: '顧客名は必須です', trigger: 'blur' },
                ],
                customer_type: [
                    { required: true, message: '顧客タイプは必須です', trigger: 'change' },
                ],
                customer_email: [
                    { required: true, message: '顧客のメールアドレスは必須です', trigger: 'blur' },
                ],
                customer_fax: [
                    { required: true, message: '顧客FAXは必須です', trigger: 'blur' },
                ],
                customer_represent: [
                    { required: true, message: '顧客代表者名は必須です', trigger: 'blur' },
                ],
                customer_mail: [
                    { required: true, message: '顧客郵便番号は必須です', trigger: 'blur' },
                ],
                customer_address: [
                    { required: true, message: '顧客住所は必須です', trigger: 'blur' },
                ],
            }
        }
    },

    methods: {
    goBack() {
      this.$router.push("/customer");
    },

    async submitForm() {
      this.isLoading = true;
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          try {
            const response = await axios.post("/customer/registerCustomer", this.form);
            if(response.data.status === "success"){
            this.$message.success("更新が成功しました") ;
            this.form.customer_id = response.data.customer_id;
            this.dialogVisible = true;
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

    closeDialog() {
        this.$router.push("/customer");
    },

    handleCancel(){
        this.$router.push("/customer");
    },

    handleDialogConfirm() {
        this.$router.push({ path: `/customer/registerRes/${this.form.customer_id}` }); 
    },

    }
}
</script>