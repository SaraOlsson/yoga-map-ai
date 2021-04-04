# yogaCam: Live map

![projectGif](images/yogacam.gif)

The yogaCam Live Map is a web application for users to keep on while practicing yoga that will recognize and visualize all ongoing activity of a certain yoga pose in real-time. On a map, each individual sees a bright spot for all other people who do the same pose at that moment. Change pose and marvel at the new group of people you share the moment with around the world.

## Repo Details

High level directory structure for this repository:

```bash
├── frontend                  <- Web app built with React.js
├── azure                     <- Azure related code
│   ├── AzureResourceGroup    <- ARM template for the solution in Azure.
├── images                    <- Images used in the documentation
```

## System architecture

![projectGif](images/solution_architecture.png)


## Reproduce

### Azure Requirements

First, create an [Azure Account](https://portal.azure.com) and a  resource group. Then, create the following resources in Azure portal or use the provided ARM template.

### Resources:  
1. [Azure Maps](https://portal.azure.com) 
2. [Custom Vision Service](https://docs.microsoft.com/en-us/azure/cognitive-services/custom-vision-service/)
3. [Speech API (text-to-speech)](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/text-to-speech)
4. [Azure Storage Account](https://docs.microsoft.com/en-us/azure/storage/common/storage-account-overview) with [Blob containers](https://docs.microsoft.com/en-us/azure/storage/blobs/)  
4. [Service Bus Topic](https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions)

### Local dev envrioment
1. Code edidor ([Visual Studio Code](https://code.visualstudio.com/) recommended)
2. [Node.js](https://nodejs.org/en/)
3. [Azure SDK for JavaScript](https://azure.github.io/azure-sdk-for-js/)

## Demo 

![Client application demo](images/yoga_bridge.gif)

## Next up 