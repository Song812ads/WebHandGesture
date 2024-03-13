// Import dependencies
import React, { useRef, useState, useEffect, Component} from "react";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import "./App.css";
import '@tensorflow/tfjs-backend-cpu';
import * as cam from "@mediapipe/camera_utils"
import {Hands,HAND_CONNECTIONS,Results} from '@mediapipe/hands'; 
import { drawConnectors, drawLandmarks} from '@mediapipe/drawing_utils';
import Header from "./component/Header";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DefaultPage from "./component/DefaultPage";
import LogInOut from "./component/LogInOut";

const AdminInterface = () => {
    const navigate = useNavigate();
    const { collapseSidebar } = useProSidebar();
    let modelHan
    const host = "http://127.0.0.1:8000"
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    let camera = null
    let canvasCtx = null
    let hands
    let count = 0
    // let hans
    let status = false
    const predict_value = 20
    
    const labelMap = {
      1:{name:"Led", color:'red'},
      2:{name:"Temp", color:'yellow'},
      3:{name:"Humid", color:'lime'},
      4:{name:"Reset", color:'blue'},
  }
  
    const  drawBoundingBox = (landmarks, videoWidth,videoHeight) => {
      if (landmarks.length < 2) {
        return; // Need at least two landmarks to draw a bounding box
      }
      let minX = Number.MAX_SAFE_INTEGER
      let minY = Number.MAX_SAFE_INTEGER
      let maxX = Number.MIN_SAFE_INTEGER
      let maxY = Number.MIN_SAFE_INTEGER
    
      for (const landmark of landmarks) {
        minX = Math.min(minX, landmark.x);
        minY = Math.min(minY, landmark.y);
        maxX = Math.max(maxX, landmark.x);
        maxY = Math.max(maxY, landmark.y);
      }
      
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = 'red'
      canvasCtx.fillStyle = 'white'
      canvasCtx.rect(minX*videoWidth, minY*videoHeight, (maxX - minX)*videoWidth*1.2, (maxY - minY)*videoHeight*1.2);
      canvasCtx.stroke();
      canvasCtx.closePath()
    }
  
    function preProcessLandmark(landmarkList) {
      const tempLandmarkList = Array.from(landmarkList);
      // Convert to relative coordinates
      let baseX = 0, baseY = 0;
      tempLandmarkList.forEach((landmarkPoint, index) => {
        if (index === 0) {
          baseX = landmarkPoint[0];
          baseY = landmarkPoint[1];
        }
        landmarkPoint[0] -= baseX;
        landmarkPoint[1] -= baseY;
      });
      // Convert to a one-dimensional list
      const flatLandmarks = tempLandmarkList.reduce((acc, curr) => {
        return acc.concat(curr);
      }, []);
      
      // Normalization
      const maxValue = Math.max(...flatLandmarks);
    
      const normalizedLandmarks = flatLandmarks.map(n => n / maxValue);
    
      return normalizedLandmarks;
    }
  
    function calcLandmarkList(image, landmarks) {
      const imageWidth = image.width;
      const imageHeight = image.height;
    
      const landmarkPoints = [];
    
      // Keypoint
      landmarks.forEach(landmark => {
        const landmarkX = Math.min(Math.floor(landmark.x * imageWidth), imageWidth - 1);
        const landmarkY = Math.min(Math.floor(landmark.y * imageHeight), imageHeight - 1);
        // const landmarkZ = landmark.z; // Uncomment if needed
    
        landmarkPoints.push([landmarkX, landmarkY]);
      });
    
      return landmarkPoints;
    }
  
    let resultIndex = 4
    let prevState = 4
    const onResults = async (results)=>{
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
  
      //Sets height and width of canvas 
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
  
      const canvasElement =  canvasRef.current;
  
      canvasCtx = canvasElement.getContext("2d");
  
      canvasCtx.save();
      canvasCtx.clearRect(0,0,videoWidth,videoHeight);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      )
      canvasCtx.fillStyle = "#000";
      canvasCtx.font = "50px sans-serif";
      canvasCtx.textBaseline = "middle";
      canvasCtx.textAlign = "center";
      
  
      if (prevState<=3 && prevState>=0 && count===predict_value){
        const state = prevState +1 
        canvasCtx.fillText("Hand Gesture: " + labelMap[state].name ,100, 50, 200);
      }
      else {
        canvasCtx.fillText("Hand Gesture: ", 100, 50, 200);
      }
  
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0){  
        for (const landmarks of results.multiHandLandmarks){
          if (count === predict_value){
            drawBoundingBox(landmarks, videoWidth, videoHeight)
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
              {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
          }
          const landmark_list = calcLandmarkList(results.image, landmarks)
          const preprocess_landmark = preProcessLandmark(landmark_list)
          const inputTensor = tf.tensor([preprocess_landmark], [1, preprocess_landmark.length]);
          const result = await modelHan.predict(inputTensor).data()
          resultIndex = Array.from(result).indexOf(Math.max(...result));
        }
      }
      else {
        status = false
        count = 0
        prevState = 4
        resultIndex = 4
      }
  
      if (prevState!== resultIndex){
        status = false
        count = 0 
        prevState = resultIndex
    }
      else {
        if (prevState!==4 && prevState !== -1 && status===false){
        count = count + 1
        console.log(count)
        if (count === predict_value){
          status = true
            const request = {
              method: 'POST',
              statusCode: 200,
              headers: {
                  'Access-Control-Allow-Origin' : 'origin',
                  'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
                  'Access-Control-Allow-Credentials' : true,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+ sessionStorage.getItem('token')
          },
          body: JSON.stringify(labelMap[prevState+1].name)
        }
            const response = await fetch(host+'/topic', request)
                                    .then (response=>{
                                      if (response.ok){
                                        // console.log('ok')
                                      }
                                      else {
                                        alert("Log in and retry")
                                        navigate("/")
                                      }
                                    }
                                    )
              
          }
        }
      }
      canvasCtx.restore()
    }
  
  const onF = async()=>{
      const video = webcamRef.current.video;
      // Create a temporary canvas element
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
  
      // Set the canvas dimensions to match the video
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
  
      // Draw the video frame onto the canvas
      tempCtx.drawImage(video, 0, 0);
  
      // Flip the image horizontally
      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);
  
      // Wait for the image to be flipped
      await new Promise(resolve => {
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        resolve();
      });
        await hands.send({ image: tempCanvas });
  }
   
  const setupCamera = async() => {
    try {
      hands = new Hands({
        locateFile:(file)=>{
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
        },
      });
    
      hands.setOptions({
        modelComplexity: 1,
        maxNumHands: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.7
      }); 
      hands.onResults(onResults);
          if (!modelHan){
            modelHan = await tf.loadLayersModel('http://localhost:8000/static/tfjsv2/model.json')
          }
        console.log(webcamRef.current)
        if (((typeof webcamRef.current !== "undefined" && webcamRef.current !== null)) ){
    
          camera = new cam.Camera(webcamRef.current.video,{
            onFrame:  onF,
            width: webcamRef.current.width,
            height: webcamRef.current.height
          })
          camera.start()
        }
      }
    catch(e){
      console.log(e)
    }
  }

 
  
  let checkin = true
  const [sta,setSta] = useState(true)
  useEffect(()=>{
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia);
      navigator.getMedia({video: true}, function() {
        if (!camera){
          setupCamera()
      }
      if (checkin){
        getUSer()
      }
      else {
        navigate("/")
      }
      }, function() {
        alert("No camera yet. Turn it on")
        navigate("/")
      });
  },[Webcam])
  
  const url = host + '/check_user'
  const getUSer = async () =>{
      const request = {
          method: 'GET',
          statusCode: 200,
          headers: {
              'Access-Control-Allow-Origin' : 'origin',
              'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
              'Access-Control-Allow-Credentials' : true,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }
      }
            await fetch(url,request)
          //   .then((response)=>response.json())
            .then((response)=>{
              if (!response.ok){
                alert("Not Log In Yet")
                setSta(false)
                navigate("..")
              }
            })
            .catch((e)=>{
              console.log(e)
            })
  }

if (sta){
    return (
  <div className="App bg-image" 
  style={{
    backgroundSize: "cover",
    backgroundImage: `url("https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`}}>
    <Header />
    <div style={{  height: "calc(100vh - 20px)", display: "flex" }}>
       <Sidebar > 
         <Menu>
           <MenuItem
            icon={<MenuOutlinedIcon />}
            onClick={() => {
              collapseSidebar();
            }}
            style={{ textAlign: "center" }}
          >
            <h2>Admin</h2>
          </MenuItem>
          <MenuItem icon={<HomeOutlinedIcon />} onClick={()=>navigate('..',{state:'home'})}>Home</MenuItem>
          <MenuItem icon={<PeopleOutlinedIcon />} onClick={()=>navigate('..',{state:'present'})}>Presentation</MenuItem>
          <MenuItem icon={<ContactsOutlinedIcon />}>Demo</MenuItem>
          <MenuItem icon={<ContactsOutlinedIcon />}>Dashboard</MenuItem>
          <LogInOut />
        </Menu>
      </Sidebar>
      <div style={{ flex: 1 }}>
        <Webcam
          ref ={webcamRef}
          mirrored={true}
          audio={false}
          style={{
            marginTop: "50px",
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 800,
            height: 540,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            marginTop: "50px",
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 800,
            height: 540,
          }}
        />
        </div>
     </div>
     <Header />
   </div>
    );
}}

export default AdminInterface