// デモ用ダミーデータ作成スクリプト
const https = require('https');

const API_BASE = 'https://im1swit6p3.execute-api.ap-northeast-1.amazonaws.com/prod';

const demoData = [
    {
        classroom: '渋谷教室',
        parentLastName: '田中',
        parentFirstName: '太郎',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        childLastName: '田中',
        childFirstName: 'さくら',
        gender: '女',
        birthYear: '2018',
        birthMonth: '04',
        birthDay: '15',
        trigger: 'インターネット上の広告',
        message: 'よろしくお願いします。'
    },
    {
        classroom: '新宿教室',
        parentLastName: '佐藤',
        parentFirstName: '花子',
        phone: '090-2345-6789',
        email: 'sato@example.com',
        childLastName: '佐藤',
        childFirstName: 'ひろと',
        gender: '男',
        birthYear: '2019',
        birthMonth: '08',
        birthDay: '22',
        trigger: '友人・知人の紹介',
        message: 'ネイティブの先生はいますか？'
    },
    {
        classroom: '池袋教室',
        parentLastName: '山田',
        parentFirstName: '美咲',
        phone: '090-3456-7890',
        email: 'yamada@example.com',
        childLastName: '山田',
        childFirstName: 'ゆい',
        gender: '女',
        birthYear: '2020',
        birthMonth: '12',
        birthDay: '03',
        trigger: 'チラシ・ポスター',
        message: '初心者ですが大丈夫でしょうか？'
    },
    {
        classroom: '渋谷教室',
        parentLastName: '鈴木',
        parentFirstName: '一郎',
        phone: '090-4567-8901',
        email: 'suzuki@example.com',
        childLastName: '鈴木',
        childFirstName: 'たくま',
        gender: '男',
        birthYear: '2017',
        birthMonth: '06',
        birthDay: '18',
        trigger: 'インターネット検索',
        message: '体験レッスンの内容を教えてください。'
    },
    {
        classroom: '新宿教室',
        parentLastName: '高橋',
        parentFirstName: '恵子',
        phone: '090-5678-9012',
        email: 'takahashi@example.com',
        childLastName: '高橋',
        childFirstName: 'みお',
        gender: '女',
        birthYear: '2019',
        birthMonth: '02',
        birthDay: '28',
        trigger: '友人・知人の紹介',
        message: '平日の午後に体験できますか？'
    }
];

async function createApplication(data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);
        
        const options = {
            hostname: 'im1swit6p3.execute-api.ap-northeast-1.amazonaws.com',
            port: 443,
            path: '/prod/submit',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(responseData);
                    console.log(`✅ 申込作成成功: ${data.parentLastName} ${data.parentFirstName} 様 (${result.id})`);
                    resolve(result);
                } else {
                    console.error(`❌ 申込作成失敗: ${res.statusCode} - ${responseData}`);
                    reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ リクエストエラー:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function main() {
    console.log('🚀 デモ用ダミーデータ作成開始...\n');
    
    for (let i = 0; i < demoData.length; i++) {
        const data = demoData[i];
        try {
            await createApplication(data);
            // リクエスト間隔を開ける
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`申込作成失敗: ${data.parentLastName} ${data.parentFirstName}`, error.message);
        }
    }
    
    console.log('\n✅ デモ用ダミーデータ作成完了！');
    console.log('管理画面で確認してください: WOFF admin interface');
}

main().catch(console.error);