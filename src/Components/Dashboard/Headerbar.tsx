import React,{useEffect, useState} from 'react';
import { Avatar, Badge, ConfigProvider, Dropdown, Menu, message, Modal } from "antd";
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import { Input, Button } from 'antd';
import { SearchOutlined, UserOutlined , LoginOutlined, LogoutOutlined} from '@ant-design/icons';
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import '../Styles/Dashboard.css';
import Notification from './Notification';

import api from '../../Api/Api-Service';
const { getDesignToken, useToken } = theme;
 
const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};
 
const globalToken = getDesignToken(config);
const Headerbar: React.FC = () => {
  const navigate = useNavigate();
 
  const [managerDetails, setManagerDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileUrl: "",
    lastLogin: "",
    role: "",
  });

  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
  }, []);

  const getDashboardLink = () => {
    switch (role) {
      case 'ROLE_HR':
        return '/hr/dashboard';
      case 'ROLE_MANAGER':
        return '/manager/dashboard';
      case 'ROLE_EMPLOYEE':
        return '/employee/dashboard';
      default:
        return '/';
    }
  };

  const handleProfileClick = () => {
    const dashboardLink = getDashboardLink();
    navigate(dashboardLink);
  };

 
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    navigate("/login");
    window.location.reload();
  };
 
  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        const response = await api.get("/api/v1/admin/fetch-user-info");
        const manager = response.data.response.data;
        setManagerDetails({
          firstName: manager?.firstName,
          lastName: manager?.lastName,
          email: manager?.email,
          profileUrl: manager?.profileUrl,
          lastLogin: manager?.lastLogin,
          role: manager?.role,
        });
      } catch (error: any) {
        throw error;
       }
    };
 
    fetchManagerInfo();
  }, []);
 
  const handleMenuMouseEnter = async () => {
    try {
      const response = await api.get("/api/v1/admin/fetch-user-info");
      const manager = response?.data?.response?.data;
      setManagerDetails({
        firstName: manager?.firstName,
        lastName: manager?.lastName,
        email: manager?.email,
        profileUrl: manager?.profileUrl,
        lastLogin: manager?.lastLogin,
        role: manager?.role,
      });
    } catch (error: any) {
        throw error
     }
  };
 
  const menu = (
    <Menu
     onMouseEnter={handleMenuMouseEnter} style={{marginTop:'-25px',marginRight:'6px'}}>
      <Menu.Item key="name">
        {managerDetails?.firstName} {managerDetails?.lastName}
      </Menu.Item>
      <Menu.Item key="email">{managerDetails?.email}</Menu.Item>
      <Menu.Item key="lastLoginDate">
        Last Login: {managerDetails?.lastLogin}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleProfileClick}>
        <NavLink to="/hr/profile">Profile</NavLink>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div className='headerstyle'>
      {/* <Input className='search' placeholder="Search Here" suffix={<SearchOutlined />} /> */}
      {/* <Notification/> */}
      <Dropdown overlay={menu}>
        <div
          style={{
            display: "flex",
            flexDirection: "row", // Adjusted to display items vertically
            alignItems: "center",
            gap: "10px",
            marginTop: "-25px",
            cursor:'pointer'
          }}
        >
          <div>
            <Avatar
              size={42}
              src={`${managerDetails?.profileUrl}#${Date.now()}`}                
              icon={<UserOutlined />}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              fontWeight: "bolder",
            }}
          >
            <div
              style={{ color: "#0B4266", fontSize: "18px", marginTop: "5px", height:'20px' }}
            >
              {managerDetails?.firstName} {managerDetails?.lastName}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(0,0,0,.45)",
              }}
            >
              {managerDetails?.role}
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default Headerbar;


//import "../Styles/Custom.css";
 
// import { Avatar, Badge, ConfigProvider, Dropdown, Menu, message } from "antd";
// import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
// import React, { useEffect, useState } from "react";
 
// import type { ThemeConfig } from "antd";
// import api from "../../Api/Api-Service";
// import { theme } from "antd";
// import { useNavigate, NavLink } from "react-router-dom";
// import Notification from "./Notification";
 
// const { getDesignToken, useToken } = theme;
 
// const config: ThemeConfig = {
//   token: {
//     colorPrimary: "#0B4266",
//     colorPrimaryBg: "#E7ECF0",
//   },
// };
 
// const globalToken = getDesignToken(config);
 
// const Navbar: React.FC = () => {
  // const navigate = useNavigate();
 
  // const [managerDetails, setManagerDetails] = useState({
  //   firstName: "",
  //   lastName: "",
  //   email: "",
  //   profileUrl: "",
  //   lastLogin: "",
  //   role: "",
  // });
 
  // const handleLogout = () => {
  //   localStorage.removeItem("authToken");
  //   localStorage.removeItem("role");
  //   navigate("/login");
  //   window.location.reload();
  // };
 
  // // const handleMenuClick = (e: any) => {
  // //   if (e.key === "profile") {
  // //   } else if (e.key === "logout") {
  // //   }
  // // };
 
  // useEffect(() => {
  //   const fetchManagerInfo = async () => {
  //     try {
  //       const response = await api.get("/api/v1/admin/fetch-user-info");
  //       const manager = response.data.response.data;
  //       setManagerDetails({
  //         firstName: manager?.firstName,
  //         lastName: manager?.lastName,
  //         email: manager?.email,
  //         profileUrl: manager?.profileUrl,
  //         lastLogin: manager?.lastLogin,
  //         role: manager?.role,
  //       });
  //     } catch (error: any) {
  //     //   if (error.response && error.response.status === 403) {
  //     //     localStorage.removeItem("authToken");
  //     //     localStorage.removeItem("role");
  //     //     navigate("/");
  //     //     window.location.reload();
  //     //   message.error(error)
  //     //   }
  //      }
  //   };
 
  //   fetchManagerInfo();
  // }, []);
 
  // const handleMenuMouseEnter = async () => {
  //   try {
  //     const response = await api.get("/api/v1/admin/fetch-user-info");
  //     const manager = response?.data?.response?.data;
  //     setManagerDetails({
  //       firstName: manager?.firstName,
  //       lastName: manager?.lastName,
  //       email: manager?.email,
  //       profileUrl: manager?.profileUrl,
  //       lastLogin: manager?.lastLogin,
  //       role: manager?.role,
  //     });
  //   } catch (error: any) {
  //   //   if (error.response.status === 403) {
  //   //     localStorage.removeItem("authToken");
  //   //     localStorage.removeItem("role");
  //   //     navigate("/");
  //   //     window.location.reload();
  //   //   }
  //    }
  // };
 
  // const menu = (
  //   <Menu
  //   // onClick={handleMenuClick}
  //    onMouseEnter={handleMenuMouseEnter} style={{marginTop:'-25px',marginRight:'6px'}}>
  //     <Menu.Item key="name">
  //       {managerDetails?.firstName} {managerDetails?.lastName}
  //     </Menu.Item>
  //     <Menu.Item key="email">{managerDetails?.email}</Menu.Item>
  //     <Menu.Item key="lastLoginDate">
  //       Last Login: {managerDetails?.lastLogin}
  //     </Menu.Item>
  //     <Menu.Divider />
  //     <Menu.Item key="profile" icon={<UserOutlined />}>
  //       <NavLink to="/hr/profile">Profile</NavLink>
  //     </Menu.Item>
  //     <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
  //       Logout
  //     </Menu.Item>
  //   </Menu>
  // );
 
//   return (
    // <div
    // className="navbar"
    // style={{
    //   display: "flex",
    //   justifyContent: "end",
    //   gap: "30px",
    //   backgroundColor: "#E7ECF0",
    //   alignItems: "center",
    //   padding: "30px 25px 20px",
    //   marginRight: "10px",
    // }}
    // >
    //   <ConfigProvider theme={config}>
    //     {/* <Input
    //       placeholder="Search"
    //       className="search"
    //       suffix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)" }} />}
    //     />
 
    //     <Badge dot>
    //       <svg
    //         xmlns="http://www.w3.org/2000/svg"
    //         width="36"
    //         height="36"
    //         viewBox="0 0 32 32"
    //         fill="none"
    //       >
    //         <path
    //           d="M16.0002 29.3335C17.4668 29.3335 18.6668 28.1335 18.6668 26.6668H13.3335C13.3335 28.1335 14.5202 29.3335 16.0002 29.3335ZM24.0002 21.3335V14.6668C24.0002 10.5735 21.8135 7.14683 18.0002 6.24016V5.3335C18.0002 4.22683 17.1068 3.3335 16.0002 3.3335C14.8935 3.3335 14.0002 4.22683 14.0002 5.3335V6.24016C10.1735 7.14683 8.00016 10.5602 8.00016 14.6668V21.3335L5.3335 24.0002V25.3335H26.6668V24.0002L24.0002 21.3335Z"
    //           fill="#0B4266"
    //         />
    //       </svg>
    //     </Badge> */}
    //     <div
    //      style={{
    //       display: "flex",
    //       alignItems: "center",
    //       marginTop: "-15px",
    //     }}
    //     >
    //       <Notification/>
    //     </div>
    //     <Dropdown overlay={menu}>
    //       <div
    //         style={{
    //           display: "flex",
    //           alignItems: "center",
    //           gap: "10px",
    //           marginTop: "-45px",
    //         }}
    //       >
    //         <div>
    //           <Avatar
    //             size={42}
    //             src={`${managerDetails?.profileUrl}#${Date.now()}`}                
    //             icon={<UserOutlined />}
    //           />
    //         </div>
    //         <div
    //           style={{
    //             display: "flex",
    //             flexDirection: "column",
    //             alignItems: "flex-start",
    //             fontWeight: "bolder",
    //           }}
    //         >
    //           <span
    //             style={{ color: "#0B4266", fontSize: "18px", marginTop: "5px" }}
    //           >
    //             {managerDetails?.firstName} {managerDetails?.lastName}
    //           </span>
    //           <span
    //             style={{
    //               marginTop: "-70px",
    //               fontSize: "12px",
    //               color: "rgba(0,0,0,.45)",
    //             }}
    //           >
    //             {managerDetails?.role}
    //           </span>
    //         </div>
    //       </div>
    //     </Dropdown>
    //   </ConfigProvider>
    // </div>
//   );
// };
 
// export default Navbar;
 