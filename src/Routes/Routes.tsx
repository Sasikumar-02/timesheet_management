import React, { useState, useEffect } from "react";
import { Roles } from "../Utils/Roles";

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
import MonthTasks from "../Components/Manager/MonthTasks";

import { Task } from "../Components/Employee/AddTask";
import Calendar from "../Components/Employee/Calendar";
import MonthRequest from "../Components/Manager/MonthRequest";
import TaskAssign from "../Components/Manager/TaskAssign";
import TaskAssignTable from "../Components/Manager/TaskAssignTable";
import EmployeeTaskAssignDetails from "../Components/Manager/EmployeeTaskAssignDetails";
import TaskDetails from "../Components/Employee/TaskDetails";
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
    path: "/hr/manager/dashboard",
    element: <ManagerDashboard />,
    roles: Roles.ROLE_HR,
  },
  {
    path: "/hr/manager/employee/dashboard",
    element: <Dashboard />,
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
  {
    path: "/manager/employee/dashboard",
    element: <Dashboard />,
    roles: Roles.ROLE_MANAGER,
  },
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
    path:"/manager/calendar", 
    element:<Calendar />,
    roles: Roles.ROLE_MANAGER
  },
  {
    path:"/manager/monthrequest", 
    element:<MonthRequest />,
    roles: Roles.ROLE_MANAGER
  },
  {
    path:"/manager/taskassign", 
    element:<TaskAssign />,
    roles: Roles.ROLE_MANAGER
  },
  {
    path:"/manager/taskassigntable", 
    element:<TaskAssignTable />,
    roles: Roles.ROLE_MANAGER
  },
  {
    path:"/manager/employeetaskassigndetails", 
    element:<EmployeeTaskAssignDetails />,
    roles: Roles.ROLE_MANAGER
  }
];

export const UserRoutes: ProtectedRoutes[] = [
    {
      path: "/employee/dashboard",
      element: <Dashboard />,
      roles: Roles.ROLE_EMPLOYEE,
    },
    {
      path: "/employee/taskdetails",
      element: <TaskDetails/>,
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
    },
    {
      path:"/employee/monthrequest", 
      element:<MonthRequest />,
      roles: Roles.ROLE_EMPLOYEE
    },
    {
      path:"/employee/taskassigntable", 
      element:<TaskAssignTable />,
      roles: Roles.ROLE_EMPLOYEE
    },
];