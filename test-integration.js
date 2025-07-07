// 統合テスト - フォーム送信からBot通知まで
const https = require('https');

// テスト用の申込データ
const testFormData = {
    classroom: '渋谷教室',
    parentLastName: '統合テスト',
    parentFirstName: '太郎',
    parentEmail: 'integration-test@example.com',
    parentPhone: '090-9999-8888',
    childLastName: '統合テスト',
    childFirstName: '花子',
    childGender: '女',
    childBirthYear: '2019',
    childBirthMonth: '6',
    childBirthDay: '20',
    trigger: '統合テスト実行',
    message: 'これは統合テストです。Bot通知が届くことを確認してください。'
};

// API Gateway経由でフォーム送信
function submitForm(data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data);
        
        const options = {
            hostname: 'im1swit6p3.execute-api.ap-northeast-1.amazonaws.com',
            path: '/prod/submit',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(jsonData)
            }
        };

        console.log('📤 フォームデータを送信中...');
        console.log('エンドポイント:', `https://${options.hostname}${options.path}`);
        console.log('データ:', JSON.stringify(data, null, 2));

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('\n📥 レスポンス:');
                console.log('ステータスコード:', res.statusCode);
                console.log('レスポンスデータ:', responseData);
                
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`API Error: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(jsonData);
        req.end();
    });
}

// メイン処理
async function runIntegrationTest() {
    console.log('=== 統合テスト開始 ===');
    console.log('日時:', new Date().toLocaleString('ja-JP'));
    console.log('');

    try {
        // 1. フォーム送信
        console.log('📝 ステップ1: フォーム送信');
        const result = await submitForm(testFormData);
        
        console.log('\n✅ フォーム送信成功!');
        console.log('申込ID:', result.id);
        console.log('タイムスタンプ:', result.timestamp);
        
        // 2. Bot通知の確認
        console.log('\n🤖 ステップ2: Bot通知');
        console.log('DynamoDB Streamsが新規レコードを検出し、Bot通知を送信します。');
        console.log('LINE WORKSアプリで以下のメッセージが届くことを確認してください:');
        console.log('');
        console.log('--- 予想されるメッセージ ---');
        console.log('新しい体験申込がありました！');
        console.log('');
        console.log(`申込者: ${testFormData.parentLastName} ${testFormData.parentFirstName} 様`);
        console.log(`お子様: ${testFormData.childLastName} ${testFormData.childFirstName} さん`);
        console.log(`教室: ${testFormData.classroom}`);
        console.log('');
        console.log('詳細を確認してください。');
        console.log('[申込詳細を確認] ← このリンクをクリックすると詳細画面が開きます');
        console.log('---------------------------');
        
        console.log('\n🔍 ステップ3: ログ確認');
        console.log('Lambda関数のログを確認するには:');
        console.log(`aws logs tail /aws/lambda/iwaoh-child-eng-bot-notify --follow`);
        
        console.log('\n=== 統合テスト完了 ===');
        console.log('✅ フォーム送信: 成功');
        console.log('⏳ Bot通知: LINE WORKSアプリで確認してください');
        console.log('📊 申込データ: DynamoDBに保存されました');
        
    } catch (error) {
        console.error('\n❌ エラーが発生しました:', error.message);
        process.exit(1);
    }
}

// テスト実行
runIntegrationTest();