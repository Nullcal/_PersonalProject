$(function() {
  // Grobal variables
  let status = false; // 選択中を検出
  let moving = undefined;
  let mvCurosr, mvScroll;

  //
  $(document).on("mousedown", ".tree-inner>.block", function(e) {
    // 親要素(content)にのみ反応
    const targetClass = e.target.classList[0];
    if (targetClass !== "content" && targetClass !== "text") return;
    moving = $(this);
    // 動かさないブロックをマーク
    $(".block-tree").find(".block").addClass("inactive");
    moving.removeClass("inactive");
    //
    status = true;
  });

  //
  $(document).on("mouseup", function() {
    if (status) {
      status = false;
      // ブロック移動
      moving.insertAfter($(".prediction"));
      moving = undefined;
    }
    $(".nd-dragging").removeClass("nd-dragging");
    // 予測非表示
    $(".prediction").css("display", "none");
  });

  //
  $(document).on("mousemove", function(e) {
    if (status) {
      // カーソルの移動後の位置
      mvCurosr = e.clientY;
      // スクロール量を記録
      mvScroll = $(".block-tree").scrollTop();

      // 予測移動を計算
      let predictOrder = 0;
      for (var i = 0; i < $(".block-tree").find(".inactive").length; i++) {
        let target = $(".block-tree").find(".inactive").eq(i);
        let targetTop = target.offset().top + target.height()/2;
        // 上下判定
        if (targetTop < mvCurosr) {
          $(".prediction").insertAfter(target);
        }
      }
      // 予測移動
      $(".prediction").insertBefore();
      // 予測表示
      $(".prediction").css("display", "flex");
      moving.addClass("nd-dragging");
    }
  });
});
