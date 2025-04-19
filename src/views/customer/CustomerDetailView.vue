<template>
    <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
        <div class="header-container">
        <h2 class="header-title">
            <i class="el-icon-user"></i> 顧客明細
        </h2>
        </div>
        <!-- 标签页主体 -->
        <div class="section-container">
            <el-form :model="form" :rules="rules" ref="form" label-width="150px">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客名" prop="customer_name">
                            <el-input v-model="form.customer_name" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客の電話番号" prop="customer_phone">
                            <el-input v-model="form.customer_phone" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="メールアドレス" prop="customer_email">
                            <el-input v-model="form.customer_email" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客タイプ" prop="customer_type">
                            <el-radio disabled v-model="form.customer_type" label="個人">個人</el-radio>
                            <el-radio disabled v-model="form.customer_type" label="法人">法人</el-radio>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客代表者名" prop="customer_represent">
                            <el-input v-model="form.customer_represent" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客FAX" prop="customer_fax">
                            <el-input v-model="form.customer_fax" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="顧客住所" prop="customer_address">
                            <el-input v-model="form.customer_address" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="顧客郵便番号" prop="customer_mail">
                            <el-input v-model="form.customer_mail" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="20" style="text-align: center; margin-top: 20px;">
                            <el-button type="default" @click="goBack">戻る</el-button>
                    </el-col>
                </el-row> 
            </el-form>
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
            rules: {
                customer_id: [
                    { required: true, message: '顧客のユニーク識別子は必須です', trigger: 'blur' },
                ],
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

    //初始化时获取ID
    created() {
    const customer_id = this.$route.params.id; // URL から ID を取得
    this.fetchCustomerDetails(customer_id);
  },

  methods: {
    async fetchCustomerDetails(customer_id) {
      try {
        const response = await axios.get(`/customer/customerDetail/${customer_id}`);
        this.form = response.data;
      } catch (error) {
        this.$message.error("顧客情報の取得に失敗しました");
      }
    },

    goBack() {
      this.$router.push("/customer");
    },
  }
}
</script>