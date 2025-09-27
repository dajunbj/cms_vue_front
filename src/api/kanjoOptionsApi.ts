// 勘定科目下拉 - 接口封装（使用视图 v_acct_category_effective 的后端）
import axios from 'axios';

export interface CascaderNode {
  label: string;
  value: string;        // 我们用 code 作为稳定值
  code?: string;        // 备查
  parentCode?: string;  // 备查
  sortNo?: number;
  isLeaf?: boolean | null;
  children?: CascaderNode[];
}

export async function fetchKanjoTree(params: {
  companyId?: number;
  locale?: 'ja' | 'zh';
}) {
  const { companyId, locale = 'ja' } = params || {};
  const { data } = await axios.get<CascaderNode[]>('/api/kanjo/options/tree', {
    params: { companyId, locale }
  });
  return data;
}

/* ===== 懒加载（后端暂不开放，保留注释，未来量大时启用） =====
export async function fetchKanjoLazyRoot(params: {
  companyId?: number;
  locale?: 'ja' | 'zh';
}) {
  const { companyId, locale = 'ja' } = params || {};
  const { data } = await axios.get<CascaderNode[]>('/api/kanjo/options/lazy/root', {
    params: { companyId, locale }
  });
  return data;
}

export async function fetchKanjoLazyChildren(params: {
  companyId?: number;
  parentCode: string;
  locale?: 'ja' | 'zh';
}) {
  const { companyId, parentCode, locale = 'ja' } = params;
  const { data } = await axios.get<CascaderNode[]>('/api/kanjo/options/lazy/children', {
    params: { companyId, parentCode, locale }
  });
  return data;
}
===== end 懒加载 ===== */
