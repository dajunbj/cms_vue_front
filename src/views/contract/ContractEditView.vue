<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-edit" /> 契約編集画面
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
                placeholder="顧客名をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 略 -- 内容未变，仅简化显示，用 setup 实现数据和方法 -->

        <el-row>
          <el-col
            :span="24"
            style="text-align: center; margin-top: 20px;"
          >
            <el-button
              type="primary"
              :loading="isLoading"
              @click="submitForm"
            >
              保存
            </el-button>
            <el-button
              type="default"
              @click="goBack"
            >
              戻る
            </el-button>
          </el-col>
        </el-row>

        <CaseSearchDialog
          v-model:visible="dialogVisible"
          :title="dialogTitle"
          :table-data="dialogData"
          :columns="dialogColumns"
          :filters="dialogFilters"
          :type="dialogType"
          @select-case="handleSelectCase"
        />
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import CaseSearchDialog from '@/components/CaseSearchDialog.vue';

const route = useRoute();
const router = useRouter();

const contractForm = ref();
const isLoading = ref(false);

const form = reactive({
  contract_id: '',
  name: '',
  employee_id: '',
  customer_name: '',
  customer_id: '',
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
  overtime_start_time: '',
  case_id: '',
  responsible_id: '',
  update_time: ''
});

const dialogVisible = ref(false);
const dialogTitle = ref('');
const dialogData = ref([]);
const dialogColumns = ref([]);
const dialogFilters = ref([]);
const dialogType = ref('');

const rules = {
  name: [{ required: true, message: '名前を入力してください', trigger: 'blur' }],
  customer_name: [{ required: true, message: '顧客名を入力してください', trigger: 'blur' }],
  employee_type: [{ required: true, message: '社員タイプを選択してください', trigger: 'change' }],
  start_date: [{ required: true, message: '契約開始日を選択してください', trigger: 'change' }],
  end_date: [{ required: true, message: '契約終了日を選択してください', trigger: 'change' }],
  unit_price: [
    { required: true, message: '単価を入力してください', trigger: 'blur' },
    { validator: (_, value, callback) => validateDecimal(value, 8, 2, callback) }
  ],
  tax_rate: [
    { required: true, message: '税率を入力してください', trigger: 'blur' },
    { validator: (_, value, callback) => validateDecimal(value, 2, 2, callback) }
  ],
  working_hours_min: [
    { required: true, message: '最低勤務時間を入力してください', trigger: 'blur' },
    { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
  ],
  working_hours_max: [
    { required: true, message: '最大勤務時間を入力してください', trigger: 'blur' },
    { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
  ],
  overtime_limit_hours: [
    { required: true, message: '最大残業時間を入力してください', trigger: 'blur' },
    { validator: (_, value, callback) => validateDecimal(value, 3, 2, callback) }
  ],
  overtime_start_time: [
    {
      required: true,
      message: '残業代開始時間を入力してください',
      trigger: 'blur',
      validator: (_, value, callback) => validateDecimal(value, 3, 2, callback)
    }
  ]
};

const fetchContractDetails = async (id) => {
  try {
    const res = await axios.get(`/contract/contractDetail/${id}`);
    Object.assign(form, res.data);
    form.overtime_included = res.data.overtime_included ? 1 : 0;
  } catch {
    ElMessage.error('契約情報の取得に失敗しました');
  }
};

const submitForm = () => {
  contractForm.value.validate(async (valid) => {
    if (form.overtime_included === 0) form.overtime_start_time = '';
    if (valid) {
      isLoading.value = true;
      try {
        const res = await axios.put('/contract/update', form);
        if (res.data.status === 'success') {
          ElMessage.success('更新が成功しました');
          router.push('/contract');
        } else {
          ElMessage.error('更新に失敗しました: ' + (res.data.message || ''));
        }
      } catch (e) {
        ElMessage.error('更新に失敗しました: ' + e.message);
      }
      isLoading.value = false;
    } else {
      ElMessage.error('入力内容を確認してください');
    }
  });
};

const goBack = () => router.push('/contract');


const handleSelectCase = (selectedCase) => {
  if (dialogType.value === 'employeeSearch') {
    form.employee_id = selectedCase.employee_id;
    form.name = selectedCase.name;
  } else if (dialogType.value === 'customerSearch') {
    form.customer_id = selectedCase.customer_id;
    form.customer_name = selectedCase.customer_name;
    form.responsible_id = selectedCase.responsible_id;
  }
  dialogVisible.value = false;
};

onMounted(() => {
  const id = route.params.id;
  if (id) fetchContractDetails(id);
});

function validateDecimal(value, maxDigits, maxDecimals, callback) {
  const pattern = new RegExp(`^-?\\d{1,${maxDigits}}(\\.\\d{1,${maxDecimals}})?$`);
  const num = Number(value);
  const max = parseFloat('9'.repeat(maxDigits) + '.' + '9'.repeat(maxDecimals));
  const min = -max;
  if (!pattern.test(value)) callback(new Error('正しい値を入力してください'));
  else if (num > max || num < min) callback(new Error(`±${max} の範囲で入力してください`));
  else callback();
}
</script>