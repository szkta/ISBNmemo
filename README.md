# My Book Manager 📚

ISBNバーコードをカメラで読み取り、書籍の「買いたいリスト」と「蔵書リスト」を管理できるWebアプリケーションです。
Next.js と Firebase を使用して構築されており、スマートフォンでの操作に最適化されています。

## ✨ 主な機能

* **ISBNスキャン**: スマホのカメラを使って書籍の裏表紙のバーコード（ISBN）を読み取ります。
* **手動入力検索**: バーコードが読み取れない場合、ISBNコードの手入力でも検索可能です（ハイフン自動除去・数値キー対応）。
* **書籍情報取得**: OpenBD APIを使用し、書影、タイトル、著者名などを自動取得します。
* **リスト管理**:
    * **買いたいリスト**: 気になる本を保存。
    * **蔵書リスト**: 購入済みの本を管理。「買いたい」からワンタップで移動可能。
* **ユーザー認証**: Googleアカウントによるログイン機能。データはユーザーごとに隔離され、他者からは見られません。
* **レスポンシブ対応**: PCおよびスマートフォンで快適に動作します。

## 🛠 使用技術

* **Frontend**: Next.js (App Router), React, Tailwind CSS
* **Backend / DB**: Firebase Authentication (Google Auth), Cloud Firestore
* **Library**: html5-qrcode (バーコード読み取り)
* **API**: OpenBD API

## 🚀 ローカルでの実行方法

### 1. リポジトリのクローン
```bash
git clone [https://github.com/あなたのユーザー名/リポジトリ名.git](https://github.com/あなたのユーザー名/リポジトリ名.git)
cd book-manager
```

### 2. パッケージのインストール
```bash

npm install
```
### 3. Firebaseの設定
`src/lib/firebase.js` を開き、ご自身のFirebaseプロジェクトの設定値に書き換えてください。

```JavaScript

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
* **注意**: Firebaseコンソールで `Authentication` (Googleプロバイダ) と `Cloud Firestore` を有効化しておく必要があります。

* **セキュリティルール**: Firestoreのルールは、認証済みユーザーのみが自身のデータにアクセスできるように設定してください。

### 4. 開発サーバーの起動
```bash

npm run dev
```
ブラウザで `http://localhost:3000` にアクセスするとアプリが起動します。

## 🌐 デプロイ方法 (レンタルサーバー / 静的ホスティング)
このプロジェクトは `output: 'export'` モードを使用しており、静的ファイルとして書き出すことができます。Node.jsが動作しない一般的なレンタルサーバーでも公開可能です。

### 1. ビルド
```bash

npm run build
```
プロジェクト直下に `out` フォルダが生成されます。

### 2. アップロード
FTPソフト等を使用し、`out` フォルダの中身をサーバーの公開ディレクトリ（`public_html` 等）にアップロードします。

### 3. リロード対策 (.htaccess)
SPA（シングルページアプリケーション）のため、リロード時に404エラーにならないよう、以下の `.htaccess` をサーバーに配置してください。

```Apache

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
※ サブディレクトリで公開する場合は、`basePath` の設定と `RewriteBase` の調整が必要です。

## ⚠️ 注意事項
* iOS (iPhone) のSafari等でカメラを使用する場合、Webサイトが **HTTPS** で配信されている必要があります（localhostを除く）。

* バーコード読み取り時は、下段の価格コードを隠して上段のISBNコードのみを映すとスムーズに認識されます。

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
