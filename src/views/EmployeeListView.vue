<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 社員一覧画面
      </h2>
    </div>
    <div class="section-container">
      <el-row>
        <el-col :span="6">
          <el-input
            v-model="employeeName"
            placeholder="社員名をご入力ください。"
            clearable
          />
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-input
            v-model="companyName"
            placeholder="会社をご入力ください。"
            clearable
          />
        </el-col>
        <el-col :span="1.5">
          <el-button
            icon="el-icon-search"
            @click="showDialog"
          />
        </el-col>
        <el-col :span="3">
          <el-input
            v-model="companyId"
            :disabled="true"
          />
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="14">
          <el-button
            icon="el-icon-search"
            type="primary"
            @click="findEmployees"
          >
            検索
          </el-button>
          <el-button
            icon="el-icon-plus"
            type="primary"
            @click="createRecord"
          >
            新規
          </el-button>
          <el-button
            icon="el-icon-delete"
            type="primary"
            @click="deleteAllSelected('/employee/deleteAll')"
          >
            全削除
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="section-container">
      <el-row>
        <el-col :span="24">
          <el-table
            :data="filteredEmployees"
            border
            style="width: 100%; margin-top: 20px;"
            height="300px"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
              align="center"
            />
            <el-table-column
              prop="employee_id"
              label="ID"
              header-align="center"
              class-name="no-wrap-column"
            />
            <el-table-column
              prop="name"
              label="名前"
              header-align="center"
            />
            <el-table-column
              prop="sex"
              label="性別"
              header-align="center"
            />
            <el-table-column
              prop="date_of_birth"
              label="誕生日"
              header-align="center"
            />
            <el-table-column
              prop="address"
              label="住所"
              header-align="center"
            />
            <el-table-column
              prop="phone_number"
              label="電話"
              header-align="center"
            />
            <el-table-column
              label="動作"
              align="center"
            >
              <template #default="{ row }">
                <el-button
                  type="text"
                  size="small"
                  @click="clickReference(row)"
                >
                  参照
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="clickEdit(row)"
                >
                  編集
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            style="margin-top: 20px; text-align: center;"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :current-page="currentPage"
            :page-size="pageSize"
            :page-sizes="[10, 20, 50, 100, 200]"
            :total="totalEmployees"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </el-col>
      </el-row>

      <CommonSearchDialog
        v-model:visible="dialogVisible"
        title="会社選択画面"
        :table-data="dialogData"
        :columns="dialogColumns"
        :filters="dialogFilters"
        @select-company="handleSelectCompany"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus'; //
import CommonSearchDialog from '@/components/CommonSearchDialog.vue';
import { deleteAllSelected } from '@/js/ListView.js';

const employeeName = ref('');
const companyName = ref('');
const companyId = ref('');
const dialogVisible = ref(false);
const dialogData = ref([]);
const dialogColumns = [
  { prop: 'id', label: 'ID', width: '100' },
  { prop: 'name', label: '名前', width: '220' },
  { prop: 'department', label: '部門', width: '220' },
];
const dialogFilters = [
  {
    prop: 'name',
    label: '名前',
    type: 'el-input',
    width: 300,
    props: { placeholder: '名前を入力してください', clearable: true },
  },
  {
    prop: 'department',
    label: '部門',
    type: 'el-select',
    width: 300,
    props: {
      placeholder: '部門を選択してください',
      clearable: true,
      options: [
        { label: '営業', value: '営業' },
        { label: '開発', value: '開発' },
        { label: '経理', value: '経理' },
      ],
    },
  },
];
const employeeData = ref([]);
const filteredEmployees = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalEmployees = ref(0);
const multipleSelection = ref([]);

const showDialog = () => {
  dialogVisible.value = true;
};

const findEmployees = async () => {
  try {
    const response = await axios.post('/employee/search', {
      employeeName: employeeName.value,
      companyName: companyName.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    filteredEmployees.value = response.data.data;
    totalEmployees.value = response.data.total;
  } catch (error) {
    ElMessage.error('データの取得に失敗しました: ' + error);
  }
};

const handleSelectCompany = (selectedCompany) => {
  companyName.value = selectedCompany.name;
  companyId.value = selectedCompany.id;
};

const clickReference = (row) => {
  window.location.href = `/employee/detail/${row.employeeId}`;
};

const clickEdit = (row) => {
  window.location.href = `/employee/edit/${row.employeeId}`;
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val.map((item) => item.id);
};

const createRecord = () => {
  window.location.href = '/employee/register';
};

const handlePageChange = (page) => {
  currentPage.value = page;
  findEmployees();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  findEmployees();
};

onMounted(() => {
  filteredEmployees.value = employeeData.value;
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
.el-input {
  margin-bottom: 10px;
}
.no-wrap-column .cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-table th {
  background-color: #E3F2FD;
  color: #333333;
  font-weight: bold;
}
.el-table th .cell {
  font-size: 14px;
  text-align: center;
}
</style>
