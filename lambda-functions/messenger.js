const { PinpointClient, SendMessagesCommand } = require("@aws-sdk/client-pinpoint");

exports.sendMessage = async (destination, message) => {
    const pinpointClient = new PinpointClient({ region: "us-east-1"});
    const params = {
        ApplicationId: "91d70cfa0fb946a3b0ca034a3f89149e",
        MessageRequest: {
            Addresses: {
                [destination]: {
                    ChannelType: "SMS"
                }
            },
            MessageConfiguration: {
                SMSMessage: {
                    Body: message,
                    MessageType: "TRANSACTIONAL"
                }
            }
        }
    };

    const sendCommand = new SendMessagesCommand(params);
    return await pinpointClient.send(sendCommand);
};