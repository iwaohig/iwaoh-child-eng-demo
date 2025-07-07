// LINE WORKS チャンネル通知テスト
const https = require('https');

// 設定値
const BOT_ID = '10248294';
const CHANNEL_ID = '05a3d91c-c172-893a-e6d3-3bd1e0ce1920';
const ACCESS_TOKEN = 'jp1AAABNRigQwXkQBKd8RGaRyN5dxvnY+5XUO4Dbb7MBM7myIPvlXCT8U6E0+CIOiW5PesWVfkgFq2Pblzl6YmpauOnbImX2oSWHxpcYGZQQOhXwOhaa9jFOlAkQZeQBMNM7MIMHiFSzMs5Ekqr/MMOwf0k9+u8ADZ5tpiJM9Y2Cl834njfiKvKkMlD9DhH7UQfVago7OZp+XY3y1lhiMNmbYQT2n1f7Z0wF+lvbSVMJ4m1fR4A67EDhzy6/NsPM5hea11+nGhZ01DVJ6sll1ZWPvMcXYSuYGxY/MkRDuWtr+SAhKGzgvQEIjbi2WPx+SP3T/XG2MELCd5cA8D6e2d/L67FzRQEqmSPUBkJipmbJQ06tjiy+udlRGravDLGflDj5iNQDLUz5tWGVSCcbH31cOIw5Hf/q/86k5TVn/CCwKNO0eDh.kwiu9yNovfcs8Rumz2QSOg';

// テストメッセージ
const testMessage = {
    content: {
        type: 'link',
        contentText: `🧪 チャンネル通知テスト

新しい体験申込がありました！

申込者: テスト 太郎 様
お子様: テスト 花子 さん
教室: テスト教室

詳細を確認してください。`,
        linkText: '申込詳細を確認',
        link: 'https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/?view=detail&id=test_123'
    }
};

// チャンネルにメッセージを送信
async function sendChannelMessage() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(testMessage);

        const options = {
            hostname: 'www.worksapis.com',
            path: `/v1.0/bots/${BOT_ID}/channels/${encodeURIComponent(CHANNEL_ID)}/messages`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        console.log('送信先URL:', `https://www.worksapis.com${options.path}`);
        console.log('送信メッセージ:', JSON.stringify(testMessage, null, 2));

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log('レスポンスステータス:', res.statusCode);
                console.log('レスポンスヘッダー:', res.headers);
                console.log('レスポンスボディ:', responseData);

                if (res.statusCode === 201) {
                    console.log('✅ チャンネル通知が正常に送信されました！');
                    resolve(responseData ? JSON.parse(responseData) : { success: true });
                } else {
                    console.error('❌ チャンネル通知の送信に失敗しました');
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ リクエストエラー:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

// テスト実行
async function main() {
    console.log('🚀 LINE WORKS チャンネル通知テスト開始...\n');
    console.log('Bot ID:', BOT_ID);
    console.log('Channel ID:', CHANNEL_ID);
    console.log('');

    try {
        await sendChannelMessage();
        console.log('\n🎉 テスト完了！');
    } catch (error) {
        console.error('\n💥 テスト失敗:', error.message);
        process.exit(1);
    }
}

main().catch(console.error);