import React, { useEffect, useState } from 'react'
import DashboardLayout from '../Dashboard/Layout'
import { Link } from 'react-router-dom';
import {
    UserOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import dayjs from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
import Chart from 'react-apexcharts';
import Calendar from '../Employee/Calendar'; // Import your Calendar component
import { useNavigate } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';
import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer , Area, AreaChart} from 'recharts';
import '../Styles/EmployeeTaskStatus.css';
import '../Styles/CreateUser.css';
import { notification, Card , ConfigProvider, Button} from 'antd';
import { Task } from '../Employee/AddTask';
import { GroupedTasks, SetGroupedTasks, UserGroupedTask } from './ApprovalRequest';
import { set } from 'lodash';
import { CatchingPokemonSharp } from '@mui/icons-material';
import asset from '../../assets/images/asset.svg'
import { Select, Input } from 'antd'; // Import the Select component from Ant Design
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import { TaskRequestedOn } from '../Employee/AddTask';
import api from '../../Api/Api-Service';
interface PerformanceDatum {
    taskName: string;
    totalHours: number;
}
const config: ThemeConfig = {
    token: {
      // colorPrimary: "#0b4266",
   
      colorPrimaryBg: "rgba(155, 178, 192, 0.2)",
   
      colorFillAlter: "rgba(231, 236, 240, 0.3)",
   
      colorPrimaryBgHover: "rgba(155, 178, 192, 0.2)",
   
      borderRadiusLG: 4,
   
      colorFill: "#0b4266",
   
      colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
    },
  };
  const CustomLabel = ({ x, y, value }: { x: number; y: number; value: string | number }) => (
    <text x={x} y={y} fill="#8884d8" textAnchor="middle" dominantBaseline="central">
      {value}
    </text>
  );
  
  interface TitleCount {
    [title: string]: number;
}

// Function to calculate and update the counts
const calculateTitleCounts = (tasks: Task[]) => {
    const titleCounts: TitleCount = {};
    tasks?.forEach(task => {
        if (!titleCounts[task.project]) {
            titleCounts[task.project] = 1;
        } else {
            titleCounts[task.project]++;
        }
    });
    return titleCounts;
};

interface EmployeeTaskStatusProps{
    setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
    setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
    pendingTask: string[];
}

const ManagerDashboard = () => {
    const userId = ['123','1234']; // Assuming you have a function to get the current user's ID
    const { Option } = Select; // Destructure the Option component from Select
    const navigate = useNavigate();
    const [filterOption, setFilterOption] = useState('Month');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
    const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const initialFilters = {
        userId: null,
    };
    const [filters, setFilters] = useState(initialFilters);
    const [placeholderValues, setPlaceholderValues] = useState({
        userId: "Filter by userId",
      });
    const userName = localStorage.getItem("userName");
    console.log("userName", userName);
    const [searchText, setSearchText] = useState("");
    // Define state for groupedTasks
  const [groupedTasks, setGroupedTasks] = useState<UserGroupedTask>({});
  const [titleCounts, setTitleCounts] = useState<TitleCount>({});
  const [taskRequestedOn, setTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [approveTaskRequestedOn, setApproveTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [workFromHomeCount, setWorkFromHomeCount] = useState(0);
  const [workFromOfficeCount, setWorkFromOfficeCount] = useState(0);
  const [monthCounts, setMonthCounts]= useState({
    acceptedCount:0,
    pendingCount: 0,
    rejectedCount: 0
  });
  const [pieChartData, setPieChartData]= useState({
    Learning: 0,
    Meeting: 0,
    Training: 0,
    Project: 0,
    Other:0
  })
  const [doughChartData, setDoughChartData]= useState({
      ClientLocation: 0,
      Office: 0,
      OnDuty: 0,
      WorkFromHome: 0
  })

const chartOptions = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: {
      position: 'right' as const, // Display the legend at the right side
      align: 'center' as const, // Align the legend to the start of the position (right side)
    }
  },
  width: 200,
  height: 300,
};

const data = {
  labels: Object.keys(doughChartData),
  datasets: [
    {
      data: Object.values(doughChartData),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)', // Red
        'rgba(54, 162, 235, 0.8)', // Blue
        'rgba(255, 206, 86, 0.8)', // Yellow
        'rgba(75, 192, 192, 0.8)', // Green
        'rgba(153, 102, 255, 0.8)', // Purple
        'rgba(255, 159, 64, 0.8)', // Orange
      ],
    },
  ],
};

// const chartOptions = {
//   labels: Object.keys(doughChartData),
//   legend: {
//     position: 'right' as 'right',
//     offsetY: 0,
//     height: 250,
//     horizontalAlign: 'right' as 'right',
//   },
//   plotOptions: {
//     pie: {
//       donut: {
//         labels: {
//           show: false
//         }
//       }
//     }
//   },
//   dataLabels: {
//     enabled: false
//   },
//   chart: {
//     height: 350,
//     type: 'donut' as 'donut',
//     offsetY: 10,
//   },
//   responsive: [{
//     breakpoint: 480,
//     options: {
//       chart: {
//         width: '100%',
//         height: 300
//       },
//       legend: {
//         position: 'bottom' as 'bottom',
//         offsetY: 0,
//         height: 250,
//         horizontalAlign: 'center' as 'center',
//       }
//     }
//   }]
// };





// const chartSeries = Object.values(doughChartData);
//console.log("data", chartSeries, chartOptions);
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Add more colors as needed

useEffect(() => {
  const monthName = currentMonth.format('MMMM'); // Get full month name (e.g., "April")
  const year = currentMonth.format('YYYY'); // Get year (e.g., "2024")

  fetchMonthlyReport(monthName, year);
  fetchPieReport(monthName, year);
  fetchDoughReport(monthName, year);
}, [currentMonth]);

const fetchMonthlyReport = async (month:any, year:any) => {
  try {
    const response = await api.get('/api/v1/timeSheet/fetch-monthly-report-manager', {
      params: {
        month,
        year
      }
    });

    const responseData = response?.data?.response?.data;
    const countsObject = {
      acceptedCount: responseData?.acceptedCount,
      pendingCount: responseData?.pendingCount,
      rejectedCount: responseData?.rejectedCount
    };
    console.log("response-new", countsObject);
    setMonthCounts(countsObject);
  } catch (error) {
    throw error;
  }
};

const fetchPieReport=async(month:any, year:any)=>{
  try{
      const response = await api.get('/api/v1/timeSheet/monthly-task-distribution-manager',{
      params:{
          month,
          year,
          
      } 
  })
  console.log("response-pie", response?.data?.response?.data?.categoryPercentages);
  setPieChartData(response?.data?.response?.data?.categoryPercentages);
  }
  catch(err){
      throw err;
  }  
}

const fetchDoughReport=async(month:any, year:any)=>{
  try{
      const response = await api.get('/api/v1/timeSheet/monthly-location-distribution-manager',{
      params:{
          month,
          year
      } 
  })
  console.log("response-dough", response?.data?.response?.data);
  setDoughChartData(response?.data?.response?.data?.locationPercentages);
  }
  catch(err){
      throw err;
  }  
}



  function getWeekOfMonth(date: dayjs.Dayjs): number {
    const firstDayOfMonth = date.startOf('month').day();
    const firstWeek = Math.ceil((1 + (7 - firstDayOfMonth)) / 7);
    const currentWeek = Math.ceil((date.date() + firstDayOfMonth) / 7);
    return currentWeek - firstWeek ;
  }

  const handleFilterChangeForId = (
    filterType: keyof typeof filters,
    value: string | string[] | null
    ) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setIsFilterActive(
        Object.values(updatedFilters).some((filter) => {
            return filter !== null && filter !== '' && filter !== undefined;
        })
    );
  
    // Update the state with the new filters
    //setFilters(updatedFilters);

    // Convert single value or array of values to display in Select
    const selectedValues = Array.isArray(value) ? value : [value];
      setSelectedUserId(selectedValues?.length === 1 ? selectedValues[0] : null);
    };

    const handleClearFilters = () => {
      setFilters(initialFilters);
      setPlaceholderValues({
        userId: "Filter by UserId",
      });

      setIsFilterActive(false);
      setSelectedUserId(null);
    };

    // useEffect to retrieve groupedTasks from localStorage
    useEffect(() => {
      // Retrieve groupedTasks from localStorage
      const storedGroupedTasks = localStorage.getItem('groupedTasks');
      if (storedGroupedTasks) {
        // Parse JSON string to object
        const parsedGroupedTasks: UserGroupedTask = JSON.parse(storedGroupedTasks);
        // Set groupedTasks state
        setGroupedTasks(parsedGroupedTasks);
      }
    }, []); // Empty dependency array to run only once on component mount

    const handleSearchInputChange = (value: string) => {
      setSearchText(value);
    };

    // const calculateFullPerformanceData = (): PerformanceDatum[] => {
    //     const taskHoursMap: { [taskName: string]: number } = {}; // Map to store accumulated hours for each task

    //     // Iterate over each user
    //     Object.values(groupedTasks).forEach((userTasks) => {
    //         // Iterate over each task group
    //         Object.values(userTasks).forEach((taskGroup) => {
    //             // Iterate over each date
    //             Object.values(taskGroup.tasks).forEach((dailyTasks) => {
    //                 // Iterate over tasks for each date
    //                 dailyTasks.tasks.forEach((task) => {
    //                     // Calculate total hours worked for each task
    //                     const totalTaskHours = parseFloat(task.totalHours);
    //                     // Accumulate hours for each task
    //                     if (taskHoursMap[task.task]) {
    //                         taskHoursMap[task.task] += totalTaskHours;
    //                     } else {
    //                         taskHoursMap[task.task] = totalTaskHours;
    //                     }
    //                 });
    //             });
    //         });
    //     });

    //     // Convert the accumulated task hours into PerformanceDatum objects
    //     const performanceData: PerformanceDatum[] = Object.entries(taskHoursMap).map(([taskName, totalHours]) => ({
    //         taskName,
    //         totalHours,
    //     }));

    //     return performanceData;
    // };

    // Call the function to calculate performance data
   // const fullPerformanceDataForManager: PerformanceDatum[] = calculateFullPerformanceData();

    // const calculatePerformanceData = (): PerformanceDatum[] => {
    //     const taskHoursMap: { [taskName: string]: number } = {}; // Map to store accumulated hours for each task

    //     // Determine the range of dates based on filterOption
    //     let startDate: string, endDate: string;
    //     if (filterOption === 'Month') {
    //         startDate = dayjs(currentMonth).startOf('month').format('YYYY-MM-DD');
    //         endDate = dayjs(currentMonth).endOf('month').format('YYYY-MM-DD');
    //     } else if (filterOption === 'Week') {
    //         startDate = dayjs(currentWeek).startOf('week').format('YYYY-MM-DD');
    //         endDate = dayjs(currentWeek).endOf('week').format('YYYY-MM-DD');
    //     } else {
    //         startDate = dayjs(currentDate).format('YYYY-MM-DD');
    //         endDate = startDate;
    //     }

    //     // Get the userId to filter tasks
    //     const userIdToFilter = filters.userId || selectedUserId; // Use selectedUserId if userId is not specified in filters
    //     console.log("calculatePerformanceData userId", userIdToFilter);
    //     // Iterate over each user
    //     if (userIdToFilter && groupedTasks[userIdToFilter]) {
    //         // Iterate over months for the selected user
    //         Object.values(groupedTasks[userIdToFilter]).forEach((monthTasks) => {
    //             // Check if the month matches the current month (if applicable)
    //             if (dayjs(monthTasks.month).isSame(currentMonth, 'month') || filterOption !== 'Month') {
    //                 // Iterate over dates for each month
    //                 Object.keys(monthTasks.tasks).forEach((date) => {
    //                     // Check if the date is within the range
    //                     if ((dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate)) && (dayjs(date).isSame(endDate) || dayjs(date).isBefore(endDate))) {
    //                         // Iterate over tasks for the current date
    //                         monthTasks.tasks[date].tasks.forEach((task) => {
    //                             // Check if the task belongs to the selected user
    //                             if (task.userId === userIdToFilter) {
    //                                 // Calculate total hours worked for each task
    //                                 const totalTaskHours = parseFloat(task.totalHours);
    //                                 // Accumulate hours for each task
    //                                 if (taskHoursMap[task.task]) {
    //                                     taskHoursMap[task.task] += totalTaskHours;
    //                                 } else {
    //                                     taskHoursMap[task.task] = totalTaskHours;
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 });
    //             }
    //         });
    //     } else{
    //         Object.values(groupedTasks).forEach((userTasks) => {
    //             console.log("calculatePerformanceData userTasks",userTasks);
    //             // Iterate over months for each user
    //             Object.values(userTasks).forEach((monthTasks) => {
    //                 console.log("calculatePerformanceData monthTasks",monthTasks);
    //                 // Check if the month matches the current month (if applicable)
    //                 console.log("calculatePerformanceData monthTasks",monthTasks);
    //                 if (dayjs(monthTasks.month).isSame(currentMonth, 'month') || filterOption !== 'Month') {
    //                     // Iterate over dates for each month
    //                     Object.keys(monthTasks.tasks).forEach((date) => {
    //                         // Check if the date is within the range
    //                         if ((dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate))&& (dayjs(date).isSame(endDate)|| dayjs(date).isBefore(endDate))) {
    //                             // Iterate over tasks for the current date
    //                             monthTasks.tasks[date].tasks.forEach((task) => {
    //                                 // Calculate total hours worked for each task
    //                                 const totalTaskHours = parseFloat(task.totalHours);
    //                                 // Accumulate hours for each task
    //                                 if (taskHoursMap[task.task]) {
    //                                     taskHoursMap[task.task] += totalTaskHours;
    //                                 } else {
    //                                     taskHoursMap[task.task] = totalTaskHours;
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }
    //             });
    //         });
    //     }

    //     // Convert the accumulated task hours into PerformanceDatum objects
    //     const performanceData: PerformanceDatum[] = Object.entries(taskHoursMap).map(([taskName, totalHours]) => ({
    //         taskName,
    //         totalHours,
    //     }));

    //     return performanceData;
    // };

    // Call the function to calculate performance data
   // const performanceDataForManager: PerformanceDatum[] = calculatePerformanceData();
    
    const handleFilterChange = (value:any) => {
        setFilterOption(value);
        if (value === 'Month') {
            // Calculate and set the start of the current month
            setCurrentMonth(dayjs().startOf('month'));
        } else if (value === 'Week') {
            // Calculate and set the start of the current week
            setCurrentWeek(dayjs().startOf('week'));
        } else {
            // For 'Date', simply use the current date
            setCurrentDate(dayjs());
        }
    };

    const getCurrentMonth = (filterOption: string, currentDate: string, currentMonth: string, currentWeek: any) => {
        let month: string;
        if (filterOption === 'Date') {
            month = dayjs(currentDate).format('MMMM');
        } else if (filterOption === 'Week') {
            month = dayjs(currentWeek).format('MMMM');
        } else if (filterOption === 'Month') {
            month = dayjs(currentMonth).format('MMMM');
        } else {
            // Default to current month
            month = dayjs().format('MMMM');
        }
        return month;
    };
    
    const getCurrentYear = (filterOption: string, currentDate: string, currentMonth: string, currentWeek: any) => {
        let year: string;
        if (filterOption === 'Date') {
            year = dayjs(currentDate).format('YYYY');
        } else if (filterOption === 'Week') {
            year = dayjs(currentWeek).format('YYYY');
        } else if (filterOption === 'Month') {
            year = dayjs(currentMonth).format('YYYY');
        } else {
            // Default to current year
            year = dayjs().format('YYYY');
        }
        return year;
    };
        
    const handleLeftArrowClick = () => {
        if (filterOption === 'Date') {
          console.log("handleLeftArrowClick -prev", currentDate);
          const previousDate = currentDate.subtract(1, 'day');
          console.log("handleLeftArrowClick previousDate",previousDate)
          setCurrentDate(previousDate);
    
        } else if (filterOption === 'Week') {
          const previousWeekStart = currentWeek.subtract(1, 'week').startOf('week');
          const previousWeekEnd = currentWeek.subtract(1, 'week').endOf('week');
          setCurrentWeek(previousWeekStart);
          console.log("previousWeek",previousWeekStart)
        } else if (filterOption === 'Month') {
          const previousMonthStart = currentMonth.subtract(1, 'month').startOf('month');
          const previousMonthEnd = currentMonth.subtract(1, 'month').endOf('month');
          setCurrentMonth(previousMonthStart);
        }
      };
    
    const handleRightArrowClick = () => {
      if (filterOption === 'Date') {
        const nextDate = currentDate.add(1, 'day');
        if(nextDate.isAfter(dayjs(), 'day')){
          notification.warning({
            message: 'Warning',
            description: 'Cannot navigate to future weeks.',
          });
          return;
        }
        setCurrentDate(nextDate);
      } else if (filterOption === 'Week') {
        const nextWeekStart = currentWeek.add(1, 'week').startOf('week');
        const nextWeekEnd = currentWeek.add(1, 'week').endOf('week');
        if (nextWeekStart.isAfter(dayjs(), 'day')) {
          notification.warning({
            message: 'Warning',
            description: 'Cannot navigate to future weeks.',
          });
          return;
        }
        setCurrentWeek(nextWeekStart);
        
      } else if (filterOption === 'Month') {
        const nextMonthStart = currentMonth.add(1, 'month').startOf('month');
        if (nextMonthStart.isAfter(dayjs(), 'day')) {
          notification.warning({
            message: 'Warning',
            description: 'Cannot navigate to future months.',
          });
          return;
        }
        setCurrentMonth(nextMonthStart);
      }
      
    };

    // Function to handle approval
    const handleApprove = (userId: string, month: string, date: string) => {
        // Update taskRequestedOn
        const updatedTaskRequestedOn = { ...taskRequestedOn };
        if (!updatedTaskRequestedOn[userId]) {
          updatedTaskRequestedOn[userId] = {};
        }
        if (!updatedTaskRequestedOn[userId][month]) {
          updatedTaskRequestedOn[userId][month] = [];
        }
        updatedTaskRequestedOn[userId][month] = updatedTaskRequestedOn[userId][month].filter(d => d !== date);
        setTaskRequestedOn(updatedTaskRequestedOn);

        // Update approveTaskRequestedOn
        const updatedApproveTaskRequestedOn = { ...approveTaskRequestedOn };
        if (!updatedApproveTaskRequestedOn[userId]) {
          updatedApproveTaskRequestedOn[userId] = {};
        }
        if (!updatedApproveTaskRequestedOn[userId][month]) {
          updatedApproveTaskRequestedOn[userId][month] = [];
        }
        updatedApproveTaskRequestedOn[userId][month] = [...updatedApproveTaskRequestedOn[userId][month], date];
        setApproveTaskRequestedOn(updatedApproveTaskRequestedOn);

        // Store updated data in localStorage
        localStorage.setItem('taskRequestedOn', JSON.stringify(updatedTaskRequestedOn));
        localStorage.setItem('approveTaskRequestedOn', JSON.stringify(updatedApproveTaskRequestedOn));
    };
  
    // Function to handle rejection
    const handleReject = (userId: string, month: string, date: string) => {
      // Implement logic to mark the task as rejected
      console.log(`Rejected: UserId-${userId}, Month-${month}, Date-${date}`);
    }; 

    const handleClick = (title: string) => {
        navigate(`/manager/projectuser`, { state: { title } });
      };

      // Function to send reminders and store them in localStorage
      const sendReminders = () => {
        const currentDateFormatted = dayjs(currentDate).format('MMMM DD, YYYY');
        let reminderMessage = '';
        
        // Generate reminder message based on filterOption
        switch (filterOption) {
            case 'Date':
                reminderMessage = `Reminder for ${currentDateFormatted} to fill the task`;
                break;
            case 'Week':
                const startOfWeek = dayjs(currentWeek).startOf('week').format('MMMM DD, YYYY');
                const endOfWeek = dayjs(currentWeek).endOf('week').format('MMMM DD, YYYY');
                reminderMessage = `Reminder for the week ${startOfWeek} to ${endOfWeek} to fill the task`;
                break;
            case 'Month':
                const startOfMonth = dayjs(currentMonth).startOf('month').format('MMMM DD, YYYY');
                const endOfMonth = dayjs(currentMonth).endOf('month').format('MMMM DD, YYYY');
                reminderMessage = `Reminder for the month of ${dayjs(currentMonth).format('MMMM YYYY')} to fill the task`;
                break;
            default:
                reminderMessage = '';
        }
        
        // Retrieve existing reminders from localStorage
        const existingReminders = JSON.parse(localStorage.getItem('remainder') || '{}');
        
        // Append new reminders to existing reminders or initialize as an array
        userId.forEach(id => {
            if (!existingReminders[id]) {
                existingReminders[id] = [];
            }
            // Push the new reminder message to the array
            existingReminders[id].push(reminderMessage);
        });
        
        // Store updated reminders back into localStorage
        localStorage.setItem('remainder', JSON.stringify(existingReminders));
        
        notification.success({
            message: 'Success',
            description: 'Reminder has been sent successfully',
        });
        
        console.log('Reminders sent and stored in localStorage.');
    };
    
       
    // useEffect(() => {
    //     calculateWorkCounts();
    //   }, [groupedTasks, filterOption, selectedUserId]);
    
      // const calculateWorkCounts = () => {
      //   let totalWorkFromHome = 0;
      //   let totalWorkFromOffice = 0;
    
      //   // Determine the range of dates based on filterOption
      //   let startDate: dayjs.Dayjs, endDate: dayjs.Dayjs;
      //   if (filterOption === 'Month') {
      //     startDate = dayjs().startOf('month');
      //     endDate = dayjs().endOf('month');
      //   } else if (filterOption === 'Week') {
      //     startDate = dayjs().startOf('week');
      //     endDate = dayjs().endOf('week');
      //   } else {
      //     startDate = dayjs();
      //     endDate = startDate;
      //   }
      //   console.log("calculateWorkCounts startDate endDate",startDate,endDate);
      //   // Get the userId to filter tasks
      //   const userIdToFilter = filters.userId || selectedUserId; // Use selectedUserId if userId is not specified in filters
      //   console.log("calculateWorkCounts userIdToFilter",userIdToFilter);
      //   if (userIdToFilter && groupedTasks[userIdToFilter]) {
      //     // Iterate over months for the selected user
      //     console.log("calculateWorkCounts groupedTasks[userIdToFilter]",groupedTasks[userIdToFilter]);
      //     Object.values(groupedTasks[userIdToFilter]).forEach((monthTasks) => {
      //       // Check if the month matches the current month (if applicable)
      //       console.log("calculateWorkCounts monthTasks",monthTasks);
      //       if (dayjs(monthTasks.month).isSame(startDate, 'month') || filterOption !== 'Month') {
      //         // Iterate over dates for each month
      //         Object.keys(monthTasks.tasks).forEach((date) => {
      //           // Check if the date is within the range
      //           console.log("calculateWorkCounts monthTasks.tasks",monthTasks.tasks);
      //           if (
      //             (dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate)) &&
      //             (dayjs(date).isSame(endDate) || dayjs(date).isBefore(endDate))
      //           ) {
      //             // Iterate over tasks for the current date
      //             monthTasks.tasks[date].tasks.forEach((task) => {
      //               if (task.workLocation === 'Work from Home') {
      //                 totalWorkFromHome++;
      //               } else if (task.workLocation === 'Work From Office') {
      //                 totalWorkFromOffice++;
      //               }
      //             });
      //           }
      //         });
      //       }
      //     });
      //   } else {
      //     Object.values(groupedTasks).forEach((userTasks) => {
      //       // Iterate over months for each user
      //       Object.values(userTasks).forEach((monthTasks) => {
               
      //         // Check if the month matches the current month (if applicable)
      //         if (dayjs(monthTasks.month).isSame(startDate, 'month') || filterOption !== 'Month') {
      //           // Iterate over dates for each month
      //           Object.keys(monthTasks.tasks).forEach((date) => {
      //               console.log("calculateWorkCounts monthTasks.tasks",monthTasks.tasks);
      //             // Check if the date is within the range
      //             if (
      //               (dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate)) &&
      //               (dayjs(date).isSame(endDate) || dayjs(date).isBefore(endDate))
      //             ) {
      //               // Iterate over tasks for the current date
      //               monthTasks.tasks[date].tasks.forEach((task) => {
      //                 if (task.workLocation === 'Work from Home') {
      //                   totalWorkFromHome++;
      //                 } else if (task.workLocation === 'Work From Office') {
      //                   totalWorkFromOffice++;
      //                 }
      //               });
      //             }
      //           });
      //         }
      //       });
      //     });
      //   }
      //   console.log("calculateWorkCounts totalWorkFromHome",totalWorkFromHome);
      //   console.log("calculateWorkCounts totalWorkFromOffice",totalWorkFromOffice);
      //   setWorkFromHomeCount(totalWorkFromHome);
      //   setWorkFromOfficeCount(totalWorkFromOffice);
      // };
    
     
    return (
      <>
          {/* <h1>Manager</h1> */}

      <div style={{margin:'30px 0px 0px 0px'}}>
              <Card className="main-card">
              <div style={{ display: "flex", height:'55px' }}>
                  <div>
                  <h3 style={{textAlign:'left', marginTop:'0px', marginBottom:'0px'}}>Welcome {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ""}
                  <span className="wave" role="img" aria-label="Waving hand">👋</span></h3>
                  <p>
                      All of us do not have equal talent, but all of us have an equal
                      opportunities to improve our <strong>Talent</strong>
                  </p>
                  </div>
                  <img
                  src={asset}
                  alt="talent"
                  style={{ marginLeft: "auto", marginTop: "-5px" }}
                  />
              </div>
              </Card>
      </div>

      {/* <div>
        <h2>Task Requests</h2>
        {Object.entries(taskRequestedOn).map(([userId, months]) => (
          <div key={userId}>
            <h3>User ID: {userId}</h3>
            {Object.entries(months).map(([month, dates]) => (
              <div key={month}>
                <h4>Month: {month}</h4>
                {dates.map((date) => (
                  <div key={date}>
                    <p>Date: {date}</p>
                    {/* Render approve and reject icons 
                    <button onClick={() => handleApprove(userId, month, date)}>Approve</button>
                    <button onClick={() => handleReject(userId, month, date)}>Reject</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div> */}

      <div style={{display:'flex', justifyContent:'space-between'}}>
          <div style={{display:'flex', justifyContent:'flex-end', height:'47px', margin:'0px 20px 10px 20px'}}>
              <ConfigProvider theme={config}>
                  <Button id='submit-icon' onClick={handleLeftArrowClick}> 
                      <LeftOutlined />
                  </Button>
                  {/* <Select 
                    // id='submit-less' 
                      style={{color:'white', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', marginTop:'10px', height:'68%'}} 
                      onChange={(value) => handleFilterChange(value)} 
                      value={filterOption}
                      dropdownStyle={{ textAlign: 'center' }} // Style the dropdown menu
                  >
                      <Option value='Date'>Date</Option>
                      <Option value='Week'>Week</Option>
                      <Option value='Month'>Month</Option>
                  </Select> */}
                  <Button id='submit-icon' onClick={handleRightArrowClick}>
                      <RightOutlined />
                  </Button>
              </ConfigProvider>
              {/* <div className='employeetask'>
                  { filterOption === 'Month' ? (
                  <div style={{display:'flex', justifyContent:'flex-start'}}>
                      <div style={{margin: '10px 20px', fontSize:'16px', fontFamily:'poppins'}}>From: {dayjs(currentMonth).format('YYYY-MM-DD')}</div>
                      <div style={{ margin: '10px 20px', fontSize:'16px', fontFamily:'poppins'}}>To: {dayjs(currentMonth).endOf('month').format('YYYY-MM-DD')}</div>
                  </div>
                  ) : filterOption === 'Week' ? (
                      <div style={{display:'flex', justifyContent:'flex-start'}}>
                          <div style={{margin: '10px 20px', fontSize:'16px', fontFamily:'poppins'}}>From: {dayjs(currentWeek).format('YYYY-MM-DD')}</div>
                          <div style={{margin: '10px 20px', fontSize:'16px', fontFamily:'poppins' }}>To: {dayjs(currentWeek).endOf('week').format('YYYY-MM-DD')}</div>
                      </div>
                  )  : (
                      <div style={{margin: '10px 20px', fontSize:'16px', fontFamily:'poppins'}}>Date: {currentDate.format('YYYY-MM-DD')}</div>
                  )
                  }
              </div> */}

              <div className='employeetask'>
                  {filterOption === 'Month' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div style={{ margin: '10px 20px', fontSize: '16px', fontFamily: 'poppins' }}>
                              {dayjs(currentMonth).format('MMMM YYYY')}
                          </div>
                      </div>
                  ) : filterOption === 'Week' ? (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div style={{ margin: '10px 20px', fontSize: '16px', fontFamily: 'poppins' }}>
                            {dayjs(currentWeek).format('MMMM YYYY')} Week {getWeekOfMonth(currentWeek)}
                          </div>
                      </div>
                  ) : (
                      <div style={{ margin: '10px 20px', fontSize: '16px', fontFamily: 'poppins' }}>
                          {dayjs(currentDate).format('MMMM DD, YYYY')}
                      </div>
                  )}
              </div>

              {/* <div>
                  <Input
                      className="search"
                      placeholder="Search by ID"
                      allowClear
                      suffix={<SearchOutlined style={{ color: "#04172480" }} />}
                      onChange={(e: any) => handleSearchInputChange(e.target.value)}
                      style={{marginLeft:'20px'}}
                  />
              </div> */}
          </div>
          {/* <div style={{display:'flex', justifyContent:'flex-end', height:'15%', marginRight:'20px', marginTop:'10px'}}>
            <div style={{ width:'200px'}}>
                <Button style={{width:'50%', height:'100%'}} onClick={sendReminders}>Reminder</Button>
            </div> 
             <div>
                <Select
                    showSearch
                    style={{ width: 200, marginRight: 8, height: 40, textAlign:'left' }}
                    placeholder={placeholderValues.userId}
                    onChange={(value) => {
                        handleFilterChangeForId("userId", value);
                        setSelectedUserId(value);
                    }}
                    value={selectedUserId !== null ? selectedUserId : undefined}
                    virtual
                    listHeight={200}

                >
                    {userId.map((id) => (
                        <Select.Option key={id} value={id}>
                            {id}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <div style={{width:'90px'}}>
            <Button
                style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'65px', textAlign:"center", marginLeft:'20px', marginTop:'0px', paddingTop:'8px'}}
                className='regenerateactive'
                onClick={handleClearFilters}
            >
            Clear
            </Button>
            </div>
          </div> */}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='box' style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', fontWeight:'bold'}}>Pending Requests</p>    
                <p style={{ color: '#FFD700', fontSize: '34px', fontFamily: 'poppins' }}>{monthCounts.pendingCount}</p>

            </div>
        </button>
        <button className='box' style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266' , fontWeight:'bold'}}>Accepted</p>
                <p style={{ color: '#32CD32	', fontSize: '34px', fontFamily: 'poppins' }}>{monthCounts.acceptedCount}</p>
            </div>
        </button>
        <button className='box' style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', fontWeight:'bold' }}>Rejected</p>
                <p style={{ color: 'red', fontSize: '34px', fontFamily: 'poppins' }}> {monthCounts.rejectedCount}</p>
            </div>
        </button>
    </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 20px', alignItems: 'center' }}>
        <div id='pie-chart-container' style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width: '50%', backgroundColor: '#ffffff' }}>
          <h2 style={{ textAlign: 'left', color: '#0B4266', marginTop: '0px' }}>Overall Task Percentage</h2>
          <div style={{display:'flex'}}>
            <div>
              <PieChart width={600} height={300}>
                <Pie
                  data={Object.entries(pieChartData).map(([name, value]) => ({ name, value }))}
                  cx={300}
                  cy={150}
                  labelLine={false}
                  label={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(pieChartData).map(([name], index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {Object.entries(pieChartData).map(([name], index) => (
              <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS?.length], marginRight: '5px' }}></span>
                <span>{name}</span>
              </div>
            ))}
            </div>
          </div>  
        </div>


          <div id='line-chart-container' style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width: '48%', backgroundColor: '#ffffff' }}>
              <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Overall Work Location Percentage</h2>
              <div style={{ height: '300px' }}>
                  <Doughnut data={data} options={chartOptions} />
              </div>
              {/* <Chart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                width="380"
              /> */}
          </div>
      </div>
      {/* <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {Object.entries(titleCounts).map(([title, count]) => (
                <button className='box' key={title} title={`Click to view ${title}`} onClick={()=>handleClick(title)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                        <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', textAlign: 'center', fontWeight: 'bold' }}>{title}</p>
                        <p style={{ color: 'black', fontSize: '34px', fontFamily: 'poppins' }}>{count}</p>
                    </div>
                </button>
            ))}
        </div> */}
      </>
    )
}

export default ManagerDashboard;

