# WOFF詳細ページアクセス問題の修正記録

## 問題の概要
申込一覧から詳細ページへのアクセスが正しく機能していなかった。

## 原因
WOFFの仕様では、URLにクエリパラメータを追加する際に以下のルールがある：
- クエリパラメータ `?` の前に `/` が必要
- URIフラグメント `#` は使用不可

## 修正内容

### 1. showDetail関数の修正
詳細ボタンクリック時の処理を修正：

```javascript
// 修正前
const detailUrl = `https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA?view=detail&id=${encodeURIComponent(id)}`;

// 修正後
const detailUrl = `https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/?view=detail&id=${encodeURIComponent(id)}`;
```

### 2. goBackToList関数の修正
一覧に戻るボタンの処理も同様に修正：

```javascript
// 修正前
url: 'https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA'

// 修正後  
url: 'https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/'
```

## 修正後の動作

### WOFF環境での詳細URL例
```
https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/?view=detail&id=sub_1751794195755_ocjt461di
```

### 通常ブラウザ環境での詳細URL例
```
https://example.com/woff-admin.html?view=detail&id=sub_1751794195755_ocjt461di
```

## 参考資料
- [WOFF API ドキュメント](https://developers.worksmobile.com/jp/docs/woff-api)
- [WOFF ガイド - WOFF アプリを開く](https://developers.worksmobile.com/jp/docs/woff-guide#open-woff-app)

## 注意事項
- WOFFでは `woff.openWindow()` を使用して新しいウィンドウを開く
- モーダル表示のコードは残してあるが、現在は使用されていない（後で削除予定）