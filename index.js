const express = require("express");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const path = require('path');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");


app.use(cookieParser()); // Cookie を扱うためのミドルウェア
app.use(express.urlencoded({ extended: true })); // フォームデータを解析するため
app.use(express.json()); // JSONデータを解析するため

const csrfProtection = csrf({ cookie: true }); // CSRF保護のミドルウェアを設定（クッキーベース）

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

// ルートへのGETリクエストで、CSRFトークンを生成し、index.htmlを返す
app.get('/', csrfProtection, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CSRF トークン付きの POST エンドポイント
app.post("/submit", csrfProtection, (req, res) => {
    // CSRFトークンの検証が自動的に行われる
    const data = req.body; // フォームのデータを取得
    console.log('Received data:', data);
    
    // ここでデータベース操作などの処理を行う
    res.json({ success: true, message: 'データを受け取りました！', data });
});

// Socket.IO の設定
io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
});

http.listen(port, () => {
    console.log(`Sample-Socket.IO-Chat server running on port http://localhost:${port}`);
});
