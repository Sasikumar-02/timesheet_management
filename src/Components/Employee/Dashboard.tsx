import 'chart.js/auto';
import React from 'react';
import DashboardLayout from '../Dashboard/Layout';
import EmployeeTaskStatus from './EmployeeTaskStatus';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
const Dashboard: React.FC = () => {
  return (
  
    <EmployeeTaskStatus/>

  
  );
};

export default Dashboard;


