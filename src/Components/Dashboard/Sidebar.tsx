import React from "react";
import { Modal,Menu} from "antd";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import '../Styles/Dashboard.css';
import mindgraph from "../../assets/images/mindgraph-logo.png";
import { PoweroffOutlined, HomeFilled, UserAddOutlined, AppstoreAddOutlined, UserOutlined, UsergroupAddOutlined, ScheduleOutlined, PullRequestOutlined } from "@ant-design/icons";
import { ScheduleSendOutlined } from "@mui/icons-material";
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

    const userEmail = localStorage.getItem('role');
    const renderMenuItems = () => {
      switch (userEmail) {
        case 'ROLE_EMPLOYEE':
          return (
            <>
              <Menu.Item
                id="menu"
                key="1"
                icon={<HomeFilled />}
                className={Location.pathname === "/employee/dashboard" ? "active" : ""}
              >
                <Link to="/employee/dashboard">Dashboard</Link>
              </Menu.Item>
              {/* <Menu.Item
                id="menu"
                key="4"
                icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/employee/calendar" ? "active" : ""}
              >
                <Link to="/employee/calendar">Calendar</Link>
              </Menu.Item> */}
              <Menu.Item
                id="menu"
                key="5"
                icon={<ScheduleSendOutlined />}
                className={Location.pathname === "/employee/addtask" ? "active" : ""}
              >
                <Link to="/employee/addtask">Add Task</Link>
              </Menu.Item>
              {/* <Menu.Item
                id="menu"
                key="5"
                icon={<ScheduleSendOutlined />}
                className={Location.pathname === "/employee/monthlytask" ? "active" : ""}
              >
                <Link to="/employee/monthlytask">Task View</Link>
              </Menu.Item> */}
            </>
          );
        case 'ROLE_HR':
          return (
            <>
               <Menu.Item id="menu" key="1" icon={<HomeFilled />}
                className={Location.pathname === "/admin/dashboard" ? "active" : ""}>
                <Link to="/hr/dashboard">Dashboard</Link>
              </Menu.Item>
              {/* <Menu.Item id="menu" key="4" icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/calendar" ? "active" : ""}>
                <Link to="/calendar">Calendar</Link>
              </Menu.Item> */}
              <Menu.Item id="menu" key="5" icon={<UserAddOutlined />}
                className={Location.pathname === "/admin/createuser" ? "active" : ""}>
                <Link to="/hr/createuser">Create User</Link>
              </Menu.Item>
              <Menu.Item id="menu" key="5" icon={<UsergroupAddOutlined />}
                className={Location.pathname === "/admin/userdetails" ? "active" : ""}>
                <Link to="/hr/userdetails">User Details</Link>
              </Menu.Item>
              {/* <Menu.Item id="menu" key="5" icon={<UserAddOutlined />}
                className={Location.pathname === "/userprofile" ? "active" : ""}>
                <Link to="/userprofile">User Profile</Link>
              </Menu.Item> */}
            </>
          );
        case 'ROLE_MANAGER':
          return (
            <>
              <Menu.Item id="menu" key="1" icon={<HomeFilled />}
                className={Location.pathname === "/manager/dashboard" ? "active" : ""}>
                <Link to="/manager/dashboard">Dashboard</Link>
              </Menu.Item>
              {/* <Menu.Item id="menu" key="4" icon={<AppstoreAddOutlined />}
                className={Location.pathname === "/calendar" ? "active" : ""}>
                <Link to="/calendar">Calendar</Link>
              </Menu.Item> */}
              <Menu.Item id="menu" key="4" icon={<PullRequestOutlined />}
                className={Location.pathname === "/manager/approvalrequest" ? "active" : ""}>
                <Link to="/manager/approvalrequest">Requests  </Link>
              </Menu.Item>
              <Menu.Item id="menu" key="4" icon={<ScheduleOutlined />}
                className={Location.pathname === "/manager/timesheet" ? "active" : ""}>
                <Link to="/manager/timesheet">TimeSheet  </Link>
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
        <img style={{width:'150px'}} src={mindgraph} alt="mindgraph" />
      </div>
      <Menu id="side" mode="inline">
        {renderMenuItems()}
        {/* <Menu.Item id="signout" key="3" danger icon={<PoweroffOutlined />} onClick={handleSignout}>
          Signout
        </Menu.Item> */}
      </Menu>
    </div>
  );
};
export default Sidebar