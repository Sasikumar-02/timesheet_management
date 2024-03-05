import React, { useEffect, useState } from 'react'
import DashboardLayout from '../Dashboard/Layout'
import {
    UserOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    SearchOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import dayjs from 'dayjs';
import Calendar from '../Employee/Calendar'; // Import your Calendar component
import { useNavigate } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';
//import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer , Area, AreaChart} from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, Brush, ReferenceLine, Label } from 'recharts';
import '../Styles/EmployeeTaskStatus.css';
import '../Styles/CreateUser.css';
import { notification, Card , ConfigProvider, Button} from 'antd';
import { Task } from '../Employee/AddTask';
import { UserGroupedTask } from './ApprovalRequest';
import { set } from 'lodash';
import { CatchingPokemonSharp } from '@mui/icons-material';
import asset from '../../assets/images/asset.svg'
import { Select, Input } from 'antd'; // Import the Select component from Ant Design
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import { TaskRequestedOn } from '../Employee/AddTask';
interface PerformanceDatum {
    taskName: string;
    totalHours: number;
}
const config: ThemeConfig = {
    token: {
      colorPrimary: "#0b4266",
   
      colorPrimaryBg: "rgba(155, 178, 192, 0.2)",
   
      colorFillAlter: "rgba(231, 236, 240, 0.3)",
   
      colorPrimaryBgHover: "rgba(155, 178, 192, 0.2)",
   
      borderRadiusLG: 4,
   
      colorFill: "#0b4266",
   
      colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
    },
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
  const [taskRequestedOn, setTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [approveTaskRequestedOn, setApproveTaskRequestedOn] = useState<TaskRequestedOn>({});

  // Load taskRequestedOn and approveTaskRequestedOn from localStorage on component mount
  useEffect(() => {
    const storedTaskRequestedOn = localStorage.getItem('taskRequestedOn');
    const storedApproveTaskRequestedOn = localStorage.getItem('approveTaskRequestedOn');
    if (storedTaskRequestedOn) {
      setTaskRequestedOn(JSON.parse(storedTaskRequestedOn));
    }
    if (storedApproveTaskRequestedOn) {
      setApproveTaskRequestedOn(JSON.parse(storedApproveTaskRequestedOn));
    }
  }, []);

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
    setSelectedUserId(selectedValues.length === 1 ? selectedValues[0] : null);
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

  const calculateFullPerformanceData = (): PerformanceDatum[] => {
    const taskHoursMap: { [taskName: string]: number } = {}; // Map to store accumulated hours for each task

    // Iterate over each user
    Object.values(groupedTasks).forEach((userTasks) => {
        // Iterate over each task group
        Object.values(userTasks).forEach((taskGroup) => {
            // Iterate over each date
            Object.values(taskGroup.tasks).forEach((dailyTasks) => {
                // Iterate over tasks for each date
                dailyTasks.tasks.forEach((task) => {
                    // Calculate total hours worked for each task
                    const totalTaskHours = parseFloat(task.totalHours);
                    // Accumulate hours for each task
                    if (taskHoursMap[task.task]) {
                        taskHoursMap[task.task] += totalTaskHours;
                    } else {
                        taskHoursMap[task.task] = totalTaskHours;
                    }
                });
            });
        });
    });

    // Convert the accumulated task hours into PerformanceDatum objects
    const performanceData: PerformanceDatum[] = Object.entries(taskHoursMap).map(([taskName, totalHours]) => ({
        taskName,
        totalHours,
    }));

    return performanceData;
};

// Call the function to calculate performance data
const fullPerformanceDataForManager: PerformanceDatum[] = calculateFullPerformanceData();

const calculatePerformanceData = (): PerformanceDatum[] => {
    const taskHoursMap: { [taskName: string]: number } = {}; // Map to store accumulated hours for each task

    // Determine the range of dates based on filterOption
    let startDate: string, endDate: string;
    if (filterOption === 'Month') {
        startDate = dayjs(currentMonth).startOf('month').format('YYYY-MM-DD');
        endDate = dayjs(currentMonth).endOf('month').format('YYYY-MM-DD');
    } else if (filterOption === 'Week') {
        startDate = dayjs(currentWeek).startOf('week').format('YYYY-MM-DD');
        endDate = dayjs(currentWeek).endOf('week').format('YYYY-MM-DD');
    } else {
        startDate = dayjs(currentDate).format('YYYY-MM-DD');
        endDate = startDate;
    }

    // Get the userId to filter tasks
    const userIdToFilter = filters.userId || selectedUserId; // Use selectedUserId if userId is not specified in filters
    console.log("calculatePerformanceData userId", userIdToFilter);
    // Iterate over each user
    if (userIdToFilter && groupedTasks[userIdToFilter]) {
        // Iterate over months for the selected user
        Object.values(groupedTasks[userIdToFilter]).forEach((monthTasks) => {
            // Check if the month matches the current month (if applicable)
            if (dayjs(monthTasks.month).isSame(currentMonth, 'month') || filterOption !== 'Month') {
                // Iterate over dates for each month
                Object.keys(monthTasks.tasks).forEach((date) => {
                    // Check if the date is within the range
                    if ((dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate)) && (dayjs(date).isSame(endDate) || dayjs(date).isBefore(endDate))) {
                        // Iterate over tasks for the current date
                        monthTasks.tasks[date].tasks.forEach((task) => {
                            // Check if the task belongs to the selected user
                            if (task.userId === userIdToFilter) {
                                // Calculate total hours worked for each task
                                const totalTaskHours = parseFloat(task.totalHours);
                                // Accumulate hours for each task
                                if (taskHoursMap[task.task]) {
                                    taskHoursMap[task.task] += totalTaskHours;
                                } else {
                                    taskHoursMap[task.task] = totalTaskHours;
                                }
                            }
                        });
                    }
                });
            }
        });
    } else{
        Object.values(groupedTasks).forEach((userTasks) => {
            console.log("calculatePerformanceData userTasks",userTasks);
            // Iterate over months for each user
            Object.values(userTasks).forEach((monthTasks) => {
                console.log("calculatePerformanceData monthTasks",monthTasks);
                // Check if the month matches the current month (if applicable)
                console.log("calculatePerformanceData monthTasks",monthTasks);
                if (dayjs(monthTasks.month).isSame(currentMonth, 'month') || filterOption !== 'Month') {
                    // Iterate over dates for each month
                    Object.keys(monthTasks.tasks).forEach((date) => {
                        // Check if the date is within the range
                        if ((dayjs(date).isSame(startDate) || dayjs(date).isAfter(startDate))&& (dayjs(date).isSame(endDate)|| dayjs(date).isBefore(endDate))) {
                            // Iterate over tasks for the current date
                            monthTasks.tasks[date].tasks.forEach((task) => {
                                // Calculate total hours worked for each task
                                const totalTaskHours = parseFloat(task.totalHours);
                                // Accumulate hours for each task
                                if (taskHoursMap[task.task]) {
                                    taskHoursMap[task.task] += totalTaskHours;
                                } else {
                                    taskHoursMap[task.task] = totalTaskHours;
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Convert the accumulated task hours into PerformanceDatum objects
    const performanceData: PerformanceDatum[] = Object.entries(taskHoursMap).map(([taskName, totalHours]) => ({
        taskName,
        totalHours,
    }));

    return performanceData;
};

// Call the function to calculate performance data
const performanceDataForManager: PerformanceDatum[] = calculatePerformanceData();
    
    const handleFilterChange = (value: any) => {
        setFilterOption(value);
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

  
  return (
    <DashboardLayout>
        <h1>Manager</h1>

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
                alt="..."
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
                <Button id='submit-less' onClick={handleLeftArrowClick}> 
                    <LeftOutlined />
                </Button>
                <Button id='submit-less' onClick={handleRightArrowClick}>
                    <RightOutlined />
                </Button>
            </ConfigProvider>
            <div className='employeetask'>
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
        <div style={{display:'flex', justifyContent:'flex-end', height:'15%', marginRight:'20px', marginTop:'10px'}}>
        <div>
            <Select
                showSearch
                style={{ width: 200, marginRight: 8, height: 40, color:'white', textAlign:'left' }}
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

            <div>
              <Button
                style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'65px', textAlign:"center", marginLeft:'20px', marginTop:'0px', paddingTop:'8px'}}
                className='regenerateactive'
                onClick={handleClearFilters}
              >
              Clear
              </Button>
            </div>
            <ConfigProvider theme={config}>
                <Select 
                    id='submit' 
                    style={{color:'white', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none'}} 
                    onChange={(value) => handleFilterChange(value)} 
                    value={filterOption}
                    dropdownStyle={{ textAlign: 'center' }} // Style the dropdown menu
                >
                    <Option value='Date'>Date</Option>
                    <Option value='Week'>Week</Option>
                    <Option value='Month'>Month</Option>
                </Select>
            </ConfigProvider>
        </div>
    </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'20px 20px', alignItems:'center'}}>
        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%'}}>
            <ApexCharts
                options={{
                    chart: {
                        type: 'pie',
                    },
                    labels: fullPerformanceDataForManager.map(data => data.taskName),
                }}
                series={fullPerformanceDataForManager.map(data => data.totalHours)}
                type="pie"
                width={600}
                height={300}
            />
        </div>
        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'48%' }}>
            <ApexCharts
                options={{
                    chart: {
                        type: 'pie',
                    },
                    labels: performanceDataForManager.map(task => task.taskName),
                }}
                series={performanceDataForManager.map(data => data.totalHours)}
                type="pie"
                width={600}
                height={300}
            />
        </div>
    </div>
    </DashboardLayout>
  )
}

export default ManagerDashboard;