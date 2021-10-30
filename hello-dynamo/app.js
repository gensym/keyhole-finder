const {DynamoDBClient, ListTablesCommand, PutItemCommand, DeleteItemCommand, QueryCommand} = require("@aws-sdk/client-dynamodb");


function addSubscriptionCommand(date, subscriber) {
    return new PutItemCommand({
        TableName: "KeyholeSubscriptions",
        Item: { "date": { S: date }, "subscriber": { S: subscriber }}});
}

function removeSubscriptionCommand(date, subscriber) {
    return new DeleteItemCommand({
        TableName: "KeyholeSubscriptions",
        Key: { "date": { S: date }, "subscriber": { S: subscriber }}});
}

function queryByDateCommand(date) {
    return new QueryCommand({
        TableName: "KeyholeSubscriptions",
        KeyConditionExpression: "#d = :d",
        ExpressionAttributeValues: {
            ":d": { S: date }
        },
        ExpressionAttributeNames: { "#d": "date" }
    });
}

exports.queryDB = async (event, context) => {
    const client = new DynamoDBClient({ region: "us-east-1" });

    // const commands = ["555-555-1234", "555-555-9873", "555-555-4021"].map (
    //     (sub) => addSubscriptionCommand("2022-01-10", sub));

    const commands = [queryByDateCommand("2022-01-10")];

    try {
        const results = await Promise.all(commands.map((cmd) => client.send(cmd)));
        results.forEach((result) => console.log(result));
        return results;
    } catch (err) {
        console.error(err);
    }
}