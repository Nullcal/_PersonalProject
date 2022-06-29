$(function() {
  $(".search").on("focus", function() {
    // 削除が楽なように全選択
    $(this).select();
  });
  //
  $(".search").on("input", function() {
    // 入力内容
    const query = $(this).val();
    // 検索範囲
    const subArea = $(this).parents(".subject-wrapper").find(".subject-outer");
    const subject = subArea.children(".subject");
    // 検索対象
    const queryType = subArea.attr("queryType");
    // 検索内容
    let isMatch = false;
    const content = subject.each(function(index) {
      const value = $(this).find(queryType).text();
      // 結果をクリア
      $(this).removeClass("query-hidden");
      // 不一致を非表示
      if (value.indexOf(query) == -1) {
        $(this).addClass("query-hidden");
      } else {
        isMatch = true;
      }
    });
    // 結果なし表示
    if (isMatch) {
      subArea.parent().find(".not-found").addClass("hidden");
    } else {
      subArea.parent().find(".not-found").removeClass("hidden");
    }
  });
});
