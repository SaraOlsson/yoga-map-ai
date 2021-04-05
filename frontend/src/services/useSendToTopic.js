import { useState, useEffect } from "react";

const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");

const connectionString = process.env.REACT_APP_AZURE_STORAGE_BUS || ''
const topicName = "yogapose";

function useSendToTopic() {

    // create a Service Bus client using the connection string to the Service Bus namespace
    const [sbClient] = useState(
        new ServiceBusClient(connectionString)
    )

    const [sender] = useState(
        sbClient.createSender(topicName)
    )

    const sendMessage = async (message) => {

        const messages = [
            { body: message }
         ];
  
        try {
            // Tries to send all messages in a single batch.
            await sender.sendMessages(messages);
            //console.log(`Sent a message to the topic: ${topicName}`);
        } 
        finally {
            //console.log("try send message: success")
        }
    }

    const closeSender = async () => {
        await sbClient.close();
    }

    return {
        sendMessage,
        closeSender
    }
}

export default useSendToTopic