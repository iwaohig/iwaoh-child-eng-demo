// AWS SDK v3 is available in Node.js 18+ Lambda runtime
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'OK' })
            };
        }

        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            
            const timestamp = new Date().toISOString();
            const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // DynamoDB用のフラットな構造で保存
            const item = {
                id: submissionId,
                timestamp,
                status: '確認',
                classroom: body.classroom,
                // 親情報をフラットに保存
                parentLastName: body.parentLastName,
                parentFirstName: body.parentFirstName,
                parentLastNameKana: body.parentLastNameKana || '',
                parentFirstNameKana: body.parentFirstNameKana || '',
                parentZipCode: body.parentZipCode || '',
                parentAddress: body.parentAddress || '',
                parentPhone: body.parentPhone,
                parentEmail: body.parentEmail,
                // 子供情報をフラットに保存
                childLastName: body.childLastName,
                childFirstName: body.childFirstName,
                childLastNameKana: body.childLastNameKana || '',
                childFirstNameKana: body.childFirstNameKana || '',
                childGender: body.childGender,
                childBirthYear: body.childBirthYear,
                childBirthMonth: body.childBirthMonth,
                childBirthDay: body.childBirthDay,
                // その他
                trigger: body.trigger,
                triggerOther: body.triggerOther || '',
                message: body.message || '',
                createdAt: timestamp,
                updatedAt: timestamp
            };
            
            const params = {
                TableName: process.env.APPLICATIONS_TABLE,
                Item: marshall(item, { removeUndefinedValues: true })
            };
            
            console.log('DynamoDB params:', JSON.stringify(params, null, 2));
            
            await dynamodb.send(new PutItemCommand(params));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Application submitted successfully',
                    id: submissionId,
                    timestamp: timestamp
                })
            };
        }

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
                error: 'Internal server error',
                details: error.message
            })
        };
    }
};