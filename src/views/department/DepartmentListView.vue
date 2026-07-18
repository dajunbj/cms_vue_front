<template>
  <div style="width: 100%; max-width: 1000px; overflow-x: hidden;">
    <div class="header-container">
      <h2 class="header-title">
        <i class="el-icon-office-building" /> 部門一覧画面
      </h2>
    </div>
    <div class="section-container">
      <el-row>
        <el-col :span="6">
          <el-input
            v-model="departmentName"
            placeholder="部門名をご入力ください。"
            clearable
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="14">
          <el-button
            class="action-button"
            type="primary"
            @click="findDepartments"
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
            @click="deleteAllSelected('/department/deleteAll')"
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
            :data="filteredDepartments"
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
              prop="department_id"
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
            :total="totalDepartments"
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

const departmentName = ref('');

const departmentData = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalDepartments = ref(0);
const filteredDepartments = ref([]);
const multipleSelection = ref([]);

const findDepartments = async () => {
  try {
    const response = await axios.post('/department/search', {
      departmentName: departmentName.value,
      currentPage: currentPage.value,
      pageSize: pageSize.value,
    });
    filteredDepartments.value = response.data.data;
    totalDepartments.value = response.data.total;
  } catch (error) {
    alert('データの取得に失敗しました' + error);
  }
};

const clickReference = (row) => {
  router.push({ path: `/department/detail/${row.department_id}` });
};

const clickEdit = (row) => {
  router.push({ path: `/department/edit/${row.department_id}` });
};

const handleSelectionChange = (val) => {
  multipleSelection.value = val.map((item) => item.department_id);
};

const createRecord = () => {
  router.push('/department/register');
};

const handlePageChange = (page) => {
  currentPage.value = page;
  findDepartments();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  currentPage.value = 1;
  findDepartments();
};

onMounted(() => {
  filteredDepartments.value = departmentData.value;
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
.action-button {
  width: 92px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
