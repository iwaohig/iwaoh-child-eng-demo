const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        // OPTIONS リクエストの処理（CORS対応）
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'OK' })
            };
        }

        // POSTリクエストの処理
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            
            // 申し込みデータの準備
            const timestamp = new Date().toISOString();
            const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const item = {
                id: submissionId,
                timestamp,
                status: '確認',
                classroom: body.classroom,
                parent: {
                    lastName: body.parentLastName,
                    firstName: body.parentFirstName,
                    lastNameKana: body.parentLastNameKana,
                    firstNameKana: body.parentFirstNameKana,
                    zipCode: body.zipCode,
                    address: body.address,
                    phone: body.phone,
                    email: body.email
                },
                child: {
                    lastName: body.childLastName,
                    firstName: body.childFirstName,
                    lastNameKana: body.childLastNameKana,
                    firstNameKana: body.childFirstNameKana,
                    gender: body.gender,
                    birthYear: body.birthYear,
                    birthMonth: body.birthMonth,
                    birthDay: body.birthDay
                },
                trigger: body.trigger,
                triggerOther: body.triggerOther || '',
                message: body.message || '',
                createdAt: timestamp,
                updatedAt: timestamp
            };
            
            // DynamoDBに保存
            const params = {
                TableName: 'iwaoh-child-eng-applications',
                Item: item
            };
            
            await dynamodb.put(params).promise();
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Application submitted successfully',
                    submissionId
                })
            };
        }

        // その他のHTTPメソッドの処理
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        };
    }
};