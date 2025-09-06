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

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="顧客ID">
              <div class="input-with-button">
                <el-input
                  v-model="form.customer_id"
                  placeholder="顧客ID"
                  disabled
                />
                <el-button
                  icon="el-icon-search"
                  @click="showCustomerDialog"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="姓名"
              prop="name"
            >
              <el-input
                v-model="form.name"
                placeholder="姓名をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="社員ID">
              <div class="input-with-button">
                <el-input
                  v-model="form.employee_id"
                  placeholder="社員ID"
                  disabled
                />
                <el-button
                  icon="el-icon-search"
                  @click="showEmployeeDialog"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="社員タイプ"
              prop="employee_type"
            >
              <el-select
                v-model="form.employee_type"
                placeholder="社員タイプを選択してください"
                clearable
              >
                <el-option
                  label="BP"
                  value="1"
                />
                <el-option
                  label="正社員"
                  value="2"
                />
                <el-option
                  label="すべて"
                  value="3"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item
              label="契約開始日"
              prop="start_date"
            >
              <el-date-picker
                v-model="form.start_date"
                type="date"
                placeholder="契約開始日を選択してください"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="契約終了日"
              prop="end_date"
            >
              <el-date-picker
                v-model="form.end_date"
                type="date"
                placeholder="契約終了日を選択してください"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item
              label="単価"
              prop="unit_price"
            >
              <el-input
                v-model="form.unit_price"
                placeholder="単価をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="税率"
              prop="tax_rate"
            >
              <el-input
                v-model="form.tax_rate"
                placeholder="税率をご入力ください。"
                clearable
              >
                <template #suffix>
                  %
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item
              label="最低勤務時間"
              prop="working_hours_min"
            >
              <el-input
                v-model="form.working_hours_min"
                placeholder="最低勤務時間をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="最大勤務時間"
              prop="working_hours_max"
            >
              <el-input
                v-model="form.working_hours_max"
                placeholder="最大勤務時間をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item
              label="最大残業時間"
              prop="overtime_limit_hours"
            >
              <el-input
                v-model="form.overtime_limit_hours"
                placeholder="最大残業時間をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item
              label="残業有無"
              prop="overtime_included"
            >
              <el-radio
                v-model="form.overtime_included"
                :label="1"
              >
                ある
              </el-radio>
              <el-radio
                v-model="form.overtime_included"
                :label="0"
              >
                なし
              </el-radio>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          v-if="form.overtime_included === 1"
          :gutter="20"
        >
          <el-col :span="10">
            <el-form-item
              label="残業代開始時間"
              prop="overtime_start_time"
            >
              <el-input
                v-model="form.overtime_start_time"
                placeholder="開始時間をご入力ください。"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

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
  update_time: '',
});

const dialogTitle = ref('');
const dialogVisible = ref(false);
const dialogData = ref([]);
const dialogColumns = ref([]);
const dialogFilters = ref([]);
const dialogType = ref('');
const isLoading = ref(false);

onMounted(() => {
  const contract_id = route.params.id;
  if (contract_id) {
    fetchContractDetails(contract_id);
  }
});

const fetchContractDetails = async (contract_id) => {
  try {
    const res = await axios.get(`/contract/contractDetail/${contract_id}`);
    Object.assign(form, res.data);
    form.overtime_included = res.data.overtime_included ? 1 : 0;
  } catch (error) {
    ElMessage.error('契約情報の取得に失敗しました');
  }
};

const submitForm = async () => {
  isLoading.value = true;
  if (form.overtime_included === 0) {
    form.overtime_start_time = '';
  }
  try {
    const response = await axios.put('/contract/update', form);
    if (response.data.status === 'success') {
      ElMessage.success('更新が成功しました');
      router.push('/contract');
    } else {
      ElMessage.error('更新に失敗しました: ' + (response.data.message || ''));
    }
  } catch (error) {
    ElMessage.error('更新に失敗しました: ' + error.message);
  }
  isLoading.value = false;
};

const goBack = () => {
  router.push('/contract');
};

const showCustomerDialog = () => {
  dialogVisible.value = true;
  dialogTitle.value = '顧客検索';
  dialogType.value = 'customerSearch';
  dialogColumns.value = [
    { prop: 'customer_name', label: '顧客名', width: '200' },
    { prop: 'customer_id', label: '顧客ID', width: '200' },
  ];
  dialogFilters.value = [
    {
      prop: 'customer_name',
      label: '顧客名',
      type: 'el-input',
      width: 200,
      props: { placeholder: '顧客名を入力してください', clearable: true },
    },
  ];
};

const showEmployeeDialog = () => {
  dialogVisible.value = true;
  dialogTitle.value = '社員検索';
  dialogType.value = 'employeeSearch';
  dialogColumns.value = [
    { prop: 'name', label: '氏名', width: '200' },
    { prop: 'employee_id', label: '社員ID', width: '200' },
  ];
  dialogFilters.value = [
    {
      prop: 'name',
      label: '氏名',
      type: 'el-input',
      width: 200,
      props: { placeholder: '社員名を入力してください', clearable: true },
    },
  ];
};

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