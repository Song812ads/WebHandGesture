import React from 'react'
import { useState, useEffect } from 'react'
import Header from './component/Header'
import { useNavigate, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import VideocamIcon from '@mui/icons-material/Videocam';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DefaultPage from "./component/DefaultPage";
import LogInOut from "./component/LogInOut";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import DrawGraph from './component/DrawGraph';
import { getListSubheaderUtilityClass } from '@mui/material';




const Dashboard = () => {
    const location = useLocation();
    const { collapseSidebar } = useProSidebar();
    const [page,setPage] = useState('home')
    const navigate = useNavigate()
    let check = true
    let checkin = true
    const url =  'http://localhost:8000/check_user'

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
            navigate("..")
          }
        })
        .catch((e)=>{
          console.log(e)
        })
}
    useEffect(()=>{
      if (checkin){
        getUSer()
        checkin = false
      }
      if (check){
        if (location.state)
        {
          setPage(location.state)
        }
        check = false
      }
    },[])

    return (
        <div className="App bg-image" 
        style={{
          backgroundSize: "cover",
          backgroundImage: `url("https://images.pexels.com/photos/753267/pexels-photo-753267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`
        }
          }>
          <Header />  
          <div style={{  height: "calc(100vh - 20px)", display: "flex" }}>
             <Sidebar style={{
                backgroundImage: `url("https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=600")`
            //    backgroundColor:"#FCC3C4"
               }} > 
               <Menu >
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
                <MenuItem icon={<VideocamIcon />} onClick={()=>navigate("/admin")}>Demo</MenuItem>
                <MenuItem icon={<DashboardIcon />} onClick={()=>navigate("/dashboard")}>Dashboard</MenuItem>
                {/* <MenuItem icon={<ReceiptOutlinedIcon /> } onClick={handleLoginClick}>LogIn</MenuItem> */}
                <LogInOut />
              </Menu>
                </Sidebar>
              <DrawGraph />
           </div>
           <Header />
         </div>
          );
}

export default Dashboard