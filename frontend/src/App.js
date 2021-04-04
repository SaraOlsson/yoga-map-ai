import logo from './logo.svg';
import blobImg from './assets/blob.svg'
import './App.css';
import myImg from './test_image.jpg'
//const myImg = require('./test_image.jpg')
import * as cvstfjs from '@microsoft/customvision-tfjs';
import React, {useState, useEffect} from "react"
import Webcam from "react-webcam";
import axios from 'axios';
import Map from './components/Map'
import WebSocketDemo from './components/WebSocketDemo'
import mockData from './assets/mockData.json'
// import myModel from 'model.json'
//const myModel = require('./model.json')
import {synthesizeSpeech} from './services/synthSpeech'
import audio_url from './assets/yoga_music.mp3'
import useBusSubscription from './services/useBusSubscription'
// import busSubscription from './services/receivefromsubscription'
import useSendToTopic from './services/useSendToTopic'
import uploadFileToBlob from './services/azure-storage-blob'
import AzureMap from './components/AzureMap.tsx'
const { v1: uuidv1} = require('uuid');

const videoConstraints = {
  width: 640, //320, //640, //1280,
  height: 480, //240, // 480, //720,
  facingMode: "user"
};

const threshold = 0.7
const VOICE_TIMEOUT_SECONDS = 7000

function App() {

  const webcamRef = React.useRef(null);
  const [runDetect, setRunDetect] = useState(false)
  const [localBlob, setLocalBlob] = useState(undefined);
  const [videoWidth, setVideoWidth] = useState(960);
  const [videoHeight, setVideoHeight] = useState(640);
  const [resultPose, setResultPose] = useState('')
  const [prevResultPose, setPrevResultPose] = useState('')
  const [score, setScore] = useState('')
  const [numPeople, setNumPeople] = useState('')

  const [numPhotos, setNumPhotos] = useState(1);

  const [audio, setAudio] = useState(new Audio(audio_url))
  const [t0, setT0] = useState(performance.now())

  // const {closeReceicer, currentData} = useBusSubscription()
  // const {sendMessage} = useSendToTopic()


  useEffect(() => {
    const timer = setInterval(() => {
      setNumPhotos(numPhotos + 1);

      if(runDetect)
      {
        console.log("capture")
        capture()
      }

    }, 3000);
               // clearing interval
    return () => clearInterval(timer);
  });

  // useBusSubscription
  useEffect(() => {

    // blobThing()
    // sendMessage()
    // busSubscription()

  }, []);

  useEffect(() => {

    // synthesizeSpeech()
  
    if (localBlob)
    {
      
      trySendRequest()
      saveToBlob()
    } 

  }, [localBlob]);

  const saveToBlob = async () => {
    let currentBlobs = await uploadFileToBlob(localBlob)
    // console.log(currentBlobs)
  }
  
  // not working yet
  const detect = async () => {

    let model = new cvstfjs.ClassificationModel();
    // await model.loadModelAsync(
    //   "https://org.azureedge.net/predict-model/model.json"
    // );

    // let model = new cvstfjs.ClassificationModel();
    await model.loadModelAsync('model.json') // './model.json');
    // const image = document.getElementById('image');
    // const result = await model.executeAsync(image);
    // console.log(result)
  }

  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot(); // base64
      toFile(imageSrc)
    },
    [webcamRef]
  );

  const toFile = (url) => {
    // const url = 'data:image/png;base6....';
    const newFileName = "yogapose_" + uuidv1() + ".png"
    //const newFileName = "childs/" + uuidv1() + ".png"
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], newFileName,{ type: "image/png" })
        setLocalBlob(file)
      })
  }

  const parseResult = (responseData) => {

    // console.log(responseData)

    if(responseData)
    {
      const tagName = responseData.data.predictions[0].tagName
      const probability = responseData.data.predictions[0].probability

      if(probability > threshold && tagName !== 'mountain')
      {
        
        const prev_pose = resultPose
        setResultPose(tagName) 
        setScore(probability)

        const mockPoints = mockData.find(m => m.name === tagName)
        if(mockPoints)
        {
          const num_people = mockPoints.coordinates.length
          setNumPeople(num_people)

          if(prevResultPose !== resultPose && okToPlayVoice()) ///okToPlayVoice())
          {
            // const toSay = `${tagName} pose. Together with ${num_people} people in the world.`
            const toSay = getRandomVoice(tagName, num_people)
            synthesizeSpeech(toSay)
            setT0(performance.now())
            setPrevResultPose(prev_pose)
          } 
          // else {
          //   synthesizeSpeech('same pose')
          // }
        }

      } else {
        setResultPose('')
        setScore('')
        setNumPeople('')
      }
    }   
  }

  const getRandomVoice = (tagName, num_people) => {

    const voiceOptions = [
      `${tagName} pose. Together with ${num_people} people in the world.`,
      `${tagName} pose. Along with ${num_people} others.`,
      `${tagName} pose. Currently with people from 3 continents.`,
      `${tagName} pose. That's you and ${num_people} other yogis around the globe`,
      `You're currently in the same ${tagName} pose as ${num_people} people`,
    ]

    const index = Math.floor(Math.random() * voiceOptions.length)
    return voiceOptions[index]
  }

  const okToPlayVoice = () => {
    
    let t1 = performance.now()
    let diff = t1 - t0
    const is_ok = diff > VOICE_TIMEOUT_SECONDS

    console.log(diff + 'is_ok: ' + is_ok)
    return is_ok

  }

  const trySendRequest = async () => {

    // console.log(imageData)
    // console.log("trySendRequest")

    const customVisionKey = process.env.REACT_APP_CUSTOMVISION_KEY || ''
    // const url_image = 'https://customvisionhhs.cognitiveservices.azure.com/customvision/v3.0/Prediction/98e34a44-6f52-47d2-92ec-d42106e3e31f/classify/iterations/Iteration1/image'
    const url_image = 'https://customvisionhhs.cognitiveservices.azure.com/customvision/v3.0/Prediction/98e34a44-6f52-47d2-92ec-d42106e3e31f/classify/iterations/Iteration2/image'

    const headers = { 
        headers: {
            'Prediction-Key': customVisionKey,
            'Content-Type': 'application/octet-stream'
        }
    };

    try {
        const detectResponse = await axios.post(url_image, localBlob, headers);        
        parseResult(detectResponse)
        
    } catch (err) {

        console.log('error');
    }
    
};

  const pickedFile = (event) => {
    const files = event.target.files
    console.log(files[0])
    setLocalBlob(files[0])
  }

  return (
    <div className="App"
      style={{
          // display: 'flex',
          // flexDirection: 'column'
      }}
    >
      <img src={blobImg} style={{position: 'absolute',
        width: 600,
        left: 0,
        top: 0,
        zIndex: 1,
        display: 'none'
        }}/>

      {/* <h1 style={{position: 'absolute',
        fontSize: '5vw',
        left: 40,
        top: 0,
        zIndex: 1,
        color: 'white'
        }}> Bridge Pose </h1> */}

      {/* <div className="mapContainer" style={{width: '100%', height: 500}}> */}
      <div style={{ height: "100vh", width: '100%' }}> 
        {/* <Map poseName={resultPose}/> */}
        <AzureMap poseName={resultPose}/>
      </div>

      <div style={{
        width: '100%', height: 400, 
        backgroundColor: '#212121',
        position: 'fixed',
        bottom: 0,
        padding: 15,
        color: 'white'
        }}
      >
        <span onClick={() => audio.play()}style={{marginRight: 20, color: 'teal'}}>Music on</span>
        <span onClick={() => setRunDetect(true)} style={{marginRight: 20, color: 'green'}}>Start</span>
        <span onClick={() => setRunDetect(false)} style={{marginRight: 20, color: 'red'}}>Stop</span>
        {runDetect && 
          <span> Running..</span>
        }
        

        {/* <div style={{width: '100%', height: 200, backgroundColor: 'teal'}}></div> */}

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{
            color: 'white',
            margin: '20px 50px'
            }}>
            

            <h2 style={{
            fontSize: '4vw',
            margin: 0
            }}> {resultPose} </h2>
            {score && <p><i>Probability: {score}</i></p> }

            {numPeople && 
            <h2 style={{
              fontSize: '2vw',
              margin: 0
            }}> 
              With {numPeople} other people in the world 
            </h2>
            }

            <p><i>Number of photos: {numPhotos}</i></p>

          </div>

          
          {/* <WebSocketDemo path="/?bridge"/>
          <WebSocketDemo path=""/> */}

          {/* <div style={{ position: "absolute", top: "200px" }}> */}
          <div style={{}}>
            <Webcam
            audio={false}
            id="img"
            ref={webcamRef}
            screenshotQuality={1}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            />
          </div>
        </div>


      </div>

    </div>
  );
}

export default App;