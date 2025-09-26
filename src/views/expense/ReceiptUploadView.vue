<template>
  <div class="ocr-page">
    <!-- ============== 顶部工具条：上传 / OCR / 保存 / 导出 ============== -->
    <el-row class="toolbar" justify="space-between" align="middle">
      <div class="left" style="display: flex; gap: 8px; align-items: center">
        <!-- 选择文件（不自动上传） -->
         <!-- 通过 ref 拿到 el-upload 实例（清空内部 fileList 用） -->
          <!-- 只选不传，由我们自己处理文件 -->
           <!-- 支持多选 -->
            <!-- 隐藏 el-upload 默认文件列表 -->
             <!-- 仅图片 -->
              <!-- @change选择文件后的回调（我们做去重/入列） -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :multiple="true"
          :show-file-list="false"
          accept="image/*"
          @change="onFilePicked"
        >
          <!-- 点击按钮前先清空 el-upload 内部 fileList，避免“历史文件残留导致重复” -->
          <el-button type="primary" @click="clearBeforePick">画像をアップロード</el-button>
        </el-upload>

        <!-- 两种 OCR 触发：只读选中的 / 读所有未读 -->
        <el-button @click="readSelected">選択分をOCR</el-button>
        <el-button type="success" @click="readAll">すべてOCR</el-button>
      </div>

      <div class="right">
        <!-- 保存全部到后台 / 导出 Excel -->
        <el-button type="primary" @click="saveAll">すべて保存</el-button>
        <el-button @click="exportExcel">Excel出力</el-button>
      </div>
    </el-row>

    <!-- ===================== 3 栏布局：左缩略 / 中预览 / 右表单+表 ===================== -->
    <el-row :gutter="16" class="content">
      <!-- 左栏：缩略图列表（含全选、批量删除） -->
      <el-col :span="5" class="stretch">
        <el-card shadow="hover" class="thumbs stretch">
          <template #header>
            <div class="thumbs-header">
              <span>画像（{{ images.length }}）</span>
              <div class="thumbs-actions">
                <!-- 全选（支持半选态） -->
                <el-checkbox v-model="allChecked" :indeterminate="indeterminate">全選択</el-checkbox>
                <!-- 新增：批量删除（仅前端列表，不调后端） -->
                <el-button
                  size="small"
                  type="danger"
                  plain
                  :disabled="!anySelected"
                  @click.stop="removeSelected"
                >選択削除</el-button>
              </div>
            </div>
          </template>

          <el-scrollbar class="thumb-scroll">
            <!-- 每一行缩略 -->
            <div
              v-for="(img, idx) in images"
              :key="img.localId"
              :class="['thumb', { active: idx === activeIndex }]"
              @click="onThumbClick(idx)"           <!-- 点击行：切为活动图且同步右侧表单 -->
            >
              <el-image :src="img.previewUrl" fit="cover" class="thumb-img" />
              <div class="thumb-meta">
                <div class="thumb-title">
                  <el-checkbox v-model="img.checked" @click.stop /> <!-- 单选勾选（阻止冒泡） -->
                  <span class="name" :title="img.name">{{ img.name }}</span>
                  <el-tag size="small" class="status-tag" :type="tagType(img.status)">
                    {{ img.status || "未処理" }}
                  </el-tag>
                </div>
                <small class="issuer">{{ img.issuer || "発行先：未認識" }}</small>
              </div>
              <!-- 单行删除（仅前端） -->
              <el-button text type="danger" size="small" @click.stop="onRemoveClick(idx)">削除</el-button>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 中栏：主图预览 + 工具 -->
      <el-col :span="11" class="stretch">
        <el-card shadow="hover" class="viewer stretch">
          <template #header>
            <div class="viewer-header">
              <div>
                <el-tag type="info">No. {{ activeImage?.localId ?? "-" }}</el-tag>
                <span class="file-name">{{ activeImage?.name }}</span>
              </div>
              <div class="viewer-tools">
                <el-button :icon="ZoomOut" circle @click="zoomOut" />
                <el-button :icon="ZoomIn" circle @click="zoomIn" />
                <el-button :icon="FullScreen" circle @click="fitToContainer" />
                <el-button :icon="ScaleToOriginal" circle @click="resetView" />
                <el-button :icon="RefreshLeft" circle @click="rotateLeft" />
                <el-button :icon="RefreshRight" circle @click="rotateRight" />
                <el-divider direction="vertical" />
                <el-button @click="prev">前へ</el-button>
                <el-button @click="next">次へ</el-button>
              </div>
            </div>
          </template>

          <div class="viewer-canvas" ref="viewerRef">
            <!-- 有活动图就显示预览图，利用 CSS transform 做缩放/旋转 -->
             <!-- @load="onImgLoad"图片加载完后重置适配 -->
            <img
              v-if="activeImage"
              ref="imgRef"
              class="preview-img"
              :src="activeImage.previewUrl"
              :style="{ transform: `scale(${zoom}) rotate(${rotation}deg)` }"
              @load="onImgLoad"
            />
            <div v-else class="placeholder">画像が未選択</div>
          </div>
        </el-card>
      </el-col>

      <!-- 右栏：编辑表单 + 一览表 -->
      <el-col :span="8" class="stretch">
        <el-card shadow="hover" class="form stretch">
          <template #header>OCR結果と修正</template>

          <div class="form-body">
            <!-- 表单：编辑当前活动图的识别结果 -->
            <el-form label-width="90px" label-position="left">
              <el-form-item label="発行先"><el-input v-model="form.issuer" /></el-form-item>
              <el-form-item label="登録番号"><el-input v-model="form.number" /></el-form-item>
              <el-form-item label="金額"><el-input v-model="form.amount" /></el-form-item>
              <el-form-item label="発行日"><el-date-picker v-model="form.date" type="date" /></el-form-item>
              <el-form-item label="OCR全文">
                <el-input v-model="form.full_text" type="textarea" :autosize="{ minRows: 8, maxRows: 20 }" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveOne">
                  {{ activeImage?.savedId ? "変更後内容を保存" : "現在を保存" }}
                </el-button>
                <el-button
                  v-if="activeImage?.savedId"
                  type="danger"
                  plain
                  @click="cancelSaveCurrent"
                >保存を取り消す</el-button>
              </el-form-item>
            </el-form>

            <el-divider />
            <!-- 右下：全图片的简表（只显示基础字段） -->
            <div class="table-wrap">
              <el-table :data="images" height="100%" size="small" border>
                <el-table-column type="index" width="50" />
                <el-table-column prop="issuer" label="発行先" />
                <el-table-column prop="number" label="登録番号" />
                <el-table-column prop="amount" label="金額" />
                <el-table-column prop="date" label="日付" />
                <el-table-column prop="status" label="ステータス" width="100">
                  <template #default="scope">
                    <el-tag size="small" :type="tagType(scope.row.status)">
                      {{ scope.row.status || "未処理" }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部：状态条（状态文案 + 进度条 + 小提示） -->
    <div class="status-bar">
      <el-tag>{{ status }}</el-tag>
      <el-progress :percentage="progress" style="flex: 1; margin: 0 12px" />
      <span>{{ hint }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * =============================================
 * ReceiptUploadView.vue（超详尽注释版）
 * 分区：
 *   A) 依赖 & 基础状态
 *   B) 列表选择/活动项/表单同步
 *   C) 上传与去重（修复重复出现问题）
 *   D) 删除（单个/批量）与活动项联动
 *   E) OCR（选中/全部）统一处理
 *   F) 保存（单个/全部）与取消保存
 *   G) 导出 Excel
 *   H) 预览控制（缩放/旋转/自适应）
 *   I) 工具/小函数
 * =============================================
 */

 /* ---------- A) 依赖 & 基础状态 ---------- */
import {
  ref,              // 创建“可变的响应式引用”（对象 .value）
  reactive,         // 创建“响应式对象”（直接读写）
  computed,         // 创建“计算属性”（依赖变化自动重新计算）
  onMounted,        // 组件挂载完成时的生命周期钩子
  onBeforeUnmount,  // 组件销毁前的生命周期钩子
  nextTick          // 等待 DOM 更新后再执行回调
} from "vue"

import api from "@/api" // 你封装的 axios 实例（带 /api 代理）
import {
  ZoomIn, ZoomOut, RefreshLeft, RefreshRight, FullScreen, ScaleToOriginal
} from "@element-plus/icons-vue" // Element Plus 的图标（预览工具按钮在用）
import { ElMessage, ElMessageBox } from "element-plus"   // 全局消息 & 确认框

// ============ 列表与活动项 ============
// 自增本地 ID（只用于前端列表 key）
let idSeq = 1

// 图片列表：每个元素代表一张待处理图片及其 OCR/保存状态
// 约定字段（关键）：
//   - file         File 对象（仅前端存在）
//   - previewUrl   blob: 预览地址，记得在删除时 revokeObjectURL
//   - status       '未処理'|'読取中'|'読取済み'|'読み取り失敗'|'保存中'|'保存済み'|'保存失敗'
//   - savedId      后端保存后的主键 ID（存在表示“已保存过”）
//   - 业务字段     issuer/number/amount/date/full_text
//   - checked      列表复选状态
const images = ref([])

// 当前活动（被预览、被右侧表单编辑）的索引；-1 表示没有活动项
const activeIndex = ref(-1)

// 右上编辑表单（活动项的可编辑副本）
// 作用：点不同缩略行 → 同步表单；编辑表单 → 保存回写到活动项
const form = reactive({
  issuer: "",    // 发票/收据的“发票方/店名”
  number: "",    // 登録番号（可选）
  amount: "",    // 金额（字符串展示，保存时后端再转 long）
  date: "",      // yyyy-MM-dd（用 el-date-picker）
  full_text: ""  // OCR 全文
})

// 底部状态条：状态文字、提示文案、整体进度
const status = ref("待機")  // 当前阶段：如 待機/読取中/保存中/完了/失敗
const hint   = ref("準備完了") // 小提示：如“新增了X张”“已完成”等
const progress = ref(0)       // 进度条（OCR/保存循环时更新）

// 预览控制：缩放、旋转；以及对容器/图片的引用
const viewerRef = ref(null) // 预览容器 DOM，用于需要时计算适配
const imgRef    = ref(null) // 预览图片 DOM
const zoom      = ref(1)    // 缩放倍数（1 = 100%）
const rotation  = ref(0)    // 旋转角度（0/90/180/270）

// 计算属性：当前活动图片对象（没有则 null）
const activeImage = computed(() => images.value[activeIndex.value] || null)


// ============ el-upload 的 ref（清空内部 fileList 用） ============
const uploadRef = ref(null)

// ============ 选择文件时的“新增数量提示”去抖用 ============
const pendingAdded = ref(0) // 本轮累计新增数量（去抖结束统一提示）
let changeDebounceTimer = null


/* ---------- B) 列表选择 / 活动项 / 表单同步 ---------- */

// 全选（带半选态）：v-model 到一个“可读可写”的 computed
const allChecked = computed({
  // 勾选状态 = 列表非空 且 每一项都被选中
  get() {
    return images.value.length > 0 && images.value.every(it => it.checked)
  },
  // 设置时让每一项的 checked 同步
  set(val) {
    images.value.forEach(it => (it.checked = !!val))
  }
})

// 半选态：至少有一个被选 & 不全选
const indeterminate = computed(() => {
  const checkedCount = images.value.filter(it => it.checked).length
  return checkedCount > 0 && checkedCount < images.value.length
})

// 是否有任意一项被勾选（供“选中删除”按钮禁用态）
const anySelected = computed(() => images.value.some(it => it.checked))

// 选中项集合（常用便捷计算）
const selectedImages = computed(() => images.value.filter(it => it.checked))

// 未读（未 OCR 成功）集合（OCR 场景下会用到）
const selectedUnread = computed(() =>
  selectedImages.value.filter(it => it.status !== "読取済み")
)

/**
 * 根据一条图片记录，同步右上表单（“行 -> 表单”）
 * 目的：切换活动项时，表单显示该行最新数据
 */
function syncFormFromItem(it) {
  Object.assign(form, {
    issuer:    it.issuer    || "",
    number:    it.number    || "",
    amount:    it.amount    || "",
    date:      it.date      || "",
    full_text: it.full_text || ""
  })
}

/**
 * 清空右上表单（当列表为空或没有活动项时）
 */
function clearForm() {
  Object.assign(form, { issuer: "", number: "", amount: "", date: "", full_text: "" })
}

/**
 * 聚焦某个索引：更新 activeIndex、同步表单，并让图片自适应容器
 */
function focusOnly(idx) {
  activeIndex.value = idx
  const it = images.value[idx]
  if (!it) return
  syncFormFromItem(it)
  nextTick(() => fitToContainer()) // 等 DOM 刷新后重置缩放为“适配容器”
}

/**
 * 列表行点击：切换活动项 + 切换该行的勾选（体验友好）
 */
function onThumbClick(idx) {
  const it = images.value[idx]
  if (!it) return
  it.checked = !it.checked         // 点行即切换勾选
  focusOnly(idx)                   // 同时切为活动项
}

/** 活动项向前/向后移动（不改勾选状态） */
function prev() { if (activeIndex.value > 0) focusOnly(activeIndex.value - 1) }
function next() { if (activeIndex.value < images.value.length - 1) focusOnly(activeIndex.value + 1) }


/* ---------- C) 上传与去重（修复重复出现问题） ---------- */

/**
 * 打开文件选择框前，清空 el-upload 内部的历史 fileList
 * 目的：避免“上次选择的文件残留到这次的 @change 中”，导致重复入列
 */
function clearBeforePick() {
  uploadRef.value?.clearFiles()
}

/** 构造文件的“唯一键”（文件名 + 大小 + 最后修改时间）用于去重 */
function fileKey(f) {
  return f ? [f.name, f.size, f.lastModified].join("::") : ""
}

/**
 * 上传选择事件（核心入列逻辑 + 两层去重 + 清空 el-upload 列表）
 * @param _uploadFile  el-upload 当前变更的单个文件（不用）
 * @param uploadFiles  el-upload 内部累计的文件列表（需要我们自己去重）
 */
function onFilePicked(_uploadFile, uploadFiles) {
  const before = images.value.length    // 入列前的数量，用于提示“新增了多少”

  const newly = []                      // 本次真正要新增到一览的条目数组
  const roundSeen = new Set()           // 本轮（对 uploadFiles）去重用的集合
  const uniqueUFs = []                  // 本轮去重后的 el-upload 文件项集合

  // (1) 先对这“一轮 uploadFiles”去重（用户可能在系统文件对话框里选了重复）
  for (const uf of uploadFiles) {
    if (!uf?.raw) continue
    const key = fileKey(uf.raw)
    if (roundSeen.has(key)) continue
    roundSeen.add(key)
    uniqueUFs.push(uf)
  }

  // (2) 再与“当前一览中已存在的文件”去重，只添加不存在的
  const existKeys = new Set(
    images.value.map(x => (x.file ? fileKey(x.file) : null)).filter(Boolean)
  )

  for (const uf of uniqueUFs) {
    const raw = uf.raw
    const key = fileKey(raw)
    if (existKeys.has(key)) continue   // 一览里已有 → 不再添加

    const objUrl = URL.createObjectURL(raw) // 生成预览用 blob: URL
    newly.push({
      localId:    idSeq++,     // 本地自增 ID（仅前端 key 用）
      name:       raw.name,
      previewUrl: objUrl,
      file:       raw,         // 保存 file 以便 OCR/保存时传给后端
      issuer:     "",
      number:     "",
      amount:     "",
      date:       "",
      full_text:  "",
      status:     "未処理",     // 初始状态
      checked:    false
    })
    existKeys.add(key)         // 防止本轮重复命中
  }

  // (3) 批量入列；如果之前没有活动项，则聚焦到第一项
  if (newly.length) {
    images.value.push(...newly)
    if (activeIndex.value === -1) focusOnly(0)
  }

  // (4) 清空 el-upload 内部 fileList，避免历史文件残留影响下一次 @change
  uploadRef.value?.clearFiles()

  // (5) 做一个“新增数量提示”的小去抖（有时候一次 @change 可能被多次触发）
  const addedNow = images.value.length - before
  if (addedNow > 0) pendingAdded.value += addedNow

  if (changeDebounceTimer) clearTimeout(changeDebounceTimer)
  changeDebounceTimer = setTimeout(() => {
    if (pendingAdded.value > 0) {
      hint.value = `${pendingAdded.value}枚を追加しました`
      pendingAdded.value = 0
    }
    changeDebounceTimer = null
  }, 120)
}

// 组件销毁前，清理去抖定时器
onBeforeUnmount(() => {
  if (changeDebounceTimer) clearTimeout(changeDebounceTimer)
})


/* ---------- D) 删除（单个/批量）与活动项联动 ---------- */

/**
 * 删除一个索引（不弹确认框的“内部动作”）
 * - 负责：释放 blob: URL、从数组移除、重算活动项、同步右上表单
 * - 仅用于 onRemoveClick/批量删除的内部复用
 */
function doRemove(idx) {
  const it = images.value[idx]
  // 释放预览 URL，避免内存泄漏
  if (it?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(it.previewUrl)

  // 真正从一览中移除
  images.value.splice(idx, 1)

  // 列表已空：清空活动索引和表单、复位预览
  if (images.value.length === 0) {
    activeIndex.value = -1
    clearForm()
    resetView()
    hint.value = "画像はありません"
    return
  }

  // 列表未空：活动项跳到“被删位置的邻近一张”
  const newIndex = Math.min(idx, images.value.length - 1)
  activeIndex.value = newIndex
  const nextItem = images.value[newIndex]
  syncFormFromItem(nextItem)      // 未读 → 空白，已读 → 显示结果
  nextTick(() => fitToContainer())
}

/**
 * 单行删除（带确认框）
 */
async function onRemoveClick(idx) {
  try {
    await ElMessageBox.confirm(
      "この画像を一覧から削除します。よろしいですか？",
      "確認",
      { confirmButtonText: "削除する", cancelButtonText: "キャンセル", type: "warning" }
    )
  } catch {
    return // 用户取消
  }
  doRemove(idx)
  ElMessage.success("削除しました")
}

/**
 * 批量删除：删除所有“勾选”的项（仅前端列表）
 */
async function removeSelected() {
  // 先找出所有被勾选的下标
  const idxList = images.value
    .map((it, idx) => (it.checked ? idx : -1))
    .filter(i => i >= 0)

  if (!idxList.length) return

  try {
    await ElMessageBox.confirm(
      `選択された ${idxList.length} 件を一覧から削除します。よろしいですか？`,
      "確認",
      { confirmButtonText: "削除する", cancelButtonText: "キャンセル", type: "warning" }
    )
  } catch {
    return // 用户取消
  }

  // 删除前，暂存“当前活动项对象”，用于删除后判断是否仍在
  const activeBefore = activeImage.value || null

  // 遍历一次：释放 blob: URL，并把“未勾选”的塞到新数组
  const toRemove = new Set(idxList)
  const remaining = []
  images.value.forEach((it, idx) => {
    if (toRemove.has(idx)) {
      if (it?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(it.previewUrl)
    } else {
      remaining.push(it)
    }
  })

  // 用新数组替换原数组（保持响应式）
  images.value = remaining
  // 全部取消勾选
  images.value.forEach(it => (it.checked = false))

  // 联动活动项/表单
  if (images.value.length === 0) {
    activeIndex.value = -1
    clearForm()
    resetView()
  } else {
    const stillHasActive = activeBefore && images.value.includes(activeBefore)
    if (stillHasActive) {
      // 原活动项还在 → 保持
      activeIndex.value = images.value.indexOf(activeBefore)
    } else {
      // 原活动项被删 → 跳到“被删最小下标”邻近的一张
      const nearest = Math.min(Math.min(...idxList), images.value.length - 1)
      activeIndex.value = Math.max(0, nearest)
    }
    const nextItem = images.value[activeIndex.value]
    syncFormFromItem(nextItem)
    nextTick(() => fitToContainer())
  }

  ElMessage.success("選択した画像を削除しました")
}


/* ---------- E) OCR（选中/全部）统一处理 ---------- */

/**
 * 通用：执行 OCR（把目标数组里的“未读项”打包发给后端）
 * @param targets 目标图片数组（外层一般传“选中项/全部项”）
 * @param doneHint 完成时的提示文案
 */
async function doOcr(targets, doneHint) {
  // 过滤掉“已读”的（只读未读），并打上“読取中”
  const unread = targets.filter(it => it.status !== "読取済み")
  if (!unread.length) {
    status.value = "完了"
    hint.value = "対象はすべて読取済みです"
    return
  }

  status.value = "読取中"
  progress.value = 0
  unread.forEach(it => (it.status = "読取中"))

  try {
    // 组装 FormData：按顺序 append 文件，后端会按顺序返回 items
    const fd = new FormData()
    unread.forEach(it => fd.append("files", it.file))

    // 调用批量 OCR API（约定返回 data.items 与我们顺序一致）
    const { data } = await api.post("/ocr/parse-batch", fd, {
      headers: { "Content-Type": "multipart/form-data" }
    })

    const items = data?.items || []
    let ok = 0

    // 回填：issuer/number/amount/date/full_text；同时标记状态
    items.forEach((row, j) => {
      const img = unread[j]
      if (!img) return
      if (row?.error) {
        img.status = "読み取り失敗"
        return
      }
      img.issuer     = row.issuer     ?? img.issuer     ?? ""
      img.number     = row.number     ?? img.number     ?? ""
      img.amount     = row.amount     ?? img.amount     ?? ""
      img.date       = row.date       ?? img.date       ?? ""
      img.full_text  = row.full_text  ?? img.full_text  ?? ""
      img.status = "読取済み"
      ok++
    })

    // 如果当前活动项属于本次回填目标，则立刻同步一下表单
    const active = activeImage.value
    if (active && unread.includes(active)) syncFormFromItem(active)

    progress.value = Math.round((ok / unread.length) * 100)
    status.value = "完了"
    hint.value = doneHint
  } catch (e) {
    console.error(e)
    status.value = "失敗"
    hint.value = "OCRに失敗しました"
  }
}

/** 读取“选中项”的未读 */
async function readSelected() {
  const selected = selectedImages.value
  if (!selected.length) { hint.value = "選択がありません"; return }
  // 预览跳到“选中项的第一张”
  const first = selected[0]
  const firstIdx = images.value.indexOf(first)
  if (firstIdx >= 0) focusOnly(firstIdx)

  await doOcr(selected, `選択未読 ${selected.length} 枚のOCRが完了`)
}

/** 读取“全部未读” */
async function readAll() {
  await doOcr(images.value, "全未読のOCRが完了しました")
}


/* ---------- F) 保存（单个/全部）与取消保存 ---------- */

/** 字符串规整：去掉 null/undefined 并 trim */
const norm = v => (v ?? "").toString().trim()

/** 判断“活动项与表单是否有差异”（用于避免重复更新） */
function hasDiff(item, f) {
  return (
    norm(item.issuer) !== norm(f.issuer) ||
    norm(item.number) !== norm(f.number) ||
    norm(item.amount) !== norm(f.amount) ||
    norm(item.date)   !== norm(f.date)   ||
    norm(item.full_text) !== norm(f.full_text)
  )
}

/** 新建保存（带图片） */
async function createWithImage(file, payload) {
  const fd = new FormData()
  fd.append("file",    file)
  fd.append("issuer",  payload.issuer ?? "")
  fd.append("number",  payload.number ?? "")
  fd.append("amount",  String(payload.amount ?? ""))
  fd.append("date",    payload.date ?? "")
  fd.append("full_text", payload.full_text ?? "")
  const { data } = await api.post("/ocr/save-with-image", fd, {
    headers: { "Content-Type": "multipart/form-data" }
  })
  return data // 期望返回 { id, status, ... }
}

/** 更新保存（仅元数据；是否接受 full_text 取决于后端实现，传了也没坏处） */
async function updateMeta(id, payload) {
  const { data } = await api.post("/ocr/update", {
    id,
    issuer:  payload.issuer ?? "",
    number:  payload.number ?? "",
    amount:  payload.amount ?? "",
    date:    payload.date ?? "",
    full_text: payload.full_text ?? ""
  })
  return data
}

/** 保存“当前活动项”：已保存过 → 更新；未保存过 → 新建 */
async function saveOne() {
  const item = activeImage.value
  if (!item) return

  // 已保存过：走 update
  if (item.savedId) {
    if (!hasDiff(item, form)) {
      await ElMessageBox.alert("保存済みの内容と同一です。変更はありません。", "お知らせ", {
        confirmButtonText: "確認"
      })
      return
    }
    try {
      item.status = "保存中"
      await updateMeta(item.savedId, form)
      Object.assign(item, form)   // 更新成功后，把表单回写到行
      item.status = "保存済み"
      ElMessage.success("変更内容を保存しました")
    } catch (e) {
      console.error(e)
      item.status = "保存失敗"
      ElMessage.error("保存に失敗しました")
    }
    return
  }

  // 未保存过：走 create
  if (!item.file) {
    ElMessage.warning("画像ファイルがありません")
    return
  }
  try {
    item.status = "保存中"
    const res = await createWithImage(item.file, form)
    const newId = res?.id
    if (!newId) throw new Error("IDが取得できませんでした")
    item.savedId = newId
    Object.assign(item, form)     // 新建成功，同步行数据
    item.status = "保存済み"
    ElMessage.success("保存しました")
  } catch (e) {
    console.error(e)
    item.status = "保存失敗"
    ElMessage.error("保存に失敗しました")
  }
}

/** 保存“全部”：逐个判断已保存与否并分别调用 update/create */
async function saveAll() {
  if (!images.value.length) return

  // 二次确认
  try {
    await ElMessageBox.confirm("表示中のすべての画像を保存します。よろしいですか？", "確認", {
      confirmButtonText: "保存する",
      cancelButtonText: "キャンセル",
      type: "warning"
    })
  } catch { return }

  status.value = "保存中"
  progress.value = 0

  let okCount = 0
  for (let i = 0; i < images.value.length; i++) {
    const it = images.value[i]
    try {
      it.status = "保存中"
      if (it.savedId) {
        await updateMeta(it.savedId, it) // 直接用行里的字段
        it.status = "保存済み"
      } else {
        if (!it.file) throw new Error("file missing")
        const res = await createWithImage(it.file, it)
        const newId = res?.id
        if (!newId) throw new Error("id missing")
        it.savedId = newId
        it.status = "保存済み"
      }
      okCount++
    } catch (e) {
      console.error(e)
      it.status = "保存失敗"
    }
    progress.value = Math.round(((i + 1) / images.value.length) * 100)
  }

  status.value = "完了"
  hint.value = `保存完了（成功 ${okCount}/${images.value.length}）`
}

/** 取消“当前活动项”的保存（仅后端删除 + 前端状态回滚） */
async function cancelSaveCurrent() {
  const item = activeImage.value
  if (!item?.savedId) return

  try {
    await ElMessageBox.confirm(
      "この画像の保存を取り消しますか？データベースから削除されます。",
      "確認",
      { confirmButtonText: "削除する", cancelButtonText: "キャンセル", type: "warning" }
    )
  } catch { return }

  try {
    await api.delete(`/ocr/${item.savedId}`, {
      headers: { "X-User-Id": sessionStorage.getItem("userId") || "1" }
    })
    // 后端删除 OK：行状态从“保存済み/保存中”回到“読取済み”
    item.savedId = null
    item.status =
      item.status === "保存済み" || item.status === "保存中" ? "読取済み" : item.status
    ElMessage.success("保存を取り消しました")
  } catch (e) {
    console.error(e)
    ElMessage.error("取り消しに失敗しました")
  }
}


/* ---------- G) 导出 Excel ---------- */
async function exportExcel() {
  try {
    hint.value = "Excel出力中…"
    const res = await api.get("/ocr/export.xlsx", { responseType: "blob" })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement("a")
    a.href = url
    a.download = "receipts.xlsx"
    a.click()
    URL.revokeObjectURL(url)
    hint.value = "Excelを出力しました"
  } catch (e) {
    console.error(e)
    hint.value = "Excel出力に失敗しました"
  }
}


/* ---------- H) 预览控制（缩放/旋转/自适应） ---------- */

// 图片加载完，默认自适应容器（把缩放重置为 1）
function onImgLoad() { fitToContainer() }

// 适配容器：这里简单处理为 zoom=1（因为图片 max-width/max-height 已限制在容器内）
function fitToContainer() { zoom.value = 1 }

// 复位预览：缩放=1、旋转=0
function resetView() { zoom.value = 1; rotation.value = 0 }

// 缩放（限制在 [0.2, 5] 范围）
function zoomIn()  { zoom.value = Math.min(zoom.value + 0.2, 5) }
function zoomOut() { zoom.value = Math.max(zoom.value - 0.2, 0.2) }

// 旋转（每次 90 度，做一个 0~359 的取模）
function rotateLeft()  { rotation.value = (rotation.value - 90 + 360) % 360 }
function rotateRight() { rotation.value = (rotation.value + 90) % 360 }

// 窗口尺寸变化时，若有活动图就重置适配（确保总是完整可见）
function onResize() { if (activeImage.value) fitToContainer() }
onMounted(() => window.addEventListener("resize", onResize))
onBeforeUnmount(() => window.removeEventListener("resize", onResize))


/* ---------- I) 工具/小函数 ---------- */

/** 把状态映射成 Element Plus 的 tag type */
function tagType(st) {
  if (st === "読取済み" || st === "保存済み") return "success"
  if (st === "読取中" || st === "保存中")   return "warning"
  if (st === "読み取り失敗" || st === "保存失敗") return "danger"
  return "info"
}
</script>

<style scoped>
/* ========== 页面布局基础 ========== */
.ocr-page { display: flex; flex-direction: column; height: 100%; min-height: 0; padding: 16px; }
.toolbar { margin-bottom: 16px; }
.content { flex: 1; min-height: 0; }
.stretch { height: 100%; }

/* 卡片内容充满高度，内部元素纵向布局 */
.thumbs :deep(.el-card__body),
.viewer :deep(.el-card__body),
.form   :deep(.el-card__body) { height: 100%; display: flex; flex-direction: column; }

/* ========== 左栏：缩略列表 ========== */
.thumbs-header { display: flex; justify-content: space-between; align-items: center; }
.thumb-scroll  { flex: 1; min-height: 0; }

.thumbs .thumb {
  display: flex; align-items: center; gap: 8px; padding: 6px;
  border: 1px solid #dcdfe6; border-radius: 6px; margin-bottom: 6px;
  cursor: pointer; background: #fff;
}
.thumbs .thumb.active { border-color: #409eff; }

.thumb-img  { width: 48px; height: 48px; border-radius: 4px; background: #f5f7fa; flex-shrink: 0; }
.thumb-meta { flex: 1; min-width: 0; }
.thumb-title { display: flex; align-items: center; gap: 6px; }
.thumb-title .name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.status-tag { margin-left: auto; }
.issuer { color: #909399; }

/* ========== 中栏：预览 ========== */
.viewer-header { display: flex; justify-content: space-between; align-items: center; }
.file-name { margin-left: 8px; }
.viewer-canvas {
  flex: 1; min-height: 0; overflow: auto; display: flex; align-items: center; justify-content: center;
  background: #f5f7fa; border-radius: 8px;
}
/* 图片本身限制在容器内，缩放/旋转只改变 transform */
.preview-img {
  max-width: 100%; max-height: 100%;
  width: auto; height: auto; object-fit: contain;
  transform-origin: center; transition: transform 0.12s linear;
}

/* ========== 右栏：表单 + 表格 ========== */
.form .form-body { flex: 1; display: flex; flex-direction: column; gap: 8px; overflow: auto; }
.table-wrap { flex: 1; min-height: 0; display: flex; }
.table-wrap :deep(.el-table) { height: 100%; width: 100%; }

/* ========== 底部状态条 ========== */
.status-bar { display: flex; align-items: center; padding: 8px 16px; border-top: 1px solid #ebeef5; margin-top: 12px; }
</style>
