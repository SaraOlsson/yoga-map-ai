import './App.css';

import * as cvstfjs from '@microsoft/customvision-tfjs';
import React, {useState, useEffect} from "react"
import Webcam from "react-webcam";
import axios from 'axios';
import mockData from './assets/mockData.json'
import {synthesizeSpeech} from './services/synthSpeech'
import audio_url from './assets/yoga_music.mp3'
import useBusSubscription from './services/useBusSubscription'
import useSendToTopic from './services/useSendToTopic'
import uploadFileToBlob from './services/azure-storage-blob'
import AzureMap from './components/AzureMap.tsx'
const { v1: uuidv1} = require('uuid');

const videoConstraints = {
  width: 640, 
  height: 480,
  facingMode: "user"
};

const DEFAULT_THRESHOLD = 0.7
const VOICE_TIMEOUT_SECONDS = 7000
const USE_SERVICE_BUS = false
const DEBUG = false

function App() {

  const webcamRef = React.useRef(null);
  const [runDetect, setRunDetect] = useState(false)
  const [localBlob, setLocalBlob] = useState(undefined);
  const [resultPose, setResultPose] = useState('')
  const [prevResultPose, setPrevResultPose] = useState('')
  const [score, setScore] = useState('')
  const [numPeople, setNumPeople] = useState('')

  const [numPhotos, setNumPhotos] = useState(0);
  const [saveImages, setSaveImages] = useState(false)
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)

  const [otherUsers, setOtherUsers] = useState([])

  const [useMock, setUseMock] = useState(USE_SERVICE_BUS ? false : true)
  const [audio, setAudio] = useState(new Audio(audio_url))
  const [t0, setT0] = useState(performance.now())

  const {closeReceiver, currentData} = useBusSubscription(USE_SERVICE_BUS)
  const {sendMessage, closeSender} = useSendToTopic()

  // run capture on interval
  useEffect(() => {
    const timer = setInterval(() => {

      if(runDetect)
      {
        setNumPhotos(numPhotos + 1);
        console.log("capture")
        capture()
      }

    }, 3000);
               // clearing interval
    return () => clearInterval(timer);
  });

  // Send message to Service Topic when we have a pose 
  useEffect(() => {

    if(!resultPose)
      return

    console.log("new resultpose")
    if(USE_SERVICE_BUS)
    {
      console.log("send message")
      let temp_message = {name: resultPose, lat: 58.588455, lng: 16.188313}
      sendMessage(temp_message)
    }
    
  }, [resultPose]);

  // listen to changes in topic subscription
  useEffect(() => {

    if(!currentData)
      return 

    console.log(currentData)

    if(currentData["name"])
    {
      let temp_list = otherUsers.slice(0);
      temp_list.push(currentData);
      setOtherUsers(temp_list);
    }

  }, [currentData]);

  // close service bus reciever on 
  useEffect(() => {
    return function cleanup() { 
      if(USE_SERVICE_BUS)
      {
        closeReceiver()
        closeSender()
      }
    }
  },[]);

  // send request when image data is prepared
  useEffect(() => {
  
    if (localBlob)
    {
      trySendRequest()

      if(saveImages)
        saveToBlob()
    } 

  }, [localBlob]);

  const saveToBlob = async () => {
    await uploadFileToBlob(localBlob)
  }
  
  // not working yet 
  const detect = async () => {

    let model = new cvstfjs.ClassificationModel();
    await model.loadModelAsync('model.json') 
  }

  // capute image from webcam
  const capture = React.useCallback(
    () => {
      const imageSrc = webcamRef.current.getScreenshot(); // base64
      toFile(imageSrc)
    },
    [webcamRef]
  );
  
  // convert blob data to FIle
  const toFile = (url) => {
    // const url = 'data:image/png;base6....';
    const newFileName = "yogapose_" + uuidv1() + ".png"
    //const newFileName = "childs/" + uuidv1() + ".png" // possible to change filename later?
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], newFileName,{ type: "image/png" })
        setLocalBlob(file)
      })
  }

  // parse and act on classificatoin respons
  const parseResult = (responseData) => {

    if(responseData)
    {
      const tagName = responseData.data.predictions[0].tagName
      const probability = responseData.data.predictions[0].probability

      if(probability > threshold && tagName !== 'mountain')
      {
        
        const prev_pose = resultPose
        setResultPose(tagName) 
        setScore(probability)

        // using mock data for other users atm
        const mockPoints = mockData.find(m => m.name === tagName)
        if(mockPoints)
        {
          // prepare value
          const num_people = mockPoints.coordinates.length
          setNumPeople(num_people)

          // make sure not repeating or already playing sound
          if(prevResultPose !== resultPose && okToPlayVoice()) 
          {
            // get random variant of speech message
            const toSay = getRandomVoice(tagName, num_people)
            synthesizeSpeech(toSay) // trigger play

            // update state
            setT0(performance.now())
            setPrevResultPose(prev_pose)
          } 

        }

      } else {
        // clear
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

    let diff = performance.now() - t0
    return diff > VOICE_TIMEOUT_SECONDS

  }

  const trySendRequest = async () => {

    const customVisionKey = process.env.REACT_APP_CUSTOMVISION_KEY || ''
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

  return (
    <div className="App">

      {/* <div className="mapContainer" style={{width: '100%', height: 500}}> */}
      <div style={{ height: "100vh", width: '100%' }}> 
        {/* <Map poseName={resultPose}/> */}
        <AzureMap poseName={resultPose} useReal={!useMock} otherUsers={otherUsers}/>
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

        <label style={{marginRight: 20}}>
            Threshold
          <input
            name="threshold"
            type="number"
            value={threshold}
            max={1}
            step={0.1}
            min={0.3}
            onChange={(e) => setThreshold(e.target.value)} 
          />
        </label>



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

            { DEBUG && 
              <>
              <label style={{marginRight: 20}}>
              Save images to shared database
                <input
                  name="saveImages"
                  type="checkbox"
                  checked={saveImages}
                  onChange={(e) => setSaveImages(e.target.checked)} 
                />
              </label>

              <label style={{marginRight: 20}}>
                  Use simulated users
                <input
                  name="useMock"
                  type="checkbox"
                  checked={useMock}
                  onChange={(e) => setUseMock(e.target.checked)} 
                />
              </label>

              <label>
                  Simulate yoga pose
                <input
                  name="setPose"
                  type="text"
                  onChange={(e) => setResultPose(e.target.value)} 
                />
              </label>
              </>
            }

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
