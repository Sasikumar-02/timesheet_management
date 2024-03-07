import 'chart.js/auto';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import DashboardLayout from '../Dashboard/Layout';
import EmployeeTaskStatus from './EmployeeTaskStatus';

interface PieChartProps {
  data: { [key: string]: number };
}

const Dashboard: React.FC<PieChartProps> = ({ data }) => {
  console.log("data", data);
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          'red',
          'blue',
          'green',
          'yellow',
          'purple',
        ],
      },
    ],
  };

  return (
  <DashboardLayout>
    <EmployeeTaskStatus/>
    {/* <Pie data={chartData} /> */}
  </DashboardLayout>
  
  );
};

export default Dashboard;


