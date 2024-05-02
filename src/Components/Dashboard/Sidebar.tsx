import React, {useState, useEffect} from "react";
import { Modal,Menu} from "antd";
import { Link, useNavigate,useLocation } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import '../Styles/Dashboard.css';
import mindgraph from "../../assets/images/mindgraph-logo.png";
import { PoweroffOutlined, HomeFilled, UserAddOutlined, AppstoreAddOutlined, UserOutlined, UsergroupAddOutlined, ScheduleOutlined, PullRequestOutlined, ScheduleFilled } from "@ant-design/icons";
import { ScheduleSendOutlined } from "@mui/icons-material";

const Sidebar: React.FC = () => {
    const [activeKey, setActiveKey] = useState("");

    const Location = useLocation();

    useEffect(() => {
        console.log("location.pathName", Location.pathname)
        const pathSegments = Location.pathname.split("/");
        setActiveKey(pathSegments[pathSegments.length - 1]);
        console.log("pathsegments", pathSegments[pathSegments.length - 1])
    }, [Location.pathname]);

    const isRequestsActive = activeKey === "approvalrequest" || activeKey === "monthtasks";
    const isEmployeeRequestActive = activeKey === 'addtask' || activeKey === 'taskdetails';
    const isAssignTask = activeKey ==='taskassign' || activeKey ==='taskassigntable' || activeKey == 'employeetaskassigndetails'
    const renderMenuItems = () => {
        const userEmail = localStorage.getItem('role');

        switch (userEmail) {
            case 'ROLE_EMPLOYEE':
                return (
                    <>
                        <Menu.Item
                            id="menu"
                            key="dashboard"
                            icon={<HomeFilled />}
                            className={activeKey === 'dashboard' ? "active" : ""}
                        >
                            <Link to="/employee/dashboard">Dashboard</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="calendar"
                            icon={<ScheduleOutlined />}
                            className={activeKey === "calendar" ? "active" : ""}
                        >
                            <Link to="/employee/calendar">Calendar</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="addtask"
                            icon={<ScheduleOutlined />}
                            className={isEmployeeRequestActive ? "active" : ""}
                        >
                            <Link to="/employee/taskdetails">Timesheet</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="taskassigntable"
                            icon={<ScheduleFilled />}
                            className={isAssignTask ? "active" : ""}
                        >
                            <Link to="/employee/taskassigntable">Assigned Task</Link>
                        </Menu.Item>
                    </>
                );
            case 'ROLE_HR':
                return (
                    <>
                        <Menu.Item
                            id="menu"
                            key="dashboard"
                            icon={<HomeFilled />}
                            className={activeKey === "dashboard" ? "active" : ""}
                        >
                            <Link to="/hr/dashboard">Dashboard</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="createuser"
                            icon={<UserAddOutlined />}
                            className={activeKey === "createuser" ? "active" : ""}
                        >
                            <Link to="/hr/createuser">Create User</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="userdetails"
                            icon={<UsergroupAddOutlined />}
                            className={activeKey === "userdetails" ? "active" : ""}
                        >
                            <Link to="/hr/userdetails">User Details</Link>
                        </Menu.Item>
                    </>
                );
            case 'ROLE_MANAGER':
                return (
                    <>
                        <Menu.Item
                            id="menu"
                            key="dashboard"
                            icon={<HomeFilled />}
                            className={activeKey === "dashboard" ? "active" : ""}
                        >
                            <Link to="/manager/dashboard">Dashboard</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="approvalrequest"
                            icon={<PullRequestOutlined />}
                            className={isRequestsActive ? "active" : ""}
                        >
                            <Link to="/manager/approvalrequest">Review</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="timesheet"
                            icon={<ScheduleOutlined />}
                            className={activeKey === "timesheet" ? "active" : ""}
                        >
                            <Link to="/manager/timesheet">Timesheet</Link>
                        </Menu.Item>
                        <Menu.Item
                            id="menu"
                            key="taskassigntable"
                            icon={<ScheduleFilled />}
                            className={isAssignTask ? "active" : ""}
                        >
                            <Link to="/manager/taskassigntable">Assign Task</Link>
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
            <Menu id="side" mode="inline" selectedKeys={[activeKey]}>
                {renderMenuItems()}
            </Menu>
        </div>
    );
};

export default Sidebar;
