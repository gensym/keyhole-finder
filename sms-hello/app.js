// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const { PinpointClient, SendMessagesCommand } = require("@aws-sdk/client-pinpoint");
let response;


/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.receiveSMS = async (event, context) => {
    try {
        const messageString = event['Records'][0]['Sns']['Message'];
        const message = JSON.parse(messageString);
        const originationNumber = message['originationNumber'];

        const pinpointClient = new PinpointClient({ region: "us-east-1"});
        const params = {
            ApplicationId: '91d70cfa0fb946a3b0ca034a3f89149e',
            MessageRequest: {
                Addresses: {
                    [originationNumber]: {
                        ChannelType: 'SMS'
                    }
                },
                MessageConfiguration: {
                    SMSMessage: {
                        Body: responseMessage,
                        MessageType: 'TRANSACTIONAL'
                    }
                }
            }
        };

        const sendCommand = new SendMessagesCommand(params);
        const result = await pinpointClient.send(sendCommand);

        // const ret = await axios(url);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                result: result
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
