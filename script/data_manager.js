function multiplyLength(array) {
  return array.reduce((acc, val) => acc * val.length, 1);
}

function margeDigit(digits) {
  // 例外処理対象を抽出
  const except = digits.slice().map(x => x[1]);
  digits = digits.map(x => x[0].concat(x[1].map(y => -y)));
  // 全パターン数を求める
  const patt = multiplyLength(digits);
  //
  let result = Array(patt).fill("", 0);
  //
  for(var i = 0; i < digits.length; i++){
    // コールバック周期と回数計算
    const vart = digits[i].length;
    const freq = patt / multiplyLength(digits.slice(0, i+1));
    const loop = patt / (vart * freq);
    // resultにパターンを記録
    for(var j = 0; j < loop; j++){
      for (var k = 0; k < vart; k++) {
        for (var l = 0; l < freq; l++) {
          // 全パターン中のインデックス（詳細は別紙参照）を取得
          const idx = j*(patt/loop)+k*(patt/(loop*vart))+l;
          // 桁の数字を取得
          let curr = digits[i][k].toString().slice(0, 1);
          // 十の位以前で終了するパターンでは重複を無視して以降の桁を0に変換 ( -2+xx >>> -2+00 )
          if (curr == "-") {
            curr = digits[i][k].toString().slice(1, 2);
            result[idx] = Array(result[idx].length+1).join(0);
          }
          result[idx] = curr+result[idx];
        }
      }
    }
  }
  // 配列の要素を整形
  result = result
    .map(val => parseInt(val.toString(), 10)) // 余分な桁(001の00)などを削除
    .sort((st, nd)=>(st - nd)); // 昇順に並べ替え
  // 0を削除
  const zeroIdx = result.indexOf(0);
  if (zeroIdx !== -1) {
    result.splice(zeroIdx, 1);
  }
  // 重複を削除
  result = [...new Set(result)];
  return result;
}

function appendToHTML(target, prop, data, template, icon) {
  const words = data[prop].words.split("_");
  let cont = [];  // content内の要素を保存
  // 文節ごとに要素化
  for (word of words) {
    const wait = word.split("%")[1];
    if (word[0] == "!") {
      const inData = data[prop].input[word[1]];
      const fixes = [inData.prefix, inData.suffix];
      // 桁分割型のvalueを生成
      let value = inData.value;
      let tmpVal = [];
      if (inData.sepNums) {
        value = margeDigit(value);
      }
      // menuの選択肢optionを保存
      let options = [];
      for (option of value) {
        options.push(template.option.split("$").join(fixes.join(option)));
      }
      // テンプレ要素に選択肢を追加してcontentに追加
      cont.push(template.cont_input
        .split("_ID_").join(inData.ident)
        .split("_PRE_").join(inData.prefix)
        .split("_SUF_").join(inData.suffix)
        .split("_ABS_").join(inData.absorb)
        .split("_BFABS_").join(inData.beforeAbs)
        .split("_SEP_").join(inData.sepNums)
        .split("_WAIT_").join(wait)
        .split("$").join(fixes.join(value[0]) + template.menu.split("$").join(options.join(""))));
    } else {
      // テンプレ要素に本文を追加してcont(ry
      cont.push(template.cont_text
        .split("$").join(word.split("%")[0])
        .split("_WAIT_").join(wait));
    }
  }
  // HTML要素てんぷら
  const elem = template.main
    .split("$").join(cont.join(""))
    .split("_INTERVAL_").join(Math.max(100, data[prop].wait-200))
    .replace("!i", icon[data[prop].kind]);
  // DOMに挿入
  target.append(elem);
  $(".block").last().addClass(`kind-${data[prop].kind}`);
  $(".block").last().find(".waittime-label").find("span").html($(".block").last().find(".waittime-input").val()+"ミリ秒");
}



$(function() {
  // blockの一覧吸い出し
  $.getJSON("data/blocks_NewCOSMOS.json", function(data) {// jsonからhtml要素生成
    const template = data.template;
    const icon = data.icon;
    // json内の全てのblockに対して実行
    for (var prop in data) {
      // 有効化されたブロックのみ生成
      if (data[prop].status) {
        appendToHTML($(".block-pallet .block-outer"), prop, data, template, icon);
      }
    }
  });



  // プリセットの吸い出し
  $.getJSON("data/presets_NewCOSMOS.json", function(data) {
    // jsonからhtml要素生成
    const template = data.HTML;
    // 仮の追加先
    let cont = [];
    // json内の全てのpresetに対して実行
    for (var prop in data) {
      // 有効化されたプリセットのみ生成
      if (data[prop].status) {
        cont.push(template
          .split("_DISPLAY_")
          .join(data[prop].displayName)
          .split("_KEY_")
          .join(prop));
      }
    }
    // DOMに追加
    $(".preset-outer").append(cont.join(""));
    // 擬似要素の内容セット
    $(".preset").attr("add-option", "追加");
  });
});
