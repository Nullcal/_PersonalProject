// ブロックツリーの初期化判定
let emptyTree = false;  // true:初期化 false:非破壊

// 再生中の編集無効化
function toggleEditorStatus(enable) {
  if (enable) {
    $(".block-tree").removeClass("disabled");
  } else {
    $(".block-tree").addClass("disabled");
  }
}

// 再生中のブロックをハイライト
function highlightPlaying(jqElem) {
  const target = jqElem.parents(".block");
  // ハイライトリセット
  $(".playing").removeClass("playing");
  //
  if (target) {
    target.addClass("playing");
  }
}

$(function() {
  // panelの開閉
  $(".panel-title").on("click", function() {
    $(this).parents(".panel").toggleClass("closed");
  });
  // プリセットのスタイル変更
  function shiftPreset(e) {
    if (e.which == 16) {
      if (e.type == "keydown") {
        emptyTree = true;
        // 擬似要素の内容セット
        $(".preset").attr("add-option", "削除して追加");
      } else {
        emptyTree = false;
        // 擬似要素の内容セット
        $(".preset").attr("add-option", "追加");
      }
    }
  }
  // プリセットの非破壊追加時のスタイル変更
  $(document).on("keydown", function(e) {
    shiftPreset(e);
  }).on("keyup", function(e) {
    shiftPreset (e);
  });
});
