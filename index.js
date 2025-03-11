const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const path = require('path');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");


app.use(cookieParser()); // Cookie を扱うためのミドルウェア
const csrfProtection = csrf({ cookie: true }); // CSRF ミドルウェア（トークンを Cookie に保存）

// public フォルダを静的ファイルとして提供
app.use(express.static(path.join(__dirname, 'public')));

/**=========================================================
 * ?                  リファラー設定
 * 
 *   もしリファラー設定が必要なら下のコメントアウトを外してください。
 *   example.com の箇所は自分のドメインに合わせて変更してください。
 * 
 *==========================================================
*/

/*
app.use((req, res, next) => {
    const referrer = req.get("Referer") || "";
    const allowedOrigin = /^https?:\/\/example\.com\//;

    if (!allowedOrigin.test(referrer)) {
        res.status(403).json({ error: "Forbidden", reason: "Invalid Referer" });
    } else {
        next();
    }
});
*/

// CSRF トークンを発行するエンドポイント
app.get("/csrf-token", csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// CSRF トークンを検証するエンドポイントを追加
app.post("/submit", (req, res) => {
    const message = req.body.message; // フォームのデータを取得
    console.log("Received message:", message);
    
    // ここでDBに保存する処理を入れる（仮）
    res.json({ success: true, message: "Message received!" });
});

// ルートアクセスで index.html を表示（CSRFトークン付き）
app.get('/', csrfProtection, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'ndex.html'));
});

// Socket.IO の設定（チャットの例）
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
});

http.listen(port, () => {
    console.log(`Sample-Socket.IO-Chat server running on port http://localhost:${port}`);
});
