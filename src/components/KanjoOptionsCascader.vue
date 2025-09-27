<template>
  <div class="kanjo-cascader">
    <el-skeleton v-if="loading" :rows="2" animated />
    <el-cascader
      v-else
      v-model="innerValue"
      :options="options"
      :props="cascaderProps"
      :placeholder="placeholder"
      :clearable="clearable"
      :filterable="filterable"
      :show-all-levels="showAllLevels"
      @change="onChange"
      class="w-full"
    />
  </div>
</template>

<script lang="ts" setup>
// 勘定科目下拉 - 一次性整棵树（懒加载代码已保留为注释）
import { ref, watch, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { CascaderProps } from 'element-plus';
import type { CascaderNode } from '@/api/kanjoOptionsApi';
import { fetchKanjoTree /*, fetchKanjoLazyRoot, fetchKanjoLazyChildren*/ } from '@/api/kanjoOptionsApi';

interface Props {
  modelValue?: string[];                 // v-model：选中路径（每级是一个 code）
  companyId?: number;                    // 公司ID（可选）
  placeholder?: string;
  clearable?: boolean;
  filterable?: boolean;
  showAllLevels?: boolean;               // 是否展示完整路径
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  locale: 'ja',
  placeholder: '勘定科目を選択…',
  clearable: true,
  filterable: true,
  showAllLevels: true
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void;
  (e: 'change', v: string[]): void;
}>();

const loading = ref(false);
const options = ref<CascaderNode[]>([]);
const innerValue = ref<string[]>(props.modelValue);

// 一次性整棵树：props 配置
const cascaderProps = computed<CascaderProps>(() => ({
  value: 'value',
  label: 'label',
  children: 'children',
  // 非懒加载
  lazy: false,
  checkStrictly: false, // 只能选叶子时设 true；当前允许选父级就设 true
}));

async function loadTree() {
  loading.value = true;
  try {
    const data = await fetchKanjoTree({ companyId: props.companyId,});
    options.value = Array.isArray(data) ? data : [];
  } catch (e: any) {
    console.error(e);
    ElMessage.error('勘定科目の読込に失敗しました');
  } finally {
    loading.value = false;
  }
}

function onChange(val: any) {
  // val 是路径数组（每级一个 code）
  emit('update:modelValue', val || []);
  emit('change', val || []);
}

// 外部 v-model 同步
watch(
  () => props.modelValue,
  (v) => { innerValue.value = Array.isArray(v) ? v : []; }
);

// companyId / locale 变化时刷新
watch(
  () => [props.companyId],
  () => { loadTree(); },
  { immediate: false }
);

onMounted(() => { loadTree(); });

/* ===== 懒加载版本（后端接口暂时注释；这段保留以备扩展） =====
const lazyCascaderProps = computed<CascaderProps>(() => ({
  value: 'value',
  label: 'label',
  children: 'children',
  leaf: 'isLeaf',
  lazy: true,
  async lazyLoad(node, resolve) {
    try {
      if (node.level === 0) {
        const data = await fetchKanjoLazyRoot({ companyId: props.companyId, locale: props.locale });
        resolve(data);
      } else {
        const parentCode = (node.data?.value ?? node.value) as string;
        const data = await fetchKanjoLazyChildren({ companyId: props.companyId, parentCode, locale: props.locale });
        resolve(data);
      }
    } catch (e) {
      console.error(e);
      ElMessage.error('勘定科目の読込に失敗しました');
      resolve([]);
    }
  }
}));
===== end 懒加载 ===== */
</script>

<style scoped>
.kanjo-cascader {
  width: 100%;
}
</style>
