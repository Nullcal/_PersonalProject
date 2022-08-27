$(function() {

  // メニューの移動
  function moveMenu(target) {
    const blkTop = target.offset().top - $(".field").offset().top;
    console.log(blkTop);
    // 中央揃え用オフセット
    const offsetMenu = $(".menu-wrapper").height() / 2;
    const offsetBlk = target.height() / 2;
    const offset = offsetMenu - offsetBlk;

    let result = blkTop-offset;

    // 上限
    if (result < 0) {
      result = 0;
    }
    // 下限
    if (result > $(".field").height()-$(".menu-wrapper").height()) {
      result = $(".field").height()-$(".menu-wrapper").height();
    }

    // 適用
    $(".menu-wrapper").css("top",result+"px");
  }

  // blockの追加
  $(document).on("click", ".block-outer>.block", function() {
    $(this).clone().attr("wait", "100").appendTo(".tree-inner");
  });

  // blockの削除
  $(document).on("click", ".remove-btn", function() {
    $(this).parents(".block").remove();
    // メニューを閉じる
    $(".menu-wrapper").addClass("hidden");
  });

  // メニューの中身更新
  $(document).on("click", ".select", function() {
    // storageから要素引き出し
    const elem = $(this).find(".storage");
    // 分類の色をクラスで適用
    const colclass = elem.parents(".block").attr("class").split(" ")[3];
    // リセット用削除するclass一覧
    const classes = "kind-track kind-time kind-type kind-station kind-form kind-fixed";
    $(".menu-content").empty().append(elem.html()).removeClass(classes).addClass(colclass);

    // メニューの移動
    moveMenu($(this).parents(".block"));
  });

  // スクロール時のmenu追尾
  $(".block-tree").scroll(function() {
    if ($(".focused").length) {
      moveMenu($(".focused").parents(".block"));
    }
  });

  // メニュー閉じる用focus外すイベント
  $(document).on("click", "*", function(e) {
    // 一番表層の要素以外のイベントを停止
    e.stopPropagation();

    // フォーカス中のselect更新
    const clicked = $(this);
    // 現在の要素にfocused追加
    if (clicked.hasClass("select")) {
      if (clicked.hasClass("focused")) {
        // 同じものをクリック
        // 既存のfocused削除
        $(".focused").removeClass("focused");
        // メニューの表示を切り替え
        $(".menu-wrapper").toggleClass("hidden");
      } else {
        // 既存のfocused削除
        $(".focused").removeClass("focused");
        // 異なるものをクリック
        $(this).addClass("focused");
        // メニューを継続して表示
        $(".menu-wrapper").removeClass("hidden");
      }
      // 検索結果をリセット
      $(".menu-wrapper").find(".not-found").addClass("hidden");
      $(".menu-wrapper").find(".query-hidden").removeClass("query-hidden");
      $(".menu-wrapper").find(".search").val("");
    } else {
      // メニュー内の操作では閉じないように
      if (!clicked.parents(".menu-wrapper").length) {
        // 既存のfocused削除
        $(".focused").removeClass("focused");
        // メニューを閉じる
        $(".menu-wrapper").addClass("hidden");
      }
    }
  });

  // optionの選択を反映
  // 子要素のonclickも伝播させる
  $(document).on("click", ".option", function() {
    const value = $(this).find(".option-name").html();
    const storage = $(".focused").find(".storage").get()[0].outerHTML;
    $(".focused").html(value+storage);
    // メニューを閉じる
    // 既存のfocused削除
    $(".focused").removeClass("focused");
    // メニューを閉じる
    $(".menu-wrapper").addClass("hidden");
    // 検索結果をリセット
    $(".menu-wrapper").find(".not-found").addClass("hidden");
    $(".menu-wrapper").find(".search").val("");
  });

  // inputに単位付与
  let tmpWaitTime = 0;
  $(document).on("input", ".waittime-input", function() {
    tmpWaitTime = $(this).val()*1+0;  // NaN防止
    $(this).parents(".block").attr("wait", tmpWaitTime);
  });
  $(document).on("focus", ".waittime-input", function() {
    $(this).val($(this).val().replace(/[^0-9]/g, ''));
  });
  $(document).on("change", ".waittime-input", function() {
    $(this).val(tmpWaitTime+" ms");
  });


  // パネルにフォーカス
  $(".add-btn").on("click", function() {
    $(".emphasis").removeClass("emphasis");
    setTimeout(function() {
      $(".panel-pallet").find(".search").addClass("emphasis").focus();
    }, 100);
  });

  // プリセットから追加
  $(document).on("click", ".preset", function() {
    // block-treeを初期化
    if (emptyTree) {
      $(".tree-inner").empty();
      $(".tree-inner").append('<div class="prediction"></div>');
    }
    // key/queue取得
    const preKey = $(this).attr("key");
    const preQueue = jsonPreset[preKey].queue;
    // jsonからデータ取得
    const template = jsonBlock.template;
    const icon = jsonBlock.icon;
    // HTML取得
    for (var prop of preQueue) {
      appendToHTML($(".tree-inner"), prop, jsonBlock, template, icon);
    }
    //
  });
});


//ブロックの移動実装
