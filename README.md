# 体験申込システム デモ

システムリプレイスのデモ用モックアプリケーションです。

## 概要

既存の Salesforce + SPIRAL システムを、AWS + LINE WORKS WOFF に置き換える検証用デモです。

## システム構成

### 置き換え対象
- **Salesforce** → **Amazon DynamoDB** (データベース)
- **SPIRAL** → **LINE WORKS WOFF** (管理画面)

### 技術スタック
- **フロントエンド**: HTML/CSS/JavaScript (GitHub Pages)
- **バックエンド**: AWS Lambda + API Gateway
- **データベース**: Amazon DynamoDB
- **管理画面**: LINE WORKS WOFF

## 機能

### 1. 体験申込フォーム
- 3つの教室から選択（渋谷・新宿・池袋）
- 保護者・お子様情報の入力
- DynamoDB への自動保存

### 2. 管理画面 (WOFF)
- 申込一覧の表示
- ステータス管理：確認 → 予約未決定 → 予約済み → 保留中 → 結果決定
- 教室・ステータスでのフィルタリング
- 申込詳細の表示

## ファイル構成

```
├── index.html                    # メインページ
├── sample/
│   └── bestudio-form-replica.html  # 体験申込フォーム
├── woff-admin.html               # 管理画面
├── aws-lambda-function.js        # Lambda関数（フォーム送信用）
├── cloudformation-template.yml   # AWS リソース作成用
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions デプロイ設定
└── README.md                    # このファイル
```

## デプロイ手順

### 1. GitHubリポジトリ作成
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/iwaoh-child-eng-demo.git
git push -u origin main
```

### 2. GitHub Pages設定
1. リポジトリの Settings → Pages
2. Source を "Deploy from a branch" に設定
3. Branch を "main" に設定

### 3. AWS リソース作成
```bash
aws cloudformation create-stack \
  --stack-name iwaoh-child-eng-demo \
  --template-body file://cloudformation-template.yml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=EnvironmentName,ParameterValue=iwaoh-child-eng
```

### 4. フォームのAPI エンドポイント更新
CloudFormation のOutput から API Gateway のエンドポイントを取得し、
`sample/bestudio-form-replica.html` の fetch URL を更新してください。

```javascript
// 現在
fetch('/api/submit', {

// 更新後
fetch('https://YOUR_API_ID.execute-api.ap-northeast-1.amazonaws.com/prod/submit', {
```

### 5. 管理画面のAPI エンドポイント更新
`woff-admin.html` の loadApplications 関数を更新してください。

```javascript
// デモ用ダミーデータの部分を以下に置き換え
const response = await fetch('https://YOUR_API_ID.execute-api.ap-northeast-1.amazonaws.com/prod/admin/applications');
const data = await response.json();
applications = data.data;
```

## LINE WORKS WOFF 設定

1. LINE WORKS Developer Console でアプリケーションを作成
2. WOFF アプリケーション設定で `woff-admin.html` を指定
3. 必要に応じて認証・権限設定を行う

## 注意事項

- このデモは検証用のため、本番環境での利用には追加のセキュリティ対策が必要です
- 実際の運用では、認証機能や入力検証の強化が必要です
- AWS リソースの料金が発生する可能性があります

## 削除手順

AWS リソースを削除する場合：

```bash
aws cloudformation delete-stack --stack-name iwaoh-child-eng-demo
```

GitHub Pages は GitHub リポジトリの設定から無効化できます。

## サポート

問題が発生した場合は、以下を確認してください：
- AWS CloudFormation のスタック作成状況
- Lambda 関数のログ (CloudWatch Logs)
- API Gateway のテスト機能
- ブラウザのデベロッパーツールでのエラーログ