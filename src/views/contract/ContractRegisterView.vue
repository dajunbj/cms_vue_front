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
        <!-- Form Fields -->
        <!-- ... 原有所有フォーム項目保持不變 ... -->

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
