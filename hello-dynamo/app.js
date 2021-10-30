const {DynamoDBClient, ListTablesCommand} = require("@aws-sdk/client-dynamodb");


exports.queryDB = async (event, context) => {
    const client = new DynamoDBClient({ endpoint: "http://docker.for.mac.localhost:8000" });

    try {
        const data = await client.send(new ListTablesCommand({}));
        console.log(data.TableNames.join("\n"));
        return data;
    } catch (err) {
        console.error(err);
    }
}