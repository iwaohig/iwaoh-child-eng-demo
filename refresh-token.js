// LINE WORKS アクセストークンのリフレッシュ
const https = require('https');

const refreshToken = 'jp1AAAAhOu6veazZ218mv01Dok0spum3ZNtpJd/KQ6+AFfdsUfkQYEbr/UZPUPlMl6+RUCeA2baqKKJPZI/HYOBwfLMeg9BFidZazj7SaTOaT2GlgASoxKljVwgU7zm15a47op4JB/6bv1zAP2DPYS4WNfpC+FlPO2WWL/nalIH2TtePb3SaB58QkAUemgGgZS/t/IE5A==.kwiu9yNovfcs8Rumz2QSOg';
const clientId = 'zC3oMwjuE5nbtWwAkPkk';
const clientSecret = '0OldwPrBU_';

function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        // LINE WORKS OAuth 2.0仕様に従ったform-urlencoded形式
        const data = `refresh_token=${encodeURIComponent(refreshToken)}&grant_type=refresh_token&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;

        const options = {
            hostname: 'auth.worksmobile.com',
            path: '/oauth2/v2.0/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        console.log('アクセストークンをリフレッシュしています...');

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(responseData);
                    console.log('✅ トークンリフレッシュ成功!');
                    console.log('新しいアクセストークン:', result.access_token);
                    console.log('有効期限:', result.expires_in, '秒');
                    resolve(result);
                } else {
                    console.error('❌ トークンリフレッシュ失敗');
                    console.error('ステータス:', res.statusCode);
                    console.error('レスポンス:', responseData);
                    reject(new Error(`Token refresh failed: ${res.statusCode} - ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

refreshAccessToken()
    .then(result => {
        console.log('\n=== CloudFormationパラメータ更新コマンド ===');
        console.log(`aws cloudformation update-stack --stack-name iwaoh-child-eng-demo --template-body file://cloudformation-template.yml --capabilities CAPABILITY_NAMED_IAM --parameters ParameterKey=BotAccessToken,ParameterValue="${result.access_token}"`);
    })
    .catch(error => {
        console.error('エラー:', error.message);
        process.exit(1);
    });