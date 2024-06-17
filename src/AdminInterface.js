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
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogInOut from "./component/LogInOut";
import VideocamIcon from '@mui/icons-material/Videocam';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { private_excludeVariablesFromRoot } from "@mui/material";
import { layers } from "@tensorflow/tfjs";
const { Attention } = layers;

// const tf = require('@tensorflow/tfjs');


const AdminInterface = () => {
    const navigate = useNavigate();
    const [userCheck,setUser] = useState('')
    const { collapseSidebar } = useProSidebar();
    let modelHan
    const host = "http://localhost:8000"
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    let camera = null
    let canvasCtx = null
    let hands
    let count = 0
    let status = false
    const predict_value = 45
    
    const labelMap = {
      1:{name:"Led 1&2&3 Off", color:'blue'},
      2:{name:"Led 1 On", color:'red'},
      3:{name:"Led 2 On", color:'yellow'},
      4:{name:"Led 3 On", color:'lime'},
      5:{name:"Led 1&2 On", color:'blue'},
      6:{name:"Led 1&3 On", color:'blue'},
      7:{name:"Led 2&3 On", color:'blue'},
      8:{name:"Led 1&2&3 On", color:'blue'},
      
  }

  const numberKey =   Object.keys(labelMap).length;
  
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
      canvasCtx.rect(minX*videoWidth, minY*videoHeight, (maxX - minX)*videoWidth, (maxY - minY)*videoHeight);
      canvasCtx.stroke();
      canvasCtx.closePath()
    }
  
    function preProcessLandmark(landmarkList) {
      const tempLandmarkList = Array.from(landmarkList);
      // Convert to relative coordinates
      let baseX = 0, baseY = 0;
      tempLandmarkList.forEach((landmarkPoint, index) => {
        if (index == 0) {
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
  
    let resultIndex = numberKey
    let prevState = numberKey
    let prevPredict = 0
    let recentPredict
    let current = 0
    let countReset = 0
    let hold = 0
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
      canvasCtx.font = "300% Arial";
      canvasCtx.textBaseline = "middle";
      canvasCtx.textAlign = "center";
      

        // if (current==1 || (current == 2 && prevState==numberKey) || (current == 2 && recentPredict == numberKey) ){
           if (prevState != -1 && prevState != numberKey){
          canvasCtx.fillText("Hand Gesture: " + labelMap[prevState+1].name , videoWidth*5.5/20, videoHeight/10,videoHeight*2/3);
          // if (prevState!==numberKey && prevState !== -1 ){
        
          //   // if (count == predict_value){
          //     if (!status){
          //       status = true
          //         // if (prevState!=1 && prevState!=2){
          //           // current = 2
          //           // recentPredict = prevState

          //           const request = {
          //             method: 'POST',
          //             statusCode: 200,
          //             headers: {
          //                 'Access-Control-Allow-Origin' : 'origin',
          //                 'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
          //                 'Access-Control-Allow-Credentials' : true,
          //                 'Accept': 'application/json',
          //                 'Content-Type': 'application/json',
          //                 'Authorization': 'Bearer '+ sessionStorage.getItem('token')
          //         },
          //         body: JSON.stringify(labelMap[prevState+1].name)
          //       }
          //           const response = await fetch(host+'/topic', request)
          //                                   .then (response=>{
          //                                     if (response.ok){
                                          
          //                                       // console.log('ok')
          //                                     }
          //                                     else {
          //                                       alert("Log in and retry")
          //                                       navigate("/DemoWeb")
          //                                     }
          //                                   }
          //                                   )
          //                                   .catch(console.error)
                                            
          //     }
             
    
          //         }
                  // else {
                  //     count = count+1
                    
                    
                  // }
          // }
        // }
        // else if (current == 2 && prevState!==numberKey && recentPredict!==numberKey){
        //   canvasCtx.fillText("Hand Gesture: " + labelMap[prevPredict+1].name + '-' + labelMap[recentPredict+1].name ,100, 50, 200);
        //   // recentPredict = numberKey
        // }
        // else if (current == 0  && prevPredict!==0 && countReset!==20){
        //     countReset = countReset + 1 
        //     canvasCtx.fillText("Hand Gesture: Reset...", 100, 50, 200);
        //     if (countReset == 20){
        //       prevPredict = 0
        //     }
          }
        else{
          // count = count + 1
          canvasCtx.fillText("Hand Gesture: ", videoWidth*2.2/10, videoHeight/10,videoHeight/2);
        }
        
  
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0){  
        for (const landmarks of results.multiHandLandmarks){
          // if (count === predict_value){
            drawBoundingBox(landmarks, videoWidth, videoHeight)
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
              {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
          // }
            if (hold == predict_value ){
              const landmark_list = calcLandmarkList(results.image, landmarks)
              const preprocess_landmark = preProcessLandmark(landmark_list)
              // hold = 0
              const request = {
                method: 'POST',
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin' : 'origin',
                    'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
                    'Access-Control-Allow-Credentials' : true,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('token')
                },
                body: JSON.stringify({
                    'data': preprocess_landmark
                })
            };
            
            try {
                const response = await fetch(host+'/predict', request);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const responseData = await response.json();
                prevState = responseData
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            // }
            }
            hold = 0
          }
          else {
            if (hold>predict_value){
              hold = hold
            }
            else {
              hold = hold+1
            }
            
          }
            }  
          // resultIndex = Array.from(result).indexOf(Math.max(...result));
          // console.log(labelMap[resultIndex+1].name)
      }
      else {
        status = false
        count = 0
        prevState = numberKey
        resultIndex = numberKey
        hold = 0
      }
  
    //   if (prevState != resultIndex){
    //     status = false
    //     count = 0 
    //     prevState = resultIndex
    //     // hold = 0
    //     // if (current == 2){
    //     //   recentPredict = numberKey
    //     // }
    //     // recentPredict = numberKey
    // }

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
          // if (!modelHan){
          //   modelHan = await tf.loadLayersModel('http://localhost:8000/static/tfjsv2/model.json').then(model=>{
          //     console.log(model)
          //   })
          // }
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
    if (checkin){
      getUSer()
      checkin = false
    }
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia);
      navigator.getMedia({video: true}, function() {
        if (!camera){
          setupCamera()
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
              else {
                response.json().then((data=>{
                  setUser(data.user)
                }))
                .catch(console.error)
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
  backgroundImage: `url("https://images.pexels.com/photos/753267/pexels-photo-753267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`}}>
  <Header />
  <div style={{  height: "calc(100vh - 20px)", display: "flex" }}>
     <Sidebar style={{backgroundImage: `url("https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=600")`}} > 
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
        <MenuItem icon={<CoPresentIcon />} onClick={()=>navigate('..',{state:'present'})}>Presentation</MenuItem>
        <MenuItem icon={<VideocamIcon />} onClick={()=>navigate("/admin")}>Webcam Demo</MenuItem>
        <MenuItem icon={<SettingsVoiceIcon />} onClick={()=>navigate("/voice_text")}>Voice Text Demo</MenuItem>
        <MenuItem icon={<DashboardIcon />} onClick={()=>navigate("/dashboard")}>Dashboard</MenuItem>
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
            width: '60%',
            height: '80%',
            objectFit: 'cover'
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
            width: '60%',
            height: '80%',
          }}
        />
        </div>
     </div>
     <Header />
   </div>
    );
}}

export default AdminInterface