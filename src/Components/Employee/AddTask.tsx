import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Input, TimePicker, Select, notification, DatePicker, Button, Modal, Col,
  ConfigProvider,
  Form,
  Row,
  Typography,
  message,} from 'antd';
import * as yup from "yup";
import { ErrorMessage, Formik, FormikFormProps, FormikHelpers, Field } from "formik";
import { useFormikContext } from 'formik';
import { SearchOutlined } from '@mui/icons-material';
import api from '../../Api/Api-Service';
import dayjs from 'dayjs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import '../Styles/CreateUser.css';
import axios from 'axios';
import DashboardLayout from '../Dashboard/Layout';
import Chart from 'react-apexcharts';
import '../Styles/AddTask.css';
import {Table} from 'antd';
import { ColumnsType } from "antd/es/table";
import ApprovalRequest from '../Manager/ApprovalRequest';
import { EditOutlined, DeleteOutlined,CloseCircleOutlined,LeftOutlined, RightOutlined } from '@ant-design/icons';
import Dashboard from './Dashboard';
import asset from '../../assets/images/asset.svg';
import type { ThemeConfig } from "antd";
import TextArea from 'antd/es/input/TextArea';
import { values } from 'lodash';
import moment from 'moment';
import { DecodedToken } from './EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
import { initInputToken } from 'antd/es/input/style';
let setFieldValue: Function;
export interface DateTask{
  key: string;
  tasks: Task[];
  status?: string;
}

export interface RequestedOn {
  [key: string]: string[]; 
}

export interface TaskRequestedOn {
  [userId: string]: RequestedOn; 
}

type FieldType = {
  date?: string;
  workLocation?: string;
  task?: string;
  project?: string;
  managerAssignedTask?: {
    managerAssignedTaskId: string;
    managerAssignedTaskName: string;
  } | null;
  startTime?: string;
  endTime?: string;
  totalHours?: string;
  description?: string;
  reportingTo?: string;
};

export interface Task {
  userId?:string;
  task_id?:string;
  date: string;
  workLocation: string;
  task: string;
  project: string;
  managerAssignedTask:string;
  startTime: string;
  endTime: string;
  totalHours: string;
  description: string;
  reportingTo: string;
}

export interface ProjectDetails {
  projectName: string;
}

interface ManagerAssignedTask{
  taskId?:any;
  taskName?:string;
}
interface UserManager {
  reportingManagerName: string;
  reportingManagerId: string;
}
interface PieChartData {
  options: {
    labels: string[];
  };
  series: number[];
}

const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

const AddTask: React.FC = () => {
  const token = localStorage.getItem("authToken");
  const decoded = jwtDecode(token || "") as DecodedToken;
  const userId = decoded.UserId;
  const location = useLocation();
  const { record } = location.state || {};  
  console.log("record", record);
  const [reportingTo, setReportingTo] = useState<UserManager[]>([]);
  const [reportingToID, setReportingToID] = useState('1234');
  const [startTime, setStartTime]= useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours]=useState('');
  const [editTaskId, setEditTaskId]= useState<any>();
  const { Option } = Select;
  const navigate = useNavigate();
  const {confirm}= Modal;
  const { formattedDate } = location.state || { formattedDate: dayjs() };
  const [formWidth, setFormWidth] = useState(800);
  const [currentDate, setCurrentDate] = useState(dayjs(record?.date || formattedDate));
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [cancelButton, setCancelButton] = useState(false);
  const [allowDate, setAllowDate]= useState(dayjs().format('YYYY-MM-DD'));
  console.log("allowDate", allowDate);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const taskOptions = ['Manager Assigned Task','Project','Learning','Training','Meeting', 'Interview'];
  const [filterOption, setFilterOption] = useState('Date');
  const [isEdited, setIsEdited]= useState<boolean>(false);
  const [selectedKeysToHide, setSelectedKeysToHide]=useState<string[]>([]);
  const [pieChartDataInForm, setPieChartDataInForm] = useState<PieChartData>({ options: { labels: [] }, series: [] });
  const [projectData, setProjectData] = useState<ProjectDetails[]>([
    {
      projectName: "Other"
    }
  ]);
  const [managerGivenTask, setManagerGivenTask]= useState<ManagerAssignedTask[]>([]);
  const [submissionEnable, setSubmissionEnable] = useState(true);
  console.log("submissionEnable",submissionEnable);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvedRequest, setApprovedRequest]= useState<any[]>([]);
  console.log("approvedRequest",approvedRequest);
  const [initialValue, setInitialValue] = useState<any>(() => {
    if (record) {
        return {
            timeSheetId: record?.timeSheetId,
            date: dayjs(record?.date).format('YYYY-MM-DD'),
            workLocation: record?.workLocation,
            task: record?.task,
            project: record?.project,
            managerAssignedTask:record?.managerAssignedTask.managerAssignedTaskName,
            startTime: record?.startTime,
            endTime: record?.endTime,
            totalHours: record?.totalHours,
            description: record?.description,
            reportingTo: record?.reportingTo || '', 
        };
    } else {
        return {
            timeSheetId: 0,
            date: dayjs(currentDate).format('YYYY-MM-DD'),
            workLocation: '',
            task: '',
            project: '',
            managerAssignedTask:'',
            startTime: '',
            endTime: '',
            totalHours: '',
            description: '',
            reportingTo: '', 
        };
    }
});

const [modalInitialValue, setModalInitialValue]= useState<any>({
  month: filterOption === "Date"
    ? dayjs(currentDate).startOf('month').format('MMMM YYYY')
    : filterOption === "Week"
    ? dayjs(currentWeek).startOf('month').format('MMMM YYYY')
    : dayjs(currentMonth).startOf('month').format('MMMM YYYY'),
  reportingTo:'',
  description:''
})
console.log("isFormEnabled-cancelButton-isEdited", isFormEnabled, cancelButton, isEdited);
console.log("currentDate, currentMonth, currentWeek", currentDate, currentMonth, currentWeek)
useEffect(() => {
  const fetchData = async () => {
      try {
          const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
          console.log("fetchTaskManager", response.data.response.data);
      } catch (error) {
          throw error;
      }
  };

  fetchData();
}, []);

useEffect(()=>{
  setModalInitialValue({
    month: filterOption === "Date"
      ? dayjs(currentDate).startOf('month').format('MMMM YYYY')
      : filterOption === "Week"
      ? dayjs(currentWeek).startOf('month').format('MMMM YYYY')
      : dayjs(currentMonth).startOf('month').format('MMMM YYYY'),
    reportingTo:'',
    description:''
  })
}, [filterOption, currentMonth, currentWeek, currentDate])


useEffect(() => {
  const fetchData = async () => {
      const response = await api.get('/api/v1/timeSheet/fetch-month-block-requests');
      console.log("response", response.data.response.data);
      let approvedArray:any[]=[];
      response.data.response.data.map((status:any)=>{
        console.log("status", status);
        if (status.approvalStatus === "Approved") {
          approvedArray.push(status.requestedMonth);
        }
      })
      setApprovedRequest(approvedArray);
  }
  fetchData();
}, []);

useEffect(() => {
  if (record) {
    setIsEdited(true); 
    setCancelButton(true);
    setIsFormEnabled(true);
    setEditTaskId(record?.timeSheetId);
  }
}, [record]);
console.log("submissionEnable", submissionEnable);
useEffect(() => {
  if (!isEdited) {
      if (filterOption === 'Date') {
          const selectedDate = dayjs(currentDate);
          const todayDate = dayjs().format('YYYY-MM-DD');
          setInitialValue({
              ...initialValue,
              date: selectedDate.format('YYYY-MM-DD'),
          });
          setAllowDate(selectedDate.format('YYYY-MM-DD'));
          handleApprovedRequest(selectedDate.format('YYYY-MM'));
          const firstDayOfCurrentMonth = dayjs().startOf('month').format('YYYY-MM-DD')
          const previousMonth = dayjs(firstDayOfCurrentMonth).subtract(1, 'month').startOf('month');
          console.log("todayDate-firstDayOfCurrentMonth-previousMonth-selectedDate",todayDate,firstDayOfCurrentMonth,previousMonth, selectedDate)
          if ((selectedDate.isSame(firstDayOfCurrentMonth, 'day')|| selectedDate.isAfter(firstDayOfCurrentMonth,'day')) && selectedDate.isSame(firstDayOfCurrentMonth, 'month')) {
            setSubmissionEnable(true);
        } else if ( (todayDate===firstDayOfCurrentMonth) && dayjs(selectedDate).format('YYYY-MM') === previousMonth.format('YYYY-MM')) {
          setSubmissionEnable(true);
      } else {
          setSubmissionEnable(false);
      }

      } else if (filterOption === 'Week') {
          const selectedWeek = dayjs(currentWeek);
          const todayDate = dayjs().format('YYYY-MM-DD');
          setInitialValue({
              ...initialValue,
              date: selectedWeek.format('YYYY-MM-DD'),
          });
          setAllowDate(selectedWeek.format('YYYY-MM-DD'));
          handleApprovedRequest(selectedWeek.format('YYYY-MM'));
          const firstDayOfCurrentMonth = dayjs().startOf('month').format('YYYY-MM-DD')
          const previousMonth = dayjs(firstDayOfCurrentMonth).subtract(1, 'month').startOf('month');
          console.log("todayDate-firstDayOfCurrentMonth-previousMonth-selectedWeek",todayDate,firstDayOfCurrentMonth,previousMonth, selectedWeek)
          if ((selectedWeek.isSame(firstDayOfCurrentMonth, 'day')|| selectedWeek.isAfter(firstDayOfCurrentMonth,'day')) && selectedWeek.isSame(firstDayOfCurrentMonth, 'month')) {
            setSubmissionEnable(true);
          } else if ( (todayDate===firstDayOfCurrentMonth) && dayjs(selectedWeek).format('YYYY-MM') === previousMonth.format('YYYY-MM')) {
            setSubmissionEnable(true);
          } else {
              setSubmissionEnable(false);
          }
      } else if (filterOption === 'Month') {
          const selectedMonth = dayjs(currentMonth);
          const todayDate = dayjs().format('YYYY-MM-DD');
          setInitialValue({
              ...initialValue,
              date: selectedMonth.format('YYYY-MM-DD'),
          });
          setAllowDate(selectedMonth.format('YYYY-MM-DD'));
          handleApprovedRequest(selectedMonth.format('YYYY-MM'));
          const firstDayOfCurrentMonth = dayjs().startOf('month').format('YYYY-MM-DD')
          const previousMonth = dayjs(firstDayOfCurrentMonth).subtract(1, 'month').startOf('month');
          console.log("todayDate-firstDayOfCurrentMonth-previousMonth-selectedMonth",todayDate,firstDayOfCurrentMonth,previousMonth, selectedMonth)
          if ((selectedMonth.isSame(firstDayOfCurrentMonth, 'day')|| selectedMonth.isAfter(firstDayOfCurrentMonth,'day')) && selectedMonth.isSame(firstDayOfCurrentMonth, 'month')) {
            setSubmissionEnable(true);
          } else if ( (todayDate===firstDayOfCurrentMonth) && dayjs(selectedMonth).format('YYYY-MM') === previousMonth.format('YYYY-MM')) {
            setSubmissionEnable(true);
          } else {
              setSubmissionEnable(false);
          }
      }
  }
}, [filterOption, isEdited, currentDate, currentMonth, currentWeek]);

const handleProject=async(value:string)=>{
  console.log("handleProject-value", value);
  if (value === 'Manager Assigned Task') {
    const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
    let projectArray: any[] = [];

    response.data.response.data.forEach((project: any) => {
        // Check if the project name already exists in projectArray
        const exists = projectArray.some(item => item.projectName === project.projectName);

        // If the project name doesn't exist, push it to projectArray
        if (!exists) {
            projectArray.push({
                projectName: project.projectName,
            });
        }
    });

    setProjectData(projectArray);
  } else{
    try {
      const response = await api.get('/api/v1/project/get-project-of-user/' + userId);
      console.log("userId", userId);
      const data = response?.data?.response?.data;
      console.log("fetchData", data);

      // Initialize an empty array to store updated projects
      const updatedProjects: any[] = [];

      // Loop through each project to update only the projectName
      data.forEach((project: any) => {
        // Store the updated project with modified projectName in the array
        const updatedProject = {
          ...project,
          projectName: project?.projectName, // Replace "New Project Name" with the desired value
        };
        console.log("updatedProject", updatedProject);
        updatedProjects.push(updatedProject);
      });
      const otherProject = {
        projectName: "Other",
        // Add other properties as needed
      };
      
      // Add the "Other" project data object to the updatedProjects array
      const updatedProjectsWithOther = [...updatedProjects, otherProject];
      
      // Set the projectData state with the updated array including the "Other" project
      setProjectData(updatedProjectsWithOther);
    } catch (error: any) {
      if (error.response?.status === 403) {
        message.error("Session expired. Redirecting to login page...", 5, () => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("role");
          navigate("/login");
        });
      }
    }
  }
}

const handleManagerAssignedTask=async(value:string)=>{
  console.log("handleManagerAssignedTask-value", value);
  const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
  let taskArray: any[] = [];
  response.data.response.data.map((task:any)=>{
    taskArray.push({
      taskId: task.taskId,
      taskName: task.taskName
    })
  })
  setManagerGivenTask(taskArray);
}

const handleApprovedRequest = (date: string) => {
  console.log("handleApprovedRequest", date);
  setApprovedRequest((prevApprovedRequest) => {
    const updatedApprovedRequest = [...prevApprovedRequest];
    if (updatedApprovedRequest.includes(date)) {
      setSubmissionEnable(true);
    }
    return updatedApprovedRequest;
  });
};

useEffect(() => {
  // Assuming 'date' is defined elsewhere
  if (approvedRequest.includes(allowDate)) {
    setSubmissionEnable(true);
  }
}, [approvedRequest, dayjs(allowDate).format('YYYY-MM')]); // Include 'date' as a dependency if it's used in the effect


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/v1/admin/employee-list`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = response?.data?.response?.data;
  
        console.log('Fetched data:', data);
        
        const employee = data.find((emp: any) => emp?.userId === userId);
        console.log("employee", employee);
        if (employee) {
          // Assuming reportingTo is an array
          const reportingManager: UserManager = {
            reportingManagerName: employee?.reportingMangerName,
            reportingManagerId: employee?.reportingManagerId,
          };
          console.log("reportingManager",reportingManager);
          setReportingTo([reportingManager]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData(); // Call the fetchData function
  }, []);
  console.log(reportingTo)
  console.log("final-filterTaask", filteredTasks);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/v1/project/get-project-of-user/' + userId);
        console.log("userId", userId);
        const data = response?.data?.response?.data;
        console.log("fetchData", data);
  
        // Initialize an empty array to store updated projects
        const updatedProjects: any[] = [];
  
        // Loop through each project to update only the projectName
        data.forEach((project: any) => {
          // Store the updated project with modified projectName in the array
          const updatedProject = {
            ...project,
            projectName: project?.projectName, // Replace "New Project Name" with the desired value
          };
          console.log("updatedProject", updatedProject);
          updatedProjects.push(updatedProject);
        });
        const otherProject = {
          projectName: "Other",
          // Add other properties as needed
        };
        
        // Add the "Other" project data object to the updatedProjects array
        const updatedProjectsWithOther = [...updatedProjects, otherProject];
        
        // Set the projectData state with the updated array including the "Other" project
        setProjectData(updatedProjectsWithOther);
      } catch (error: any) {
        if (error.response?.status === 403) {
          message.error("Session expired. Redirecting to login page...", 5, () => {
            localStorage.removeItem("authToken");
            localStorage.removeItem("role");
            navigate("/login");
          });
        }
      }
    };
    fetchData();
  }, []);
  

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks from the API
        const response = await api.get('/api/v1/timeSheet/fetch-tasks-by-employee');
        console.log("response-fulldata", response?.data?.response?.data);
        let filteredTasks: any[] = [];
        if (filterOption === 'Date') {
          let date = dayjs(currentDate).format('YYYY-MM-DD');
          console.log('response-date', date);
          console.log("response-currentDate", currentDate);
          // Filter tasks based on currentDate
          filteredTasks = response?.data?.response?.data?.filter((task: any) => {
            // Assuming the task has a date property named "date"
            // Modify this condition according to your task structure
            return task.date === date;
          });
        } else if (filterOption === 'Week') {
          const startOfWeek = currentWeek.startOf('week');
          const endOfWeek = currentWeek.endOf('week');
          filteredTasks = response?.data?.response?.data?.filter(
            (task: any) =>
              (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
              (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek))
  
          );
        } else {
          const startOfMonth = currentMonth.startOf('month');
          const endOfMonth = currentMonth.endOf('month');
          filteredTasks = response?.data?.response?.data?.filter(
            (task: any) =>
              (dayjs(task.date).isSame(startOfMonth) || dayjs(task.date).isAfter(startOfMonth)) &&
              (dayjs(task.date).isSame(endOfMonth) || dayjs(task.date).isBefore(endOfMonth))
  
          );
        }
  
        console.log("response-filteredData", filteredTasks);
  
        // Find the first task with status "Approved" for each date
        const approvedDates = filteredTasks.reduce((acc: string[], task: any) => {
          if (task.taskStatus === "Approved" && !acc.includes(task.date)) {
            acc.push(task.date);
          }
          return acc;
        }, []);
  
        // Update the state with the filtered tasks
        setFilteredTasks(filteredTasks);
        console.log("approvedDates", approvedDates);
        // Update selectedKeysToHide state with approved dates
        setSelectedKeysToHide(approvedDates);
      } catch (error) {
        // Handle errors
        console.error('Error fetching tasks:', error);
        // You can also show a notification or perform other error handling here
      }
    };
    // Call the fetchTasks function
    fetchTasks();
  }, [refetch, currentDate, currentWeek, currentMonth, filterOption]); // Empty dependency array to fetch tasks only once when the component mounts
  


  // Function to calculate and update totalHours


  const updateTotalHours = (startTime: any, endTime: any, setFieldValue: Function) => {
    if (startTime && endTime) {
      const start = dayjs(startTime, 'HH:mm');
      console.log("upatedTotalHours-start", start);
      const end = dayjs(endTime, 'HH:mm');
      console.log("upatedTotalHours-end", end);
      const duration = end.diff(start, 'minute', true); // Calculate difference in minutes
      console.log("upatedTotalHours-duration", duration);
      const hours = Math.floor(duration / 60); // Extract hours
      console.log("upatedTotalHours-hours", hours);
      const minutes = duration % 60; // Extract remaining minutes
      console.log("upatedTotalHours-minutes", minutes);
      const formattedDuration = hours + (minutes / 100); // Combine hours and minutes
      console.log("upatedTotalHours-formattedDuration", formattedDuration);
      console.log("upatedTotalHours-formattedDuration", formattedDuration.toFixed(2));
      setFieldValue("totalHours", formattedDuration.toFixed(2)); // Update totalHours
    }
};
  const workLocation = ['Work From Home', 'Office', 'Client Location', 'On-Duty'];

  useEffect(() => {
    const updateFormWidth = () => {
      const formElement = document.getElementById('myForm');
      if (formElement) {
        const newWidth = formElement.offsetWidth;
        setFormWidth(newWidth);
      }
    };

    window.addEventListener('resize', updateFormWidth);
    updateFormWidth();

    return () => {
      window.removeEventListener('resize', updateFormWidth);
    };
  }, []); //no use

  const borderStyle = {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Add box shadow
    margin: '10px 20px',
   // padding: '10px 20px',
    //width: formWidth + 'px',
    width: '1350px',
    height:'540px'
  };


  useEffect(() => {
    // Calculate data for the pie chart
    const taskHours: { [key: string]: number } = {};
    
    // Calculate total hours worked
    let totalHours = 0;
    filteredTasks.forEach(task => {
      // Convert totalHours to a number before adding
      totalHours += parseFloat(task.totalHours) || 0;
    });

    // Calculate hours for each task and add to the taskHours object
    filteredTasks.forEach(task => {
      // Convert totalHours to a number before calculating percentage
      const taskHoursValue = parseFloat(task.totalHours) || 0;
      // Check if the task name exists in the taskHours object
      if (taskHours[task.task]) {
        // If it exists, add the hours to the existing value
        taskHours[task.task] += taskHoursValue;
      } else {
        // If it doesn't exist, initialize the value with the hours
        taskHours[task.task] = taskHoursValue;
      }
    });

    // Calculate percentage for each task
    const taskPercentage: { [key: string]: number } = {};
    Object.keys(taskHours).forEach(taskName => {
      taskPercentage[taskName] = (taskHours[taskName] / totalHours) * 100;
    });

    const labels = Object.keys(taskHours);
    const data = Object.values(taskPercentage);

    // Update pie chart data
    setPieChartDataInForm({
      options: {
        labels: labels,
      },
      series: data,
    });
  }, [filteredTasks]); //this is for piechart

  <Chart
    options={pieChartDataInForm.options}
    series={pieChartDataInForm.series}
    type="pie"
    width="380"
  />

  const handleFilterChange = (value: any) => {
    setFilterOption(value);
    setRefetch((prevState: any) =>  !prevState);
  };

  const handleLeftArrowClick = () => {
    if (filterOption === 'Date') {
      console.log("handleLeftArrowClick -prev", currentDate);
      const previousDate = currentDate.subtract(1, 'day');
      console.log("handleLeftArrowClick previousDate",previousDate)
      setCurrentDate(dayjs(previousDate));

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
          description: 'Cannot navigate to future dates.',
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

  const hoursDecimalToHoursMinutes = (decimalHours:any) => {
    // Split the decimal value into hours and minutes
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 100);
    console.log("hours minutes",hours, minutes);
    // Return the formatted string
    if(hours===0 && minutes===0){
        return '➖';
    }
    return `${hours}h ${minutes}min`;
  };

  const hoursTimeToHoursMinutes = (decimalHours: string) => {
    // Parse the decimal hours string
    const [hoursStr, minutesStr] = decimalHours.split(':');
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    // Return the formatted string
    if (hours === 0 && minutes === 0) {
        return '➖';
    }
    return `${hours}h ${minutes}min`;
  };


  const handleToggleForm = () => {
    setIsFormEnabled((prevIsFormEnabled) => !prevIsFormEnabled);
    setCancelButton((prevIsFormEnabled) => !prevIsFormEnabled);
  };

  const handleRequest = () => {
        setModalVisible(true);
  };
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Function to handle editing a task
  const handleEditTask = (record: any) => {
    console.log("after - filteredTasks", filteredTasks);
    console.log("clicked", record);
  
    // Update both state values synchronously
    setEditTaskId(record?.timeSheetId);
    setInitialValue({
      date: record?.date,
      workLocation: record?.workLocation,
      task: record?.task,
      project: record?.project,
      managerAssignedTask: record?.managerTaskName,
      startTime: record?.startTime,
      endTime: record?.endTime,
      totalHours: record?.totalHours,
      description: record?.description,
      reportingTo: record?.reportingTo, // Set default value to reportingManagerId if available
    });
  
    console.log("clicked", initialValue);
    setIsEdited(true);
    setIsFormEnabled(true);
    setCancelButton(true);
  };
  

  // Function to handle submitting the form (including both adding and editing tasks)
  const handleFormSubmit = async (values: any, { setSubmitting, resetForm }: FormikHelpers<any>) => {
    console.log("handleFormSubmit-filteredTasks", filteredTasks);
    console.log("handleFormSubmit-values", values)
    // Check for overlapping tasks in the specified time range

    // Check if any field is empty
    // if (!values.startTime || !values.endTime || !values.workLocation || !values.task || !values.project || !values.description || !values.reportingTo) {
    //     notification.warning({
    //         message: 'Missing Information',
    //         description: 'Please fill in all fields before submitting the task.',
    //     });
    //     return; // Abort submission
    // }

    const overlappingTask = filteredTasks.find((task:any )=> {
      
      let date = values.date;
      console.log('handleFormSubmit-date', date);
      const newTaskStartTime = dayjs(values.startTime, 'HH:mm'); // Change to 24-hour format
      const newTaskEndTime = dayjs(values.endTime, 'HH:mm'); // Change to 24-hour format
      const taskStartTime = dayjs(task.startTime, 'HH:mm'); // Change to 24-hour format
      const taskEndTime = dayjs(task.endTime, 'HH:mm'); // Change to 24-hour format
    
      // Check if the new task overlaps with any existing task
      return (
        (!isEdited && task.date === date) &&
        (
          ((newTaskStartTime.isSame(taskStartTime) || newTaskStartTime.isAfter(taskStartTime)) && newTaskStartTime.isBefore(taskEndTime)) ||
          ((newTaskEndTime.isSame(taskStartTime) || newTaskEndTime.isAfter(taskStartTime)) && newTaskEndTime.isBefore(taskEndTime)) ||
          (newTaskStartTime.isBefore(taskStartTime) && (newTaskEndTime.isSame(taskEndTime) || newTaskEndTime.isAfter(taskEndTime)))
        )
      );
    });
    console.log("handleFormSubmit", overlappingTask);
    if (overlappingTask) {
      notification.warning({
        message: 'Restricted',
        description: 'Task already exists in the specified time range.',
      });
      return;
    }
    try {
      setSubmitting(true);
      let response: any;
      if (isEdited && values) {
        // If editing an existing task, send a PUT request to the edit-task API endpoint
        if(values.task ==='Manager Assigned Task'){
          console.log("3")
          response = await api.put(`/api/v1/timeSheet/edit-task/${editTaskId}`, {
              date: values?.date,
              workLocation: values?.workLocation,
              task: values?.task,
              project: values?.project,
              managerAssignedTaskId: values && values?.managerAssignedTask || null,
              startTime: values?.startTime,
              endTime: values?.endTime,
              totalHours: values?.totalHours,
              description: values?.description,
              reportingTo: values?.reportingTo,
          });
          console.log("response-handleformsubmit", response);
        } else{
          console.log("4");
          response = await api.put(`/api/v1/timeSheet/edit-task/${editTaskId}`, {
              date: values?.date,
              workLocation: values?.workLocation,
              task: values?.task,
              project: values?.project,
              managerAssignedTaskId: null,
              startTime: values?.startTime,
              endTime: values?.endTime,
              totalHours: values?.totalHours,
              description: values?.description,
              reportingTo: values?.reportingTo,
          });
          console.log("response-handleformsubmit", response);
        }
      } else {
        console.log("inside here");
        // If adding a new task, send a POST request to the add-task API endpoint
        if(values.task ==='Manager Assigned Task'){
          console.log("1");
          response = await api.post('/api/v1/timeSheet/add-task', {
            date: values?.date,
            workLocation: values?.workLocation,
            task: values?.task,
            project: values?.project,
            managerAssignedTaskId: values && values?.managerAssignedTask || null,
            startTime: values?.startTime,
            endTime: values?.endTime,
            totalHours: values?.totalHours,
            description: values?.description,
            reportingTo: values?.reportingTo,
        }) 
        console.log("response-handleformsubmit", response);
        } else{
          console.log("2");
          response = await api.post('/api/v1/timeSheet/add-task', {
            date: values?.date,
            workLocation: values?.workLocation,
            task: values?.task,
            project: values?.project,
            managerAssignedTaskId: null,
            startTime: values?.startTime,
            endTime: values?.endTime,
            totalHours: values?.totalHours,
            description: values?.description,
            reportingTo: values?.reportingTo,
        });
        console.log("response-handleformsubmit", response);
        }
      }
      console.log("handleformsubmit 1");
      console.log("response-handleformsubmit", response.data);
      // Check the response status
      if (response.status === 200) {
        // Handle successful response
        setRefetch((prevState: any) =>  !prevState);
        console.log('Task added/edited successfully:', response.data);
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
        })
        // Handle any other necessary operations after successful submission
        // For example, resetting form fields, updating state, etc.
        setIsEdited(false);
        resetForm();
        setInitialValue({
            timeSheetId: 0,
            date: values?.date, // Update date field with submitted value
            workLocation: '',
            task: '',
            project: '',
            managerAssignedTask:'',
            startTime: '',
            endTime: '',
            totalHours: '',
            description: '',
            reportingTo: '', 
        })
      } else {
        // Handle other response statuses
        console.error('Failed to add/edit task. Status:', response.status);
      }
    } catch (error:any) {
      // Handle errors
      setSubmitting(false);
      console.error('Error adding/editing task:', error);
      notification.error({
        message:error?.response?.data?.action,
        description: error?.response?.data?.message
      })
      // You can also show a notification or perform other error handling here
    }
  };

  const handleOverallSubmit = async () => {
    try {
      const response = await api.post('/api/v1/timeSheet/submit-task');
      console.log("response-handleoverallsubmit", response);
      if (response.status === 200) {
        // Display a notification when the task is submitted successfully
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
        })
        console.log('Task overall submitted successfully:', response.data);
      }
    } catch (error:any) {
      console.log("Error occurred during overall submit:", error);
      // You can also display an error notification if needed
      notification.error({
        message:error?.response?.data?.response?.action,
        description: error?.response?.data?.message
      })
    }
  };

  const handleRequestSubmit = async (values: any, { setSubmitting, resetForm }: FormikHelpers<any>) => {
    try {
        // Prepare the payload
        const payload = {
            requestedMonth: dayjs(values.month).format('YYYY-MM'),
            description: values.description,
            reportingToId: values.reportingTo,
        };

        // Send POST request to the API endpoint
        const response = await api.post('/api/v1/timeSheet/request-submission-by-month', payload);

        // Log the response
        console.log("API response:", response.data);

        // Show notification if submission is successful
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
          duration:3
        })

        // Reset form after successful submission
        resetForm();
        setModalVisible(false);
    } catch (error:any) {
        // Handle errors if submission fails
        console.error('Submission error:', error);

        notification.error({
          message:error?.response?.data?.response?.action,
          description: error?.response?.data?.message,
          duration:3
        })
    } finally {
        setSubmitting(false);
    }
};
  
  

  const handleDeleteTask = useCallback((task_id:any) => {
    // Display confirmation modal before deleting the task
    confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete the task?',
      okText: 'Yes',
      okButtonProps: {
        style: {
          width: '80px', backgroundColor: '#0B4266', color: 'white'
        },
      },
      cancelText: 'No',
      cancelButtonProps: {
        style: {
          width: '80px', backgroundColor: '#0B4266', color: 'white'
        },
      },
      async onOk() {
        // Logic to delete the task if user confirms
        try {
          // Make DELETE request to delete the task
          await api.delete(`/api/v1/timeSheet/delete-task/${task_id}`);
          setRefetch((refetch)=>!refetch);
          // Optionally, perform any additional actions after deletion
          // For example, refetch the tasks or update the UI
        } catch (error) {
          // Handle errors
          console.error('Error deleting task:', error);
          // You can also show a notification or perform other error handling here
        }
      },
      onCancel() {
        // Logic if user cancels deletion
      },
    });
  }, []);


  const columns: ColumnsType<any> = [
    {
      title: 'S.No',
      dataIndex: 'slNo',
      key: 'slNo',
      fixed: 'left',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Date',
      // sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },    
    {
      title: 'Work Location',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'workLocation',
      key: 'workLocation',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },
    {
      title: 'Task',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'task',
      key: 'task',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project</div>,
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'project',
      key: 'project',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Manager Assigned Task</div>,
      dataIndex: 'managerTaskName',
      key: 'managerTaskName',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text? text: '➖'}</div>,
    },  
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Start Time</div>,
      //sorter: (a: Task, b: Task) => a.startTime.localeCompare(b.startTime),
      dataIndex: 'startTime',
      key: 'startTime',
      fixed: 'left',
      render: (_, record) => {
        return (
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hoursTimeToHoursMinutes(record?.startTime)}
          </div>
        );
    }
    },
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>End Time</div>,
      //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
      dataIndex: 'endTime',
      key: 'endTime',
      fixed: 'left',
      render: (_, record) => {
        return (
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hoursTimeToHoursMinutes(record?.endTime)}
          </div>
        );
    }
    },
    {
      title:<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Hours</div>,
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'totalHours',
      key: 'totalHours',
      fixed: 'left',
      render: (_, record) => {
        return (
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {hoursDecimalToHoursMinutes(record?.totalHours)}
          </div>
        );
    }
    },
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Description</div>,
      //sorter: (a: Task, b: Task) => a.description.localeCompare(b.description),
      dataIndex: 'description',
      key: 'description',
      fixed: 'left',
      // render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    },
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Reporting To</div>,
      //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      dataIndex: 'reportingToName',
      key: 'reportingToName',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    }, 
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</div>,
      //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      fixed: 'left',
      render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
    }, 
    {
      title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Actions</div>,
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record, index) => {
        // const isExistingTask = taskList.some(task => task.task_id === record?.task_id);
        const isDateSelected = selectedKeysToHide.includes(record?.date);
        
        
        // Filter tasks by userId
        //const userTasks = taskList.filter(task => task.userId === record?.userId);
        
        // Check if the user has tasks for the selected date
        //const hasUserTasksForDate = userTasks.some(task => task.date === record?.date);
    
        return (
          <div>
            <EditOutlined
              onClick={() => handleEditTask(record)}
              style={{
                marginRight: '8px',
                cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
                color: (isDateSelected ) ? 'grey' : 'blue', //|| !hasUserTasksForDate
                fontSize: '20px',
              }}
              disabled={isDateSelected } //|| !hasUserTasksForDate
            />
            <DeleteOutlined
              onClick={() => handleDeleteTask(record?.timeSheetId)}
              style={{
                cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
                color: (isDateSelected ) ? 'grey' : 'red', //|| !hasUserTasksForDate
                fontSize: '20px',
              }}
              disabled={isDateSelected } //|| !hasUserTasksForDate
            />
          </div>
        );
      },
    }    
    
      
  ]

  const getCurrentDate = () => {
    if (filterOption === 'Date') {
      return currentDate.format('YYYY-MM-DD');
    } else if (filterOption === 'Week') {
      return currentWeek.format('YYYY-MM-DD');
    } else if (filterOption === 'Month') {
      return currentMonth.format('YYYY-MM-DD');
    } else {
      // Return a default value or handle other cases as needed
      return ''; // Change this to the appropriate default value
    }
  };
  

  const handleClearForm = (resetForm:any) => {
    resetForm(); // Reset the form to its initial values
  };
  const modalValidationSchema = yup.object().shape({
    month: yup.string()
      .required('Month is required'), // Validate that the month field is not empty
    reportingTo: yup.string()
      .required('ReportingTo is required'), // Validate that the reportingTo field is not empty
    description: yup.string()
      .required('Description is required') // Validate that the description field is not empty
      .max(500, 'Description must be at most 500 characters long') // Validate that the description is at most 500 characters long
  });
    // Define validation schema using Yup
  const validationSchema = yup.object().shape({
    date: yup.string().required('Date is required'),
    workLocation: yup.string().required('Work Location is required'),
    task: yup.string().required('Task is required'),
    project: yup.string().required('Project is Required'),
    startTime: yup.string().required('Start Time is required'),
    endTime: yup.string()
      .required('End Time is required')
      .test(
        'is-greater',
        'End Time must be greater than Start Time',
        function (value) {
          const { startTime } = this.parent;
          return value && startTime && value > startTime;
        }
      ),  
      totalHours: yup.number()
      .required('Total Hours is required')
      .positive('Total Hours must be greater than 0')
      .moreThan(0, 'Total Hours must be greater than 0'),
      description: yup.string().required('Description is required'),
      reportingTo: yup.string().required('Reporting To is required'),
  });

  return (
    <ConfigProvider theme={config}>
      <div className='createuser-main' style={{overflow:'hidden'}}>
        <div className='header'>
          <div>
            <h1 style={{marginLeft:'20px'}}>{isFormEnabled ? 'Add Task': 'TimeSheet'}</h1>
          </div>
          { filterOption === 'Month' ? (
            <div style={{display:'flex', justifyContent:'flex-end'}}>
              <div className='date' style={{fontSize:'18px'}}><b>From: {dayjs(currentMonth).startOf('month').format('YYYY-MM-DD')}</b></div>
              <div className='date' style={{ marginLeft: '40px', fontSize:'18px' }}><b>To: {dayjs(currentMonth).endOf('month').format('YYYY-MM-DD')}</b></div>
            </div>
            ) : filterOption === 'Week' ? (
              <div style={{display:'flex', justifyContent:'flex-end'}}>
                <div className='date' style={{fontSize:'18px'}}><b>From: {dayjs(currentWeek).startOf('week').format('YYYY-MM-DD')}</b></div>
                <div className='date' style={{ marginLeft: '40px', fontSize:'18px' }}><b>To: {dayjs(currentWeek).endOf('week').format('YYYY-MM-DD')}</b></div>
              </div>
            )  : (
              <div className='date' style={{fontSize:'18px'}}><b>Date: {currentDate.format('YYYY-MM-DD')}</b></div>
            )
          }
        </div>
        {(isFormEnabled && cancelButton && submissionEnable) ? ( 
        <Formik
          initialValues={initialValue}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize={true}
        >
        {({
          
          values,
          handleChange,
          setFieldValue,
          setFieldTouched,
          handleBlur,
          handleSubmit,
          errors,
          isSubmitting,
          resetForm
        }) => 
       { console.log(values,errors)
         return (  
          <Form name='basic' layout='vertical' autoComplete='off' onFinish={handleSubmit}>
            <div>
              {(isFormEnabled && submissionEnable)&& ( //&& filterOption!=='Date'
                <CloseCircleOutlined
                  style={{ margin: '10px 20px', display: 'flex', justifyContent: 'flex-end', color: 'black', width:'1000px' }}
                  title='Click the icon to disable the form'
                  onClick={handleToggleForm} // Call the handleToggleForm function on click
                />
              )}
              <div style={{display:'flex', marginLeft:'10px'}}>
                <div>
                  <div style={{display:'flex'}}>
                  <Form.Item<FieldType>
                    label="Date"
                    className="label-strong"
                    name="date"
                    required
                    style={{ padding: "10px" }}
                  >
                    <DatePicker
                      style={{
                        height: "50px",
                        width: "470px",
                        borderRadius: "4px",
                        margin: "0px",
                      }}
                      format="YYYY-MM-DD"
                      value={
                        isEdited
                          ? (values.date ? dayjs(values.date) : null)
                          : filterOption === 'Week'
                          ? currentWeek
                            ? dayjs(currentWeek)
                            : null
                          : filterOption === 'Month'
                          ? currentMonth
                            ? dayjs(currentMonth)
                            : null
                          : currentDate
                          ? dayjs(currentDate)
                          : null
                      }                 
                      onChange={(date, dateString) => {
                        if (date) {
                          // Update currentDate, currentWeek, or currentMonth based on filterOption
                          if (filterOption === 'Week') {
                            setCurrentWeek(date);
                            setAllowDate(date.format('YYYY-MM-DD')); // Update allowDate
                          } else if (filterOption === 'Month') {
                            setCurrentMonth(date);
                            setAllowDate(date.format('YYYY-MM-DD')); // Update allowDate
                          } else {
                            setCurrentDate(date);
                            setAllowDate(date.format('YYYY-MM-DD')); // Update allowDate
                          }
                          // Set Formik field value
                          setAllowDate(dayjs(dateString).format('YYYY-MM-DD')); // Update allowDate
                          setFieldValue('date', dayjs(dateString).format('YYYY-MM-DD'));
                        }
                      }}
                      onBlur={handleBlur}
                      disabledDate={(current) => {
                        // Disable dates after today
                        return current && current > moment().endOf('day');
                      }}
                    />
                    <div>
                      <Typography.Text
                        type="danger"
                        style={{ wordBreak: "break-word", textAlign: 'left' }}
                      >
                        <ErrorMessage name="date" />
                      </Typography.Text>
                    </div>
                  </Form.Item>

                    <Form.Item<FieldType>
                      label="Work Location"
                      className="label-strong"
                      name="workLocation"
                      required
                      style={{ padding: "10px" }}
                    >
                      <Select
                        style={{
                          height: "50px",
                          width: "470px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        value={values.workLocation}
                        onChange={(value, option) => {
                          setFieldValue("workLocation", value); // Update "workLocation" field value
                        }}
                        onBlur={() => {
                          setFieldTouched("workLocation", true); // Mark "workLocation" field as touched
                        }}
                      >
                        <Select.Option value="" disabled>
                          Select work location
                        </Select.Option>
                        {workLocation.map((option) => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                      </Select>
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="workLocation" /> {/* Adjusted to use "workLocation" */}
                        </Typography.Text>
                      </div>
                    </Form.Item>
                  </div>
                  <div style={{display:'flex'}}>
                    <Form.Item<FieldType>
                      label="Task"
                      className="label-strong"
                      name="task"
                      required
                      style={{ padding: "10px" }}
                    >
                      <Select
                        style={{
                          height: "50px",
                          width: "470px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        value={values.task}
                        onChange={(value, option) => {
                          setFieldValue("task", value); // Update "workLocation" field value
                          handleProject(value);
                          setFieldValue("project", null);
                          setFieldValue("managerAssignedTask", null);
                        }}
                        onBlur={() => {
                          setFieldTouched("task", true); // Mark "workLocation" field as touched
                        }}
                      >
                        <Select.Option value="" disabled>
                          Select the task
                        </Select.Option>
                        {taskOptions.map((option) => (
                          <Select.Option key={option} value={option}>
                            {option}
                          </Select.Option>
                        ))}
                      </Select>
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="task" /> {/* Adjusted to use "workLocation" */}
                        </Typography.Text>
                      </div>
                    </Form.Item>
                    <Form.Item<FieldType>
                      label="Project"
                      className="label-strong"
                      name="project"
                      required
                      style={{ padding: "10px" }}
                    >  
                      <Select
                        style={{
                          height: "50px",
                          width: "470px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        value={values.project}
                        onChange={(value, option) => {
                          setFieldValue("project", value); // Update "workLocation" field value
                          setFieldValue("managerAssignedTask", null);
                          handleManagerAssignedTask(value);
                        }}
                        onBlur={() => {
                          setFieldTouched("project", true); // Mark "workLocation" field as touched
                        }}
                      >
                        <Select.Option value="" disabled>
                          Select the Project
                        </Select.Option>
                        {projectData.map((option, index) => (  // Use 'index' as the key
                          <Option key={index} value={option.projectName}>
                            {option.projectName}
                          </Option>
                        ))}
                      </Select>
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="project" /> {/* Display error message if any */}
                        </Typography.Text>
                      </div>
                    </Form.Item>
                   
                  </div>
                  {values.task === 'Manager Assigned Task' &&(
                    <div>
                      <Form.Item<FieldType>
                        label="Manager Assigned Task"
                        className="label-strong"
                        name="managerAssignedTask"
                        required
                        style={{ padding: "10px" }}
                      >
                        
                        <Select
                          style={{
                            height: "50px",
                            width: "470px",
                            borderRadius: "4px",
                            margin: "0px",
                          }}
                          value={values.task==='Manager Assigned Task' ? values.managerAssignedTask: null}
                          onChange={(value, option) => {
                            setFieldValue("managerAssignedTask", value); // Update "workLocation" field value
                          }}
                          onBlur={() => {
                            setFieldTouched("managerAssignedTask", true); // Mark "workLocation" field as touched
                          }}
                        >
                          <Select.Option value="" disabled>
                            Select the Manager Assigned Task
                          </Select.Option>
                          {managerGivenTask.map((option:any, index:any) => (  // Use 'index' as the key
                            <Option key={index} value={option.taskId}>
                              {option.taskName}
                            </Option>
                          ))}
                        </Select>
                        <div>
                          <Typography.Text
                            type="danger"
                            style={{ wordBreak: "break-word", textAlign: "left" }}
                          >
                            <ErrorMessage name="project" /> 
                          </Typography.Text>
                        </div>
                      </Form.Item>
                    </div>
                  )}
                  <div style={{display:'flex'}}>
                    <Form.Item<FieldType>
                      label="Start Time"
                      className="label-strong"
                      name="startTime"
                      required
                      style={{ padding: "10px" }}
                    >
                      <TimePicker
                          style={{height:'50px', width:'470px'}}
                          value={values.startTime ? dayjs(values.startTime, 'HH:mm') : null} // Convert string to Dayjs object
                          onChange={(value) => {
                            const formattedStartTime = value ? value.format('HH:mm') : '';
                            setStartTime(formattedStartTime);
                            setFieldValue("startTime", formattedStartTime); // Update endTime field value
                            updateTotalHours(formattedStartTime, values.endTime, setFieldValue); // Update totalHours
                            // Now you can perform any other necessary operations with formattedEndTime
                          }}
                          onBlur={() => {
                            setFieldTouched("startTime", true); 
                          }}
                          
                          format='HH:mm' // Change the format to 24-hour HH:mm
                      />
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="startTime" /> 
                        </Typography.Text>
                      </div>
                    </Form.Item>
                    <Form.Item<FieldType>
                      label="End Time"
                      className="label-strong"
                      name="endTime"
                      required
                      style={{ padding: "10px" }}
                    >
                      <TimePicker
                          style={{height:'50px', width:'470px'}}
                          value={values.endTime ? dayjs(values.endTime, 'HH:mm') : null} // Convert string to Dayjs object
                          onChange={(value) => {
                            const formattedEndTime = value ? value.format('HH:mm') : '';
                            setEndTime(formattedEndTime);
                            setFieldValue("endTime", formattedEndTime); // Update endTime field value
                            updateTotalHours(values.startTime, formattedEndTime, setFieldValue); // Update totalHours
                            // Now you can perform any other necessary operations with formattedEndTime
                          }}
                          onBlur={() => {
                            setFieldTouched("endTime", true); // Mark "workLocation" field as touched
                          }}
                          
                          format='HH:mm' // Change the format to 24-hour HH:mm
                      />
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="endTime" /> {/* Adjusted to use "workLocation" */}
                        </Typography.Text>
                      </div>
                    </Form.Item>
                  </div>
                  <div style={{display:'flex'}}>
                    <Form.Item<FieldType>
                      label="Total Hours"
                      className="label-strong"
                      name="totalHours"
                      required
                      style={{ padding: "10px" }}
                    >
                      <Input
                        style={{
                          height: "50px",
                          width: "470px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        name="totalHours"
                        value={values.totalHours}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        readOnly // Optionally, you can set it as readOnly
                      />
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign:'left' }}
                        >
                          <ErrorMessage name="totalHours" />
                        </Typography.Text>
                      </div>
                    </Form.Item>
                    <Form.Item<FieldType>
                      label="Reporting To"
                      className="label-strong"
                      name="reportingTo"
                      required
                      style={{ padding: "10px" }}
                    >
                     
                      <Select
                        style={{
                          height: "50px",
                          width: "470px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        value={values.reportingTo}
                        onChange={(value, option) => {
                          setFieldValue("reportingTo", value); // Update "workLocation" field value
                        }}
                        onBlur={() => {
                          setFieldTouched("reportingTo", true); // Mark "workLocation" field as touched
                        }}
                      >
                        <Select.Option value="" disabled>
                          Select the Reporting Manager
                        </Select.Option>
                        {reportingTo.map((option, index) => (  // Use 'index' as the key
                          <Option key={index} value={option.reportingManagerId}>
                            {option.reportingManagerName}
                          </Option>
                        ))}
                      </Select>
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign: "left" }}
                        >
                          <ErrorMessage name="reportingTo" /> {/* Display error message if any */}
                        </Typography.Text>
                      </div>
                    </Form.Item>

                  </div>
                  <div style={{display:'flex'}}>
                    <Form.Item<FieldType>
                      label="Description"
                      className="label-strong"
                      name="description"
                      required
                      style={{ padding: "10px" }}
                    >
                      <TextArea
                        style={{
                          height: "150px",
                          width: "960px",
                          borderRadius: "4px",
                          margin: "0px",
                        }}
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <div>
                        <Typography.Text
                          type="danger"
                          style={{ wordBreak: "break-word", textAlign:'left' }}
                        >
                          <ErrorMessage name="description" />
                        </Typography.Text>
                      </div>
                    </Form.Item>
                  </div>
                  <div style={{display:'flex', marginLeft:'760px'}}>
                    <Form.Item>
                      <Button
                        //type="primary"
                        htmlType="button"
                        style={{ width: "100px", height: "41px", cursor: selectedKeysToHide.includes(values.date) ? 'not-allowed' : 'pointer'}}
                        className="Button"
                        id='cancel-addTask'
                        onClick={() => handleClearForm(resetForm)}
                        disabled={selectedKeysToHide.includes(values.date)} // Disable if currentDate is in selectedKeysToHide
                      >
                        Clear
                      </Button>
                    </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{ width: "100%", height: "41px" , marginLeft:'10px', cursor: (selectedKeysToHide.includes(values.date))  ? 'not-allowed' : 'pointer'}} //|| Object.keys(errors).length > 0
                          className="Button"
                          disabled={isSubmitting || selectedKeysToHide.includes(values.date) } //|| Object.keys(errors).length > 0 Disable if submitting, date is in selectedKeysToHide, or there are form errors
                          title={selectedKeysToHide.includes(values.date) ? 'Approved date should not have the access to add the task' :  ''} //Object.keys(errors).length > 0 ? 'Kindly fill all the required fields':
                        >
                          {isSubmitting ? 'Submitting...' : (isEdited ? 'Save' : 'Add Task')}
                        </Button>
                      </Form.Item>
                    
                  </div>
                </div>
                {/* <div style={{display:'flex', alignItems:'center'}}>
                
                  <div className='chart-container' style={{ marginLeft: "150px",width:'750px'}}>
                   <h2>Task Percentage</h2>
                    <Chart
                        options={pieChartDataInForm.options}
                        series={pieChartDataInForm.series}
                        type="pie"
                        width="480"
                    />
                  </div>
                </div> */}
              </div>
            </div>

        </Form>
        )}
        }  
        </Formik>
        ):null}
        <>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 20px' }}>
            <div style={{display:'flex'}}>
              <Button id='submit-icon' onClick={handleLeftArrowClick}> 
                      <LeftOutlined />
                  </Button>

                  <Button id='submit-icon' onClick={handleRightArrowClick}>
                      <RightOutlined />
                  </Button>

            </div>
          
         
          <div style={{display:'flex', justifyContent:'flex-end'}}>
         { !submissionEnable && (
          <Button 
              id='cancel-new'
              onClick={handleRequest} 
              //title={selectedRows.length === 0 ? "Please select the row to Reject" : ""}
          >
              Request
          </Button>
         )
         }
          <Modal
            title="Request"
            className='modalTitle'
            visible={modalVisible}
            onCancel={handleCancel}
            footer={false}
            >
            <Formik
              initialValues={modalInitialValue}
              validationSchema={modalValidationSchema}
              onSubmit={handleRequestSubmit}
              enableReinitialize={true}
            >
            {({
              values,
              handleChange,
              setFieldValue,
              setFieldTouched,
              handleBlur,
              handleSubmit,
              errors,
              isSubmitting,
              resetForm
            }) => (
              <Form name='basic' layout='vertical' autoComplete='off' onFinish={handleSubmit}>
                <div style={{display:'flex'}}>
                  <Form.Item
                    label="Month"
                    className="label-strong"
                    name="month"
                    required
                    style={{ padding: "10px" }}
                  >
                    <DatePicker
                      style={{
                        height: "50px",
                        width: "470px",
                        borderRadius: "4px",
                        margin: "0px",
                      }}
                      picker="month" // Set picker to "month" to allow only month and year selection
                      format="MMMM YYYY" // Use the format for month and year (e.g., "April 2024")                     
                      value={values.month ? dayjs(values.month, "MMMM YYYY") : null} // Parse the value using dayjs if it exists
                      onChange={(date, dateString) => {
                        setFieldValue('month', dateString); // Update the value using the formatted date string
                      }}
                      onBlur={() => {
                        setFieldTouched("month", true); // Mark "workLocation" field as touched
                      }}
                    />
                    <div>
                      <Typography.Text
                        type="danger"
                        style={{ wordBreak: "break-word", textAlign: 'left' }}
                      >
                        <ErrorMessage name="month" />
                      </Typography.Text>
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Reporting To"
                    className="label-strong"
                    name="reportingTo"
                    required
                    style={{ padding: "10px" }}
                  >
                    <Select
                      style={{
                        height: "50px",
                        width: "470px",
                        borderRadius: "4px",
                        margin: "0px",
                      }}

                      value={values.reportingTo}
                      onChange={(value, option) => {
                        setFieldValue("reportingTo", value); // Update "workLocation" field value
                      }}
                      onBlur={() => {
                        setFieldTouched("reportingTo", true); // Mark "workLocation" field as touched
                      }}
                    >
                      <Select.Option value="" disabled>
                        Select the Reporting Manager
                      </Select.Option>
                      {reportingTo.map((option, index) => (  // Use 'index' as the key
                        <Option key={index} value={option.reportingManagerId}>
                          {option.reportingManagerName}
                        </Option>
                      ))}
                    </Select>
                    <div>
                      <Typography.Text
                        type="danger"
                        style={{ wordBreak: "break-word", textAlign: "left" }}
                      >
                        <ErrorMessage name="reportingTo" /> {/* Display error message if any */}
                      </Typography.Text>
                    </div>
                  </Form.Item>
                </div>
                <Form.Item
                  label="Description"
                  className="label-strong"
                  name="description"
                  required
                  style={{ padding: "10px" }}
                >
                  <TextArea
                    style={{
                      height: "150px",
                      width: "960px",
                      borderRadius: "4px",
                      margin: "0px",
                    }}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <div>
                    <Typography.Text
                      type="danger"
                      style={{ wordBreak: "break-word", textAlign:'left' }}
                    >
                      <ErrorMessage name="description" />
                    </Typography.Text>
                  </div>
                </Form.Item>
                <Button
                type="primary"
                htmlType="submit"
                // id='cancel-new'
                style={{width:'10%', height:'100%'}}
                >Submit
                </Button>
              </Form>
              
              )}
            </Formik>
            </Modal>
        {!cancelButton && !isFormEnabled && submissionEnable && (
            <Button
              id='cancel-new'
              onClick={handleToggleForm}
              disabled={isFormEnabled} 
            >
              Add Task
            </Button>
          )}
          <Select 
                    id='submit' 
                    style={{color:'white', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', marginTop:'10px', height:'95%', width:'120px' }} 
                    onChange={(value) => handleFilterChange(value)} 
                    value={filterOption}
                    dropdownStyle={{ textAlign: 'center' }} 
                >
                    <Option value='Date'>Date</Option>
                    <Option value='Week'>Week</Option>
                    <Option value='Month'>Month</Option>
                </Select>
         
          </div>
        </div>
      </div>

        <div style={{ overflowX: 'auto', maxHeight: 'calc(80vh - 200px)' }}> 
          <Table
            style={{ fontSize: '12px', fontFamily: 'poppins', fontWeight: 'normal', color: '#0B4266' }}
            className='addtask-table'
            columns={columns}
            dataSource={filteredTasks}
            pagination={false}
          />
          <Button
            id='submit-overall'
            onClick={handleOverallSubmit}
            disabled={selectedKeysToHide.includes(allowDate)} 
            style={{ cursor: selectedKeysToHide.includes(allowDate) ? 'not-allowed' : 'pointer' }}
            title={selectedKeysToHide.includes(allowDate) ? 'Approved date should not have the access to submit the task' : ''}
          >
            Submit
          </Button>
        </div>           
        </>
      </div>
    </ConfigProvider>
  );
};

export default AddTask;