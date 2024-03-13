// import Approval from "../Pages/Admin/Approval";
// import Collaborate from "../Pages/User/Collaborate";
// import CollaborateDetails from "../Pages/User/CollaborateDetails";
// //import Dashboard from "../Pages/Admin/Home";
// import Employee from "../Pages/Admin/Employee";
// import EmployeeDetails from "../Pages/Admin/EmployeeDetails";
// import OptionSwitch from "../Components/OptionSwitch";
// import ProjectDetails from "../Pages/Admin/Projects/Forms/ProjectDetails";
// import ProjectList from "../Pages/Admin/Projects/ProjectList";
// import ProjectOnboardForm from "../Pages/Admin/Projects/Forms/ProjectOnboardForm";
// import { ReactNode } from "react";
// import { Roles } from "../Utils/Roles";
// import UserDashboard from '../Pages/User/UserDashboard'
// //import UserProfile from "../Pages/User/UserProfile";
// import UserProjectDetails from "../Pages/User/UserProjectDetails";
// //import ManagerDashboard from "../Pages/Manager/ManagerDashboard";
// import ListOfEmployees from "../Pages/Manager/EmployeeListOfManager";
// import EmployeeListDetails from "../Pages/Admin/EmployeeTableList";
// import UserProfileList from "../Pages/Admin/UserProfileList";
// import UserProjectList from "../Pages/User/ProjectDetails";
// import ViewerEmployeeTable from "../Pages/Viewer/ViewerEmployeeTable";
// import ViewerEmployeeDetails from "../Pages/Viewer/ViewerEmployeeDetails";
// import ViewerProjectList from "../Pages/Viewer/ViewerProjectList";
// import ViewerProjectDetails from "../Pages/Viewer/ViewerProjectDetails";
// import CertificateApproval from "../Pages/Manager/Certificate";
// import jwtDecode from "jwt-decode";
// import UserIndividualProject from "../Pages/User/UserIndividualProject";
// import EmployeeProjectDetails from "../Pages/Admin/EmployeeProjectDetails";

import React, { useState, useEffect } from "react";
import { Roles } from "../Utils/Roles";
import usePieChartData from "./UsePieChartData";

import AdminDashboard from "../Components/Admin/Admindashboard";
import CreateUser from "../Components/Admin/CreateUser";
import UserDetails from "../Components/Admin/UserDetails";
import UserProfile from "../Components/Admin/UserProfile";

import AddTask from "../Components/Employee/AddTask";
import Dashboard from "../Components/Employee/Dashboard";
import EmployeeTaskStatus from "../Components/Employee/EmployeeTaskStatus";

import ApprovalRequest from "../Components/Manager/ApprovalRequest";
import ManagerDashboard from "../Components/Manager/ManagerDashboard";
import ManagerTimeSheet from "../Components/Manager/ManagerTimeSheet";
import ManagerUserDetails from "../Components/Manager/ManagerUserDetails";
import MonthTasks from "../Components/Manager/MonthTasks";

import { Task } from "../Components/Employee/AddTask";
import Calendar from "../Components/Employee/Calendar";

interface RouteBase {
  path: string;
  element: React.ReactNode;
}

interface ProtectedRoutes extends RouteBase {
  roles: string;
}

export const HrRoutes: ProtectedRoutes[] = [
  {
    path: "/hr/dashboard",
    element: <AdminDashboard />,
    roles: Roles.ROLE_HR,
  },
  {
    path: "/hr/createuser",
    element: <CreateUser />,
    roles: Roles.ROLE_HR,
  },
  {
    path: "/hr/userdetails",
    element: <UserDetails />,
    roles: Roles.ROLE_HR,
  },
  {
    path:"/hr/userprofile/:userId" ,
    element:<UserProfile /> ,
    roles: Roles.ROLE_HR
  },
  {
    path:"/hr/createuser/:userId", 
    element:<CreateUser />,
    roles: Roles.ROLE_HR
  },
  {
    path:"/hr/calendar", 
    element:<Calendar />,
    roles: Roles.ROLE_HR
  }
];

export const ManagerRoutes: ProtectedRoutes[] = [ 
  {
    path: "/manager/dashboard",
    element: <ManagerDashboard />,
    roles: Roles.ROLE_MANAGER,
  },
//   {
//     path: "/employee/dashboard",
//     element: <Dashboard />,
//     roles: Roles.ROLE_MANAGER,
//   },
  {
    path: "/manager/approvalrequest",
    element: <ApprovalRequest />,
    roles: Roles.ROLE_MANAGER,
  },
  {
    path: "/manager/timesheet",
    element: <ManagerTimeSheet />,
    roles: Roles.ROLE_MANAGER,
  },
  {
    path: "/manager/monthtasks",
    element: <MonthTasks />,
    roles: Roles.ROLE_MANAGER,
  },
  {
    path:'/manager/projectuser',
    element:<ManagerUserDetails/>,
    roles:Roles.ROLE_MANAGER,
  },
  {
    path:"/manager/calendar", 
    element:<Calendar />,
    roles: Roles.ROLE_HR
  }
];

export const UserRoutes: ProtectedRoutes[] = [
   
    {
      path: "/employee/dashboard",
      element: <Dashboard />,
      roles: Roles.ROLE_EMPLOYEE,
    },
    {
      path: "/employee/addtask",
      element: <AddTask/>,
      roles: Roles.ROLE_EMPLOYEE,
    },
    {
      path:"/employee/calendar", 
      element:<Calendar />,
      roles: Roles.ROLE_EMPLOYEE
    }
];




