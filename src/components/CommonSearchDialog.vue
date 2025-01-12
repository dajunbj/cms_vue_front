<template>
  <el-dialog :visible.sync="localVisible" :title="title" @close="handleClose">
    <!-- 动态条件区域 -->
    <el-form :model="filterValues" label-width="120px">
      <el-row :gutter="20">
        <el-col v-for="filter in filters" :key="filter.prop" :span="20">
          <el-form-item :label="filter.label">
            <component
              :is="filter.type"
              v-model="filterValues[filter.prop]"
              v-bind="filter.props"
              @input="onFilterChange"
              :style="{ width: filter.width + 'px' }" >
              <el-option
              v-for="option in filter.props.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
              ></el-option>
          </component>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 检索按钮 -->
    <div style="margin: 10px 0; text-align: right;">
      <el-button type="primary" @click="searchCompanyInfo">検索</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table :data="searchResult" border @row-click="rowClick">
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
      ></el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">閉じる</el-button>
    </div>
  </el-dialog>
</template>


<script>

import axios from 'axios';

export default {
  name: "CommonSearchDialog",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
      default: "Dialog",
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    filters: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      localVisible: this.visible,
      filterValues: {},
      searchResult: [],
    };
  },
  watch: {
    visible(newVal) {
      this.localVisible = newVal;
    },
    localVisible(newVal) {
      this.$emit("update:visible", newVal);
    },
    tableData: {
      handler(newData) {
        this.applyFilters(newData);
      },
      immediate: true,
    },
    filterValues: {
      handler() {
        this.applyFilters(this.tableData);
      },
      deep: true,
    },
  },
  //◆メソッド定義
  methods: {
    //子画面を閉じる
    closeDialog() {
      this.localVisible = false;
    },
    handleClose() {
      this.localVisible = false;
    },
    //入力条件が変更される場合、既存データによりフィルダーする
    onFilterChange() {
      this.searchResult = this.tableData.filter((item) => {
        return Object.keys(this.filterValues).every((key) => {
          return this.filterValues[key]
            ? String(item[key]).includes(this.filterValues[key])
            : true;
        });
      });
    },

    //会社検索
    async searchCompanyInfo() {
      try {
        console.log("111:"+this.filterValues.name);
        console.log("222:"+this.filterValues.department);
        const response = await axios.post('/utils/SearchCompanyList', 
        { name: this.filterValues.name,//名前
          department: this.filterValues.department//部門
        });
        this.searchResult = response.data;
      } catch (error) {
        this.$message.error('データの取得に失敗しました' + error);
      }
    },

  // 点击表格行时触发，传递选中数据给父组件
  rowClick(row) {
    this.$emit("select-company", row); // 触发事件，传递选中行的数据
    this.closeDialog(); // 关闭对话框
  },

  },
  //◆画面初期化
  mounted() {
 
  this.searchResult = this.tableData;
  }
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>