<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 顧客編集
      </h2>
    </div>
    <div class="section-container">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客名"
              prop="customer_name"
            >
              <el-input
                v-model="form.customer_name"
                placeholder="顧客名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客の電話番号"
              prop="customer_phone"
            >
              <el-input
                v-model="form.customer_phone"
                placeholder="顧客の電話番号"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item
              label="メールアドレス"
              prop="customer_email"
            >
              <el-input
                v-model="form.customer_email"
                placeholder="顧客のメールアドレス"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客タイプ"
              prop="customer_type"
            >
              <el-radio
                v-model="form.customer_type"
                label="個人"
              >
                個人
              </el-radio>
              <el-radio
                v-model="form.customer_type"
                label="法人"
              >
                法人
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客代表者名"
              prop="customer_represent"
            >
              <el-input
                v-model="form.customer_represent"
                placeholder="顧客代表者名"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客FAX"
              prop="customer_fax"
            >
              <el-input
                v-model="form.customer_fax"
                placeholder="顧客FAX"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item
              label="顧客住所"
              prop="customer_address"
            >
              <el-input
                v-model="form.customer_address"
                placeholder="顧客住所"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客郵便番号"
              prop="customer_mail"
            >
              <el-input
                v-model="form.customer_mail"
                placeholder="顧客郵便番号"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col
            :span="20"
            style="text-align: center; margin-top: 20px;"
          >
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitForm"
            >
              登録
            </el-button>
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
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const formRef = ref(null);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();

const form = reactive({
  customer_id: '',
  customer_phone: '',
  customer_name: '',
  customer_type: '個人',
  customer_email: '',
  customer_fax: '',
  customer_represent: '',
  customer_mail: '',
  customer_address: '',
});

const rules = {
  customer_phone: [{ required: true, message: '顧客の電話番号は必須です', trigger: 'blur' }],
  customer_name: [{ required: true, message: '顧客名は必須です', trigger: 'blur' }],
  customer_type: [{ required: true, message: '顧客タイプは必須です', trigger: 'change' }],
  customer_email: [{ required: true, message: '顧客のメールアドレスは必須です', trigger: 'blur' }],
  customer_fax: [{ required: true, message: '顧客FAXは必須です', trigger: 'blur' }],
  customer_represent: [{ required: true, message: '顧客代表者名は必須です', trigger: 'blur' }],
  customer_mail: [{ required: true, message: '顧客郵便番号は必須です', trigger: 'blur' }],
  customer_address: [{ required: true, message: '顧客住所は必須です', trigger: 'blur' }],
};

const fetchCustomerDetails = async (customer_id) => {
  try {
    const response = await axios.get(`/customer/customerDetail/${customer_id}`);
    Object.assign(form, response.data);
  } catch (error) {
    ElMessage.error('顧客情報の取得に失敗しました');
  }
};

const submitForm = () => {
  isLoading.value = true;
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/customer/updateCustomer', form);
        if (response.data.status === 'success') {
          ElMessage.success('更新が成功しました');
        } else {
          ElMessage.error('更新に失敗しました: ' + (response.data.message || ''));
        }
      } catch (error) {
        ElMessage.error('登録に失敗しました: ' + error.message);
      }
    } else {
      ElMessage.error('入力内容を確認してください');
    }
    isLoading.value = false;
  });
};

const goBack = () => {
  router.push('/customer');
};

onMounted(() => {
  const customer_id = route.params.id;
  fetchCustomerDetails(customer_id);
});
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
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
</style>
