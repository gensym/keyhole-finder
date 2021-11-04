const {DynamoDBClient, ListTablesCommand, PutItemCommand, DeleteItemCommand, QueryCommand} = require("@aws-sdk/client-dynamodb");
const { PinpointClient, SendMessagesCommand } = require("@aws-sdk/client-pinpoint");

function addSubscriptionCommand(subscriber, date) {
    return new PutItemCommand({
        TableName: "KeyholeSubscriptions",
        Item: { "date": { S: date }, "subscriber": { S: subscriber }}});
}

async function sendMessage(destination, message) {
    const pinpointClient = new PinpointClient({ region: "us-east-1"});
    const params = {
        ApplicationId: '91d70cfa0fb946a3b0ca034a3f89149e',
        MessageRequest: {
            Addresses: {
                [destination]: {
                    ChannelType: 'SMS'
                }
            },
            MessageConfiguration: {
                SMSMessage: {
                    Body: message,
                    MessageType: 'TRANSACTIONAL'
                }
            }
        }
    };

    const sendCommand = new SendMessagesCommand(params);
    return await pinpointClient.send(sendCommand);
}

const watchCommand = {
    validate: (args) => args.length === 1 && args[0].match(/^\d{4}-\d{2}-\d{2}$/),
    commandSyntax: () => "WATCH YYYY-MM-DD (For example, \"WATCH 2022-02-28\")",
    execute: async function(subscriber, [date]) {
        try {
            const client = new DynamoDBClient({ region: "us-east-1" });
            await client.send(addSubscriptionCommand(subscriber, date));
            return `Watching ${date} for availability`;
        } catch (err) {
            console.error(err);
        }
    }
}

const helpMessage = "Available commands:\nWATCH YYYY-MM-DD";

exports.listen = async (event, context) => {
    const messageString = event['Records'][0]['Sns']['Message'];
    const message = JSON.parse(messageString);
    const originationNumber = message['originationNumber'];

    let [command, ...args] = message['messageBody'].split(/\s+/);

    try {
        switch(command.toLowerCase()) {
            case 'watch':
                const cmd = watchCommand;
                if (cmd.validate(args)) {
                    let result = await cmd.execute(originationNumber, args);
                    await sendMessage(originationNumber, result);
                } else {
                    await sendMessage(originationNumber, cmd.commandSyntax());
                }
                break;
            default:
                await sendMessage(originationNumber, helpMessage);
                break;
        }
    } catch(err) {
        console.error(err);
    }
}