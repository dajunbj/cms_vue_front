<template>
  <div style="width: 100%; max-width: 1400px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 総合一覧画面
      </h2>
    </div>
    <div class="section-container">
      <el-tabs
        v-model="tabsController"
        @click="handleTabsClick"
      >
        <el-tab-pane
          label="顧客一覧"
          name="customer"
          :disabled="isLoading"
        >
          <div class="section-container">
            <el-form
              ref="customerForm"
              :model="customerForm"
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
                      v-model="customerForm.customer_name"
                      placeholder="顧客名"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item
                    label="顧客タイプ"
                    prop="customer_type"
                  >
                    <el-radio
                      v-model="customerForm.customer_type"
                      label="個人"
                    >
                      個人
                    </el-radio>
                    <el-radio
                      v-model="customerForm.customer_type"
                      label="法人"
                    >
                      法人
                    </el-radio>
                    <el-radio
                      v-model="customerForm.customer_type"
                      label="すべて"
                    >
                      すべて
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
                      v-model="customerForm.customer_represent"
                      placeholder="顧客代表者名"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item
                    label="顧客住所"
                    prop="customer_address"
                  >
                    <el-input
                      v-model="customerForm.customer_address"
                      placeholder="顧客住所"
                      clearable
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="3">
                  <el-button
                    icon="el-icon-search"
                    type="primary"
                    :loading="isLoading"
                    @click="findCustomer"
                  >
                    検索
                  </el-button>
                </el-col>
                <el-col :span="3">
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    :disabled="isLoading"
                    @click="createCustomer"
                  >
                    新規
                  </el-button>
                </el-col>
              </el-row>

              <div class="section-container">
                <el-row>
                  <el-col :span="24">
                    <el-table
                      :data="customerForm.filteredCustomer"
                      border
                      style="width: 100%; margin-top: 20px;"
                      height="300px"
                      @selection-change="handleSelectionChange"
                    >
                      <el-table-column
                        label="顧客ID"
                        header-align="center"
                        align="center"
                      >
                        <template #default="scope">
                          <el-button
                            type="text"
                            size="small"
                            @click="handleCustomerIdClick(scope.row)"
                          >
                            {{ scope.row.customer_id }}
                          </el-button>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="customer_name"
                        label="顧客名"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="customer_represent"
                        label="顧客代表者名"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="customer_type"
                        label="顧客タイプ"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="customer_address"
                        label="顧客住所"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="customer_phone"
                        label="顧客電話番号"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        label="アクション"
                        align="center"
                      >
                        <template #default="scope">
                          <el-button
                            type="text"
                            size="small"
                            @click="clickCustomerDetail(scope.row)"
                          >
                            明細
                          </el-button>
                          <el-button
                            type="text"
                            size="small"
                            @click="clickCustomerEdit(scope.row)"
                          >
                            編集
                          </el-button>
                          <el-button
                            type="text"
                            size="small"
                            @click="showCustomerDeleteDialog(scope.row)"
                          >
                            削除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-pagination
                      v-model:current-page="customerForm.currentPage"
                      v-model:page-size="customerForm.pageSize"
                      style="margin-top: 20px; text-align: center;"
                      background
                      layout="total, sizes, prev, pager, next, jumper"
                      :page-sizes="[10, 20, 50, 100, 200]"
                      :total="customerForm.totalCustomer"
                      @current-change="handleCustomerPageChange"
                      @size-change="handleCustomerSizeChange"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-form>

            <el-dialog
              v-model:visible="deleteCustomerDialogVisible"
              title="確認"
              width="30%"
              @close="closeCustomerDeleteDialog"
            >
              <span>選択したレコードを削除しますか？</span>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleCustomerDeleteDialogCancel">キャンセル</el-button>
                  <el-button
                    type="primary"
                    @click="handleCustomerDeleteDialogConfirm"
                  >確認</el-button>
                </span>
              </template>
            </el-dialog>
          </div>
        </el-tab-pane>

        <!-- 責任者一覧 -->
        <el-tab-pane
          label="責任者一覧"
          name="responsible"
          :disabled="isLoading"
        >
          <div class="section-container">
            <el-form
              ref="responsibleForm"
              :model="responsibleForm"
              :rules="rules"
              label-width="150px"
            >
              <el-row>
                <el-col :span="10">
                  <el-form-item
                    label="責任者名"
                    prop="responsible_name"
                  >
                    <el-input
                      v-model="responsibleForm.responsible_name"
                      placeholder="責任者名"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item
                    label="顧客名"
                    prop="customer_name"
                  >
                    <el-input
                      v-model="responsibleForm.customer_name"
                      placeholder="顧客名"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="1">
                  <el-button
                    icon="el-icon-search"
                    @click="showDialog"
                  />
                </el-col>
                <el-col :span="1">
                  <el-input
                    v-model="responsibleForm.customer_id"
                    :disabled="true"
                  />
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="3">
                  <el-button
                    icon="el-icon-search"
                    type="primary"
                    :loading="isLoading"
                    @click="findResponsible"
                  >
                    検索
                  </el-button>
                </el-col>
                <el-col :span="3">
                  <el-button
                    icon="el-icon-plus"
                    type="primary"
                    :disabled="isLoading"
                    @click="createResponsible"
                  >
                    新規
                  </el-button>
                </el-col>
              </el-row>

              <div class="section-container">
                <el-row>
                  <el-col :span="24">
                    <el-table
                      :data="responsibleForm.filteredResponsible"
                      border
                      style="width: 100%; margin-top: 20px;"
                      height="300px"
                      @selection-change="handleSelectionChange"
                    >
                      <el-table-column
                        prop="responsible_id"
                        label="責任者ID"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="responsible_name"
                        label="責任者名"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        label="対応顧客名"
                        header-align="center"
                        align="center"
                      >
                        <template #default="scope">
                          <el-button
                            type="text"
                            size="small"
                            @click="handleNameClick(scope.row)"
                          >
                            {{ scope.row.customer_name }}
                          </el-button>
                        </template>
                      </el-table-column>
                      <el-table-column
                        prop="department_name"
                        label="部門名"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        prop="responsible_type"
                        label="責任者の役割"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        v-if="isEmployee"
                        prop="name"
                        label="対応社員"
                        header-align="center"
                        align="center"
                      />
                      <el-table-column
                        label="アクション"
                        align="center"
                      >
                        <template #default="scope">
                          <el-button
                            type="text"
                            size="small"
                            @click="clickResponsibleDetail(scope.row)"
                          >
                            明細
                          </el-button>
                          <el-button
                            type="text"
                            size="small"
                            @click="clickResponsibleEdit(scope.row)"
                          >
                            編集
                          </el-button>
                          <el-button
                            type="text"
                            size="small"
                            @click="showResponsibleDeleteDialog(scope.row)"
                          >
                            削除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>

                    <el-pagination
                      v-model:current-page="responsibleForm.currentPage"
                      v-model:page-size="responsibleForm.pageSize"
                      style="margin-top: 20px; text-align: center;"
                      background
                      layout="total, sizes, prev, pager, next, jumper"
                      :page-sizes="[10, 20, 50, 100, 200]"
                      :total="responsibleForm.totalResponsible"
                      @current-change="handleResponsiblePageChange"
                      @size-change="handleResponsibleSizeChange"
                    />
                  </el-col>
                </el-row>
              </div>
            </el-form>

            <CaseSearchDialog
              v-model:visible="dialogVisible"
              :title="'案件選択画面'"
              :table-data="dialogData"
              :columns="dialogColumns"
              :filters="dialogFilters"
              :type="dialogType"
              @select-case="handleSelectCase"
            />

            <el-dialog
              v-model:visible="deleteResponsibleDialogVisible"
              title="確認"
              width="30%"
              @close="closeResponsibleDeleteDialog"
            >
              <span>選択したレコードを削除しますか？</span>
              <template #footer>
                <span class="dialog-footer">
                  <el-button @click="handleResponsibleDeleteDialogCancel">キャンセル</el-button>
                  <el-button
                    type="primary"
                    @click="handleResponsibleDeleteDialogConfirm"
                  >確認</el-button>
                </span>
              </template>
            </el-dialog>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>




<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import CaseSearchDialog from '@/components/CaseSearchDialog.vue';

const router = useRouter();

const tabsController = ref('customer');
const isLoading = ref(false);
const deleteCustomerDialogVisible = ref(false);
const deleteResponsibleDialogVisible = ref(false);
const dialogVisible = ref(false);
const selectedRow = ref(null);

const customerForm = reactive({
  customer_id: '',
  customer_name: '',
  customer_type: 'すべて',
  customer_represent: '',
  customer_address: '',
  filteredCustomer: [],
  customerData: [],
  currentPage: 1,
  pageSize: 10,
  totalCustomer: 0,
});

const responsibleForm = reactive({
  responsible_name: '',
  customer_name: '',
  customer_id: '',
  filteredResponsible: [],
  responsibleData: [],
  totalResponsible: 0,
  currentPage: 1,
  pageSize: 10,
});

const dialogData = ref([]);
const dialogType = ref('customerSearch');
const dialogColumns = [
  { prop: 'customer_name', label: '顧客名', width: '220' },
  { prop: 'customer_id', label: 'ユニーク識別子', width: '220' },
];

const dialogFilters = [
  {
    prop: 'customer_name',
    label: '顧客名',
    type: 'el-input',
    width: 300,
    props: { placeholder: '顧客名を入力してください', clearable: true },
  },
];

const isEmployee = computed(() => {
  const right = sessionStorage.getItem('right');
  return right !== '営業員';
});

onMounted(() => {
  customerForm.filteredCustomer = customerForm.customerData;
  responsibleForm.filteredResponsible = responsibleForm.responsibleData;
});

function handleTabsClick(tab) {
  console.log(tab);
}

function showDialog() {
  dialogVisible.value = true;
}

function handleSelectCase(selectedCase) {
  responsibleForm.customer_id = selectedCase.customer_id;
  responsibleForm.customer_name = selectedCase.customer_name;
  dialogVisible.value = false;
}

async function findCustomer() {
  isLoading.value = true;
  const type = customerForm.customer_type === 'すべて' ? '' : customerForm.customer_type;
  try {
    const { data } = await axios.post('/customer/searchCustomer', {
      customer_name: customerForm.customer_name,
      customer_type: type,
      customer_represent: customerForm.customer_represent,
      customer_address: customerForm.customer_address,
      currentPage: customerForm.currentPage,
      pageSize: customerForm.pageSize,
    });
    customerForm.filteredCustomer = data.data;
    customerForm.totalCustomer = data.total;
  } catch (err) {
    ElMessage.error('データの取得に失敗しました' + err);
  } finally {
    isLoading.value = false;
  }
}

function handleCustomerPageChange(page) {
  customerForm.currentPage = page;
  findCustomer();
}

function handleCustomerSizeChange(size) {
  customerForm.pageSize = size;
  customerForm.currentPage = 1;
  findCustomer();
}

function createCustomer() {
  router.push('/customer/register');
}

function handleCustomerIdClick(row) {
  tabsController.value = 'responsible';
  responsibleForm.customer_id = row.customer_id;
}

function clickCustomerEdit(row) {
  router.push({ path: `/customer/edit/${row.customer_id}` });
}

function clickCustomerDetail(row) {
  router.push({ path: `/customer/detail/${row.customer_id}` });
}

function showCustomerDeleteDialog(row) {
  deleteCustomerDialogVisible.value = true;
  selectedRow.value = row;
}

function closeCustomerDeleteDialog() {
  deleteCustomerDialogVisible.value = false;
}

function handleCustomerDeleteDialogCancel() {
  deleteCustomerDialogVisible.value = false;
}

function handleCustomerDeleteDialogConfirm() {
  deleteCustomerDialogVisible.value = false;
  deleteSelectedCustomerRow();
}

async function deleteSelectedCustomerRow() {
  try {
    const res = await axios.post('/customer/deleteCustomer', {
      customer_id: selectedRow.value.customer_id,
      updated_at: selectedRow.value.updated_at,
    });
    if (res.data.status === 'success') {
      ElMessage.success(res.data.message);
      findCustomer();
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (err) {
    ElMessage.error('操作失敗しました:' + (err.response?.data?.message || err.message));
  }
}

async function findResponsible() {
  isLoading.value = true;
  try {
    const { data } = await axios.post('/customer/searchResponsible', {
      responsible_name: responsibleForm.responsible_name,
      customer_id: responsibleForm.customer_id,
      currentPage: responsibleForm.currentPage,
      pageSize: responsibleForm.pageSize,
    });
    responsibleForm.filteredResponsible = data.data;
    responsibleForm.totalResponsible = data.total;
  } catch (err) {
    ElMessage.error('データの取得に失敗しました' + err);
  } finally {
    isLoading.value = false;
  }
}

function handleResponsiblePageChange(page) {
  responsibleForm.currentPage = page;
  findResponsible();
}

function handleResponsibleSizeChange(size) {
  responsibleForm.pageSize = size;
  responsibleForm.currentPage = 1;
  findResponsible();
}

function createResponsible() {
  router.push('/customer/registerRes');
}

function clickResponsibleEdit(row) {
  router.push({ path: `/customer/editRes/${row.responsible_id}` });
}

function clickResponsibleDetail(row) {
  router.push({ path: `/customer/detailRes/${row.responsible_id}` });
}

function handleNameClick(row) {
  tabsController.value = 'customer';
  customerForm.customer_name = row.customer_name;
}

function showResponsibleDeleteDialog(row) {
  deleteResponsibleDialogVisible.value = true;
  selectedRow.value = row;
}

function closeResponsibleDeleteDialog() {
  deleteResponsibleDialogVisible.value = false;
}

function handleResponsibleDeleteDialogCancel() {
  deleteResponsibleDialogVisible.value = false;
}

function handleResponsibleDeleteDialogConfirm() {
  deleteResponsibleDialogVisible.value = false;
  deleteSelectedResponsibleRow();
}

async function deleteSelectedResponsibleRow() {
  try {
    const res = await axios.post('/customer/deleteResponsible', {
      responsible_id: selectedRow.value.responsible_id,
      updated_at: selectedRow.value.updated_at,
    });
    if (res.data.status === 'success') {
      ElMessage.success(res.data.message);
      findResponsible();
    } else {
      ElMessage.error(res.data.message);
    }
  } catch (err) {
    ElMessage.error('操作失敗しました:' + (err.response?.data?.message || err.message));
  }
}
</script>

