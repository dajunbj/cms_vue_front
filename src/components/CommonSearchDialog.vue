<template>
  <el-dialog :visible.sync="localVisible" :title="title" @close="handleClose">
    <!-- 动态条件区域 -->
    <el-form :model="filterValues" label-width="120px">
      <el-row :gutter="20">
        <el-col v-for="filter in filters" :key="filter.prop" :span="8">
          <el-form-item :label="filter.label">
            <component
              :is="filter.type"
              v-model="filterValues[filter.prop]"
              v-bind="filter.props"
              @input="onFilterChange"
            ></component>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 检索按钮 -->
    <div style="margin: 10px 0; text-align: right;">
      <el-button type="primary" @click="applyFilters">検索</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table :data="filteredData" border>
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
      filteredData: [],
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
  methods: {
    closeDialog() {
      this.localVisible = false;
    },
    handleClose() {
      this.localVisible = false;
    },
    applyFilters() {
    this.filteredData = this.tableData.filter((item) => {
      return Object.keys(this.filterValues).every((key) => {
        return this.filterValues[key]
          ? String(item[key]).includes(this.filterValues[key])
          : true;
      });
    });
  },
    onFilterChange() {
    this.applyFilters();
  },
  },
  mounted() {
    this.filters.forEach((filter) => {
      this.$set(this.filterValues, filter.prop, "");
    });
    this.filteredData = this.tableData;
  },
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>