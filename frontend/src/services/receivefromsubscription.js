const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");

const connectionString = "Endpoint=sb://telemetry-service-bus.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=fxyfAL2/jZxfD8kdPzb4/DGTGr1BybncOV/vYYrXLq8="
const topicName = "yogapose";
const subscriptionName = "yoga-subscription";

 async function main() {
    // create a Service Bus client using the connection string to the Service Bus namespace
    const sbClient = new ServiceBusClient(connectionString);

    // createReceiver() can also be used to create a receiver for a queue.
    const receiver = sbClient.createReceiver(topicName, subscriptionName);

    // function to handle messages
    const myMessageHandler = async (messageReceived) => {
        console.log(`Received message: ${messageReceived.body}`);
    };

    // function to handle any errors
    const myErrorHandler = async (error) => {
        console.log(error);
    };

    // subscribe and specify the message and error handlers
    receiver.subscribe({
        processMessage: myMessageHandler,
        processError: myErrorHandler
    });

    // Waiting long enough before closing the sender to send messages
    await delay(5000);

    await receiver.close(); 
    await sbClient.close();
}

export default main

// call the main function
main().catch((err) => {
    console.log("Error occurred: ", err);
    process.exit(1);
 });