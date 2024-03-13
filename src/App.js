import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import '@tensorflow/tfjs-backend-cpu';
import Header from "./component/Header";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DefaultPage from "./component/DefaultPage";
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
        <MenuItem icon={<HomeOutlinedIcon />} onClick={()=>setPage('home')}>Home</MenuItem>
        <MenuItem icon={<PeopleOutlinedIcon />} onClick={()=>setPage('present')}>Presentation</MenuItem>
        <MenuItem icon={<ContactsOutlinedIcon />} onClick={()=>navigate("/admin")}>Demo</MenuItem>
        <MenuItem icon={<ContactsOutlinedIcon />} onClick={()=>navigate("/admin")}>Dashboard</MenuItem>
        {/* <MenuItem icon={<ReceiptOutlinedIcon /> } onClick={handleLoginClick}>LogIn</MenuItem> */}
        <LogInOut />
      </Menu>
    </Sidebar>
      <DefaultPage type={page} />
   </div>
   <Header />
 </div>
  );
}

export default App;
