const {DynamoDBClient, ListTablesCommand, PutItemCommand, DeleteItemCommand, QueryCommand} = require("@aws-sdk/client-dynamodb");
const { PinpointClient, SendMessagesCommand } = require("@aws-sdk/client-pinpoint");

function addSubscriptionCommand(subscriber, date) {
    return new PutItemCommand({
        TableName: "KeyholeSubscriptions",
        Item: { "date": { S: date }, "subscriber": { S: subscriber }}});
}

function deleteSubscriptionCommand(subscriber, date) {
    return new DeleteItemCommand({
        TableName: "KeyholeSubscriptions",
        Key: { "date": { S: date }, "subscriber": { S: subscriber }}});
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
        const client = new DynamoDBClient({ region: "us-east-1" });
        await client.send(addSubscriptionCommand(subscriber, date));
        return `Watching ${date} for availability`;
    }
}

const unwatchCommand = {
    validate: (args) => args.length === 1 && args[0].match(/^\d{4}-\d{2}-\d{2}$/),
    commandSyntax: () => "UNWATCH YYYY-MM-DD (For example, \"UNWATCH 2022-02-28\")",
    execute: async function(subscriber, [date]) {
        const client = new DynamoDBClient({ region: "us-east-1" });
        await client.send(deleteSubscriptionCommand(subscriber, date));
        return `Stopped longer Watching ${date} for availability`;
    }
}

const helpMessage = "Available commands:\nWATCH YYYY-MM-DD";

exports.listen = async (event, context) => {
    const messageString = event['Records'][0]['Sns']['Message'];
    const message = JSON.parse(messageString);
    const originationNumber = message['originationNumber'];

    let [commandName, ...args] = message['messageBody'].split(/\s+/);

    const availableCommands = {
        'watch': watchCommand,
        'unwatch': unwatchCommand
    }

    const command = availableCommands[commandName.toLowerCase()];

    try {
        if (command) {
            if (command.validate(args)) {
                let result = await command.execute(originationNumber, args);
                await sendMessage(originationNumber, result);
            } else {
                await sendMessage(originationNumber, command.commandSyntax());
            }
        } else {
            await sendMessage(originationNumber, helpMessage);
        }
    } catch(err) {
        console.error(err);
    }
}