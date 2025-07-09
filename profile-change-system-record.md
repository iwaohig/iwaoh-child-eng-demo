# 📝 登録情報変更システム開発記録

## 📋 プロジェクト概要
- **システム名**: 登録情報変更システム with LINE WORKS Bot連携
- **開発期間**: 2025年7月9日
- **技術スタック**: AWS Lambda, DynamoDB, API Gateway, LINE WORKS Bot API, WOFF SDK, GitHub Pages

## 🎯 システム仕様

### 変更対象項目
1. **🏠 住所変更**: 郵便番号・住所・変更理由
2. **📞 連絡先変更**: 電話番号・緊急連絡先・変更理由
3. **🏦 口座変更**: 銀行名・支店名・口座種別・口座番号・口座名義・変更理由

### 技術構成
- **フロントエンド**: WOFF統合HTMLフォーム（レスポンシブ対応）
- **バックエンド**: AWS Lambda (Node.js 18.x)
- **データベース**: Amazon DynamoDB
- **API**: Amazon API Gateway
- **通知**: LINE WORKS Bot API
- **認証**: WOFF Profile API
- **ホスティング**: GitHub Pages

## 🚀 デプロイ情報

### GitHub Repository
- **URL**: https://github.com/iwaohig/profile-change-system
- **GitHub Pages**: https://iwaohig.github.io/profile-change-system/

### AWS リソース
- **CloudFormation Stack**: `profile-change-system`
- **DynamoDB Table**: `profile-change-requests`
- **Lambda Function**: `profile-change-api`
- **API Gateway**: `https://u7t6bk9az0.execute-api.ap-northeast-1.amazonaws.com/prod`

### LINE WORKS設定
- **Bot ID**: `10248294` (体験申込システムと共有)
- **Channel ID**: `05a3d91c-c172-893a-e6d3-3bd1e0ce1920`
- **WOFF ID**: `-Ukp496e9FuVCFxS5NT_8Q`

## 🛠️ 開発過程・問題解決記録

### 2025年7月9日: 初期開発

#### **1. システム設計・構築**
- WOFF-Bot統合ガイドに基づく実装
- CloudFormationテンプレート作成
- 3種類の変更フォーム実装
- DynamoDB設計（インデックス最適化）

#### **2. WOFF SDK統合問題**
**問題**: フォームが動作しない、申請者名が表示されない

**原因**:
- WOFF SDK URLが古い（旧バージョン使用）
- パラメータ名の間違い（`appId` → `woffId`）
- 初期化タイミングの問題

**解決**:
```javascript
// 修正前
<script src="https://static.worksmobile.net/static/wm/woff/woff.js"></script>
woff.init({ appId: 'Gwb_BTfV562bnUxhhp81PA' });

// 修正後
<script charset="utf-8" src="https://static.worksmobile.net/static/wm/woff/edge/3.7.1/sdk.js"></script>
woff.init({ woffId: '-Ukp496e9FuVCFxS5NT_8Q' });
```

#### **3. ユーザー情報表示の変更**
**要求**: メールアドレス欄にLINE WORKS IDを表示

**実装**:
```javascript
// フォーム表示
document.getElementById('userEmail').value = userProfile.userId;  // LINE WORKS ID

// 送信データ
const baseData = {
    userEmail: document.getElementById('userEmail').value + '@lineworks',
    lineWorksId: document.getElementById('userEmail').value,
    // ...
};
```

#### **4. 現在情報入力欄の廃止**
**要求**: 現在の情報入力欄を削除

**実装**:
- 「現在の住所」「現在の連絡先」「現在の口座情報」入力欄を削除
- 「新しい○○」→「○○情報」に表示名変更
- `currentData`送信処理を削除

#### **5. userEmail必須フィールドエラー**
**問題**: `Missing required field: userEmail`

**原因**: Lambda関数のバリデーションでuserEmailが必須になっている

**解決**:
```javascript
// 修正前
const requiredFields = ['changeType', 'userDisplayName', 'userEmail'];

// 修正後
const requiredFields = ['changeType', 'userDisplayName'];
```

#### **6. Bot通知の改行処理問題**
**問題**: 通知メッセージで`\n`が文字として表示される

**原因**: CloudFormationテンプレート内での文字列エスケープ問題

**解決**:
```javascript
// 修正前
text: '📝 登録情報変更申請がありました！\\n\\n🔄 変更種類: ...'

// 修正後
let messageText = '📝 登録情報変更申請がありました！';
messageText += String.fromCharCode(10) + String.fromCharCode(10);
messageText += '🔄 変更種類: ' + changeTypeNames[changeRequest.changeType];
// ...
```

## 📱 完成したシステム

### 機能一覧
1. **申請フォーム**: 3種類の変更申請（住所・連絡先・口座）
2. **自動通知**: LINE WORKS Bot通知（申請時・ステータス更新時）
3. **データ管理**: DynamoDB永続化
4. **API**: RESTful API（GET/POST/PUT）
5. **認証**: WOFF Profile統合

### 通知フォーマット
```
📝 登録情報変更申請がありました！

🔄 変更種類: 住所変更
👤 申請者: 東本岩雄
🆔 LINE WORKS ID: 6d5c6fe4-a326-4cdf-17e3-04f72bde0896
📅 申請日時: 2025/7/9 12:30:00
📋 ステータス: pending

理由: 転居のため

申請ID: change_1752031324737_juaa5ukel
```

### データ構造
```json
{
  "id": "change_1752031324737_juaa5ukel",
  "timestamp": "2025-07-09T03:30:00.000Z",
  "userId": "6d5c6fe4-a326-4cdf-17e3-04f72bde0896",
  "changeType": "address",
  "userDisplayName": "東本岩雄",
  "lineWorksId": "6d5c6fe4-a326-4cdf-17e3-04f72bde0896",
  "status": "pending",
  "newData": {
    "zipCode": "123-4567",
    "address": "東京都新宿区..."
  },
  "reason": "転居のため"
}
```

## 🎯 運用状況

### 動作確認済み
- ✅ WOFF SDK統合（ユーザー情報自動取得）
- ✅ フォーム送信（3種類全て）
- ✅ DynamoDB保存
- ✅ LINE WORKS Bot通知
- ✅ GitHub Pages公開
- ✅ モバイル対応

### テスト結果
- **住所変更テスト**: ✅ 成功
- **連絡先変更テスト**: ✅ 成功
- **口座変更テスト**: ✅ 成功
- **履歴取得テスト**: ✅ 成功

## 📚 開発成果物

### ファイル構成
```
profile-change-system/
├── index.html              # WOFFフォーム
├── cloudformation.yml      # AWS インフラ
├── test.js                 # テストスクリプト
├── README.md              # システム概要
└── lambda-update.js       # Lambda関数コード
```

### 技術的特徴
- **サーバーレス**: 完全なサーバーレス構成
- **スケーラブル**: 従量課金制でコスト効率
- **セキュア**: HTTPS通信・IAM権限制御
- **保守性**: CloudFormation管理・バージョン管理

## 🔄 今後の拡張可能性

### 機能拡張
- ステータス管理機能（承認・却下）
- 履歴照会機能
- 管理者ダッシュボード
- メール通知機能

### 技術拡張
- 他システムとの連携
- 承認ワークフロー
- 詳細ログ機能
- 監視・アラート機能

---

**開発完了日**: 2025年7月9日  
**ステータス**: 本番運用可能  
**次期システム**: 体験申込システムと同等の成熟度を達成