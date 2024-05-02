import 'chart.js/auto';
import React from 'react';
import EmployeeTaskStatus from './EmployeeTaskStatus';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import MonthRequest from '../Manager/MonthRequest';
const Dashboard: React.FC = () => {
  return (
  <>
    <EmployeeTaskStatus/>
    <MonthRequest/>
  </>
  );
};

export default Dashboard;


