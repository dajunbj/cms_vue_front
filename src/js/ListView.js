import axios from 'axios';

//◆全削除
export async function deleteAllSelected(url) {

  if (!this.multipleSelection || this.multipleSelection.length === 0) {
    this.$message.warning('削除する項目を選択してください。');
    return;
  }

  try {
    await axios.post(url, {
      delListId: this.multipleSelection
    }); // 发送对象

    this.$message.success('選択した項目が削除されました。');
    // 更新画面データ
    this.findEmployees();
  } catch (error) {
    this.$message.error('削除中にエラーが発生しました: ' + error);
  }
}