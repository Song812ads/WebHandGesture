
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "./App.css";
import '@tensorflow/tfjs-backend-cpu';
import Header from "./component/Header";
import { Sidebar, Menu, MenuItem, useProSidebar } from "react-pro-sidebar";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogInOut from "./component/LogInOut";

const Login = () => {

  const { collapseSidebar } = useProSidebar();
  const host = "http://127.0.0.1:8000"
let check = true


  const navigate = useNavigate()
  const sign = require('jwt-encode')
  const secret = 'nhungngay0em'
  const [pass,setPass] =  useState('')
  const [user,setUser] = useState('')
  const jwtEnocde = async () =>{
    const data = {
      'username' : user,
      'password' : pass
    }
    let modifiedPassword = sign(data, secret)
    const request = {
      method: 'POST',
      statusCode: 200,
      headers: {
          'Access-Control-Allow-Origin' : 'origin',
          'Access-Control-Allow-Headers':'Content-Type, Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Credentials' : true,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // 'Authorization': 'Bearer ' + auth.user.access_token
  },
  body: JSON.stringify(modifiedPassword)
}
    const response = await fetch(host+'/log', request)
                          .then((response)=>{if (!response.ok){
                            setPass('')
                            setUser('')
                            alert('Login fail. Try again')
                          }
                          else {
                          return response.json()
                          }
                          })
                          .then((response)=>{
                            if (response.token){
                              alert("Login success")
                              navigate('/')
                              sessionStorage.setItem('token',response.token)
                            }
                    
                          })
                          .catch(e => {
                            console.log(e)
                          })
                        }

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
        <MenuItem icon={<ContactsOutlinedIcon />} onClick={()=>navigate("/admin")}>Demo</MenuItem>
        <MenuItem icon={<ContactsOutlinedIcon />} onClick={()=>navigate("/admin")}>Dashboard</MenuItem>
        {/* <MenuItem icon={<ReceiptOutlinedIcon /> } onClick={handleLoginClick}>LogIn</MenuItem> */}
        <LogInOut />
      </Menu>
    </Sidebar>
  <div className="container py-5 h-100">
    <div className="row d-flex justify-content-center align-items-center h-100">
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card bg-dark text-white" >
          <div className="card-body p-5 text-center">
            <div className="mb-md-5 mt-md-4 pb-1">
              <h2 className="fw-bold mb-2 text-uppercase">Login</h2>
              <p className="text-white-50 mb-5">Please enter your login and password!</p>
              <div className="form-outline form-white mb-4">
                <input className="form-control form-control-lg" placeholder='Username' value={user} onChange={(e)=>setUser(e.target.value)}/>
              </div>
              <div className="form-outline form-white mb-4">
                <input className="form-control form-control-lg" placeholder='Password' value={pass} onChange={(e)=>setPass(e.target.value)}/>
              </div>
              {/* <p class="small mb-5 pb-lg-2"><a class="text-white-50" href="#!">Forgot password?</a></p> */}
              <button className="btn btn-outline-light btn-lg px-5" type="submit" onClick={()=>jwtEnocde()}>Login</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
   </div>
   <Header />
 </div>
  );


}

export default Login