<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit" /> 契約参照画面
      </h2>
    </div>

    <div class="section-container">
      <el-form
        ref="contractForm"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item
              label="契約ID"
              prop="contract_id"
            >
              <el-input
                v-model="form.contract_id"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="顧客名"
              prop="customer_name"
            >
              <el-input
                v-model="form.customer_name"
                readonly
                class="el-input-disabled"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 省略部分保持不变 -->
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const contractForm = ref(null);

const form = reactive({
  contract_id: '',
  name: '',
  customer_phone: '',
  responsible_name: '',
  responsible_phone: '',
  employee_id: '',
  customer_name: '',
  employee_type: '',
  phone_number: '',
  start_date: '',
  end_date: '',
  unit_price: '',
  tax_rate: '',
  working_hours_min: '',
  working_hours_max: '',
  overtime_limit_hours: '',
  overtime_included: 0,
  overtime_start_time: ''
});

const rules = {
  contract_id: [{ required: true, message: '契約IDを入力してください', trigger: 'blur' }],
  name: [{ required: true, message: '名前を入力してください', trigger: 'blur' }],
  customer_name: [{ required: true, message: '顧客名を入力してください', trigger: 'blur' }],
  employee_type: [{ required: true, message: '社員タイプを選択してください', trigger: 'change' }],
  phone_number: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],
  start_date: [{ required: true, message: '契約開始日を選択してください', trigger: 'change' }],
  end_date: [{ required: true, message: '契約終了日を選択してください', trigger: 'change' }],
  unit_price: [
    { required: true, message: '単価を入力してください', trigger: 'blur' },
    { validator: demical102Check, trigger: 'blur' }
  ],
  tax_rate: [
    { required: true, message: '税率を入力してください', trigger: 'blur' },
    { validator: demical42Check, trigger: 'blur' }
  ],
  working_hours_min: [
    { required: true, message: '最低勤務時間を入力してください', trigger: 'blur' },
    { validator: demical52Check, trigger: 'blur' }
  ],
  working_hours_max: [
    { required: true, message: '最大勤務時間を入力してください', trigger: 'blur' },
    { validator: demical52Check, trigger: 'blur' }
  ],
  overtime_limit_hours: [
    { required: true, message: '最大残業時間を入力してください', trigger: 'blur' },
    { validator: demical52Check, trigger: 'blur' }
  ],
  overtime_start_time: [
    { required: true, message: '残業代開始時間を入力してください', trigger: 'blur' },
    { validator: demical52Check, trigger: 'blur' }
  ],
  customer_phone: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],
  responsible_phone: [{ required: true, message: '電話番号を入力してください', trigger: 'blur' }],
  responsible_name: [{ required: true, message: '姓名を入力してください', trigger: 'blur' }]
};

onMounted(() => {
  fetchContractDetails(route.params.id);
});

const fetchContractDetails = async (contract_id) => {
  try {
    const response = await axios.get(`/contract/contractDetail/${contract_id}`);
    Object.assign(form, response.data);
    form.overtime_included = response.data.overtime_included ? 1 : 0;
  } catch (error) {
    ElMessage.error('社員情報の取得に失敗しました');
  }
};

function demical52Check(rule, value, callback) {
  const decimalPattern = /^-?\d{1,3}(\.\d{1,2})?$/;
  const numberValue = Number(value);
  if (!decimalPattern.test(value)) callback(new Error('正しい値を入力してください'));
  else if (numberValue > 999.99 || numberValue < -999.99) callback(new Error('正しいの値を入力してください'));
  else callback();
}

function demical102Check(rule, value, callback) {
  const decimalPattern = /^-?\d{1,8}(\.\d{1,2})?$/;
  const numberValue = Number(value);
  if (!decimalPattern.test(value)) callback(new Error('正しい値を入力してください'));
  else if (numberValue > 99999999.99 || numberValue < -99999999.99) callback(new Error('正しいの値を入力してください'));
  else callback();
}

function demical42Check(rule, value, callback) {
  const decimalPattern = /^-?\d{1,2}(\.\d{1,2})?$/;
  const numberValue = Number(value);
  if (!decimalPattern.test(value)) callback(new Error('正しい値を入力してください'));
  else if (numberValue > 9.99 || numberValue < -9.99) callback(new Error('正しいの値を入力してください'));
  else callback();
}

function goBack() {
  router.push('/contract');
}
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
