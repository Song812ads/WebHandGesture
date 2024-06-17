import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import '@tensorflow/tfjs-backend-cpu';
import Header from "./component/Header";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import VideocamIcon from '@mui/icons-material/Videocam';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DefaultPage from "./component/DefaultPage";
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import Recorder from './component/Recorder'
import LogInOut from "./component/LogInOut";
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapseSidebar } = useProSidebar();
  const host = "http://127.0.0.1:8000"
  const [page,setPage] = useState('home')
  
let check = true
useEffect(()=>{
  if (check){
    if (location.state)
    {
      setPage(location.state)
    }
    check = false
  }
},[])

    const [selectedOption, setSelectedOption] = useState(null);
  
    const handleChange = (event) => {
      setSelectedOption(event.target.value);
    };

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
        <MenuItem icon={<HomeOutlinedIcon />} onClick={()=>setPage('home')}>Home</MenuItem>
        <MenuItem icon={<CoPresentIcon />} onClick={()=>setPage('present')}>Presentation</MenuItem>
        <MenuItem icon={<VideocamIcon />} onClick={()=>navigate("/admin")}>Webcam Demo</MenuItem>
        <MenuItem icon={<SettingsVoiceIcon />} onClick={()=>navigate("/voice_text")}>Voice Text Demo</MenuItem>
        <MenuItem icon={<DashboardIcon />} onClick={()=>navigate("/dashboard")}>Dashboard</MenuItem>
        {/* <MenuItem icon={<ReceiptOutlinedIcon /> } onClick={handleLoginClick}>LogIn</MenuItem> */}
        <LogInOut />
      </Menu>
    </Sidebar>
    <div style={{ flex: 1 }}>
    <div className="audio-recorder-container py-5 h-100 d-flex justify-content-center align-items-center">
        <div className="max-w-sm border py-4 px-6 bg-black" style={{ width: '50vw' }}>
            <h2 className="text-white text-center mb-4">Audio Recorder</h2>
            <div className="form-check form-check-inline mb-3">
                <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="option1" defaultChecked />
                <label className="form-check-label text-white" htmlFor="inlineRadio1">Text</label>
            </div>
            <div className="form-check form-check-inline">
                <input className="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="option2" />
                <label className="form-check-label text-white" htmlFor="inlineRadio2">Voice</label>
            </div>
            <Recorder />
        </div>
    </div>
</div>
   </div>
   <Header />
 </div>
  );
}

export default App;
