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
// import myModel from 'model.json'
//const myModel = require('./model.json')

const videoConstraints = {
  width: 640, //320, //640, //1280,
  height: 480, //240, // 480, //720,
  facingMode: "user"
};

const threshold = 0.7

function App() {

  const webcamRef = React.useRef(null);
  const [localBlob, setLocalBlob] = useState(undefined);
  const [videoWidth, setVideoWidth] = useState(960);
  const [videoHeight, setVideoHeight] = useState(640);
  const [resultPose, setResultPose] = useState('Bridge Pose..')
  const [score, setScore] = useState('')

  const [numPhotos, setNumPhotos] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setNumPhotos(numPhotos + 1);
      capture()
    }, 2000);
               // clearing interval
    return () => clearInterval(timer);
  });

  useEffect(() => {
  
    if (localBlob)
    {
      trySendRequest()
    } 

  }, [localBlob]);
  
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
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "File name",{ type: "image/png" })
        console.log("to file")
        console.log(file)
        setLocalBlob(file)
      })
  }

  const parseResult = (responseData) => {

    if(responseData)
    {
      const tagName = responseData.data.predictions[0].tagName
      const probability = responseData.data.predictions[0].probability

      if(probability > threshold)
      {
        setResultPose(tagName + " - "+ probability)
        setScore(probability)
      } else {
        // setResultPose("nothing. ( "+ tagName + " - "+ probability + " )")
        setResultPose('')
        setScore('')
      }
    }   
  }

  const trySendRequest = async () => {

    // console.log(imageData)
    console.log("trySendRequest")

    const customVisionKey = process.env.REACT_APP_CUSTOMVISION_KEY || ''
    const url_image = 'https://customvisionhhs.cognitiveservices.azure.com/customvision/v3.0/Prediction/98e34a44-6f52-47d2-92ec-d42106e3e31f/classify/iterations/Iteration1/image'

    const headers = { 
        headers: {
            'Prediction-Key': customVisionKey,
            'Content-Type': 'application/octet-stream'
        }
    };

    try {
        const detectResponse = await axios.post(url_image, localBlob, headers);        
        console.log(detectResponse);
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
        <Map/>
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

            <p><i>Number of photos: {numPhotos}</i></p>
            {/* <h1>{resultPose}</h1> */}

          </div>

          {/* <Map/> */}

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
