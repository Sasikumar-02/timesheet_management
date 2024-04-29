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
// import { RecentRejected, SelectedKeys, RejectedKeys } from '../Manager/MonthTasks';
import asset from '../../assets/images/asset.svg';
import type { ThemeConfig } from "antd";
import TextArea from 'antd/es/input/TextArea';
import { values } from 'lodash';
import moment from 'moment';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
// Declare setFieldValue outside of Formik
let setFieldValue: Function;
export interface DateTask{
  key: string;
  tasks: Task[];
  status?: string;
}

export interface RequestedOn {
  [key: string]: string[]; // Each key represents a month (e.g., "February 2024") with an array of dates
}

export interface TaskRequestedOn {
  [userId: string]: RequestedOn; // Each key represents a month (e.g., "February 2024") with an array of dates
}

type FieldType={
  date?: string;
  workLocation?: string;
  task?: string;
  project?: string;
  startTime?: string;
  endTime?: string;
  totalHours?: string;
  description?: string;
  reportingTo?: string;
}
export interface Task {
  userId?:string;
  task_id?:string;
  date: string;
  workLocation: string;
  task: string;
  project: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  description: string;
  reportingTo: string;
}

interface ProjectDetails {
  projectName: string;
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

type AddTaskProps = {
  setPieChartData: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  setApprovalRequestsData: React.Dispatch<React.SetStateAction<Task[]>>;
  approvalRequestsData: Task[];
};

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
  const [reportingTo, setReportingTo] = useState<UserManager[]>([]);
  const [reportingToID, setReportingToID] = useState('1234');
  const [startTime, setStartTime]= useState('');
  const [endTime, setEndTime] = useState('');
  const [totalHours, setTotalHours]=useState('');
  const [userProject, setProjectUser]= useState([]);
  const [editTaskId, setEditTaskId]= useState<any>();
  const { Option } = Select; // Destructure the Option component from Select
  const navigate = useNavigate();
  const {confirm}= Modal;
  const location = useLocation();
  // Define a state variable to hold the currently edited task
  //const [editedTask, setEditedTask] = useState<Task | null>(null);
  const { formattedDate } = location.state || { formattedDate: dayjs() }; // Access formattedDate from location.state
  const [deletedTask, setDeletedTask] = useState(false);
  const [formWidth, setFormWidth] = useState(800);
  const [currentDate, setCurrentDate] = useState(dayjs(formattedDate));
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [cancelButton, setCancelButton] = useState(false);
  const [isDateChanged, setIsDateChanged] = useState(false);
  const [addTask, setAddTask] = useState<Task>({
    date: currentDate.format('YYYY-MM-DD'),
    workLocation: '',
    task: '',
    project: '',
    startTime: '',
    endTime: '',
    totalHours: '',
    description: '',
    reportingTo: reportingToID,
  });
  const [deletedTaskIdx, setDeletedTaskIdx] = useState<number | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  //const [reportingOptions, setReportingOptions]= useState<any>('');
  const reportingOptions = ['ManagerA', 'ManagerB', 'ManagerC'];
  const taskOptions = ['Project','Learning','Training','Meeting', 'Interview'];
  const [filterOption, setFilterOption] = useState('Date');
  const [isEdited, setIsEdited]= useState<boolean>(false);
  // State to manage the search input
  const [searchInput, setSearchInput] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [selectedKeysToHide, setSelectedKeysToHide]=useState<string[]>([]);
  const [pieChartDataInForm, setPieChartDataInForm] = useState<PieChartData>({ options: { labels: [] }, series: [] });
  // Define a loading state
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [descCount, setDescCount]=useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [projectData, setProjectData] = useState<ProjectDetails[]>([
    {
      projectName: "Other"
    }
  ]);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [initialValue, setInitialValue] = useState<any>({
    timeSheetId: 0,
    date: dayjs(currentDate).format('YYYY-MM-DD'), // Set to an empty string initially
    workLocation: '',
    task: '',
    project: '',
    startTime: '',
    endTime: '',
    totalHours: '',
    description: '',
    reportingTo: '', // Set default value to reportingManagerId if available
  });
  
  // Assuming currentDate, currentWeek, and currentMonth are already defined
  useEffect(() => {
    if(!isEdited){
      if (filterOption === 'Date') {
        setInitialValue({
          ...initialValue,
          date: currentDate.format('YYYY-MM-DD'),
        });
      } else if (filterOption === 'Week') {
        setInitialValue({
          ...initialValue,
          date: currentWeek.format('YYYY-MM-DD'),
        });
      } else if (filterOption === 'Month') {
        setInitialValue({
          ...initialValue,
          date: currentMonth.format('YYYY-MM-DD'),
        });
      }
    }
  }, [filterOption, isEdited, currentDate, currentMonth, currentWeek]); // Run this effect whenever filterOption changes

  // useEffect(()=>{
  //   if(!isEdited){
  //     setInitialValue({
  //       timeSheetId: 0,
  //       date: currentDate.format('YYYY-MM-DD'),
  //       workLocation: '',
  //       task: '',
  //       project: '',
  //       startTime: '',
  //       endTime: '',
  //       totalHours: '',
  //       description: '',
  //       reportingTo: '', // Set default value to reportingManagerId if available
  //     })
  //   }
  // },[currentDate, currentMonth, currentWeek, filterOption, isEdited])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`/api/v1/admin/employee-list`);
        if (response?.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = response?.data?.response?.data;
  
        console.log('Fetched data:', data);
        
        const employee = data?.find((emp: any) => emp?.userId === userId);
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
            return task?.date === date;
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

const calculateTotalHours = (startTime: any, endTime: any) => {
  if (!startTime || !endTime) return ''; // Handle cases where either start or end time is missing
  const start = dayjs(startTime, 'HH:mm');
      console.log("calculateTotalHours-start", start);
      const end = dayjs(endTime, 'HH:mm');
      console.log("calculateTotalHours-end", end);
      const duration = end.diff(start, 'minute', true); // Calculate difference in minutes
      console.log("calculateTotalHours-duration", duration);
      const hours = Math.floor(duration / 60); // Extract hours
      console.log("calculateTotalHours-hours", hours);
      const minutes = duration % 60; // Extract remaining minutes
      console.log("calculateTotalHours-minutes", minutes);
      const formattedDuration = hours + (minutes / 100); // Combine hours and minutes
      console.log("calculateTotalHours-formattedDuration", formattedDuration);
      console.log("calculateTotalHours-formattedDuration", formattedDuration.toFixed(2));
      return formattedDuration.toFixed(2); // Format hours and minutes
};

  
  useEffect(() => {
    const newTotalHours = calculateTotalHours(startTime, endTime);
    console.log("newtotalHours", newTotalHours);
    setTotalHours(newTotalHours);
  }, [startTime, endTime]);


  const updateSlNo = (tasks: Task[], deleteTask: boolean): Task[] => {
    return tasks.map((task, index) => ({
      ...task
    }));
  };
  const projectTitle = ['Project','TMS', 'LMS','SAASPE', 'Timesheet'];
  const meetingTitle = ['Meeting', 'TMS', 'LMS','SAASPE', 'Timesheet', 'HR-Meet', 'Others'];
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
    // If you want to reset the form when disabling it, you can reset the form state here
    if (!isFormEnabled) {
      setAddTask({
        date: dayjs(currentDate).format('YYYY-MM-DD'),
        workLocation: '',
        task: '',
        project:'',
        startTime: '',
        endTime: '',
        totalHours:'',
        description: '',
        reportingTo: reportingToID,
      });
    }
  };

  // Function to handle editing a task
  const handleEditTask = async (record: any) => {
    console.log("after - filteredTasks", filteredTasks);
    console.log("clicked", record);
    // const newFitleredTasks = filteredTasks.filter((task:any)=> task.timeSheetId !==record.timeSheetId)
    // setFilteredTasks(newFitleredTasks);
    setEditTaskId(record?.timeSheetId);
    setInitialValue({
      date: record.date,
      workLocation: record.workLocation,
      task: record.task,
      project: record.project,
      startTime: record.startTime,
      endTime: record.endTime,
      totalHours: record.totalHours,
      description: record.description,
      reportingTo: record.reportingTo, // Set default value to reportingManagerId if available
    });
    setIsEdited(true);
  };

  // Function to handle submitting the form (including both adding and editing tasks)
  const handleFormSubmit = async (values: any, { setSubmitting, resetForm }: FormikHelpers<any>) => {
    console.log("handleFormSubmit-filteredTasks", filteredTasks);
    console.log("handleFormSubmit-values", values)
    // Check for overlapping tasks in the specified time range

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
        response = await api.put(`/api/v1/timeSheet/edit-task/${editTaskId}`, {
            date: values?.date,
            workLocation: values?.workLocation,
            task: values?.task,
            project: values?.project,
            startTime: values?.startTime,
            endTime: values?.endTime,
            totalHours: values?.totalHours,
            description: values?.description,
            reportingTo: values?.reportingTo,
        });
      } else {
       
        console.log("inside here");
        // If adding a new task, send a POST request to the add-task API endpoint
        response = await api.post('/api/v1/timeSheet/add-task', {
            date: values?.date,
            workLocation: values?.workLocation,
            task: values?.task,
            project: values?.project,
            startTime: values?.startTime,
            endTime: values?.endTime,
            totalHours: values?.totalHours,
            description: values?.description,
            reportingTo: values?.reportingTo,
        });
      }
      console.log("handleformsubmit 1");
      console.log("response", response?.data);
      // Check the response status
      if (response.status === 200) {
        // Handle successful response
        setRefetch((prevState: any) =>  !prevState);
        console.log('Task added/edited successfully:', response.data);
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
            startTime: '',
            endTime: '',
            totalHours: '',
            description: '',
            reportingTo: '', 
        })
        setIsFormSubmitted(true);
        setIsDateChanged(true);
      } else {
        // Handle other response statuses
        console.error('Failed to add/edit task. Status:', response.status);
      }
    } catch (error) {
      // Handle errors
      setSubmitting(false);
      console.error('Error adding/editing task:', error);
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
          message: 'Success',
          description: 'Task Submitted Successfully',
        });
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
      title: 'Sl. No',
      width: '132px',
      dataIndex: 'slNo',
      key: 'slNo',
      fixed: 'left',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Work Location',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'workLocation',
      key: 'workLocation',
      fixed: 'left',
    },
    {
      title: 'Task',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'task',
      key: 'task',
      fixed: 'left',
    },
    {
      title: 'Project',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'project',
      key: 'project',
      fixed: 'left',
    },
    {
      title: 'Date',
      //sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
    },
    {
      title: 'Start Time',
      //sorter: (a: Task, b: Task) => a.startTime.localeCompare(b.startTime),
      dataIndex: 'startTime',
      key: 'startTime',
      fixed: 'left',
      render: (_, record) => {
        return (
            <div>
                {hoursTimeToHoursMinutes(record?.startTime)}
            </div>
        );
    }
    },
    {
      title: 'End Time',
      //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
      dataIndex: 'endTime',
      key: 'endTime',
      fixed: 'left',
      render: (_, record) => {
        return (
            <div>
                {hoursTimeToHoursMinutes(record?.endTime)}
            </div>
        );
    }
    },
    {
      title: 'Total Hours',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'totalHours',
      key: 'totalHours',
      fixed: 'left',
      render: (_, record) => {
        return (
            <div>
                {hoursDecimalToHoursMinutes(record?.totalHours)}
            </div>
        );
    }
    },
    {
      title: 'Description',
      //sorter: (a: Task, b: Task) => a.description.localeCompare(b.description),
      dataIndex: 'description',
      key: 'description',
      fixed: 'left',
    },
    {
      title: 'Reporting To',
      //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      dataIndex: 'reportingTo',
      key: 'reportingTo',
      fixed: 'left',
    }, 
    {
      title: 'Status',
      //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      dataIndex: 'taskStatus',
      key: 'taskStatus',
      fixed: 'left',
    }, 
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record, index) => {
        // const isExistingTask = taskList.some(task => task.task_id === record.task_id);
        const isDateSelected = selectedKeysToHide.includes(record.date);
        
        
        // Filter tasks by userId
        //const userTasks = taskList.filter(task => task.userId === record.userId);
        
        // Check if the user has tasks for the selected date
        //const hasUserTasksForDate = userTasks.some(task => task.date === record.date);
    
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
           <h1>{isFormEnabled ? 'Add Task': 'TimeSheet'}</h1>
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
        {(((filterOption === 'Date' || filterOption === 'Week' || filterOption === 'Month') && isEdited)) || isFormEnabled  ? ( 
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
              {(isFormEnabled )&& ( //&& filterOption!=='Date'
                <CloseCircleOutlined
                  style={{ margin: '10px 20px', display: 'flex', justifyContent: 'flex-end', color: 'black', width:'1000px' }}
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
                        format="YYYY-MM-DD" // Set the format of the displayed date
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
                            } else if (filterOption === 'Month') {
                              setCurrentMonth(date);
                            } else {
                              setCurrentDate(date);
                            }
                            // Set Formik field value
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
                        style={{ wordBreak: "break-word", textAlign:'left' }}
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
                        style={{ width: "100px", height: "41px", cursor: selectedKeysToHide.includes(getCurrentDate()) ? 'not-allowed' : 'pointer'}}
                        className="Button"
                        id='cancel-addTask'
                        onClick={() => handleClearForm(resetForm)}
                        disabled={selectedKeysToHide.includes(getCurrentDate())} // Disable if currentDate is in selectedKeysToHide
                      >
                        Clear
                      </Button>
                    </Form.Item>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          style={{ width: "100%", height: "41px" , marginLeft:'10px', cursor: selectedKeysToHide.includes(getCurrentDate()) ? 'not-allowed' : 'pointer'}}
                          className="Button"
                          disabled={isSubmitting || selectedKeysToHide.includes(getCurrentDate()) }
                          title={selectedKeysToHide.includes(getCurrentDate()) ? 'Approved date should not have the access to add the task' : ''}
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
         
        
        {!cancelButton && !isFormEnabled && (
            <Button
              id='cancel-new'
              onClick={handleToggleForm}
              disabled={isFormEnabled} // Disable the button when the form is enabled
            >
              Add Task
            </Button>
          )}
          <Select 
                    id='submit' 
                    style={{color:'white', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', marginTop:'10px', height:'95%', width:'120px' }} 
                    onChange={(value) => handleFilterChange(value)} 
                    value={filterOption}
                    dropdownStyle={{ textAlign: 'center' }} // Style the dropdown menu
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
            disabled={selectedKeysToHide.includes(getCurrentDate())} // Disable if currentDate is in selectedKeysToHide
            style={{ cursor: selectedKeysToHide.includes(getCurrentDate()) ? 'not-allowed' : 'pointer' }}
            title={selectedKeysToHide.includes(getCurrentDate()) ? 'Approved date should not have the access to submit the task' : ''}
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