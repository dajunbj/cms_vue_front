<template>
  <div class="ocr-page">
    <!-- =========================================================
      ツールバー：アップロード／OCR／保存／Excel出力
    ========================================================== -->
    <el-row class="toolbar" justify="space-between" align="middle">
      <div class="left" style="display: flex; gap: 8px; align-items: center">
        <!-- 画像アップロード（選択のみ、自動アップロードなし） -->
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :multiple="true"
          :show-file-list="false"
          accept="image/*"
          @change="onFilePicked"
        >
          <el-button type="primary">画像をアップロード</el-button>
        </el-upload>

        <!-- OCR 実行 -->
        <el-button @click="readSelected">選択分をOCR</el-button>
        <el-button type="success" @click="readAll">すべてOCR</el-button>
      </div>

      <div class="right">
        <!-- 保存／エクスポート -->
        <el-button type="primary" @click="saveAll">すべて保存</el-button>
        <el-button @click="exportExcel">Excel出力</el-button>
      </div>
    </el-row>

    <!-- =========================================================
      3 カラムレイアウト
      左：サムネイル一覧（全選択）
      中：閲覧ビュー（拡大・縮小・回転・リセット）
      右：OCR 結果の修正フォーム＋固定ヘッダテーブル（全件表示）
    ========================================================== -->
    <el-row :gutter="16" class="content">
      <!-- 左：サムネイル -->
      <el-col :span="5" class="stretch">
        <el-card shadow="hover" class="thumbs stretch">
          <template #header>
            <div class="thumbs-header">
              <span>画像（{{ images.length }}）</span>
              <!-- 全選択（半選択表示あり） -->
              <el-checkbox v-model="allChecked" :indeterminate="indeterminate">
                全選択
              </el-checkbox>
            </div>
          </template>

          <el-scrollbar class="thumb-scroll">
            <div
              v-for="(img, idx) in images"
              :key="img.localId"
              :class="['thumb', { active: idx === activeIndex }]"
              @click="onThumbClick(idx)"
            >
              <el-image :src="img.previewUrl" fit="cover" class="thumb-img" />
              <div class="thumb-meta">
                <div class="thumb-title">
                  <!-- 個別選択（クリック伝播停止） -->
                  <el-checkbox v-model="img.checked" @click.stop />
                  <!-- ファイル名（省略表示） -->
                  <span class="name" :title="img.name">{{ img.name }}</span>
                  <!-- ステータスタグ -->
                  <el-tag
                    size="small"
                    class="status-tag"
                    :type="tagType(img.status)"
                  >
                    {{ img.status || "未処理" }}
                  </el-tag>
                </div>
                <!-- 発行先プレビュー -->
                <small class="issuer">{{
                  img.issuer || "発行先：未認識"
                }}</small>
              </div>
              <!-- 行削除（クリック伝播停止） -->
              <el-button
                text
                type="danger"
                size="small"
                @click.stop="remove(idx)"
              >
                削除
              </el-button>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <!-- 中央：プレビュー（初期＝コンテナに完全表示） -->
      <el-col :span="11" class="stretch">
        <el-card shadow="hover" class="viewer stretch">
          <template #header>
            <div class="viewer-header">
              <div>
                <el-tag type="info"
                  >No. {{ activeImage?.localId ?? "-" }}</el-tag
                >
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

      <!-- 右：フォーム＋固定ヘッダの内部スクロールテーブル -->
      <el-col :span="8" class="stretch">
        <el-card shadow="hover" class="form stretch">
          <template #header>OCR結果と修正</template>

          <div class="form-body">
            <!-- 上：アクティブ画像の修正フォーム -->
            <el-form label-width="90px" label-position="left">
              <el-form-item label="発行先">
                <el-input v-model="form.issuer" placeholder="発行先" />
              </el-form-item>
              <el-form-item label="登録番号">
                <el-input v-model="form.number" placeholder="登録番号" />
              </el-form-item>
              <el-form-item label="金額">
                <el-input v-model="form.amount" placeholder="金額" />
              </el-form-item>
              <el-form-item label="発行日">
                <el-date-picker
                  v-model="form.date"
                  type="date"
                  placeholder="日付を選択"
                />
              </el-form-item>
              <el-form-item>
                <!-- 保存ボタン（未保存→新規／保存済→差分更新） -->
                <el-button type="primary" @click="saveOne">
                  {{ activeImage?.savedId ? "変更後内容を保存" : "現在を保存" }}
                </el-button>
                <!-- 取消ボタン（保存済のみ表示） -->
                <el-button
                  v-if="activeImage?.savedId"
                  type="danger"
                  plain
                  @click="cancelSaveCurrent"
                >
                  保存を取り消す
                </el-button>
              </el-form-item>
            </el-form>

            <el-divider />

            <!-- 下：固定ヘッダ＋内部スクロールのテーブル（全画像がソース） -->
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

    <!-- 底部：進捗・ヒント -->
    <div class="status-bar">
      <el-tag>{{ status }}</el-tag>
      <el-progress :percentage="progress" style="flex: 1; margin: 0 12px" />
      <span>{{ hint }}</span>
    </div>
  </div>
</template>

<script setup>
/**
 * ReceiptUploadView.vue
 * ----------------------------------------------------------
 * バッチOCR＋編集保存画面（工程品質向けの構成・命名・コメント）
 *
 * バックエンドAPI（/api プロキシ前提の api インスタンス）:
 *  - POST   /ocr/parse-batch          : 画像群 OCR
 *  - POST   /ocr/save-with-image      : 新規保存（画像＋項目）
 *  - POST   /ocr/update               : 既存更新（項目のみ）
 *  - DELETE /ocr/{id}                 : 取消（物理削除）
 *  - GET    /ocr/export.xlsx          : Excel 出力
 *
 * UI 要件:
 *  - 左：画像一括 or 個別選択（トグル）、全選択チェック
 *  - 中：プレビュー（初期＝完全表示／ズーム／回転）
 *  - 右：アクティブ画像のフォーム編集＋全件一覧（固定ヘッダ）
 *  - OCR 挙動：選択分OCR＝選択内の未読のみ、すべてOCR＝全未読
 *  - 保存挙動：未保存→新規、保存済→差分がある時のみ更新
 *  - 取消挙動：DB削除→状態ロールバック→ボタン文言復帰
 */

import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import api from "@/api";
import {
  ZoomIn,
  ZoomOut,
  RefreshLeft,
  RefreshRight,
  FullScreen,
  ScaleToOriginal,
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

/* ============================================================
 * 型注釈（参考）：アップロード画像モデル
 * {
 *   localId: number,
 *   name: string,
 *   previewUrl: string,
 *   file: File,
 *   issuer: string,
 *   number: string,
 *   amount: string|number,
 *   date: string (yyyy-MM-dd),
 *   status: '未処理'|'読取中'|'読取済み'|'読み取り失敗'|'保存中'|'保存済み'|'保存失敗',
 *   checked: boolean,
 *   savedId?: number
 * }
 * ============================================================ */

/* ------------------------------------------------------------
 * 1) 画面状態（リアクティブ）
 * ---------------------------------------------------------- */
let idSeq = 1;
const images = ref([]);
const activeIndex = ref(-1);

/** アクティブ画像の編集フォーム */
const form = reactive({ issuer: "", number: "", amount: "", date: "" });

/** 進捗・ヒント */
const status = ref("待機");
const hint = ref("準備完了");
const progress = ref(0);

/** プレビュー：ズーム・回転 */
const viewerRef = ref(null);
const imgRef = ref(null);
const zoom = ref(1);
const rotation = ref(0);

/** 現在のアクティブ画像 */
const activeImage = computed(() => images.value[activeIndex.value] || null);

/* ------------------------------------------------------------
 * 2) 全選択（半選択表示付き）
 * ---------------------------------------------------------- */
const allChecked = computed({
  get() {
    return images.value.length > 0 && images.value.every((it) => it.checked);
  },
  set(val) {
    images.value.forEach((it) => (it.checked = !!val));
  },
});
const indeterminate = computed(() => {
  const checked = images.value.filter((it) => it.checked).length;
  return checked > 0 && checked < images.value.length;
});

/** 選択済み集合（全体／未読） */
const selectedImages = computed(() => images.value.filter((it) => it.checked));
const selectedUnread = computed(() =>
  selectedImages.value.filter((it) => it.status !== "読取済み")
);

/* ------------------------------------------------------------
 * 3) サムネイル操作
 * ---------------------------------------------------------- */
/** 行→フォーム同期 */
function syncFormFromItem(it) {
  Object.assign(form, {
    issuer: it.issuer || "",
    number: it.number || "",
    amount: it.amount || "",
    date: it.date || "",
  });
}

/**
 * サムネイルクリック：
 *  - checked をトグル
 *  - アクティブ切替（フォーム同期／プレビュー完全表示）
 */
function onThumbClick(idx) {
  const it = images.value[idx];
  if (!it) return;
  it.checked = !it.checked;
  focusOnly(idx);
}

/** 直近アクティブにのみ切替（チェック状態に影響しない） */
function focusOnly(idx) {
  activeIndex.value = idx;
  const it = images.value[idx];
  if (!it) return;
  syncFormFromItem(it);
  nextTick(() => fitToContainer());
}

/** 前後移動（チェック状態は変更しない） */
function prev() {
  if (activeIndex.value > 0) focusOnly(activeIndex.value - 1);
}
function next() {
  if (activeIndex.value < images.value.length - 1)
    focusOnly(activeIndex.value + 1);
}

/** 行削除（Blob URL 解放＋インデックス整合） */
function remove(idx) {
  const it = images.value[idx];
  if (it?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(it.previewUrl);
  images.value.splice(idx, 1);
  if (activeIndex.value >= images.value.length) {
    activeIndex.value = images.value.length - 1;
  }
}

// —— 用于累计一轮选择中新增加的数量（去抖显示） ——
const pendingAdded = ref(0)
let changeDebounceTimer = null

/* ------------------------------------------------------------
 * 4) アップロード（重複除外・自動初期選択）＋去抖累计提示
 * ---------------------------------------------------------- */
function onFilePicked(_uploadFile, uploadFiles) {
  const before = images.value.length
  const newly = []

  for (const uf of uploadFiles) {
    if (!uf.raw) continue
    const dup = images.value.some(
      (x) =>
        x.file &&
        x.file.name === uf.raw.name &&
        x.file.size === uf.raw.size &&
        x.file.lastModified === uf.raw.lastModified
    )
    if (dup) continue

    const objUrl = URL.createObjectURL(uf.raw)
    newly.push({
      localId: idSeq++,
      name: uf.raw.name,
      previewUrl: objUrl,
      file: uf.raw,
      issuer: '',
      number: '',
      amount: '',
      date: '',
      status: '未処理',
      checked: false,
    })
  }

  if (newly.length) {
    images.value.push(...newly)
    if (activeIndex.value === -1) focusOnly(0)
  }

  // 本次 onChange 实际新增的数量
  const addedNow = images.value.length - before
  if (addedNow > 0) {
    pendingAdded.value += addedNow
  }

  // 去抖：多次 onChange（每个文件一次）结束后统一提示本轮合计
  if (changeDebounceTimer) clearTimeout(changeDebounceTimer)
  changeDebounceTimer = setTimeout(() => {
    if (pendingAdded.value > 0) {
      hint.value = `${pendingAdded.value}枚を追加しました`
      pendingAdded.value = 0
    }
    changeDebounceTimer = null
  }, 120)
}

// 卸载时清理定时器
onBeforeUnmount(() => {
  if (changeDebounceTimer) clearTimeout(changeDebounceTimer)
})


/* ------------------------------------------------------------
 * 5) OCR 実行（選択分／すべて・未読のみ）   
 * ---------------------------------------------------------- */
async function readSelected() {
  const selected = images.value.filter((it) => it.checked);
  if (!selected.length) {
    hint.value = "選択がありません";
    return;
  }

  // プレビューは選択の先頭へ（チェック状態は変更しない）
  const first = selected[0];
  const firstIdx = images.value.indexOf(first);
  if (firstIdx >= 0) focusOnly(firstIdx);

  const targets = selected.filter((it) => it.status !== "読取済み");
  if (!targets.length) {
    status.value = "完了";
    hint.value = "選択項目はすべて読取済みです";
    return;
  }

  status.value = "読取中";
  progress.value = 0;
  targets.forEach((it) => (it.status = "読取中"));

  try {
    const fd = new FormData();
    targets.forEach((it) => fd.append("files", it.file));
    const { data } = await api.post("/ocr/parse-batch", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const items = data?.items || [];
    let ok = 0;
    items.forEach((row, j) => {
      const img = targets[j];
      if (!img) return;
      if (row?.error) {
        img.status = "読み取り失敗";
        return;
      }
      img.issuer = row.issuer ?? img.issuer ?? "";
      img.number = row.number ?? img.number ?? "";
      img.amount = row.amount ?? img.amount ?? "";
      img.date = row.date ?? img.date ?? "";
      img.status = "読取済み";
      ok++;
    });

    // 中央に表示中の画像が今回の対象なら、フォームに最新値を即反映
    const active = activeImage.value;
    if (active && targets.includes(active)) syncFormFromItem(active);

    progress.value = Math.round((ok / targets.length) * 100);
    status.value = "完了";
    hint.value = `選択未読 ${targets.length} 枚のOCRが完了（成功 ${ok}/${targets.length}）`;
  } catch (e) {
    console.error(e);
    status.value = "失敗";
    hint.value = "OCRに失敗しました";
  }
}

async function readAll() {
  const targets = images.value.filter((it) => it.status !== "読取済み");
  if (!targets.length) {
    hint.value = "未読の画像はありません";
    return;
  }

  status.value = "読取中";
  progress.value = 0;
  targets.forEach((it) => (it.status = "読取中"));

  try {
    const fd = new FormData();
    targets.forEach((it) => fd.append("files", it.file));
    const { data } = await api.post("/ocr/parse-batch", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const items = data?.items || [];
    let ok = 0;
    items.forEach((row, j) => {
      const img = targets[j];
      if (!img) return;
      if (row?.error) {
        img.status = "読み取り失敗";
        return;
      }
      img.issuer = row.issuer ?? img.issuer ?? "";
      img.number = row.number ?? img.number ?? "";
      img.amount = row.amount ?? img.amount ?? "";
      img.date = row.date ?? img.date ?? "";
      img.status = "読取済み";
      ok++;
    });

    // 中央表示が対象だった場合、フォーム更新
    const active = activeImage.value;
    if (active && targets.includes(active)) syncFormFromItem(active);

    progress.value = Math.round((ok / targets.length) * 100);
    status.value = "完了";
    hint.value = "全未読のOCRが完了しました";
  } catch (e) {
    console.error(e);
    status.value = "失敗";
    hint.value = "OCRに失敗しました";
  }
}

/* ------------------------------------------------------------
 * 6) 保存（新規／更新／一括／取消）
 * ---------------------------------------------------------- */
const norm = (v) => (v ?? "").toString().trim();
function hasDiff(item, f) {
  return (
    norm(item.issuer) !== norm(f.issuer) ||
    norm(item.number) !== norm(f.number) ||
    norm(item.amount) !== norm(f.amount) ||
    norm(item.date) !== norm(f.date)
  );
}

async function createWithImage(file, payload) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("issuer", payload.issuer ?? "");
  fd.append("number", payload.number ?? "");
  fd.append("amount", String(payload.amount ?? ""));
  fd.append("date", payload.date ?? "");
  const { data } = await api.post("/ocr/save-with-image", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

async function updateMeta(id, payload) {
  const { data } = await api.post("/ocr/update", {
    id,
    issuer: payload.issuer ?? "",
    number: payload.number ?? "",
    amount: payload.amount ?? "",
    date: payload.date ?? "",
  });
  return data;
}

async function saveOne() {
  const item = activeImage.value;
  if (!item) return;

  if (item.savedId) {
    if (!hasDiff(item, form)) {
      await ElMessageBox.alert(
        "保存済みの内容と同一です。変更はありません。",
        "お知らせ",
        {
          confirmButtonText: "確認",
        }
      );
      return;
    }
    try {
      item.status = "保存中";
      await updateMeta(item.savedId, form);
      Object.assign(item, form);
      item.status = "保存済み";
      ElMessage.success("変更内容を保存しました");
    } catch (e) {
      console.error(e);
      item.status = "保存失敗";
      ElMessage.error("保存に失敗しました");
    }
    return;
  }

  if (!item.file) {
    ElMessage.warning("画像ファイルがありません");
    return;
  }
  try {
    item.status = "保存中";
    const res = await createWithImage(item.file, form);
    const newId = res?.id;
    if (!newId) throw new Error("IDが取得できませんでした");
    item.savedId = newId;
    Object.assign(item, form);
    item.status = "保存済み";
    ElMessage.success("保存しました");
  } catch (e) {
    console.error(e);
    item.status = "保存失敗";
    ElMessage.error("保存に失敗しました");
  }
}

async function saveAll() {
  if (!images.value.length) return;

  try {
    await ElMessageBox.confirm(
      "表示中のすべての画像を保存します。よろしいですか？",
      "確認",
      {
        confirmButtonText: "保存する",
        cancelButtonText: "キャンセル",
        type: "warning",
      }
    );
  } catch {
    return;
  }

  status.value = "保存中";
  progress.value = 0;

  let okCount = 0;
  for (let i = 0; i < images.value.length; i++) {
    const it = images.value[i];
    try {
      it.status = "保存中";
      if (it.savedId) {
        await updateMeta(it.savedId, {
          issuer: it.issuer,
          number: it.number,
          amount: it.amount,
          date: it.date,
        });
        it.status = "保存済み";
      } else {
        if (!it.file) throw new Error("file missing");
        const res = await createWithImage(it.file, {
          issuer: it.issuer,
          number: it.number,
          amount: it.amount,
          date: it.date,
        });
        const newId = res?.id;
        if (!newId) throw new Error("id missing");
        it.savedId = newId;
        it.status = "保存済み";
      }
      okCount++;
    } catch (e) {
      console.error(e);
      it.status = "保存失敗";
    }
    progress.value = Math.round(((i + 1) / images.value.length) * 100);
  }

  status.value = "完了";
  hint.value = `保存完了（成功 ${okCount}/${images.value.length}）`;
}

async function cancelSaveCurrent() {
  const item = activeImage.value;
  if (!item?.savedId) return;

  try {
    await ElMessageBox.confirm(
      "この画像の保存を取り消しますか？データベースから削除されます。",
      "確認",
      {
        confirmButtonText: "削除する",
        cancelButtonText: "キャンセル",
        type: "warning",
      }
    );
  } catch {
    return;
  }

  try {
    await api.delete(`/ocr/${item.savedId}`, {
      headers: { "X-User-Id": sessionStorage.getItem("userId") || "1" },
    });
    item.savedId = null;
    item.status =
      item.status === "保存済み" || item.status === "保存中"
        ? "読取済み"
        : item.status;
    ElMessage.success("保存を取り消しました");
  } catch (e) {
    console.error(e);
    ElMessage.error("取り消しに失敗しました");
  }
}

/* ------------------------------------------------------------
 * 7) Excel 出力
 * ---------------------------------------------------------- */
async function exportExcel() {
  try {
    hint.value = "Excel出力中…";
    const res = await api.get("/ocr/export.xlsx", { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipts.xlsx";
    a.click();
    URL.revokeObjectURL(url);
    hint.value = "Excelを出力しました";
  } catch (e) {
    console.error(e);
    hint.value = "Excel出力に失敗しました";
  }
}

/* ------------------------------------------------------------
 * 8) プレビュー操作
 * ---------------------------------------------------------- */
function onImgLoad() {
  fitToContainer();
}
function fitToContainer() {
  zoom.value = 1;
}
function resetView() {
  zoom.value = 1;
  rotation.value = 0;
}
function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.2, 5);
}
function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.2, 0.2);
}
function rotateLeft() {
  rotation.value = (rotation.value - 90 + 360) % 360;
}
function rotateRight() {
  rotation.value = (rotation.value + 90) % 360;
}
function onResize() {
  if (activeImage.value) fitToContainer();
}
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => window.removeEventListener("resize", onResize));

/* ------------------------------------------------------------
 * 9) ユーティリティ
 * ---------------------------------------------------------- */
function tagType(st) {
  if (st === "読取済み" || st === "保存済み") return "success";
  if (st === "読取中" || st === "保存中") return "warning";
  if (st === "読み取り失敗" || st === "保存失敗") return "danger";
  return "info";
}
</script>

<style scoped>
/* ============================================================
  レイアウト・スタイル
============================================================ */

/* ページ全体（親要素いっぱいに） */
.ocr-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
}

.toolbar {
  margin-bottom: 16px;
}

/* 3 カラムの伸縮 */
.content {
  flex: 1;
  min-height: 0;
}
.stretch {
  height: 100%;
}

/* カード内を縦並びフレックスにして、子を伸縮可能に */
.thumbs :deep(.el-card__body),
.viewer :deep(.el-card__body),
.form :deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 左：サムネイル */
.thumbs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.thumb-scroll {
  flex: 1;
  min-height: 0;
}
.thumbs .thumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  background: #fff;
}
.thumbs .thumb.active {
  border-color: #409eff;
}
.thumb-img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: #f5f7fa;
  flex-shrink: 0;
}
.thumb-meta {
  flex: 1;
  min-width: 0;
}
.thumb-title {
  display: flex;
  align-items: center;
  gap: 6px;
}
.thumb-title .name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-tag {
  margin-left: auto;
}
.issuer {
  color: #909399;
}

/* 中央：プレビュー */
.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.file-name {
  margin-left: 8px;
}
.viewer-canvas {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
}

/* 画像：コンテナ内に完全表示（object-fit: contain） */
.preview-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transform-origin: center;
  transition: transform 0.12s linear;
}

/* 右：フォーム＋表（固定ヘッダ＋内部スクロール） */
.form .form-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}
.table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
}
.table-wrap :deep(.el-table) {
  height: 100%;
  width: 100%;
}

/* 下部：ステータスバー */
.status-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid #ebeef5;
  margin-top: 12px;
}
</style>
