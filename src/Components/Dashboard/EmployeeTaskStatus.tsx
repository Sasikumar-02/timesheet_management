import React, { useEffect, useState } from 'react'
import DashboardLayout from './Layout'
import {
    UserOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import dayjs from 'dayjs';
import Calendar from './Calendar'; // Import your Calendar component
import { useNavigate } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';
//import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer , Area, AreaChart} from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, Brush, ReferenceLine, Label } from 'recharts';
import '../Styles/EmployeeTaskStatus.css';
import '../Styles/CreateUser.css';
import { notification } from 'antd';
import { Task } from './AddTask';

import { set } from 'lodash';
import { CatchingPokemonSharp } from '@mui/icons-material';

interface EmployeeTaskStatusProps{
    setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
    setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
}
const EmployeeTaskStatus = () => {
    const navigate = useNavigate();
    const [filterOption, setFilterOption] = useState('Month');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
    const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [approvedKeys, setApprovedKeys]= useState<string[]>([]);
    const [rejectedKeys, setrejectedKeys]= useState<string[]>([]);
    const [rejectCount, setRejectCount]= useState(0);
    const [acceptCount, setAcceptCount]= useState(0);
    const [missedCount, setMissedCount]= useState(0);
    const [pendingCount, setPendingCount]= useState(0);
    const [performanceData, setPerformanceData] = useState<{ date: string, percentage: number }[]>([]);
    const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Set initial chart width to 90% of window width
    const [selectedMonth, setSelectedMonth]=useState<string>('');
    const [selectedYear, setSelectedYear]=useState<string>('');
    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth * 0.2); // Update chart width when window is resized
        };

        window.addEventListener('resize', handleResize); // Add event listener for window resize

        return () => {
            window.removeEventListener('resize', handleResize); // Remove event listener on component unmount
        };
    }, []);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Add more colors if needed
    useEffect(() => {
        const storedData = localStorage.getItem('taskList');
        if (storedData) {
            setTaskList(JSON.parse(storedData));
        }
        console.log("storedData", storedData);
    }, []);

    useEffect(() => {
        const storedData = localStorage.getItem('selectedKeys');
        if (storedData) {
            setApprovedKeys(JSON.parse(storedData));
        }
        console.log("storedData", storedData);
    }, []);

    useEffect(() => {
        const storedData = localStorage.getItem('rejectedKeys');
        if (storedData) {
            setrejectedKeys(JSON.parse(storedData));
        }
        console.log("storedData", storedData);
    }, []);

    function getDaysInMonth(month: number, year: number) {
        // month is 0-based in JavaScript
        return new Date(year, month + 1, 0).getDate();
      }

      useEffect(() => {
        let filtered: Task[] = [];
        let processedDates = new Set<string>(); // Set to store processed dates
        if (filterOption === 'Date') {
            filtered = taskList.filter((task) => task.date === dayjs(currentDate).format('YYYY-MM-DD'));
        } else if (filterOption === 'Week') {
            const startOfWeek = currentWeek.startOf('week');
            const endOfWeek = currentWeek.endOf('week');
            filtered = taskList.filter(
                (task) =>
                    (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
                    (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek))
            );
        } else if (filterOption === 'Month') {
            const startOfMonth = currentMonth.startOf('month');
            const endOfMonth = currentMonth.endOf('month');
            filtered = taskList.filter(
                (task) =>
                    (dayjs(task.date).isSame(startOfMonth) || dayjs(task.date).isAfter(startOfMonth)) &&
                    (dayjs(task.date).isSame(endOfMonth) || dayjs(task.date).isBefore(endOfMonth))
            );
        }
    
        let newAcceptCount = 0;
        let newRejectCount = 0;
        let newPendingCount = 0;
    
        filtered.forEach(task => {
            const date = dayjs(task.date).format('YYYY-MM-DD');
            // Check if the date has already been processed
            if (!processedDates.has(date)) {
                processedDates.add(date); // Add date to processed dates set
                if (approvedKeys.includes(task.date)) {
                    newAcceptCount++;
                } else if (rejectedKeys.includes(task.date)) {
                    newRejectCount++;
                } else {
                    newPendingCount++;
                }
            }
        });
    
        let newMissedCount = 0;
    
        if (filterOption === 'Month') {
            // Calculate total days in the month
            const totalDaysInMonth = dayjs(currentMonth).daysInMonth();
            newMissedCount = totalDaysInMonth - newAcceptCount - newRejectCount - newPendingCount;
        } else if (filterOption === 'Week') {
            // Calculate total days in the week
            const totalDaysInWeek = 7;
            newMissedCount = totalDaysInWeek - newAcceptCount - newRejectCount - newPendingCount;
        } else {
            // For Date filter option, check if the task exists for the selected date
            const selectedDate = dayjs(currentDate).format('YYYY-MM-DD');
            const taskExists = filtered.some(task => task.date === selectedDate);
            if (!taskExists) {
                newMissedCount = 1;
            }
        }
    
        setAcceptCount(newAcceptCount);
        setRejectCount(newRejectCount);
        setPendingCount(newPendingCount);
        setMissedCount(newMissedCount);
    
        setFilteredTasks(filtered);
    }, [filterOption, currentDate, currentMonth, currentWeek, taskList, approvedKeys, rejectedKeys]);

    useEffect(() => {
        const calculatePerformanceData = () => {
            const performanceData = [];
    
            if (filterOption === 'Month') {
                const totalDaysInMonth = dayjs(currentMonth).daysInMonth();
                const totalWorkingHours = totalDaysInMonth * 9; // Assuming 9 hours of work per day
    
                for (let i = 1; i <= totalDaysInMonth; i++) {
                    const date = dayjs(currentMonth).date(i).format('YYYY-MM-DD');
                    const tasksForDate = filteredTasks.filter(task => task.date === date);
                    const totalTaskHours = tasksForDate.reduce((acc, task) => acc + parseFloat(task.totalHours), 0);
                    const extraHoursPercentage = totalTaskHours < 9 ? 0 : ((totalTaskHours - 9) / totalWorkingHours) * 100;
                    performanceData.push({ date, percentage: extraHoursPercentage });
                }
            } else if (filterOption === 'Week') {
                const totalDaysInWeek = 7;
                const totalWorkingHours = totalDaysInWeek * 9; // Assuming 9 hours of work per day
    
                for (let i = 0; i < totalDaysInWeek; i++) {
                    const date = dayjs(currentWeek).add(i, 'day').format('YYYY-MM-DD');
                    const tasksForDate = filteredTasks.filter(task => task.date === date);
                    const totalTaskHours = tasksForDate.reduce((acc, task) => acc + parseFloat(task.totalHours), 0);
                    const extraHoursPercentage = totalTaskHours < 9 ? 0 : ((totalTaskHours - 9) / totalWorkingHours) * 100;
                    performanceData.push({ date, percentage: extraHoursPercentage });
                }
            } else {
                const selectedDate = dayjs(currentDate).format('YYYY-MM-DD');
                const tasksForDate = filteredTasks.filter(task => task.date === selectedDate);
                const totalTaskHours = tasksForDate.reduce((acc, task) => acc + parseFloat(task.totalHours), 0);
                const extraHoursPercentage = totalTaskHours < 9 ? 0 : ((totalTaskHours - 9) / 9) * 100;
                performanceData.push({ date: selectedDate, percentage: extraHoursPercentage });
            }
    
            return performanceData;
        };
    
        setPerformanceData(calculatePerformanceData());
    }, [filterOption, currentDate, currentMonth, currentWeek, filteredTasks]);
    
    const handleFilterChange = (value: any) => {
        setFilterOption(value);
    };

    // const calculateTaskPercentages = () => {
    //     let totalHours = 0;
    //     const taskHoursMap: { [taskName: string]: number } = {}; // Object to store total hours for each task type
        
    //     // Calculate total working hours based on filterOption
    //     if (filterOption === 'Month') {
    //         totalHours = dayjs(currentMonth).daysInMonth() * 9; // Assuming 9 hours of work per day
    //     } else if (filterOption === 'Week') {
    //         totalHours = 7 * 9; // Assuming 9 hours of work per day for 7 days
    //     } else {
    //         totalHours = 9; // Assuming 9 hours of work for the selected date
    //     }
        
    //     // Accumulate total task hours for each task type
    //     filteredTasks.forEach(task => {
    //         const taskName = task.task;
    //         const taskHours = parseFloat(task.totalHours);
            
    //         if (!taskHoursMap[taskName]) {
    //             taskHoursMap[taskName] = 0;
    //         }
            
    //         taskHoursMap[taskName] += taskHours;
    //     });
        
    //     // Calculate percentage for each task type
    //     const taskPercentages = Object.keys(taskHoursMap).map(taskName => ({
    //         taskName,
    //         value: totalHours !== 0 ? (taskHoursMap[taskName] / totalHours) * 100 : 0
    //     }));
        
    //     return taskPercentages;
    // }; 
    
    const calculateOverallPercentages = () => {
        const totalTasks = acceptCount + rejectCount + pendingCount;
        const acceptedPercentage = (acceptCount / totalTasks) * 100;
        const rejectedPercentage = (rejectCount / totalTasks) * 100;
        const pendingPercentage = (pendingCount / totalTasks) * 100;
        return [
            { taskName: 'Accepted', value: acceptedPercentage },
            { taskName: 'Rejected', value: rejectedPercentage },
            { taskName: 'Pending', value: pendingPercentage }
        ];
    };
    const calculateTaskPercentages = () => {
        let totalHours = 0;
        let taskHoursMap: { [taskName: string]: number } = {}; // Object to store total hours for each task type
    
        // Calculate total working hours based on filterOption
        if (filterOption === 'Month') {
            totalHours = dayjs(currentMonth).daysInMonth() * 9; // Assuming 9 hours of work per day for the entire month
        } else if (filterOption === 'Week') {
            totalHours = 7 * 9; // Assuming 9 hours of work per day for 7 days
        } else {
            totalHours = 9; // Assuming 9 hours of work for the selected date
        }
    
        // Accumulate total task hours for each task type
        filteredTasks.forEach(task => {
            const taskName = task.task;
            const taskHours = parseFloat(task.totalHours);
    
            if (!taskHoursMap[taskName]) {
                taskHoursMap[taskName] = 0;
            }
    
            taskHoursMap[taskName] += taskHours;
        });
    
        // Calculate percentage for each task type
        const taskPercentages = Object.keys(taskHoursMap).map(taskName => ({
            taskName,
            value: totalHours !== 0 ? (taskHoursMap[taskName] / totalHours) * 100 : 0
        }));
    
        return taskPercentages;
    };
    
    const generateXAxisCategories = () => {
        if (filterOption === 'Month') {
            // Get the start and end dates of the current month
            const startDate = dayjs(currentMonth).startOf('month');
            const endDate = dayjs(currentMonth).endOf('month');
            
            // Generate an array of all dates in the current month
            const datesOfMonth = [];
            let currentDate = startDate;
            while (currentDate.isSame(endDate, 'day') || currentDate.isBefore(endDate, 'day')) {
                datesOfMonth.push(currentDate.format('YYYY-MM-DD'));
                currentDate = currentDate.add(1, 'day');
            }
            console.log("dateoFmonth", datesOfMonth);
            return datesOfMonth;
        } else if (filterOption === 'Week') {
            // Get all dates of the specific week
            const startDate = dayjs(performanceData[0].date).startOf('week');
            const endDate = dayjs(performanceData[performanceData.length - 1].date).endOf('week');
            const datesOfWeek = [];
            let currentDate = startDate;
            while (currentDate.isSame(endDate, 'day') || currentDate.isBefore(endDate, 'day')) {
                datesOfWeek.push(currentDate.format('YYYY-MM-DD'));
                currentDate = currentDate.add(1, 'day');
            }
            return datesOfWeek;
        } else {
            // Get all hours of the specific date
            return Array.from({ length: 24 }, (_, index) => `${index}:00`);
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
    
    const handleCountClick = (status: string, filterOption: string, currentDate: string, currentMonth: string, currentWeek: any) => {
        
        // Navigate to the calendar for the specific month based on the filter option
        const month = getCurrentMonth(filterOption, currentDate, currentMonth, currentWeek);
        const year = getCurrentYear(filterOption, currentDate, currentMonth, currentWeek);
        console.log("handleCountClick", month, year);
        setSelectedYear(year);
        setSelectedMonth(month);
        localStorage.setItem('selectedMonth', month);
        localStorage.setItem('selectedYear', year);
        navigate(`/calendar?month=${month}&year=${year}&status=${status}`);
    };
    
    
    
    // const generateXAxisCategories = () => {
    //     if (filterOption === 'Month') {
    //         // Get the start and end dates of the current month
    //         const startDate = currentMonth.startOf('month');
    //         const endDate = currentMonth.endOf('month');
    //         // const startDate = dayjs(currentMonth).startOf('month');
    //         // const endDate = dayjs(currentMonth).endOf('month');
    //         console.log("generateXAxisCategories-month", startDate);
    //         console.log("generateXAxisCategories-month", endDate);
    //         // Generate an array of all dates in the current month
    //         const datesOfMonth = [];
    //         let currentDate = startDate;
    //         while (currentDate.isSame(endDate, 'day') || currentDate.isBefore(endDate, 'day')) {
    //             console.log("1");
    //             datesOfMonth.push(currentDate.format('YYYY-MM-DD'));
    //             currentDate = currentDate.add(1, 'day');
    //         }
    //         return datesOfMonth;
    //     } else if (filterOption === 'Week') {
    //         // Get all dates of the specific week
    //         const startDate = dayjs(performanceData[0].date).startOf('week');
    //         const endDate = dayjs(performanceData[performanceData.length - 1].date).endOf('week');
    //         const datesOfWeek = [];
    //         let currentDate = startDate;
    //         while (currentDate.isSame(endDate, 'day') || currentDate.isBefore(endDate, 'day')) {
    //             datesOfWeek.push(currentDate.format('YYYY-MM-DD'));
    //             currentDate = currentDate.add(1, 'day');
    //         }
    //         return datesOfWeek;
    //     } else {
    //         // Get all hours of the specific date
    //         return Array.from({ length: 24 }, (_, index) => `${index}:00`);
    //     }
    // };
    
    

    // Function to calculate performance data based on filter option
   
    const calculatePerformance = () => {
        const performanceData:any[] = [];

        // Ensure filteredTasks has data
        if (!filteredTasks || filteredTasks.length === 0) {
            return performanceData;
        }

        // Iterate over the filtered tasks and calculate extra hours worked per day/week/month
        filteredTasks.forEach(task => {
            let totalExpectedHours = 0;
            if (filterOption === 'Month') {
                totalExpectedHours = dayjs(task.date).daysInMonth() * 9; // Assuming 9 hours of work per day
            } else if (filterOption === 'Week') {
                totalExpectedHours = 7 * 9; // Assuming 9 hours of work per day for 7 days
            } else {
                totalExpectedHours = 9; // Assuming 9 hours of work for the selected date
            }
            const extraHours = parseFloat(task.totalHours) - totalExpectedHours;
            const percentage = (extraHours / totalExpectedHours) * 100;
            performanceData.push({
                date: dayjs(task.date).format('YYYY-MM-DD'), // Adjust date format as needed
                extraHours,
                percentage,
            });
        });

        return performanceData;
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
  return (
    <>
    <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{textAlign:'left', margin:'10px 20px'}}>
            <h1 style={{fontSize:'34px'}}>Welcome</h1>
            <h3 style={{ fontSize: '20px', marginBottom:'0px'}}>
                Sasi
                <span className="wave" role="img" aria-label="Waving hand">👋</span>
            </h3>
        </div>
        <div style={{display:'flex', justifyContent:'flex-end', height:'10%', margin:'40px 20px 10px 20px'}}>
            <button type='button' id='submit-less' onClick={handleLeftArrowClick}>
                <LeftOutlined />
            </button>
            <select 
                id='submit' 
                style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} 
                onChange={(e) => handleFilterChange(e.target.value)} value={filterOption}
            >
                <option style={{textAlign:'center'}} value='Date'>Date</option>
                <option style={{textAlign:'center'}} value='Week'>Week</option>
                <option style={{textAlign:'center'}} value='Month'>Month</option>
            </select>
            <button type='button' id='submit-less' onClick={handleRightArrowClick}>
                <RightOutlined />
            </button>
        </div>
    </div>
    <div className='employeetask'>
        { filterOption === 'Month' ? (
        <div style={{display:'flex', justifyContent:'flex-start'}}>
            <div style={{margin: '10px 20px', fontSize:'20px'}}>From: {dayjs(currentMonth).format('YYYY-MM-DD')}</div>
            <div style={{ margin: '10px 20px', fontSize:'20px'}}>To: {dayjs(currentMonth).endOf('month').format('YYYY-MM-DD')}</div>
        </div>
        ) : filterOption === 'Week' ? (
            <div style={{display:'flex', justifyContent:'flex-start'}}>
                <div style={{margin: '10px 20px', fontSize:'20px'}}>From: {dayjs(currentWeek).format('YYYY-MM-DD')}</div>
                <div style={{margin: '10px 20px', fontSize:'20px' }}>To: {dayjs(currentWeek).endOf('week').format('YYYY-MM-DD')}</div>
            </div>
        )  : (
            <div style={{margin: '10px 20px', fontSize:'20px'}}>Date: {currentDate.format('YYYY-MM-DD')}</div>
        )
        }
    </div>
    {/* <div style={{display:'flex', justifyContent:'space-between'}}>
        <div className='cardStyle'>
            <p style={{fontFamily:'poppins', fontSize:'20px', color:'#0B4266', fontWeight:'bold'}}>Missing</p>
            <p style={{color:'red', fontSize:'54px', fontFamily:'poppins'}}> {missedCount}</p>
        </div>
        <div className='cardStyle'>
            <p style={{fontFamily:'poppins', fontSize:'20px', color:'#0B4266', fontWeight:'bold'}}>Pending</p>
            <p style={{color:'black', fontSize:'54px', fontFamily:'poppins'}}> {pendingCount}</p>
        </div>
        <div className='cardStyle'>
            <p style={{fontFamily:'poppins', fontSize:'20px', color:'#0B4266', fontWeight:'bold'}}>Accepted</p>
            <p style={{color:'green', fontSize:'54px', fontFamily:'poppins'}}> {acceptCount}</p>
        </div>
        <div className='cardStyle'>
            <p style={{fontFamily:'poppins', fontSize:'20px', color:'#0B4266', fontWeight:'bold'}}>Rejected</p>
            <p style={{color:'red', fontSize:'54px', fontFamily:'poppins'}}> {rejectCount}</p>
        </div>
    </div>  */}
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='cardStyle'onClick={() => handleCountClick('Missed', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none' }}>
            <p style={{ fontFamily: 'poppins', fontSize: '20px', color: '#0B4266', fontWeight: 'bold' }}>Not Filled</p>
            <p style={{ color: 'red', fontSize: '54px', fontFamily: 'poppins' }}> {missedCount}</p>
        </button>
        <button className='cardStyle' onClick={() => handleCountClick('Pending', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none' }}>
            <p style={{ fontFamily: 'poppins', fontSize: '20px', color: '#0B4266', fontWeight: 'bold' }}>Pending</p>
            <p style={{ color: 'black', fontSize: '54px', fontFamily: 'poppins' }}> {pendingCount}</p>
        </button>
        <button className='cardStyle' onClick={() => handleCountClick('Accepted',filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none' }}>
            <p style={{ fontFamily: 'poppins', fontSize: '20px', color: '#0B4266', fontWeight: 'bold' }}>Accepted</p>
            <p style={{ color: 'green', fontSize: '54px', fontFamily: 'poppins' }}> {acceptCount}</p>
        </button>
        <button className='cardStyle' onClick={() => handleCountClick('Rejected', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none' }}>
            <p style={{ fontFamily: 'poppins', fontSize: '20px', color: '#0B4266', fontWeight: 'bold' }}>Rejected</p>
            <p style={{ color: 'red', fontSize: '54px', fontFamily: 'poppins' }}> {rejectCount}</p>
        </button>
    </div>
    {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <ApexCharts
            options={{
                chart: {
                    type: 'line',
                },
                xaxis: {
                    categories: generateXAxisCategories(),
                },
                yaxis: {
                    title: {
                        text: 'Percentage of Extra Hours Worked',
                    },
                    labels: {
                        formatter: function (value) {
                            return value.toFixed(2); // Fix the decimal to 2 places
                        }
                    }
                },
                dataLabels: {
                    enabled: false,
                },
            }}
            series={[{ name: 'Performance', data: calculatePerformance().map(data => data.percentage) }]}
            type="line"
            width={1000}
            height={400}
        />
    </div> */}
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom:'20px',marginLeft: '20px', marginRight: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px' }}>
    <ResponsiveContainer width="80%" height={400}>
        <LineChart data={performanceData}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
            </defs>
            <XAxis dataKey="date">
                {/* Remove x-axis title */}
            </XAxis>
            <YAxis>
                <Label
                    value="Percentage of Extra Hours Worked"
                    angle={-90}
                    offset={0}
                    position="insideLeft"
                    style={{ textAnchor: 'middle', fill: '#333' }}
                />
            </YAxis>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="percentage" stroke="#333" fillOpacity={1} fill="url(#colorUv)" />
            {/* Remove the Brush component */}
            <ReferenceLine y={0} stroke="#000" />
            {/* Remove x-axis Label */}
            <Label value="Time" offset={0} position="insideBottomRight" />
        </LineChart>
    </ResponsiveContainer>
</div>


    <div style={{display:'flex', justifyContent:'space-between', margin:'20px 20px', alignItems:'center'}}>
        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%'}}>
            <ApexCharts
                options={{
                    chart: {
                        type: 'pie',
                    },
                    labels: calculateTaskPercentages().map(task => task.taskName),
                }}
                series={calculateTaskPercentages().map(task => task.value)}
                type="pie"
                width={600}
                height={400}
            />
        </div>
        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%' }}>
            <ApexCharts
                options={{
                    chart: {
                        type: 'pie',
                    },
                    labels: calculateOverallPercentages().map(task => task.taskName),
                }}
                series={calculateOverallPercentages().map(task => task.value)}
                type="pie"
                width={600}
                height={400}
            />
        </div>
    </div>
    
    

   


    </>
  )
}

export default EmployeeTaskStatus
