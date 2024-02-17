import React from "react";
import { Modal,Menu} from "antd";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import '../Styles/Dashboard.css';
import mindgraph from "../../assets/images/mindgraph-logo.png";
import { PoweroffOutlined, HomeFilled, UserAddOutlined, AppstoreAddOutlined } from "@ant-design/icons";
const Sidebar: React.FC = () => {
    const { instance } = useMsal();
    const navigate = useNavigate();
    const Location = useLocation();
    const { confirm } = Modal;
    const handleSignout = () => {
      confirm({
        title: 'Sign Out',
        content: 'Do you want to sign out?',
        okButtonProps: {
          style: {
            width: '80px', backgroundColor: '#0B4266',color:'white'
          },
        },
        cancelButtonProps: {
          style: {
            width: '80px', backgroundColor: '#0B4266',color:'white'
          },
        },
        onOk() {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          instance.logout();
          navigate("/");
          window.location.reload();
        },
        onCancel() {
        },
      });
    };

    const userEmail = localStorage.getItem('email');
    const renderMenuItems = () => {
      switch (userEmail) {
        case 'sasikumarmurugan232@gmail.com':
          return (
            <>
              <Menu.Item
                id="menu"
                key="1"
                icon={<HomeFilled />}
                className={Location.pathname === "/dashboard" ? "active" : ""}
              >
                <Link to="/dashboard">DASHBOARD</Link>
              </Menu.Item>
              <Menu.Item
                id="menu"
                key="4"
                icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/calendar" ? "active" : ""}
              >
                <Link to="/calendar">Calendar</Link>
              </Menu.Item>
              <Menu.Item
                id="menu"
                key="5"
                icon={<UserAddOutlined />}
                className={Location.pathname === "/addtask" ? "active" : ""}
              >
                <Link to="/addtask">Add Task</Link>
              </Menu.Item>
            </>
          );
        case 'sasikumarmurugan02@gmail.com':
          return (
            <>
               <Menu.Item id="menu" key="1" icon={<HomeFilled />}
                className={Location.pathname === "/dashboard" ? "active" : ""}>
                <Link to="/dashboard">DASHBOARD</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="4" icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/calendar" ? "active" : ""}>
                <Link to="/calendar">Calendar</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="5" icon={<UserAddOutlined />}
                className={Location.pathname === "/createuser" ? "active" : ""}>
                <Link to="/createuser">Create User</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="5" icon={<UserAddOutlined />}
                className={Location.pathname === "/userdetails" ? "active" : ""}>
                <Link to="/userdetails">User Details</Link>
              </Menu.Item>
              {/* <Menu.Item id="menu" key="5" icon={<UserAddOutlined />}
                className={Location.pathname === "/userprofile" ? "active" : ""}>
                <Link to="/userprofile">User Profile</Link>
              </Menu.Item> */}
            </>
          );
        case 'sasikumarashok2006@gmail.com':
          return (
            <>
              <Menu.Item id="menu" key="1" icon={<HomeFilled />}
                className={Location.pathname === "/dashboard" ? "active" : ""}>
                <Link to="/dashboard">DASHBOARD</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="4" icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/calendar" ? "active" : ""}>
                <Link to="/calendar">Calendar</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="4" icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/approvalrequests" ? "active" : ""}>
                <Link to="/approvalrequests">Approval Requests</Link>
              </Menu.Item>
            </>
          );
        default:
          return null;
      }
    };
  
   
  return (
    <div>
      <div id="img">
        <img src={mindgraph} alt="mindgraph" />
      </div>
      <Menu id="side" mode="inline">
        {renderMenuItems()}
        <Menu.Item id="signout" key="3" danger icon={<PoweroffOutlined />} onClick={handleSignout}>
          SIGNOUT
        </Menu.Item>
      </Menu>
    </div>
  );
};
export default Sidebar