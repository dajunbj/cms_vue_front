<template>
  <div class="p-4">
    <!-- ================== 検索フォーム + 一括申請ボタン ================== -->
    <el-card class="mb-4">
      <el-form :inline="true" :model="query">
        <!-- 店名で部分一致検索 -->
        <el-form-item label="店名">
          <el-input
            v-model="query.storeName"
            placeholder="店名で検索"
            clearable
          />
        </el-form-item>

        <!-- 状態で絞り込み -->
        <el-form-item label="状態">
          <el-select
            v-model="query.status"
            placeholder="状態を選択"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="s in statusOptions"
              :key="s"
              :label="s"
              :value="s"
            />
          </el-select>
        </el-form-item>

        <!-- 検索／リセットボタン -->
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="fetchList(1)"
            >検索</el-button
          >
          <el-button @click="reset">リセット</el-button>
        </el-form-item>

        <!-- 一括申請ボタン（選択されていて、かつ全て申請可能状態で有効） -->
        <el-form-item style="margin-left: 12px">
          <el-button
            type="success"
            :disabled="selectedRows.length === 0 || !allSelectable"
            @click="openBulkApply"
            >一括申請</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ================== 領収書一覧テーブル ================== -->
    <el-card>
      <el-table
        :data="items"
        v-loading="loading"
        border
        :row-key="(row) => row.id"
        @selection-change="onSelectionChange"
      >
        <!-- 選択用チェックボックス列 -->
        <el-table-column type="selection" width="48" reserve-selection />

        <!-- 領収書画像 -->
        <el-table-column label="画像" width="110">
          <template #default="{ row }">
            <el-image
              v-if="row.imagePath"
              :src="resolveImageUrl(row.imagePath)"
              :preview-src-list="[resolveImageUrl(row.imagePath)]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px"
            >
              <!-- 読み込みエラー時の表示 -->
              <template #error>
                <div style="font-size: 12px; color: #999; width: 80px">
                  No Image
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>

        <!-- 店名・発行日・金額・状態・登録日時 -->
        <el-table-column prop="storeName" label="店名" min-width="180" />
        <el-table-column prop="issueDate" label="発行日" width="130" />
        <el-table-column label="金額" width="120" align="right">
          <template #default="{ row }">￥{{ formatYen(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="状態" width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="登録日時" min-width="160" />

        <!-- 編集・単票申請などの操作列 -->
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="onEditClick(row)"
              >編集</el-button
            >
            <el-divider direction="vertical" />
            <el-button
              v-if="canApply(row.status)"
              type="success"
              link
              @click="applyOne(row.id)"
              >申請</el-button
            >
            <el-button
              v-else-if="isApplied(row.status)"
              type="warning"
              link
              @click="cancelApplyOne(row.id)"
              >取消申請</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- ページネーション -->
      <div class="mt-3" style="display: flex; justify-content: flex-end">
        <el-pagination
          background
          layout="prev, pager, next, jumper, ->, total"
          :total="total"
          :current-page="page"
          :page-size="size"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- ================== 一括申請ダイアログ ================== -->
    <el-dialog v-model="dlg.visible" title="一括申請" width="520px">
      <div style="margin-bottom: 12px">
        選択件数: <b>{{ selectedRows.length }}</b> 件 / 合計金額:
        <b>￥{{ formatYen(totalSelectedAmount) }}</b>
      </div>
      <!-- 摘要入力 -->
      <el-input
        v-model="dlg.summary"
        type="textarea"
        :rows="4"
        placeholder="摘要（任意）"
      />
      <template #footer>
        <el-button @click="dlg.visible = false">キャンセル</el-button>
        <el-button type="primary" :loading="dlg.loading" @click="doBulkApply"
          >申請</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
/**
 * 領収書一覧画面
 * - 検索フォーム（店名・状態で絞り込み）
 * - 一覧テーブル（画像プレビュー、状態タグ付き）
 * - ページネーション
 * - 一括申請ダイアログ
 * - 単票申請・編集ボタン
 */
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/api";
import { ElMessage } from "element-plus";

const router = useRouter();

// 一覧データ管理
const items = ref([]); // 表示用アイテム
const total = ref(0); // 総件数
const page = ref(1); // 現在ページ
const size = ref(10); // 1ページ件数
const loading = ref(false); // ローディング状態

// 検索条件
const query = ref({
  storeName: "",
  status: "",
});

// 状態選択肢
const statusOptions = ["草稿", "確認済", "申請済", "承認済", "差し戻し"];

// 状態→タグ色変換
const statusTagType = (s) => {
  switch (s) {
    case "確認済":
      return "success";
    case "申請済":
      return "warning";
    case "承認済":
      return "success";
    case "差し戻し":
      return "danger";
    default:
      return "";
  }
};

// 画像URL解決（バックエンドで /uploads が公開されている前提）
const resolveImageUrl = (p) => p || "";

// 金額フォーマット（カンマ区切り、整数円）
const formatYen = (n) => new Intl.NumberFormat("ja-JP").format(Number(n || 0));

// 一覧取得処理
const fetchList = async (toPage = page.value) => {
  loading.value = true;
  try {
    page.value = toPage;
    const { data } = await api.get("/ocr/receipts/list", {
      params: {
        page: page.value,
        size: size.value,
        issuer: query.value.storeName || undefined,
        status: query.value.status || undefined,
      },
    });
    items.value = data.items || [];
    total.value = data.total || 0;
  } catch (e) {
    console.error(e);
    ElMessage.error("一覧の取得に失敗しました");
  } finally {
    loading.value = false;
  }
};

// 検索条件リセット
const reset = () => {
  query.value.storeName = "";
  query.value.status = "";
  fetchList(1);
};

// ================== 選択 & 一括申請関連 ==================
const selectedRows = ref([]); // 選択中の行
const onSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 「申請可能」状態（草稿・確認済）のみ許可
const canApply = (s) => ["草稿", "確認済"].includes(s);
const isApplied = (s) => s === "申請済";
const canEdit = (s) => !["申請済", "承認済"].includes(s); // 差し戻し/草稿/確認済 は編集可
const allSelectable = computed(
  () =>
    selectedRows.value.length > 0 &&
    selectedRows.value.every((r) => canApply(r.status))
);

// 選択分の合計金額
const totalSelectedAmount = computed(() =>
  selectedRows.value.reduce((sum, r) => sum + Number(r.amount || 0), 0)
);

// 一括申請ダイアログ管理
const dlg = ref({ visible: false, summary: "", loading: false });

const openBulkApply = () => {
  if (!allSelectable.value) {
    ElMessage.warning("申請不可の状態が含まれています");
    return;
  }
  dlg.value.summary = "";
  dlg.value.visible = true;
};

// 一括申請実行
const doBulkApply = async () => {
  try {
    dlg.value.loading = true;
    const ids = selectedRows.value.map((r) => r.id);
    await api.post("/expense/requests", {
      receiptIds: ids,
      summary: dlg.value.summary,
    });
    ElMessage.success("一括申請しました");
    dlg.value.visible = false;
    selectedRows.value = [];
    fetchList(page.value);
  } catch (e) {
    console.error(e);
    ElMessage.error("申請に失敗しました");
  } finally {
    dlg.value.loading = false;
  }
};

// ================== 単票申請 & 編集 ==================
const applyOne = async (id) => {
  try {
    await api.post("/expense/requests", { receiptIds: [id], summary: "" });
    ElMessage.success("申請しました");
    fetchList(page.value);
  } catch (e) {
    console.error(e);
    ElMessage.error("申請に失敗しました");
  }
};

const onEditClick = (row) => {
  if (!canEdit(row.status)) {
    ElMessage.info('この明細は申請中または承認済のため、編集できません。先に「取消申請」してください。')
    return
  }
  goEdit(row.id)
};

const cancelApplyOne = async (id) => {
  try {
    await api.post("/expense/requests/cancel", { receiptIds: [id] });
    ElMessage.success("申請を取消しました");
    fetchList(page.value);
  } catch (e) {
    console.error(e);
    ElMessage.error("取消に失敗しました");
  }
};

// 編集画面へ遷移
const goEdit = (id) => {
  router.push(`/expense/receipt-edit/${id}`);
};

// 初期表示時に一覧取得
onMounted(() => fetchList(1));
</script>

<style scoped>
/* マージン調整 */
.mb-4 {
  margin-bottom: 16px;
}
.mt-3 {
  margin-top: 12px;
}
</style>
