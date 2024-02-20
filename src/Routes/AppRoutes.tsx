// AppRoutes.tsx
// import React from "react";
// import { Route, Routes, Navigate } from 'react-router-dom';
// import Error404 from "../Components/Error/Error-404";
// import Dashboard from "../Components/Dashboard/Dashboard";
// import Asset from "../Components/Dashboard/Asset";
// import BranchAdmin from "../Components/Dashboard/BranchAdmin";
// import CreateBranchAdmin from "../Components/Dashboard/CreateBranchAdmin";
// import CreateAsset from "../Components/Dashboard/CreateAsset";
// import OnboardForm from "../Components/OnboardForm";

// const AppRoutes: React.FC = () => {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to='/dashboard' />} />
//       <Route path="/dashboard" element={<Dashboard />} />
//       <Route path="/onboardform" element={<OnboardForm />} />
//       <Route path="/asset" element={<Asset />} />
//       <Route path="/branch-admin" element={<BranchAdmin />} />
//       <Route path="/create-branch-admin" element={<CreateBranchAdmin />} />
//       <Route path="/create-asset" element={<CreateAsset />} />
//       <Route path="*" element={<Error404 />} />
//     </Routes>
//   );
// };

// export default AppRoutes;

import PrivateRoutes from './PrivateRoutes';
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from 'react-router-dom';
import Error404 from "../Components/Error/Error-404";
import Dashboard from "../Components/Dashboard/Dashboard";
import CreateBranchAdmin from "../Components/Dashboard/CreateBranchAdmin";
import OnboardForm from "../Components/Dashboard/OnboardForm";
import ControlCalendar from '../Components/Dashboard/Calendar';
import CreateUser from '../Components/Dashboard/CreateUser';
import EmployeeList from '../Components/Dashboard/Employee-list';
import UserDetails from '../Components/Dashboard/UserDetails';
import AddTask from '../Components/Dashboard/AddTask';
import UserProfile from '../Components/Dashboard/UserProfile';
import ApprovalRequest from '../Components/Dashboard/ApprovalRequest';
import { Task } from '../Components/Dashboard/AddTask';
import MonthTasks from '../Components/Dashboard/MonthTasks';

const AppRoutes: React.FC = () => {
  const userEmail = localStorage.getItem('email');
  const [pieChartData, setPieChartData] = useState<{ [key: string]: number }>({});
  const [approvalRequestsData, setApprovalRequestsData] = useState<Task[]>([]);
  const [selectedKeys, setSelectedKeys]=useState<string[]>([]);
  const [selectedMonth, setSelectedMonth]= useState<string>('');
  const [selectedMYear, setSelectedYear]= useState<string>('');
  useEffect(() => {
    // Retrieve approvalRequestsData from local storage
    const storedData = localStorage.getItem('approvalRequestsData');
    if (storedData) {
      setApprovalRequestsData(JSON.parse(storedData));
    }
  }, []); // Fetch data only once on component mount

  
  return (
    <Routes>
      <Route path="/" element={<Navigate to='/dashboard' />} />
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard data={pieChartData}/>} />
        <Route path="/create-branch-admin" element={<CreateBranchAdmin />} />
        <Route path='/calendar' element={<ControlCalendar />} />
        <Route path="/onboardform" element={<OnboardForm />} />
        {/* ... (other routes) */}
        <Route path="/createuser" element={userEmail === 'sasikumarmurugan02@gmail.com' ? <CreateUser /> : <Navigate to="/dashboard" />} />
        <Route path='/userdetails' element={userEmail === 'sasikumarmurugan02@gmail.com' ? <UserDetails /> : <Navigate to="/dashboard" />} />
        <Route path='/employeeview' element={<EmployeeList />} />
        <Route
          path="/addtask"
          element={
            userEmail === 'sasikumarmurugan02@gmail.com' ? (
              <AddTask setPieChartData={setPieChartData} setApprovalRequestsData={setApprovalRequestsData} approvalRequestsData={approvalRequestsData}/>
            ) : (
                <Navigate to="/dashboard" />
              )
          }
        />
        <Route path="/userprofile/:userId" element={userEmail === 'sasikumarmurugan02@gmail.com' ? <UserProfile /> : <Navigate to="/dashboard" />} />
        <Route path="/createuser/:userId" element={userEmail === 'sasikumarmurugan02@gmail.com' ? <CreateUser /> : <Navigate to="/dashboard" />} />
        <Route path='/approvalrequests' element={(userEmail === 'sasikumarmurugan02@gmail.com') ? <ApprovalRequest/> : <Navigate to="/dashboard" />} />
        <Route path='/monthTasks' element={(userEmail === 'sasikumarmurugan02@gmail.com') ? <MonthTasks setSelectedKeys ={setSelectedKeys} /> : <Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;