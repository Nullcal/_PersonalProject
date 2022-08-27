$(function() {
  // 空白を埋める
  function fillBlank(value) {
    if (value) {
      return value;
    } else {
      return "null";
    }
  }

  // 再生停止
  function forcePause(audio) {
    // 再生停止
    $(".playpause.fa-play").addClass("shown");
    $(".playpause.fa-pause").removeClass("shown");
    audio.pause();
    //　編集再有効化
    toggleEditorStatus(true);
    // blovkのハイライト削除
    $(".playing").removeClass("playing");
    console.log("aaa");
  }

  // 対応表json読み込み
  let filenameData = {};
  $.getJSON("data/filename.json", function(data) {
    filenameData = data;
    console.log(filenameData);
  });

  let playing = false;

  // 再生イベント初期化
  let audio = new Audio();
  let index = 0;
  let queue = ["NewCOSMOS", []];

  // スキップ（先送り）
  $(".forward-btn, .backward-btn").on("click", function() {
    if (playing) {
      // 再生停止
      audio.pause();
      // キューを進めて再度再生
      index += parseInt($(this).attr("skip"), 10);
      // 0以下は先頭に
      if (index < 0) {
        index = 0;
      }
      if (index < queue[1].length) {
        // キューが残っている場合
        playaudio();
      } else {
        forcePause(audio);
        playing = !playing;
      }
    }
  });

  // 音声再生
  // ファイル情報書き込み
  function playaudio() {
    audio.src = `audio/${queue[0]}/${queue[1][index][0]}.mp3`;
    audio.addEventListener("canplaythrough", ePlayAudio());
    // 再生処理func
    function ePlayAudio() {
      audio.play();
      // 再生中のブロックをハイライト
      highlightPlaying(queue[1][index][1]);
    }
  }

  // 再生
  $(".playpause").parent().on("click", function() {
    if ($(".tree-inner").html()) {
      if (playing) {
        // 再生中
        forcePause(audio);
      } else {
        // 停止中
        $(".playpause.fa-play").removeClass("shown");
        $(".playpause.fa-pause").addClass("shown");
        // 編集無効化
        toggleEditorStatus(false);


        // キュー作成


        // 読み上げデータ
        queue = ["NewCOSMOS", []];
        // 接続国削除用
        let prevAbs = null;
        // blockの情報取得
        $(".block-tree").find(".text,.select,.waittime-input").each(function() {
          // ファイル名出力
          let filename = [];
          // 接続語句削除用変数を保存
          const absorb = fillBlank(prevAbs);
          prevAbs = $(this).attr("absorb");
          // インデックス計算用
          const jqElem = $(this);
          //
          if ($(this).prop("tagName") == "INPUT") {
            // 待機時間
            filename.push(`&${$(this).val()}`);
          } else if($(this).attr("class").split(" ")[0] == "select") {
            // .select
            // prefixなどを取得
            const prefix = fillBlank($(this).attr("prefix"));
            const suffix = fillBlank($(this).attr("suffix"));
            const reg = new RegExp(`${prefix}|${suffix}|${absorb}`, "g");
            // prefix/suffixを削除
            const name = $(this).html().split("<")[0].replace(reg, "");
            // 手前の台詞の重複を削除
            const beforeAbs = fillBlank($(this).attr("beforeAbs"));
            if (queue[1][queue[1].length-1]) {
              if (beforeAbs && beforeAbs == queue[1][queue[1].length-1][0]) {
                queue[1].pop();
              }
            }
            // 識別子を取得
            const ident = $(this).attr("class").split(" ")[1];
            // 数字を分割
            if ($(this).attr("sepNums") == "true") {  // booleanが使えない
              // 桁に分割
              const digit = name.split("");
              // 整形
              for (let i = 0; i < digit.length; i++) {
                if (digit[i] == 0) {
                  // 0は除外
                  digit.splice(i, 1);
                  i--;
                } else {
                  // 桁を揃える
                  const digAdj = new Array(digit.length-i).join("0");
                  digit[i] += digAdj;
                  // DOM挿入準備
                  if (i >= digit.length-1 || digit.slice(i+1).reduce((sum, a)=>(sum*1 + a*1), 0) == 0) {
                    // 最後の桁もしくは以降に0しか続かない桁はcのまま追加
                    filename.push(`${ident}_${digit[i]}`);
                  } else {
                    // 識別子からcをとって追加
                    filename.push(`${ident.slice(0, -1)}_${digit[i]}`);
                  }
                }
              }
            } else {
              // 桁を分離しない場合はそのまま追加
              filename.push(`${ident}_${name}`);
            }
          } else {
            // .text
            // そのまま追加
            const reg = new RegExp(`${absorb}`, "g");
            filename.push($(this).html().split("<")[0].replace(reg, ""));
          }
          // ファイル名からキューに追加
          for (let path of filename) {
            // 空白は追加しない
            if (path && path[0] !== "&") {
              // 日本語を変換
              for (const prop in filenameData) {
                if (filenameData.hasOwnProperty(prop)) {
                  path = path.replace(prop, filenameData[prop]);
                }
              }
              // キューに追加
              queue[1].push([path, jqElem]);
            }
          }
        });


        // 再生


        audio = new Audio();
        index = 0;
        // 待機時間計算変数
        let bIndex = 0;
        playaudio();

        // 前のキューの終了を検知
        audio.addEventListener("ended", event => {
          if (index++ < queue[1].length-1) {
            // キューが残っていたら再生
            let wait = 50; // 初期値
            if (true) {
              // 終了した親と次の親.blockを取得
              const prevIdx = queue[1][index-1][1].parents(".block").index(".block");
              const curnIdx = queue[1][index][1].parents(".block").index(".block");
              // ブロックの境目の場合初期値を更新
              if (prevIdx !== curnIdx) {
                wait = $(".block-tree").find(".block").eq(bIndex).find(".waittime-input").val().replace(/[^0-9]/g, '');
                bIndex++;
              }
            }
            // 再生
            setTimeout(function() {
              playaudio();
            }, wait);
          } else {
            // キューが残っていない場合
            $(".playpause").toggleClass("shown");
            //　編集再有効化
            toggleEditorStatus(true);
            forcePause(audio);
          }
        });
      }
      playing = !playing;
    }
  });
});
