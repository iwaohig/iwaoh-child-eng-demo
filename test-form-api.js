// フォーム形式のテスト - 実際のHTMLフォームと同じフィールド名でテスト
const https = require('https');

// フォームと同じフィールド名でテストデータを作成
const formTestData = {
    classroom: '渋谷教室',
    // 保護者情報
    parentLastName: 'フォームテスト',
    parentFirstName: '太郎',
    parentLastNameKana: 'ふぉーむてすと',
    parentFirstNameKana: 'たろう',
    zipCode: '150-0002',
    address: '東京都渋谷区渋谷1-1-1',
    phone: '090-1111-2222',
    email: 'form-test@example.com',
    emailConfirm: 'form-test@example.com',
    // お子様情報
    childLastName: 'フォームテスト',
    childFirstName: '花子',
    childLastNameKana: 'ふぉーむてすと',
    childFirstNameKana: 'はなこ',
    gender: '女',
    birthYear: '2020',
    birthMonth: '08',
    birthDay: '15',
    // その他
    trigger: 'インターネット上の広告',
    message: 'フォームからのテスト送信です。Bot通知が正常に動作することを確認してください。'
};

function submitFormData(data) {
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

        console.log('📝 フォーム形式データでテスト開始');
        console.log('送信データ:', JSON.stringify(data, null, 2));
        console.log('');

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('📥 レスポンス:', res.statusCode);
                console.log('データ:', responseData);
                
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

async function runFormTest() {
    console.log('=== フォーム形式APIテスト ===');
    console.log('日時:', new Date().toLocaleString('ja-JP'));
    console.log('');

    try {
        const result = await submitFormData(formTestData);
        
        console.log('\n✅ フォームデータ送信成功!');
        console.log('申込ID:', result.id);
        console.log('タイムスタンプ:', result.timestamp);
        
        console.log('\n🤖 期待される通知内容:');
        console.log('----------------------------');
        console.log('新しい体験申込がありました！');
        console.log('');
        console.log(`申込者: ${formTestData.parentLastName} ${formTestData.parentFirstName} 様`);
        console.log(`お子様: ${formTestData.childLastName} ${formTestData.childFirstName} さん`);
        console.log(`教室: ${formTestData.classroom}`);
        console.log('');
        console.log('詳細を確認してください。');
        console.log('[申込詳細を確認] ← WOFFアプリへのリンク');
        console.log('----------------------------');
        
        console.log('\n⏰ 数秒後にLINE WORKSで通知が届きます...');
        
    } catch (error) {
        console.error('\n❌ エラー:', error.message);
        process.exit(1);
    }
}

runFormTest();