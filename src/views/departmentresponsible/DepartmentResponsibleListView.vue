<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-user" /> 部門責任者一覧画面
      </h2>
    </div>
    <div class="section-container">
      <el-row>
        <el-col :span="6">
          <el-select
            v-model="departmentId"
            placeholder="部門を選択してください。"
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="dept in departmentOptions"
              :key="dept.department_id"
              :label="dept.department_name"
              :value="dept.department_id"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-input
            v-model="employeeName"
            placeholder="責任者名をご入力ください。"
            clearable
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="14">
          <el-button
            class="action-button"
            type="primary"
            @click="findResponsibles"
          >
            検索
          </el-button>
          <el-button
            class="action-button"
            type="primary"
            @click="createRecord"
          >
            新規
          </el-button>
          <el-button
            class="action-button"
            type="primary"
            @click="deleteAllSelected('/departmentResponsible/deleteAll')"
          >
            全削除
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 检索结果和翻页部分 -->
    <div class="section-container">
      <el-row>
        <el-col :span="24">
          <el-table
            :data="filteredResponsibles"
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
              prop="responsible_id"
              label="ID"
              header-align="center"
              class-name="no-wrap-column"
            />
            <el-table-column
              prop="department_name"
              label="部門名"
              header-align="center"
            />
            <el-table-column
              prop="employee_name"
              label="責任者名"
              header-align="center"
            />
            <el-table-column
              prop="level"
              label="責任者レベル"
              header-align="center"
            />
            <el-table-column
              label="動作"
              align="center"
            >
              <template #default="scope">
                <el-button
                  type="text"
                  size="small"
                  @click="clickReference(scope.row)"
                >
                  参照
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  @click="clickEdit(scope.row)"
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
            :total="totalResponsibles"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { deleteAllSelected } from '@/js/ListView.js';

const router = useRouter();

const departmentId = ref('');
const employeeName = ref('');
const departmentOptions = ref([]);

const responsibleData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalResponsibles = ref(0);
const filteredResponsibles = ref([]);//検索結果
const multipleSelection = ref([]);

const fetchDepartments = async () => {
  //部門選択を初期化する
  try {
    const response = await axios.get('/departmentresponsible/departments');
    departmentOptions.value = response.data.data;
  } catch (error) {
    alert('部門情報の取得に失敗しました' + error);
  }
};

const findResponsibles = async () => {
  //検索を行う
  try {
    const response = await axios.post('/departmentresponsible/search', {
      departmentId: departmentId.value,
      employeeName: employeeName.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    filteredResponsibles.value = response.data.data;
    totalResponsibles.value = response.data.total;
  } catch (error) {
    alert('データの取得に失敗しました' + error);
  }
};

const clickReference = (row) => {
  //参照画面へ遷移する
  router.push({ path: '/departmentresponsible/detail/${row.responsible_id}'});
};

const clickEdit = (row) => {
  //編集画面へ遷移する
  router.push({ path: '/departmentresponsible/edit/${row.responsible_id}'});
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val.map((item) => item.responsible_id);
};

const createRecord = () => {
  router.push('/departmentresponsible/regist');
};

const handlePageChange = (page) => {
  currentPage.value = page;
  findResponsibles();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  findResponsibles();
};

onMounted(() => {
  fetchDepartments();
  filteredResponsibles.value = responsibleData.value;
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
.el-input, .el-select {
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
.action-button {
  width: 92px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
