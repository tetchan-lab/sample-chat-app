# Realtime Chat App - sample
このプロジェクトは **Node.js + Express + Socket.IO** を使ったリアルタイムチャットアプリのサンプルコードです。
- CSRF対策のためトークンの発行と検証に`csurf`と`cookie-parser`を使っています。
- エスケープ＆バリデーションに`express-validator` を使っています。

## 📌 必要な環境
- **Node.js** (推奨バージョン: `18.x.x` 以上)
- **npm** (`Node.js` に含まれています)

## 📥 インストール
### 1️⃣ このリポジトリをクローン
```sh
git clone https://github.com/tetchan-lab/sample-chat-app.git
cd sample-chat-app
```
### 2️⃣ 依存パッケージをインストール
```sh
npm install
```
### 3️⃣ アプリを起動
```sh
npm start
```
または  
```sh
node index.js
```
### 4️⃣ 動作確認
- ブラウザで http://localhost:3000 にアクセス
### 5️⃣ .env について
- 現時点では `.env` は不要 ですが、今後使う予定があるため `dotenv` をインストール済みです。
- もし `.env` を使う場合は、プロジェクトルートに `.env` を作成し、以下のように記述してください。
```sh
PORT=3000 DB_HOST=localhost DB_USER=root DB_PASS=yourpassword
```
## 📝 ライセンス
このプロジェクトは [ISCライセンス](https://opensource.org/licenses/ISC) のもとで公開されています。  
ISCライセンスは、MITライセンスに似たシンプルなライセンスで、商用・非商用問わず自由に利用できます。
