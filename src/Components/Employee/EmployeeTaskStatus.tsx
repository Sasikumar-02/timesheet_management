import React, { useEffect, useState } from 'react'
import DashboardLayout from '../Dashboard/Layout'
import {
    UserOutlined,
    DownOutlined,
    LeftOutlined,
    RightOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import dayjs from 'dayjs';
import api from '../../Api/Api-Service';
import Calendar from './Calendar'; // Import your Calendar component
import { useNavigate, useLocation } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';
//import { PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer , Area, AreaChart} from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, ResponsiveContainer, Brush, ReferenceLine, Label } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import '../Styles/EmployeeTaskStatus.css';
import '../Styles/CreateUser.css';
import { notification, Card , ConfigProvider, Button} from 'antd';
import { Task } from './AddTask';
import '../Styles/AddTask.css';
import { set } from 'lodash';
import { CatchingPokemonSharp } from '@mui/icons-material';
import asset from '../../assets/images/asset.svg'
import { Select } from 'antd'; // Import the Select component from Ant Design
import { RecentRejected } from '../Manager/MonthTasks';
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import { RejectedKeys, SelectedKeys } from '../Manager/MonthTasks';
import { jwtDecode } from 'jwt-decode';
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
export interface DecodedToken {
  Role: string;
  UserId: string;
}
 

interface EmployeeTaskStatusProps{
    setSelectedMonth: React.Dispatch<React.SetStateAction<string>>;
    setSelectedYear: React.Dispatch<React.SetStateAction<string>>;
    pendingTask: string[];
}

const EmployeeTaskStatus = () => {
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const [filterOption, setFilterOption] = useState('Month');
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
    const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [approvedKeys, setApprovedKeys]= useState<string[]>([]);
    const [rejectedKeys, setRejectedKeys]= useState<RecentRejected[]>([]);
    const [rejectCount, setRejectCount]= useState(0);
    const [acceptCount, setAcceptCount]= useState(0);
    const [missedCount, setMissedCount]= useState(0);
    const [pendingCount, setPendingCount]= useState(0);
    const [pendingTask, setPendingTask]= useState<string[]>([]);
    const [performanceData, setPerformanceData] = useState<{ date: string, percentage: number }[]>([]);
    const [chartWidth, setChartWidth] = useState(window.innerWidth * 0.7); // Set initial chart width to 90% of window width
    const [selectedMonth, setSelectedMonth]=useState<string>('');
    const [selectedYear, setSelectedYear]=useState<string>('');
    const [userName, setUserName]=useState('');
    const [workFromHomeCount, setWorkFromHomeCount] = useState(0);
    const [workFromOfficeCount, setWorkFromOfficeCount] = useState(0);
    const [recentApproved, setRecentApproved] = useState([]);
    const [recentRejected, setRecentRejected] = useState<RecentRejected[]>([]);
    const [monthCounts, setMonthCounts]= useState({
        acceptedCount:0,
        notFilledDays:0,
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

    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token || "") as DecodedToken;
    const userId = decoded.UserId;
    const chartOptions = {
        maintainAspectRatio: false,
        responsive: true,
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
      

      const fetchMonthlyReport = async (month:any, year:any) => {
        try {
          const response = await api.get('/api/v1/timeSheet/fetch-monthly-report', {
            params: {
              month,
              year
            }
          });
      
          const responseData = response.data.response.data;
          const countsObject = {
            acceptedCount: responseData.acceptedCount,
            notFilledDays: responseData.notFilledDays,
            pendingCount: responseData.pendingCount,
            rejectedCount: responseData.rejectedCount
          };
          console.log("response-new", countsObject);
          setMonthCounts(countsObject);
        } catch (error) {
          throw error;
        }
      };

      useEffect(()=>{
        const fetchData = async()=>{
            try{
                const response = await api.get('/api/v1/admin/employee-list')
                const data = response.data.response.data;
  
                console.log('Fetched data:', data);
                
                const employee = data.filter((emp: any) => emp.userId === userId).map((emp:any)=>emp?.firstName);
                setUserName(employee);
            }
            catch(err){
                throw err;
            }
            
        }
        fetchData();
      },[])
      
      useEffect(() => {
        const monthName = currentMonth.format('MMMM'); // Get full month name (e.g., "April")
        const year = currentMonth.format('YYYY'); // Get year (e.g., "2024")
      
        fetchMonthlyReport(monthName, year);
        fetchPieReport(monthName, year, userId);
        fetchDoughReport(monthName, year, userId);
      }, [currentMonth, userId, userName]);

   
    const fetchPieReport=async(month:any, year:any, employeeId:any)=>{
        try{
            const response = await api.get('/api/v1/timeSheet/monthly-task-distribution',{
            params:{
                month,
                year,
                employeeId
            } 
        })
        console.log("response-pie", response.data.response.data.categoryPercentages);
        setPieChartData(response.data.response.data.categoryPercentages);
        }
        catch(err){
            throw err;
        }  
    }

    const fetchDoughReport=async(month:any, year:any,employeeId:any)=>{
        try{
            const response = await api.get('/api/v1/timeSheet/monthly-location-distribution',{
            params:{
                month,
                year,
                employeeId
            } 
        })
        console.log("response-dough", response.data.response.data);
        setDoughChartData(response.data.response.data.locationPercentages);
        }
        catch(err){
            throw err;
        }  
    }
    

    useEffect(() => {
        // Fetch recentApproved dates from localStorage
        const recentApprovedFromStorage = JSON.parse(localStorage.getItem("recentApproved") || "[]");
        setRecentApproved(recentApprovedFromStorage);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth * 0.2); // Update chart width when window is resized
        };

        window.addEventListener('resize', handleResize); // Add event listener for window resize

        return () => {
            window.removeEventListener('resize', handleResize); // Remove event listener on component unmount
        };
    }, []);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1973'];


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
    
    const handleCountClick = (status: string, filterOption: string, currentDate: string, currentMonth: string, currentWeek: any) => {
        // Determine the clickedDate based on the filterOption
        let clickedDate;
        if (filterOption === "Month") {
            clickedDate = dayjs(currentMonth).startOf('month').format('YYYY-MM-DD');
        } else if (filterOption === "Week") {
            clickedDate = dayjs(currentWeek).startOf('week').format('YYYY-MM-DD');
        } else {
            clickedDate = dayjs(currentDate).format('YYYY-MM-DD');
        }
        // Navigate to the calendar for the specific month based on the filter option
        const month = getCurrentMonth(filterOption, currentDate, currentMonth, currentWeek);
        const year = getCurrentYear(filterOption, currentDate, currentMonth, currentWeek);
    
        console.log("handleCountClick", month, year);
        setSelectedYear(year);
        setSelectedMonth(month);
        
        // Store the clickedDate in localStorage
        localStorage.setItem('clickedDate', clickedDate);
        
        navigate(`/employee/calendar?month=${month}&year=${year}&status=${status}`, {state:{month, year}});
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
              description: 'Cannot navigate to future date.',
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

      function getWeekOfMonth(date: dayjs.Dayjs): number {
        const firstDayOfMonth = date.startOf('month').day();
        const firstWeek = Math.ceil((1 + (7 - firstDayOfMonth)) / 7);
        const currentWeek = Math.ceil((date.date() + firstDayOfMonth) / 7);
        return currentWeek - firstWeek ;
    }
  return (
    <>
    <div style={{margin:'30px 0px 0px 0px'}}>
            <Card className="main-card">
            <div style={{ display: "flex", height:'55px' }}>
                <div>
                <h3 style={{textAlign:'left', marginTop:'0px', marginBottom:'0px'}}>Welcome {userName ? userName : ""}
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

    <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', justifyContent:'flex-end', height:'47px', margin:'0px 20px 10px 20px'}}>
        {/* id='submit-less' */}
            <ConfigProvider theme={config}>
                <Button id='submit-icon' onClick={handleLeftArrowClick}> 
                {/* if id is submit-less then the button color is blue */}
                    <LeftOutlined />
                </Button>
                {/* <select 
                    id='submit' 
                    style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} 
                    onChange={(e) => handleFilterChange(e.target.value)} value={filterOption}
                >
                    <option style={{textAlign:'center'}} value='Date'>Date</option>
                    <option style={{textAlign:'center'}} value='Week'>Week</option>
                    <option style={{textAlign:'center'}} value='Month'>Month</option>
                </select> */}
                <Button id='submit-icon' onClick={handleRightArrowClick}>
                    <RightOutlined />
                </Button>
            </ConfigProvider>
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
        </div>
        
        <div style={{display:'flex', justifyContent:'flex-end', height:'15%', marginRight:'20px', marginTop:'10px'}}>
                {/* <button type='button' id='submit-less' onClick={handleLeftArrowClick}>
                    <LeftOutlined />
                </button> */}
                {/* <ConfigProvider theme={config}>
                <Select 
                    id='submit' 
                    style={{color:'white', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} 
                    onChange={(value) => handleFilterChange(value)} 
                    value={filterOption}
                    dropdownStyle={{ textAlign: 'center' }} // Style the dropdown menu
                >
                    <Option value='Date'>Date</Option>
                    <Option value='Week'>Week</Option>
                    <Option value='Month'>Month</Option>
                </Select>
                </ConfigProvider> */}

                {/* <button type='button' id='submit-less' onClick={handleRightArrowClick}>
                    <RightOutlined />
                </button> */}
        </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className='box' onClick={() => handleCountClick('Missed', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', textAlign:'center', fontWeight:'bold' }}>Not Filled</p>
                <p style={{ color: '#FF8C00', fontSize: '34px', fontFamily: 'poppins' }}> {monthCounts.notFilledDays}</p>
            </div>
        </button>
        <button className='box' onClick={() => handleCountClick('Pending', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', fontWeight:'bold'}}>Pending</p>    
                <p style={{ color: '#FFD700', fontSize: '34px', fontFamily: 'poppins' }}>{monthCounts.pendingCount}</p>

            </div>
        </button>
        <button className='box' onClick={() => handleCountClick('Accepted',filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266' , fontWeight:'bold'}}>Accepted</p>
                <p style={{ color: '#32CD32	', fontSize: '34px', fontFamily: 'poppins' }}>{monthCounts.acceptedCount}</p>
            </div>
        </button>
        <button className='box' onClick={() => handleCountClick('Rejected', filterOption, currentDate.toString(), currentMonth.toString(), currentWeek)} style={{ border: 'none', background: 'none', cursor:'pointer' }} title="Click to view the Calendar">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-around'}}>
                <p style={{ fontFamily: 'poppins', fontSize: '16px', color: '#0B4266', fontWeight:'bold' }}>Rejected</p>
                <p style={{ color: 'red', fontSize: '34px', fontFamily: 'poppins' }}> {monthCounts.rejectedCount}</p>
            </div>
        </button>
    </div>
  {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom:'20px',marginLeft: '20px', marginRight: '20px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px' }}>
    <ResponsiveContainer width="80%" height={400}>
        <LineChart data={performanceData}>
            <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
            </defs>
            <XAxis dataKey="date">
                {/* Remove x-axis title 
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
            {/* Remove the Brush component 
            <ReferenceLine y={0} stroke="#000" />
            {/* Remove x-axis Label 
            <Label value="Time" offset={0} position="insideBottomRight" />
        </LineChart>
    </ResponsiveContainer>
</div> */}


    <div style={{display:'flex', justifyContent:'space-between', margin:'20px 20px', alignItems:'center'}}>
        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%'}}>
            <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Task Percentage</h2>
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
                    {
                        Object.entries(pieChartData).map(([name], index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length]} />
                        ))
                    }
                </Pie>
                <Tooltip />
            </PieChart>
        </div>

        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'48%' }}>
            <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Work Location Percentage</h2>
            <div style={{ height: '300px' }}>
                <Doughnut data={data} options={chartOptions} />
            </div>
        </div>


    </div>
    </>
  )
}

export default EmployeeTaskStatus
