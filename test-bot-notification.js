// テスト用スクリプト - LINE WORKS Bot通知のテスト
const https = require('https');

// Bot configuration
const BOT_ID = '10248294';
const USER_ID = 'iwao.higashimoto@works-demo.org';
const ACCESS_TOKEN = 'jp1AAABNRigQwXkQBKd8RGaRyN5dxvnY+5XUO4Dbb7MBM7myIPvlXCT8U6E0+CIOiW5PesWVfkgFq2Pblzl6YmpauOnbImX2oSWHxpcYGZQQOhXwOhaa9jFOlAkQZeQBMNM7MIMHiFSzMs5Ekqr/MMOwf0k9+u8ADZ5tpiJM9Y2Cl834njfiKvKkMlD9DhH7UQfVago7OZp+XY3y1lhiMNmbYQT2n1f7Z0wF+lvbSVMJ4m1fR4A67EDhzy6/NsPM5hea11+nGhZ01DVJ6sll1ZWPvMcXYSuYGxY/MkRDuWtr+SAhKGzgvQEIjbi2WPx+SP3T/XG2MELCd5cA8D6e2d/L67FzRQEqmSPUBkJipmbJQ06tjiy+udlRGravDLGflDj5iNQDLUz5tWGVSCcbH31cOIw5Hf/q/86k5TVn/CCwKNO0eDh.kwiu9yNovfcs8Rumz2QSOg';

// テスト用の申込データ
const testApplicationData = {
    id: 'test_' + Date.now(),
    parent: {
        lastName: 'テスト',
        firstName: '太郎',
        email: 'test@example.com',
        phone: '090-1234-5678'
    },
    child: {
        lastName: 'テスト',
        firstName: '花子',
        gender: '女',
        birthYear: '2020',
        birthMonth: '4',
        birthDay: '15'
    },
    classroom: '渋谷教室',
    status: '確認',
    timestamp: new Date().toISOString()
};

// メッセージ送信関数
function sendLinkMessage(applicationData) {
    return new Promise((resolve, reject) => {
        const message = {
            content: {
                type: 'link',
                contentText: `新しい体験申込がありました！\n\n申込者: ${applicationData.parent.lastName} ${applicationData.parent.firstName} 様\nお子様: ${applicationData.child.lastName} ${applicationData.child.firstName} さん\n教室: ${applicationData.classroom}\n\n詳細を確認してください。`,
                linkText: '申込詳細を確認',
                link: `https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/?view=detail&id=${applicationData.id}`
            }
        };

        const data = JSON.stringify(message);
        console.log('送信するメッセージ:', JSON.stringify(message, null, 2));

        const options = {
            hostname: 'www.worksapis.com',
            path: `/v1.0/bots/${BOT_ID}/users/${encodeURIComponent(USER_ID)}/messages`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        console.log('リクエストオプション:', {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': 'Bearer [HIDDEN]'
            }
        });

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('レスポンスステータス:', res.statusCode);
                console.log('レスポンスデータ:', responseData);
                
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log('✅ メッセージ送信成功!');
                    resolve(responseData ? JSON.parse(responseData) : { success: true });
                } else {
                    console.error('❌ メッセージ送信失敗');
                    reject(new Error(`Failed to send message: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('リクエストエラー:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// テスト実行
console.log('=== LINE WORKS Bot通知テスト開始 ===');
console.log('Bot ID:', BOT_ID);
console.log('User ID:', USER_ID);
console.log('テストデータ:', JSON.stringify(testApplicationData, null, 2));
console.log('');

sendLinkMessage(testApplicationData)
    .then(result => {
        console.log('\n=== テスト完了 ===');
        console.log('結果:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('\n=== テスト失敗 ===');
        console.error('エラー:', error.message);
        process.exit(1);
    });