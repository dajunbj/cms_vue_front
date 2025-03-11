<template>
    <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
        <div class="header-container">
        <h2 class="header-title">
            <i class="el-icon-user"></i> 責任者明細
        </h2>
        </div>
        <!-- 标签页主体 -->
        <div class="section-container">
            <el-form :model="form" :rules="rules" ref="form" label-width="150px">
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="ユニーク識別子" prop="responsible_id">
                            <el-input v-model="form.responsible_id" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="責任者の電話番号" prop="responsible_phone">
                            <el-input v-model="form.responsible_phone" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="対応する顧客のID" prop="customer_id">
                            <el-input v-model="form.customer_id" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="責任者の役割" prop="responsible_type">
                            <el-input v-model="form.responsible_type" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="責任者所属部門ID" prop="department_id">
                            <el-input v-model="form.department_id" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="10">
                        <el-form-item label="責任者名" prop="responsible_name">
                            <el-input v-model="form.responsible_name" readonly class="el-input-disabled"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row>
                    <el-col :span="10">
                        <el-form-item label="メールアドレス" prop="responsible_email">
                            <el-input v-model="form.responsible_email" readonly class="el-input-disabled"></el-input>
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
                responsible_id: '',
                responsible_phone: '',
                customer_id: '',
                responsible_type: '',
                department_id: '',
                responsible_name: '',
                responsible_email: '',
            },
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

    //初始化时获取ID
    created() {
    const responsible_id = this.$route.params.id; // URL から ID を取得
    this.fetchResponsibleDetails(responsible_id);
  },

  methods: {
    async fetchResponsibleDetails(responsible_id) {
      try {
        const response = await axios.get(`/customer/responsibleDetail/${responsible_id}`);
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