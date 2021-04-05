import { useState, useEffect } from "react";

const { delay, ServiceBusClient, ServiceBusMessage } = require("@azure/service-bus");

const connectionString = process.env.REACT_APP_AZURE_STORAGE_BUS || ''
const topicName = "yogapose";
const subscriptionName = "yoga-subscription";

function useBusSubscription(run) {

    const [currentData, setCurrentData] = useState(null)

    // create a Service Bus client using the connection string to the Service Bus namespace
    const [sbClient] = useState(
        new ServiceBusClient(connectionString)
    )

    // createReceiver() can also be used to create a receiver for a queue.
    const [receiver] = useState(
        run ? sbClient.createReceiver(topicName, subscriptionName) : undefined
    )

    useEffect(() => {

        if(!receiver)
        {
            console.log("no receiver")
            return
        }

        console.log("subscribe now")

        // subscribe and specify the message and error handlers 
        if(run)
        {
            receiver.subscribe({
                processMessage: myMessageHandler,
                processError: myErrorHandler
            });
        }

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

    const closeReceiver = async () => {
        console.log("close receiver")
        await receiver.close(); 
        await sbClient.close();
    }

    return {
        closeReceiver,
        currentData
    }
}

export default useBusSubscription