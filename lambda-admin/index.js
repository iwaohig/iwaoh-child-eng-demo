// AWS SDK v3 is available in Node.js 18+ Lambda runtime
const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-northeast-1' });

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

        if (event.httpMethod === 'GET') {
            const params = {
                TableName: process.env.APPLICATIONS_TABLE
            };
            
            console.log('DynamoDB scan params:', JSON.stringify(params, null, 2));
            
            const result = await dynamodb.send(new ScanCommand(params));
            
            // Unmarshall the items
            const items = result.Items.map(item => unmarshall(item));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: items
                })
            };
        }

        if (event.httpMethod === 'PUT') {
            const body = JSON.parse(event.body);
            const id = event.pathParameters?.id;
            
            if (!id) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing id parameter' })
                };
            }
            
            const params = {
                TableName: process.env.APPLICATIONS_TABLE,
                Key: marshall({ id }),
                UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
                ExpressionAttributeNames: {
                    '#status': 'status'
                },
                ExpressionAttributeValues: marshall({
                    ':status': body.status,
                    ':updatedAt': new Date().toISOString()
                })
            };
            
            console.log('DynamoDB update params:', JSON.stringify(params, null, 2));
            
            await dynamodb.send(new UpdateItemCommand(params));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Status updated successfully'
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