const https = require('https');

// Bot configuration
const BOT_ID = '10248294';
const USER_ID = 'iwao.higashimoto@works-demo.org';

// Token configuration - these should be moved to environment variables in production
let accessToken = 'jp1AAABNRigQwXkQBKd8RGaRyN5dxvnY+5XUO4Dbb7MBM7myIPvlXCT8U6E0+CIOiW5PesWVfkgFq2Pblzl6YmpauOnbImX2oSWHxpcYGZQQOhXwOhaa9jFOlAkQZeQBMNM7MIMHiFSzMs5Ekqr/MMOwf0k9+u8ADZ5tpiJM9Y2Cl834njfiKvKkMlD9DhH7UQfVago7OZp+XY3y1lhiMNmbYQT2n1f7Z0wF+lvbSVMJ4m1fR4A67EDhzy6/NsPM5hea11+nGhZ01DVJ6sll1ZWPvMcXYSuYGxY/MkRDuWtr+SAhKGzgvQEIjbi2WPx+SP3T/XG2MELCd5cA8D6e2d/L67FzRQEqmSPUBkJipmbJQ06tjiy+udlRGravDLGflDj5iNQDLUz5tWGVSCcbH31cOIw5Hf/q/86k5TVn/CCwKNO0eDh.kwiu9yNovfcs8Rumz2QSOg';
const refreshToken = 'jp1AAAAhOu6veazZ218mv01Dok0spum3ZNtpJd/KQ6+AFfdsUfkQYEbr/UZPUPlMl6+RUCeA2baqKKJPZI/HYOBwfLMeg9BFidZazj7SaTOaT2GlgASoxKljVwgU7zm15a47op4JB/6bv1zAP2DPYS4WNfpC+FlPO2WWL/nalIH2TtePb3SaB58QkAUemgGgZS/t/IE5A==.kwiu9yNovfcs8Rumz2QSOg';
let tokenExpiresAt = Date.now() + 3600 * 1000; // 1 hour from now

// Function to refresh access token
async function refreshAccessToken() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
        });

        const options = {
            hostname: 'auth.worksmobile.com',
            path: '/oauth2/v2.0/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
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
                    accessToken = result.access_token;
                    tokenExpiresAt = Date.now() + (result.expires_in * 1000);
                    console.log('Token refreshed successfully');
                    resolve(accessToken);
                } else {
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

// Function to send link message to user
async function sendLinkMessage(applicationData) {
    // Check if token needs refresh (refresh 5 minutes before expiry)
    if (Date.now() > tokenExpiresAt - 300000) {
        try {
            await refreshAccessToken();
        } catch (error) {
            console.error('Failed to refresh token:', error);
            throw error;
        }
    }

    const message = {
        content: {
            type: 'link',
            contentText: `新しい体験申込がありました！\n\n申込者: ${applicationData.parent.lastName} ${applicationData.parent.firstName} 様\nお子様: ${applicationData.child.lastName} ${applicationData.child.firstName} さん\n教室: ${applicationData.classroom}\n\n詳細を確認してください。`,
            linkText: '申込詳細を確認',
            link: `https://woff.worksmobile.com/woff/Gwb_BTfV562bnUxhhp81PA/?view=detail&id=${applicationData.id}`
        }
    };

    return new Promise((resolve, reject) => {
        const data = JSON.stringify(message);

        const options = {
            hostname: 'www.worksapis.com',
            path: `/v1.0/bots/${BOT_ID}/users/${encodeURIComponent(USER_ID)}/messages`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    console.log('Message sent successfully:', responseData);
                    try {
                        resolve(responseData ? JSON.parse(responseData) : { success: true });
                    } catch (parseError) {
                        console.log('Response parse warning:', parseError.message);
                        resolve({ success: true, message: 'Message sent (empty response)' });
                    }
                } else {
                    reject(new Error(`Failed to send message: ${res.statusCode} - ${responseData}`));
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

// Lambda handler
exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        // Parse the event data
        let applicationData;
        
        if (event.Records) {
            // DynamoDB Stream event
            for (const record of event.Records) {
                if (record.eventName === 'INSERT') {
                    // New application added
                    applicationData = record.dynamodb.NewImage;
                    
                    // Convert DynamoDB format to regular object
                    applicationData = {
                        id: applicationData.id.S,
                        parent: {
                            lastName: applicationData.parentLastName.S,
                            firstName: applicationData.parentFirstName.S,
                            email: applicationData.parentEmail.S,
                            phone: applicationData.parentPhone.S
                        },
                        child: {
                            lastName: applicationData.childLastName.S,
                            firstName: applicationData.childFirstName.S,
                            gender: applicationData.childGender.S,
                            birthYear: applicationData.childBirthYear.S,
                            birthMonth: applicationData.childBirthMonth.S,
                            birthDay: applicationData.childBirthDay.S
                        },
                        classroom: applicationData.classroom.S,
                        trigger: applicationData.trigger ? applicationData.trigger.S : '',
                        message: applicationData.message ? applicationData.message.S : '',
                        status: applicationData.status.S,
                        timestamp: applicationData.timestamp.S
                    };

                    // Send notification
                    await sendLinkMessage(applicationData);
                }
            }
        } else if (event.body) {
            // Direct invocation with application data
            applicationData = JSON.parse(event.body);
            await sendLinkMessage(applicationData);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Notification sent successfully'
            })
        };
    } catch (error) {
        console.error('Error processing event:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to send notification',
                message: error.message
            })
        };
    }
};