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

    <!-- Footer 插槽 -->
    <template #footer>
      <el-button @click="closeDialog">
        閉じる
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// Props
const props = defineProps({
  visible: { type: Boolean, required: true },
  title: { type: String, default: 'Dialog' },
  tableData: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  filters: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:visible', 'select-case'])

// 状态变量
const localVisible = ref(props.visible)
const filterValues = ref({})
const searchResult = ref([])

// 同步 v-model:visible
watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal
  }
)

watch(localVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 表格数据变化时同步结果
watch(
  () => props.tableData,
  (newData) => {
    applyFilters(newData)
  },
  { immediate: true }
)

watch(
  filterValues,
  () => {
    applyFilters(props.tableData)
  },
  { deep: true }
)

// 过滤函数
function applyFilters(data) {
  searchResult.value = data
}

// 条件变化时重新过滤
function onFilterChange() {
  searchResult.value = props.tableData.filter((item) => {
    return Object.keys(filterValues.value).every((key) => {
      return filterValues.value[key]
        ? String(item[key]).includes(filterValues.value[key])
        : true
    })
  })
}

// 检索事件
async function searchCaseInfo() {
  try {
    const response = await axios.post('/contract/caseSearch', {
      case_title: filterValues.value.case_title
    })
    searchResult.value = response.data.data
  } catch (error) {
    ElMessage.error('データの取得に失敗しました: ' + error)
  }
}

// 点击行事件
function rowClick(row) {
  emit('select-case', row)
  closeDialog()
}

// 关闭弹窗
function closeDialog() {
  localVisible.value = false
}

function handleClose() {
  localVisible.value = false
}

// 初始赋值
onMounted(() => {
  searchResult.value = props.tableData
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
