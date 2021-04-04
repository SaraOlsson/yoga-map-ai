import { useState, useEffect } from "react";

const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");

const connectionString = process.env.REACT_APP_AZURE_STORAGE_BUS || ''
const topicName = "yogapose";
const subscriptionName = "yoga-subscription";

function useBusSubscription() {

    // console.log("useBusSubscription")
    const [currentData, setCurrentData] = useState(null)

    // create a Service Bus client using the connection string to the Service Bus namespace
    const [sbClient] = useState(
        new ServiceBusClient(connectionString)
    )

    // // createReceiver() can also be used to create a receiver for a queue.
    const [receiver] = useState(
        sbClient.createReceiver(topicName, subscriptionName)
    )

    useEffect(() => {

        if(!receiver)
        {
            console.log("no receiver")
            return
        }

        console.log("subscribe now")

        // subscribe and specify the message and error handlers
        receiver.subscribe({
            processMessage: myMessageHandler,
            processError: myErrorHandler
        });

    }, [receiver])

    // function to handle messages
    const myMessageHandler = async (messageReceived) => {
        // console.log(`Received message: ${messageReceived.body}`);
        setCurrentData(messageReceived.body)
    };

    // function to handle any errors
    const myErrorHandler = async (error) => {
        console.log(error);
    };

    const closeReceicer = async () => {
  
        await receiver.close(); 
        await sbClient.close();
    }

    return {
        closeReceicer,
        currentData
    }
}

export default useBusSubscription