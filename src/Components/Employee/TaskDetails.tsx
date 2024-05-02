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
    managerTaskName: string;
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
  managerAssignedTask:{
    managerAssignedTaskId: string;
    managerTaskName: string;
  };
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

const TaskDetails: React.FC = () => {
  const token = localStorage.getItem("authToken");
  const decoded = jwtDecode(token || "") as DecodedToken;
  const userId = decoded.UserId;
  const location = useLocation();
  const { record } = location.state || {};  
  const {filter, date, week, month}= location.state ||{};
  console.log("record", record);
  const [reportingTo, setReportingTo] = useState<UserManager[]>([]);
  const [editTaskId, setEditTaskId]= useState<any>();
  const { Option } = Select;
  const navigate = useNavigate();
  const {confirm}= Modal;
  const { formattedDate } = location.state || { formattedDate: dayjs() };
  const [formWidth, setFormWidth] = useState(800);
  const [currentDate, setCurrentDate] = useState(dayjs(date|| record?.date || formattedDate));
  const [currentWeek, setCurrentWeek] = useState(week||dayjs().startOf('week'));
  const [currentMonth, setCurrentMonth] = useState(month || dayjs().startOf('month'));
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [cancelButton, setCancelButton] = useState(false);
  const [allowDate, setAllowDate]= useState(dayjs().format('YYYY-MM-DD'));
  console.log("allowDate", allowDate);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [filterOption, setFilterOption] = useState(filter || 'Date');
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
            managerAssignedTask:record?.managerAssignedTask.managerTaskName,
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
    navigate('/employee/addtask', {state:{filter: filterOption, date: dayjs(currentDate).format('YYYY-MM-DD'), week: dayjs(currentWeek).format('YYYY-MM-DD'),month: dayjs(currentMonth).format('YYYY-MM-DD')}});
  };

  const handleRequest = () => {
        setModalVisible(true);
  };
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Function to handle editing a task
  const handleEditTask = (record: any) => {
    console.log("handleEditTask-record", record);
    navigate('/employee/addtask', {state:{record}});
    console.log("after - filteredTasks", filteredTasks);
    console.log("clicked", record);
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

  const modalValidationSchema = yup.object().shape({
    month: yup.string()
      .required('Month is required'), // Validate that the month field is not empty
    reportingTo: yup.string()
      .required('ReportingTo is required'), // Validate that the reportingTo field is not empty
    description: yup.string()
      .required('Description is required') // Validate that the description field is not empty
      .max(500, 'Description must be at most 500 characters long') // Validate that the description is at most 500 characters long
  });

  return (
    <ConfigProvider theme={config}>
      <div className='createuser-main' style={{overflow:'hidden'}}>
        <div className='header'>
          <div>
            <h1 style={{marginLeft:'20px'}}>Timesheet</h1>
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
        { submissionEnable && (
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

export default TaskDetails;