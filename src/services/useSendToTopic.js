import { useState, useEffect } from "react";

const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");

const connectionString = process.env.REACT_APP_AZURE_STORAGE_BUS || ''
const topicName = "yogapose";

function useSendToTopic() {

    // console.log("useSendToTopic")

    // create a Service Bus client using the connection string to the Service Bus namespace
    const [sbClient] = useState(
        new ServiceBusClient(connectionString)
    )

    const [sender] = useState(
        sbClient.createSender(topicName)
    )

    const sendMessage = async () => {

        const messages = [
            { body: {pose: "childs", lat: 58.588455, lng: 16.188313} }
         ];
  
        try {
            // Tries to send all messages in a single batch.
            // Will fail if the messages cannot fit in a batch.
            await sender.sendMessages(messages);
            console.log(`Sent a message to the topic: ${topicName}`);
    
            // Close the sender
            //await sender.close();
        } finally {
            //await sbClient.close();
            console.log("finally")
        }
    }

    return {
        sendMessage
    }
}

export default useSendToTopic