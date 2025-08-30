<template>
  <el-dialog
    v-model:visible="localVisible"
    :title="title"
    @close="handleClose"
  >
    <!-- 动态条件区域 -->
    <el-form
      :model="filterValues"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col
          v-for="filter in filters"
          :key="filter.prop"
          :span="20"
        >
          <el-form-item :label="filter.label">
            <component
              :is="filter.type"
              v-model="filterValues[filter.prop]"
              v-bind="filter.props"
              :style="{ width: filter.width + 'px' }"
              @input="onFilterChange"
            >
              <el-option
                v-for="option in filter.props.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </component>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 检索按钮 -->
    <div style="margin: 10px 0; text-align: right;">
      <el-button
        type="primary"
        @click="searchCaseInfo"
      >
        検索
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-table
      :data="searchResult"
      border
      @row-click="rowClick"
    >
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
      />
    </el-table>

    <!-- Vue 3 插槽语法 -->
    <template #footer>
      <el-button @click="closeDialog">
        閉じる
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import axios from "axios"

export default {
  name: "CommonSearchDialog",
  // 显式声明会触发的事件（按你的用法全列上）
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
    type: {
      type: String,
      default: "",
    },
  },
  emits: [
    "update:visible",
    "select-case",
    "select-employee",
    "select-company",
    "select-department"
  ],
  
  data() {
    return {
      localVisible: this.visible,
      filterValues: {},
      searchResult: [],
    }
  },
  watch: {
    visible(newVal) {
      this.localVisible = newVal
    },
    localVisible(newVal) {
      this.$emit("update:visible", newVal)
    },
    tableData: {
      handler(newData) {
        this.applyFilters(newData)
      },
      immediate: true,
    },
    filterValues: {
      handler() {
        this.applyFilters(this.tableData)
      },
      deep: true,
    },
  },
  mounted() {
    this.searchResult = this.tableData
  },
  methods: {
    closeDialog() {
      this.localVisible = false
    },
    handleClose() {
      this.localVisible = false
    },
    onFilterChange() {
      this.searchResult = this.tableData.filter((item) => {
        return Object.keys(this.filterValues).every((key) => {
          return this.filterValues[key]
            ? String(item[key]).includes(this.filterValues[key])
            : true
        })
      })
    },
    async searchCaseInfo() {
      try {
        if (this.type === "caseSearch") {
          const response = await axios.post("/popup/caseSearch", {
            case_title: this.filterValues.case_title,
          })
          this.searchResult = response.data.data
        }
        if (this.type === "employeeSearch") {
          const response = await axios.post("/popup/employeeSearch", {
            name: this.filterValues.name,
          })
          this.searchResult = response.data.data
        }
        if (this.type === "customerSearch") {
          const response = await axios.post("/popup/customerSearch", {
            customer_name: this.filterValues.customer_name,
          })
          this.searchResult = response.data.data
        }
        if (this.type === "departmentSearch") {
          const response = await axios.post("/popup/departmentSearch", {
            department_name: this.filterValues.department_name,
          })
          this.searchResult = response.data.data
        }
      } catch (error) {
        this.$message.error("データの取得に失敗しました" + error)
      }
    },
    rowClick(row) {
      this.$emit("select-case", row)
      this.closeDialog()
    },
    applyFilters(data) {
      this.searchResult = data
    },
  },
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
