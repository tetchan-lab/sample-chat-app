window.onload = async function () {
    try {
        await updateCsrfToken(); // HTMLの読み込み完了後にCSRFトークンを取得
    } catch (error) {
        console.error("Failed to retrieve CSRF Token:", error);
    }
};

// CSRFトークンを取得してフォームにセットする関数
async function updateCsrfToken() {
    const res = await fetch("/csrf-token");
    const data = await res.json();
    document.getElementById("csrf-token").value = data.csrfToken;
    console.log("✅ New CSRF Token retrieved:", data.csrfToken); // (デバッグ用)
}

let socket = io();
const messages = document.getElementById("messages");
const chatName = document.getElementById("chat-name");
const input = document.getElementById("input");
const form = document.getElementById("chatForm");
const emojiButton = document.getElementById("emoji-button");
const emojiPicker = document.getElementById("emoji-picker");
const tooltipStyle = document.getElementById("emoji-tooltip");
const sendImg = document.querySelector(".send-img");
let isComposing = false; // IME変換中かどうかを判定するフラグ

// IME変換開始時にフラグを立てる
input.addEventListener("compositionstart", () => {
    isComposing = true;
});

// IME変換確定時にフラグを解除
input.addEventListener("compositionend", () => {
    isComposing = false;
});

// 表示する絵文字一覧
const emojis = [
    "😌",
    "😭",
    "😀",
    "😁",
    "😂",
    "🤣",
    "😃",
    "😄",
    "😅",
    "😆",
    "☺️",
    "😇",
    "😍",
    "😡",
    "😓",
    "😴",
    "😨",
    "🤔",
    "🥹",
    "😔",
    "😉",
    "😊",
    "😋",
    "😎",
];

// 絵文字ピッカーを生成
function createEmojiPicker() {
    emojiPicker.innerHTML = ""; // emojiPicker の中身をリセットする（新しく作り直すため）
    emojis.forEach((emoji) => {
        const span = document.createElement("span"); // <span> 要素を作る
        span.textContent = emoji; // 絵文字を <span> の中に入れる
        span.classList.add("emoji"); // CSS でスタイルを適用するために emoji クラスを追加
        span.addEventListener("click", () => insertEmoji(emoji)); // クリックしたら insertEmoji() を実行
        emojiPicker.appendChild(span); // emojiPicker（絵文字一覧の div）の中に span を追加する
    });
}

// 絵文字を textarea に挿入
function insertEmoji(emoji) {
    const cursorPos = input.selectionStart; // カーソル位置を取得
    const textBefore = input.value.substring(0, cursorPos); // カーソル前の文字を取得
    const textAfter = input.value.substring(cursorPos); //カーソル後の文字を取得
    input.value = textBefore + emoji + textAfter; // 新しい文字列を作成（カーソル位置に絵文字を挿入）
    input.focus(); // フォーカスを戻して引き続き入力できるようにする
}

// ボタンを押したら絵文字一覧を表示・非表示
emojiButton.addEventListener("click", (event) => {
    createEmojiPicker(); // 関数を実行 絵文字リストを作成
    // if 文を短くかいた 三項演算子（?:）を使った条件分岐
    emojiPicker.style.display =
        emojiPicker.style.display === "flex" ? "none" : "flex";
    // ツールチップを非表示にする
    document.body.classList.add("tooltip-hidden");
});

// クリックで絵文字ピッカーを閉じる（ボタンとピッカー以外）＆ tooltip のスタイルを戻す
document.addEventListener("click", (event) => {
    if (
        !emojiButton.contains(event.target) &&
        !emojiPicker.contains(event.target)
    ) {
        emojiPicker.style.display = "none";
        // 外クリックで tooltip を元に戻す
        document.body.classList.remove("tooltip-hidden");
    }
});

// テキストの幅を計算する関数
function getTextWidth(text, font) {
    const canvas = document.createElement("canvas"); // canvas 要素を作成
    const context = canvas.getContext("2d"); // 2Dコンテキスト（getContext("2d")を取得
    context.font = font; // textarea のフォントを適用
    return context.measureText(text).width; // リターンで「現在のフォント設定で text を描いた時の横幅」を返す
}

// スマホ判定関数
function isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

// スマホならemojiボタンを非表示にする処理（コメントアウト中）
/*if (isMobile()) {
    emojiButton.style.display = "none"; // スマホならボタンを非表示
}*/

// 自動リサイズ関数
function adjustTextareaHeight() {
    input.style.height = "39px"; // 一度リセットする

    const newLine = input.value.includes("\n"); // 改行の確認。
    const twoHeight = 49; // 2行分の高さ
    let newHeight = input.scrollHeight; // 現在の高さ

    //console.log("現在の高さ:", newHeight); // 現在の高さを確認（デバッグ用）
    //console.log("２行分の高さ:", twoHeight); // ２行分の高さを確認（デバッグ用）

    // textarea のスタイルを取得してフォント情報を取得
    const textareaStyle = window.getComputedStyle(input);
    const font = `${textareaStyle.fontSize} ${textareaStyle.fontFamily}`;

    // 現在の入力テキストの幅を計算
    const TextWidth = getTextWidth(input.value, font); // 現在の入力テキストをgetTextWidth() に渡す
    //console.log("Text Width:", TextWidth); // デバッグ用

    // textarea の padding を取得
    const paddingLeft = parseFloat(textareaStyle.paddingLeft);
    const paddingRight = parseFloat(textareaStyle.paddingRight);
    const textPadding = paddingLeft + paddingRight; // 合計のpadding
    const margin = 55; // 余力の値（ピクセル）

    // テキスト幅にpadding分と余力分の数字を加える
    const adjustedTextWidth = TextWidth + textPadding + margin;
    //console.log("Adjusted Text Width:", adjustedTextWidth); // デバッグ用

    // emojiボタンの左側の位置を取得
    const emojiButtonLeft = emojiButton.getBoundingClientRect().left;
    //console.log("emojiButton Left: ", emojiButtonLeft); // デバッグ用

    // PCかスマホか判定して、個別の条件で処理をさせる。スマホならemojiボタンの位置を考慮しない（コメントアウト中）
    /*if (isMobile()) {
	    // もし折り返しが発生し2行分になったら
		if (newHeight >= twoHeight) {
		    input.style.height = "89px"; // 4行分の高さに変更
			messages.style.marginBottom = "70px"; // ul を４行分の高さ上げる
			messages.scrollTo(0, messages.scrollHeight); // messages内のスクロールを一番下へ
		} else {
			// 元の値に戻す
			messages.style.marginBottom = "23px";
		}
	} else {*/

    // PCならemojiボタンの位置を考慮する
    //もし折り返しが発生し2行分になる、あるいは文字がボタン左端の距離まできたら4行分の高さを確保
    if (newHeight >= twoHeight || adjustedTextWidth >= emojiButtonLeft) {
        input.style.height = "89px"; // 4行分の高さに変更
        messages.style.marginBottom = "70px"; // ul を４行分の高さ上げる
        messages.scrollTo(0, messages.scrollHeight); // messagesのスクロールを一番下へ
        // 絵文字ボタンの位置を右下に調整する
        emojiButton.style.top = "88%";
        emojiButton.style.transform = "translateY(-88%)";
    } else {
        // 元の値に戻す
        messages.style.marginBottom = "23px";
        emojiButton.style.top = "9px";
        emojiButton.style.transform = "none";
    }
    //}

    input.style.height = Math.min(input.scrollHeight, 205) + "px"; // 最大205pxまで拡大

    // PCかスマホか判定して、個別の条件でborder-radiusの値を変更する。スマホならemojiボタンの位置を考慮しない（コメントアウト中）
    /*
    if (isMobile()) {
		// もし改行がある or 現在の高さが２行分(49px)をこえたら、自動でborder-radiusの値を変更する。
		if (newLine || newHeight >= twoHeight) {
		    input.style.borderRadius = "0.8rem"; // 改行あり → 0.8rem
		} else {
			input.style.borderRadius = "2rem"; // 改行なし → 2rem
		}
	} else {
    */

    // PCならemojiボタンの位置を考慮する
    // 改行がある or 現在の高さが２行分(49px)になる or 文字がボタン左端の距離まできていたら値を変更する。
    if (
        newLine ||
        newHeight >= twoHeight ||
        adjustedTextWidth >= emojiButtonLeft
    ) {
        input.style.borderRadius = "0.8rem"; // 改行あり → 0.8rem
    } else {
        input.style.borderRadius = "2rem"; // 改行なし → 2rem
    }
    //}
}

// 入力時に高さを調整
input.addEventListener("input", adjustTextareaHeight);

// シフト+エンターで改行、通常のエンターで送信
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        if (isComposing) {
            return; // IME変換中なら送信しない
        }

        if (event.shiftKey) {
            // シフト+エンターなら改行
            event.preventDefault();
            const cursorPos = input.selectionStart; // カーソル位置を取得
            const textBefore = input.value.substring(0, cursorPos); // カーソル前の文字を取得
            const textAfter = input.value.substring(cursorPos); //カーソル後の文字を取得
            input.value = textBefore + "\n" + textAfter; // 新しい文字列を作成
            input.selectionStart = input.selectionEnd = cursorPos + 1; // カーソル位置を調整
            adjustTextareaHeight();
        } else {
            // エンターのみならフォームを送信
            event.preventDefault();
            form.requestSubmit(); // フォームを送信
        }
    }
});

// 入力時に送信ボタン画像の色を変える
input.addEventListener("input", (event) => {
    // 空かつ改行の場合は除外
    if (
        input.value.trim() &&
        !(input.value.trim() === "" && input.value.includes("\n"))
    ) {
        sendImg.style.filter =
            "invert(23%) sepia(67%) saturate(3090%) hue-rotate(201deg) brightness(93%) contrast(101%)";
    } else {
        sendImg.style.filter =
            "invert(22%) sepia(16%) saturate(4%) hue-rotate(315deg) brightness(102%) contrast(81%)";
    }
});

// フォーム送信時の処理
form.addEventListener("submit", async (event) => {
    event.preventDefault(); // ページ遷移を防ぐ
    const trimmedValue = input.value.trim(); // 前後の空白と改行を除去

    if (trimmedValue && !(trimmedValue === "" && input.value.includes("\n"))) {
        try {
            const formData = new FormData(form);
            const name = formData.get("_name");
            const message = formData.get("_message");
            const csrfToken = formData.get("_csrf");
            //console.log("📝 送信データ:", { name, message }); (デバッグ用)

            // サーバーへPOSTリクエストを送信（CSRFトークンをヘッダーに含める）
            const response = await fetch("/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "CSRF-Token": csrfToken, // ヘッダーにトークンを設定
                },
                body: JSON.stringify({ name, message }),
            });

            const result = await response.json();
            console.log("📝 Server response:", result);

            // 送信後に新しい CSRF トークンを取得
            await updateCsrfToken();
        } catch (error) {
            console.error("Error during form submission:", error);
        }

        console.log("送信されたメッセージ:", trimmedValue); // 送信内容を表示（デバッグ用）

        socket.emit("chat message", {
            text: input.value,
            name: chatName.value,
        });

        input.value = ""; // 入力欄をクリア
        input.style.height = "39px"; // 初期の高さに戻す
        input.style.borderRadius = "2rem"; // 初期値に戻す
        input.blur(); // フォーカスを外す（スマホならキーボードを閉じる）
        emojiButton.style.top = "9px"; // 初期の高さに戻す
        emojiButton.style.transform = "none"; // 初期値に戻す
        messages.style.marginBottom = "23px"; // 初期に戻す

        // 送信ボタンの色をリセット
        sendImg.style.filter =
            "invert(22%) sepia(16%) saturate(4%) hue-rotate(315deg) brightness(102%) contrast(81%)";

        // PCならフォーカスを戻す（スマホでは戻さない）
        if (!isMobile()) {
            setTimeout(() => input.focus(), 100);
        }
    }
    //  下記は同じ条件式のもう一つの方法。どっちが分かりすいか悩ましい。
    // if (trimmedValue && input.value.replace(/\n/g, "").trim() !== "")
});

// 新しいメッセージがきた時の処理
socket.on("chat message", function (msg) {
    // 投稿時間を取得する
    let postTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Tokyo",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }); // 英語圏のロケール（例: en-US）を使いタイムゾーンで日本を明示的に指定
    let item = document.createElement("li");
    item.innerHTML = `
					<span class="msg-icon"><img src="/icon/profile_sample_image-300x300.jpg"></span>
					<div class="msg-contents">
						<time>${postTime}</time>
						<span class="msg-name">${msg.name}</span>
						<span class="msg-text">${msg.text}</span>
					</div>
				`;
    messages.appendChild(item);
    messages.scrollTo(0, messages.scrollHeight); // messages内のスクロールを一番下へ
    //window.scrollTo(0, document.body.scrollHeight);
});
