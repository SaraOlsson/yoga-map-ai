import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// Authentication requirements
const key = process.env.REACT_APP_SPEECH_KEY;
const region = process.env.REACT_APP_SPEECH_REGION;

// function synthesizeSpeech() {
//     const speechConfig = sdk.SpeechConfig.fromSubscription("YourSubscriptionKey", "YourServiceRegion");
//     const audioConfig = AudioConfig.fromAudioFileOutput("path/to/file.wav");
// }

// function synthesizeSpeech() {
//     const speechConfig = sdk.SpeechConfig.fromSubscription("YourSubscriptionKey", "YourServiceRegion");
//     const audioConfig = AudioConfig.fromAudioFileOutput("path-to-file.wav");

//     const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
//     synthesizer.speakTextAsync(
//         "A simple test to write to a file.",
//         result => {
//             synthesizer.close();
//             if (result) {
//                 // return result as stream
//                 return fs.createReadStream("path-to-file.wav");
//             }
//         },
//         error => {
//             console.log(error);
//             synthesizer.close();
//         });
// }

export const synthesizeSpeech = (fromText = 'Hi yogi') => {
    console.log("run synthesizeSpeech")
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();

    speechConfig.speechSynthesisLanguage = 'en-US'
    speechConfig.speechSynthesisVoiceName = 'en-GB-MiaNeural'
    //speechConfig.speechRecognitionLanguage = 'sv-SE' //  'en-US';

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(
        fromText,
        result => {
            if (result) {
                synthesizer.close();
                return result.audioData;
            }
        },
        error => {
            console.log(error);
            synthesizer.close();
        });
}
