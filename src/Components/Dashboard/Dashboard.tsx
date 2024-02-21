// import React, { useState } from "react";
// import Chart from "react-apexcharts";
// import "../Styles/Dashboard.css";
// import DashboardLayout from "./Layout";

// const Dashboard: React.FC = () => {
//   const [state] = useState({
//     options: {
//       colors: ["#E91E63", "#FF9800"],
//       chart: {
//         id: "basic-bar",
//       },
//       xaxis: {
//         categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
//       },
//     },
//     series: [
//       {
//         name: "People Born",
//         data: [30, 40, 45, 50, 49, 60, 70, 91],
//       },
//       {
//         name: "People Died",
//         data: [3, 60, 35, 80, 49, 70, 20, 81],
//       },
//     ],
//   });


//   return (
//     <div>
//       <DashboardLayout>
//         <p>Admin &gt; Timesheet Management &gt; Dashboard</p>
//         <h1>Home Content</h1>

//         <div className="row">
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="bar"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="line"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="area"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="radar"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             // type="histogram"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="scatter"
//             width="450"
//           />
//         </div>
//         <div className="col-4">
//           <Chart
//             options={state.options}
//             series={state.series}
//             type="heatmap"
//             width="450"
//           />
//         </div>
//       </div>
//       </DashboardLayout>
//     </div>
//   );
// };

// export default Dashboard;



import 'chart.js/auto';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import DashboardLayout from './Layout';
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


