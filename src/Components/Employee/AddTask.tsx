import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Input, TimePicker, Select, notification, DatePicker, Button, Modal, ConfigProvider} from 'antd';
import { SearchOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import '../Styles/CreateUser.css';
import DashboardLayout from '../Dashboard/Layout';
import Chart from 'react-apexcharts';
import '../Styles/AddTask.css';
import {Table} from 'antd';
import { ColumnsType } from "antd/es/table";
import ApprovalRequest from '../Manager/ApprovalRequest';
import { EditOutlined, DeleteOutlined,CloseCircleOutlined,LeftOutlined, RightOutlined } from '@ant-design/icons';
import Dashboard from './Dashboard';
import { RecentRejected, SelectedKeys, RejectedKeys } from '../Manager/MonthTasks';
import asset from '../../assets/images/asset.svg';
import type { ThemeConfig } from "antd";
export interface DateTask{
  key: string;
  task: Task[];
}

export interface RequestedOn {
  [key: string]: string[]; // Each key represents a month (e.g., "February 2024") with an array of dates
}

export interface TaskRequestedOn {
  [userId: string]: RequestedOn; // Each key represents a month (e.g., "February 2024") with an array of dates
}


export interface Task {
  key?:string;
  idx: number; 
  date: string;
  userId: string;
  workLocation: string;
  task: string;
  title: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  description: string;
  reportingTo: string;
  slNo?: number;
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
  const userId = '1234';
  const { Option } = Select; // Destructure the Option component from Select
  const navigate = useNavigate();
  const {confirm}= Modal;
  const location = useLocation();
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
    idx: 1, // Set initial idx
    date: currentDate.format('YYYY-MM-DD'),
    userId: userId,
    workLocation: '',
    task: '',
    title: '',
    startTime: '',
    endTime: '',
    totalHours: '',
    description: '',
    reportingTo: '',
  });
  const [deletedTaskIdx, setDeletedTaskIdx] = useState<number | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const reportingOptions = ['ManagerA', 'ManagerB', 'ManagerC'];
  const taskOptions = ['Task','Project','Learning','Training','Meeting'];
  const [filterOption, setFilterOption] = useState('Date');
  const [isEdited, setIsEdited]= useState<boolean>(false);
  // State to manage the search input
  const [searchInput, setSearchInput] = useState('');
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [selectedKeysToHide, setSelectedKeysToHide]=useState<string[]>([]);
  const [pieChartDataInForm, setPieChartDataInForm] = useState<PieChartData>({ options: { labels: [] }, series: [] });

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  useEffect(() => {
    const userId = addTask.userId;
    const currentDate = dayjs(addTask.date);
    const month = currentDate.format('YYYY-MM');
    const currentDateFormatted = currentDate.format('YYYY-MM-DD');
    const approvedRequestedOnString = localStorage.getItem('approveTaskRequestedOn');
    const approvedRequestedOn: TaskRequestedOn = approvedRequestedOnString ? JSON.parse(approvedRequestedOnString) : {};
  
    // Check if the date is in the taskList or approvedTaskRequestedOn
    if (taskList.find(task => task.userId === userId && task.date === addTask.date)|| approvedRequestedOn[userId]?.[month]?.includes(addTask.date)|| dayjs(addTask.date).isSame(dayjs().format('YYYY-MM-DD'))) {
      setIsButtonDisabled(true);
    } else {
      setIsButtonDisabled(false);
    }
  }, [addTask.date, addTask.userId, taskList]); // Update dependencies as per your requirement

 const updateSlNo = (tasks: Task[], deleteTask: boolean): Task[] => {
  return tasks.map((task, index) => ({
    ...task,
    slNo: index + 1,
    idx: deleteTask ? index + 1 : task.idx
  }));
};
const projectTitle = ['Project','TMS', 'LMS','SAASPE', 'Timesheet'];
const meetingTitle = ['Meeting', 'TMS', 'LMS','SAASPE', 'Timesheet', 'HR-Meet', 'Others'];
const workLocation = ['Work Location', 'Work from Home', 'Work From Office'];
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
  }, []);

  const borderStyle = {
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Add box shadow
    margin: '10px 20px',
   // padding: '10px 20px',
    //width: formWidth + 'px',
    width: '1350px',
    height:'540px'
  };

  useEffect(() => {
    const storedKeysString: string | null = localStorage.getItem('selectedKeys');
    if (storedKeysString !== null) {
        const storedKeys: SelectedKeys = JSON.parse(storedKeysString);
        if (storedKeys.hasOwnProperty(userId)) {
            setSelectedKeysToHide(storedKeys[userId]);
        } else {
            console.log("User ID not found in stored keys");
        }
    } else {
        console.log("else-useEffect", storedKeysString);
    }
  }, []);

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
  }, [filteredTasks]);

  <Chart
    options={pieChartDataInForm.options}
    series={pieChartDataInForm.series}
    type="pie"
    width="380"
  />

  
  const handleInputChange = (field: keyof Task, value: string) => {
    if (field === 'date') {
      if(filterOption==='Month'){
        
      }
      const selectedDate = dayjs(value);
      if (selectedDate.isAfter(dayjs(), 'day')) {
        // Display a notification
        notification.warning({
          message: 'Warning',
          description: 'Cannot select a future date.',
        });
        // Set the selected date to today
        setCurrentDate(dayjs());
      } else {
        // Update the state with the selected date
        setCurrentDate(selectedDate);
      }
    }
  
    // Keep userId constant
    if (field === 'userId') {
      setAddTask((prevTask) => ({ ...prevTask, [field]: value }));
    } else {
      // Update startTime or endTime with the new value
      const updatedTime = value || dayjs().format('hh:mm A');
      setAddTask((prevTask) => ({ ...prevTask, [field]: updatedTime }));
      // Calculate the duration and update totalHours
      const updatedStartTime = field === 'startTime' ? updatedTime : addTask.startTime || dayjs().format('hh:mm A');
      const updatedEndTime = field === 'endTime' ? updatedTime : addTask.endTime || dayjs().format('hh:mm A');
      const duration = dayjs(updatedEndTime, 'hh:mm A').diff(dayjs(updatedStartTime, 'hh:mm A'), 'hour', true);
      setAddTask((prevTask) => ({
        ...prevTask,
        startTime: field === 'startTime' ? updatedTime : addTask.startTime,
        endTime: field === 'endTime' ? updatedTime : addTask.endTime,
        totalHours: duration.toFixed(2),
      }));
    }
  };
  
  useEffect(() => {
    const storedTaskListString = localStorage.getItem('taskList');
    const storedTaskList = storedTaskListString ? JSON.parse(storedTaskListString) : [];

    // Filter tasks based on the userId
    //const userTaskList = storedTaskList.filter((task:Task)=> task.userId === userId);

    // Assuming deletedTask is a state variable
    const updatedTaskList = updateSlNo(storedTaskList, deletedTask);

    setTaskList(updatedTaskList);
    setFilteredTasks(updatedTaskList);
  }, [deletedTask]); // Include deletedTask in the dependency array

//   useEffect(() => {
//     // Filter tasks based on the addTask.date and userId when it changes
//     if (addTask.date) {
//         const filtered = taskList.filter(task => task.date === addTask.date && task.userId === userId);
//         setFilteredTasks(updateSlNo(filtered, deletedTask)); // Update slNo when loading tasks
//     } else {
//         // If no date is selected, display all tasks
//         setFilteredTasks(updateSlNo(taskList, deletedTask)); // Update slNo when loading tasks
//     }
// }, [addTask.date, taskList]);

const handleFormOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  handleFormSubmit();
};

  useEffect(() => {
    // Update addTask with the current date
    if (!isEdited) {
      // Update addTask with the current date only when not in edit mode
      setAddTask((prevAddTask) => ({
        ...prevAddTask,
        date: dayjs(currentDate).format('YYYY-MM-DD'),
    }));
  }
    //setFilteredTasks(taskList);
    // Filter tasks based on the filterOption and currentDate when they change
    if(!isDateChanged){
    let filtered: Task[] = [];

    if (searchInput) {
      // If there is a search input, filter tasks based on date or month
      const searchDate = dayjs(searchInput);
      filtered = taskList.filter((task) => {
          if (filterOption === 'Date') {
            return ((dayjs(task.date).isSame(searchDate, 'day'))&&(task.userId===userId));
            } else if (filterOption === 'Week') {
              const startOfWeek = currentWeek.startOf('week');
              const endOfWeek = currentWeek.endOf('week');
              return (
                (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
                (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek)) &&
                task.userId===userId
              );
            } else if (filterOption === 'Month') {
              // Format the searchInput in the same way as the task date
              const formattedSearchMonth = searchDate.format('MMMM');
              return ((dayjs(task.date).format('MMMM') === formattedSearchMonth) && (task.userId===userId));
            }
        return false;
      });
    }  else {
      // If no search input, apply the regular filtering based on filterOption and currentDate
      if (filterOption === 'Date') {
        filtered = taskList.filter((task) => 
          task.date === dayjs(currentDate).format('YYYY-MM-DD') && task.userId===userId);
        console.log("useEffect-date", filtered)
      } else if (filterOption === 'Week') {
        const startOfWeek = currentWeek.startOf('week');
        const endOfWeek = currentWeek.endOf('week');
        filtered = taskList.filter(
          (task) =>
            (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
            (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek)) &&
            task.userId ===userId
        );
        console.log("useeffect-week", filtered);
      } else if (filterOption === 'Month') {
        const startOfMonth = currentMonth.startOf('month');
        const endOfMonth = currentMonth.endOf('month');
        filtered = taskList.filter(
          (task) =>
            (dayjs(task.date).isSame(startOfMonth) || dayjs(task.date).isAfter(startOfMonth)) &&
            (dayjs(task.date).isSame(endOfMonth) || dayjs(task.date).isBefore(endOfMonth)) && 
            (task.userId === userId)
        );
        console.log("useeffect", filtered);
      }
    }

    setFilteredTasks(updateSlNo(filtered, deletedTask));
  }
  setIsDateChanged(false);
  //  console.log("useeffect filtered-task", filteredTasks);
  }, [isEdited, filterOption, currentDate, currentMonth, currentWeek, taskList, searchInput, isDateChanged]);

  const handleFilterChange = (value: any) => {
    setFilterOption(value);
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

  const handleToggleForm = () => {
    setIsFormEnabled((prevIsFormEnabled) => !prevIsFormEnabled);
    setCancelButton((prevIsFormEnabled) => !prevIsFormEnabled);
    // If you want to reset the form when disabling it, you can reset the form state here
    if (!isFormEnabled) {
      setAddTask({
        date: dayjs(currentDate).format('YYYY-MM-DD'),
        userId:userId,
        workLocation: '',
        task: '',
        title:'',
        startTime: '',
        endTime: '',
        totalHours:'',
        description: '',
        reportingTo: '',
        idx: addTask.idx,
      });
    }
  };

  const handleFormSubmit = () => {
    const userId = addTask.userId;

    // Check if the addTask date is included in selectedKeysToHide
    if (selectedKeysToHide.includes(addTask.date)) {
      notification.warning({
          message: 'Restricted',
          description: `The Task Approved: ${addTask.date} & Restrict to Add New Task`,
      });
      return;
  }

  const taskRequestedOn = localStorage.getItem('taskRequestedOn');
  const approvedRequestedOnString = localStorage.getItem('approveTaskRequestedOn');
const approvedRequestedOn: TaskRequestedOn = approvedRequestedOnString ? JSON.parse(approvedRequestedOnString) : {};
console.log("approvedRequestedOn", approvedRequestedOn);  
    // Check if the date is not in the taskList and it's before the currentDate
    // const currentDateFormatted = dayjs().format('YYYY-MM-DD');
    // if (
    //     (!taskList.find(task => (task.userId===addTask.userId) && (task.date === addTask.date)) && dayjs(addTask.date).isBefore(currentDateFormatted))
    // ) {
    //     notification.warning({
    //         message: 'Restricted',
    //         description: 'Cannot add task for a date before the current date and not present in the task list.',
    //     });
    //     return;
    // }

    const currentDateFormatted = dayjs().format('YYYY-MM-DD');
    // Check if the date is not present in the approvedRequestedOn and satisfies the condition
    console.log("approvedRequestedOn", approvedRequestedOn[userId]?.[dayjs(addTask?.date).format('YYYY-MM')]?.includes(addTask.date));
    if (
      (!approvedRequestedOn[userId]?.[dayjs(addTask?.date).format('YYYY-MM')]?.includes(addTask.date)) &&
      (!taskList.find(task => task.userId === addTask.userId && task.date === addTask.date) &&
      dayjs(addTask.date).isBefore(currentDateFormatted))
  ) {
      notification.warning({
          message: 'Restricted',
          description: 'Cannot add task for a date before the current date and not present in the task list.',
      });
      return;
  }
  
  

    // Check for overlapping tasks in the specified time range
    const overlappingTask = taskList.find(task => {
      if(task.userId !== addTask.userId) return false;
      const newTaskStartTime = dayjs(addTask.startTime, 'hh:mm A');
      const newTaskEndTime = dayjs(addTask.endTime, 'hh:mm A');
      const taskStartTime = dayjs(task.startTime, 'hh:mm A');
      const taskEndTime = dayjs(task.endTime, 'hh:mm A');
    
      // Check if the new task overlaps with any existing task
      return (
        !isEdited && task.date === addTask.date &&
        (
          ((newTaskStartTime.isSame(taskStartTime) || newTaskStartTime.isAfter(taskStartTime)) && newTaskStartTime.isBefore(taskEndTime)) ||
          ((newTaskEndTime.isSame(taskStartTime) || newTaskEndTime.isAfter(taskStartTime)) && newTaskEndTime.isBefore(taskEndTime)) ||
          (newTaskStartTime.isBefore(taskStartTime) && (newTaskEndTime.isSame(taskEndTime) || newTaskEndTime.isAfter(taskEndTime)))
        )
      );
    });
      
    if (overlappingTask) {
      notification.warning({
        message: 'Restricted',
        description: 'Task already exists in the specified time range.',
      });
      return;
    }

    if (isEdited) {
      // If editing, update the existing task
      const updatedTaskList = taskList.map(task =>
        (task.idx === addTask.idx) && (task.userId === addTask.userId)
         ? { ...addTask } : task
      );
      setTaskList(updatedTaskList);
      setFilteredTasks(updateSlNo(updatedTaskList, deletedTask));
      localStorage.setItem('taskList', JSON.stringify(updatedTaskList));
      setIsEdited(false);
    } else {
      // Update the taskList
      const updatedTaskList = [
        ...taskList,
        { ...addTask, idx: taskList.length + 1 }
      ];
      setTaskList(updatedTaskList);
      setFilteredTasks(updateSlNo(updatedTaskList, deletedTask));
      localStorage.setItem('taskList', JSON.stringify(updatedTaskList));
    }

    // After successful submission, remove the date from approvedRequestedOn
  // if (approvedRequestedOn[userId]?.[dayjs(addTask?.date).format('YYYY-MM')]?.includes(addTask.date)) {
  //   const updatedApprovedRequestedOn = { ...approvedRequestedOn };
  //   const index = updatedApprovedRequestedOn[userId][dayjs(addTask?.date).format('YYYY-MM')].indexOf(addTask.date);
  //   updatedApprovedRequestedOn[userId][dayjs(addTask?.date).format('YYYY-MM')].splice(index, 1);
  //   localStorage.setItem('approveTaskRequestedOn', JSON.stringify(updatedApprovedRequestedOn));
  // }
  
    // Clear the form with the default date and reset idx
    setAddTask({
      idx: taskList.length + 2, // Set a new idx
      date: dayjs(currentDate).format('YYYY-MM-DD'),
      userId: userId,
      workLocation: '',
      task: '',
      title:'',
      startTime: '',
      endTime: '',
      totalHours: '',
      description: '',
      reportingTo: '',
    });
    setIsEdited(false);
    setIsFormSubmitted(true);
    setIsDateChanged(true);
};

const handleRequestForm = () => {
  const userId = addTask.userId;
  const month = dayjs(addTask.date).format('YYYY-MM');
  const currentDateFormatted = dayjs().format('YYYY-MM-DD');
  const approvedRequestedOnString = localStorage.getItem('approveTaskRequestedOn');
  const approvedTaskRequestedOn: TaskRequestedOn = approvedRequestedOnString ? JSON.parse(approvedRequestedOnString) : {};
  if (
    !taskList.find(task => task.userId === userId && task.date === addTask.date) &&
    dayjs(addTask.date).isBefore(currentDateFormatted) && !(approvedTaskRequestedOn[userId]?.[dayjs(addTask?.date).format('YYYY-MM')]?.includes(addTask.date))
  ) {
    const taskRequestedOn: TaskRequestedOn = JSON.parse(localStorage.getItem('taskRequestedOn') || '{}');
    

    if (!taskRequestedOn[userId]) {
      taskRequestedOn[userId] = {};
    }

    if (!taskRequestedOn[userId][month]) {
      taskRequestedOn[userId][month] = [];
    }

    let datesToRequest: string[] = [];

    if (filterOption === 'Month') {
      // Get the first and last dates of the month
      const firstDayOfMonth = dayjs(addTask.date).startOf('month');
      const lastDayOfMonth = dayjs(addTask.date).endOf('month');
      const presentDate = dayjs().format('YYYY-MM-DD');
      // Generate all dates in the month
      let currentDate = firstDayOfMonth;
      while (
        (currentDate.isSame(lastDayOfMonth, 'day') || currentDate.isBefore(lastDayOfMonth, 'day')) &&
        !currentDate.isAfter(presentDate)
      ) {
        const currentDateFormatted = currentDate.format('YYYY-MM-DD');
        if (
          !taskList.some(task => task.userId === userId && task.date === currentDateFormatted) &&
          !approvedTaskRequestedOn[userId]?.[month]?.includes(currentDateFormatted)
        ) {
          // Check if the date is not already present in both approvedTaskRequestedOn and taskList
          if (!taskRequestedOn[userId][month].includes(currentDateFormatted)) {
            datesToRequest.push(currentDateFormatted);
          }
        }
        currentDate = currentDate.add(1, 'day');
      }
    } else if (filterOption === 'Week') {
      // Get the first and last dates of the week
      const startOfWeek = dayjs(addTask.date).startOf('week');
      const endOfWeek = dayjs(addTask.date).endOf('week');
      const presentDate = dayjs().format('YYYY-MM-DD');
      // Generate all dates in the week
      let currentDate = startOfWeek;
      while (
        (currentDate.isSame(endOfWeek, 'day') || currentDate.isBefore(endOfWeek, 'day')) &&
        !currentDate.isAfter(presentDate)
      ) {
        const currentDateFormatted = currentDate.format('YYYY-MM-DD');
        if (
          !taskList.some(task => task.userId === userId && task.date === currentDateFormatted) &&
          !approvedTaskRequestedOn[userId]?.[month]?.includes(currentDateFormatted)
        ) {
          // Check if the date is not already present in both approvedTaskRequestedOn and taskList
          if (!taskRequestedOn[userId][month].includes(currentDateFormatted)) {
            datesToRequest.push(currentDateFormatted);
          }
        }
        currentDate = currentDate.add(1, 'day');
      }
    } else if (filterOption === 'Date') {
      // Generate dates for the specific date option
      const currentDate = dayjs(addTask.date).format('YYYY-MM-DD');
      if (
        !taskList.some(task => task.userId === userId && task.date === currentDate) &&
        !approvedTaskRequestedOn[userId]?.[month]?.includes(currentDate)
      ) {
        // Check if the date is not already present in both approvedTaskRequestedOn and taskList
        if (!taskRequestedOn[userId][month].includes(currentDate)) {
          datesToRequest.push(currentDate);
        }
      }
    }

    taskRequestedOn[userId][month] = taskRequestedOn[userId][month].concat(datesToRequest);

    localStorage.setItem('taskRequestedOn', JSON.stringify(taskRequestedOn));

    // Display notification
    notification.success({
      message: `The request for ${addTask.date} has been sent.`,
      placement: 'topRight',
    });
  } 
};



  const handleClearSubmit = () => {
    // Clear the form with the default date and set idx
    setAddTask({
      date: dayjs(addTask.date).format('YYYY-MM-DD'),
      userId: userId,
      workLocation: '',
      task: '',
      title:'',
      startTime: '',
      endTime: '',
      totalHours:'',
      description: '',
      reportingTo: '',
      idx: addTask.idx 
    });
  }
  
//   const handleEditTask = (idx: number) => {
//     const taskToEdit = taskList.find((task) => task.idx === idx);
//     const isExistingTask = taskToEdit !== undefined; // Check if taskToEdit is defined
//     // if (taskToEdit) {
//         // const isDateSelected = selectedKeysToHide.includes(taskToEdit.date);
        
//     //     // if (isDateSelected && isExistingTask) {
//     //     //     // Date is selected and it's an existing task, so prevent further action
//     //     //     // You can display a message or handle this case according to your application's logic
//     //     //     return;
//     //     // }

//     //     // setIsEdited(true);
//     //     // setAddTask({
//     //     //     date: taskToEdit.date,
//     //     //     userId: taskToEdit.userId,
//     //     //     task: taskToEdit.task,
//     //     //     startTime: taskToEdit.startTime,
//     //     //     endTime: taskToEdit.endTime,
//     //     //     totalHours: taskToEdit.totalHours,
//     //     //     description: taskToEdit.description,
//     //     //     reportingTo: taskToEdit.reportingTo,
//     //     //     idx: taskToEdit.idx, 
//     //     // });

//     //     // // Now, you can perform additional actions or display a modal for editing
//     //     // setCurrentDate(dayjs(taskToEdit.date));

//     // }

//     if (taskToEdit) {
//       const isDateSelected = selectedKeysToHide.includes(taskToEdit.date);

//       if (isDateSelected && taskToEdit.isNew) {
//           // If the task is newly added and its date is selected, allow editing
//           setIsEdited(true);
//           setAddTask({ ...taskToEdit });
//           setCurrentDate(dayjs(taskToEdit.date));
//       } else if (!isDateSelected) {
//           // If the date is not selected, allow editing
//           setIsEdited(true);
//           setAddTask({ ...taskToEdit });
//           setCurrentDate(dayjs(taskToEdit.date));
//       } else {
//           // Date is selected and it's an existing task, so prevent further action
//           // You can display a message or handle this case according to your application's logic
//           return;
//       }
//   } else {
//       // Handle the case where taskToEdit is undefined
//       // You can display a message or handle this case according to your application's logic
//       return;
//   }
// };

const handleEditTask = (idx: number) => {
  const taskToEdit = taskList.find((task) => (task.idx === idx) && (task.userId === addTask.userId));
  if (taskToEdit) {
    // Check if the date is included in selectedKeysToHide
    if (selectedKeysToHide.includes(taskToEdit.date)) {
      // Date is included in selectedKeysToHide, so prevent further action
      // You can display a message or handle this case according to your application's logic
      return;
    }

    setIsEdited(true);
  
    setAddTask({
        date: taskToEdit.date,
        userId: taskToEdit.userId,
        workLocation:taskToEdit.workLocation,
        task: taskToEdit.task,
        title:taskToEdit.title,
        startTime: taskToEdit.startTime,
        endTime: taskToEdit.endTime,
        totalHours: taskToEdit.totalHours,
        description: taskToEdit.description,
        reportingTo: taskToEdit.reportingTo,
        idx: taskToEdit.idx, 
    });

    // Now, you can perform additional actions or display a modal for editing
    setCurrentDate(dayjs(taskToEdit.date));
  }
};

const handleDeleteTask = useCallback((idx: number) => {
  const taskToDelete = taskList.find(task => (task.idx === idx));  //&&(task.userId === addTask.userId)
  
  if (!taskToDelete || selectedKeysToHide.includes(taskToDelete.date)) {
    // Task not found or its date is in selectedKeysToHide, do not delete
    return;
  }

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
    onOk() {
      // Logic to delete the task if user confirms
      const updatedTaskList = taskList.filter(task => (task.idx !== idx)); //&&(task.userId==addTask.userId)
  
      // Reindex the idx starting from 1
      const reindexedTaskList = updateSlNo(updatedTaskList, true);
  
      setTaskList(reindexedTaskList);
      setFilteredTasks(reindexedTaskList);
  
      // Update localStorage
      localStorage.setItem('taskList', JSON.stringify(reindexedTaskList));
    },
    onCancel() {
      // Logic if user cancels deletion
    },
  });
}, [taskList, selectedKeysToHide]);


// const handleDeleteTask = useCallback((idx: number) => {
//   // Check if the date is included in selectedKeysToHide
//   const isDateIncluded = selectedKeysToHide.some(date => {
//       // Assuming taskList contains tasks with a 'date' property
//       const task = taskList.find(task => task.idx === idx);
//       return task && task.date === date;
//   });

//   // Toggle the deletedTask flag based on the presence of the date in selectedKeysToHide
//   setDeletedTask(!isDateIncluded);

//   // Save idx in state
//   setDeletedTaskIdx(idx);
// }, [selectedKeysToHide, taskList]);


//   useEffect(() => {
//     if (deletedTask) {
//       // Implement the logic to delete the task based on idx
//       const updatedTaskList = taskList.filter(task => {
//         // Check if the task date is not included in selectedKeysToHide and isNew is true
//         return !selectedKeysToHide.includes(task.date);
//       });
  
//       // Reindex the idx starting from 1 and use deletedTask flag
//       const reindexedTaskList = updateSlNo(updatedTaskList, deletedTask);
  
//       setTaskList(reindexedTaskList);
//       setFilteredTasks(reindexedTaskList);
  
//       // Update localStorage
//       localStorage.setItem('taskList', JSON.stringify(reindexedTaskList));
  
//       // Reset the deletedTask flag after updating
//       setDeletedTask(false);
//     }
//   }, [deletedTask, deletedTaskIdx, selectedKeysToHide, taskList]);

  // const handleDeleteTask = useCallback((idx: number) => {
  //   // Display confirmation modal before deleting the task
  //   confirm({
  //     title: 'Delete Task',
  //     content: 'Are you sure you want to delete the task?',
  //     okText: 'Yes',
  //     okButtonProps: {
  //       style: {
  //         width: '80px', backgroundColor: '#0B4266', color: 'white'
  //       },
  //     },
  //     cancelText: 'No',
  //     cancelButtonProps: {
  //       style: {
  //         width: '80px', backgroundColor: '#0B4266', color: 'white'
  //       },
  //     },
  //     onOk() {
  //       // Logic to delete the task if user confirms
  //       const updatedTaskList = taskList.filter(task => task.idx !== idx);
    
  //       // Reindex the idx starting from 1
  //       const reindexedTaskList = updateSlNo(updatedTaskList);
    
  //       setTaskList(reindexedTaskList);
  //       setFilteredTasks(reindexedTaskList);
    
  //       // Update localStorage
  //       localStorage.setItem('taskList', JSON.stringify(reindexedTaskList));
  //     },
  //     onCancel() {
  //       // Logic if user cancels deletion
  //     },
  //   });
  // }, [taskList]);

  
  
  // const handleOverallSubmit = () => {
  //   // Assuming you have an API endpoint for approval requests
  //   //const apiUrl = 'http://localhost:3000/approvalrequests';

  //   // Prepare the data to be sent
  //   const requestData = filteredTasks.map(task => ({
  //     date: task.date,
  //     userId: task.userId,
  //     task: task.task,
  //     startTime: task.startTime,
  //     endTime: task.endTime,
  //     totalHours: task.totalHours,
  //     description: task.description,
  //     reportingTo: task.reportingTo,
  //     idx: task.idx,
  //   }));
  //   // Navigate to the approvalrequests component with the data
  //   navigate('/approvalrequests', { state: { requestData } });
  //   // Make the HTTP POST request to the /approvalrequests endpoint
  //   // fetch(apiUrl, {
  //   //   method: 'POST',
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   //   body: JSON.stringify(requestData),
  //   // })
  //   //   .then(response => {
  //   //     if (!response.ok) {
  //   //       console.log("network response was not okay");
  //   //       throw new Error('Network response was not ok');
          
  //   //     }
  //   //     return response.json();
  //   //   })
  //   //   .then(data => {
  //   //     // Handle the success response from the server
  //   //     console.log('Submission successful:', data);
  //   //     // You may want to show a success message or redirect the user
  //   //     // Show success notification
  //   //     notification.success({
  //   //       message: 'Submission Successful',
  //   //       description: 'Task details submitted successfully!',
  //   //     });
  //   //   })
  //   //   .catch(error => {
  //   //     // Handle errors during the fetch
  //   //     console.error('Error during submission:', error);
  //   //     // Show error notification
  //   //     notification.error({
  //   //       message: 'Submission Failed',
  //   //       description: 'There was an error submitting the task details.',
  //   //     });
  //   //     // You may want to show an error message to the user
  //   //   });
  // };

//   const handleOverallSubmit = () => {
//     // Prepare the data to be sent
//     const requestData: Task[] = filteredTasks.map(task => ({
//         date: task.date,
//         userId: task.userId,
//         task: task.task,
//         startTime: task.startTime,
//         endTime: task.endTime,
//         totalHours: task.totalHours,
//         description: task.description,
//         reportingTo: task.reportingTo,
//         idx: task.idx,
//     }));

//     // Set the success notification
//     notification.success({
//         message: 'Submission Successful',
//         description: 'Task details submitted successfully!',
//     });
//     navigate('/approvalrequests')
//     // Set the approvalRequestsData state
//     console.log("handleOverAllsubmit", requestData);
//     setApprovalRequestsData(requestData);
//     localStorage.setItem('requestedOn', addTask.date);
//     // Store the approvalRequestsData in local storage
//     localStorage.setItem('approvalRequestsData', JSON.stringify(requestData));

//     // Retrieve rejectedKeys from local storage
//     const rejectedKeysString = localStorage.getItem('rejectedKeys');
//     console.log("rejectedKeysString",rejectedKeysString);
//     if (rejectedKeysString) {
//       let parsedRejectedKeys: RecentRejected[] = JSON.parse(rejectedKeysString);
//       console.log("rejectedKeys", parsedRejectedKeys);
//       // Check if 'submit' exists in rejectedKeys
//       const date = requestData.length > 0 ? requestData[0].date : '';
//       if (parsedRejectedKeys.some((key) => key.date === date)) {
//         // Remove 'date' from rejectedKeys
//         const updatedRejectedKeys = parsedRejectedKeys.filter((key) => key.date !== date);

//         // Update rejectedKeys in local storage
//         localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
//     }
//     }
// };



const handleOverallSubmit = () => {

  // Filter tasks where userId matches addTask.userId
  const tasksToSend: Task[] = filteredTasks.filter(task => task.userId === addTask.userId);
    // Prepare the data to be sent
    const requestData: Task[] = tasksToSend.map(task => ({
        date: task.date,
        userId: task.userId,
        workLocation: task.workLocation,
        task: task.task,
        title:task.title,
        startTime: task.startTime,
        endTime: task.endTime,
        totalHours: task.totalHours,
        description: task.description,
        reportingTo: task.reportingTo,
        idx: task.idx,
    }));

    // Group tasks by date
    const groupedTasks: { [date: string]: Task[] } = {};
    requestData.forEach(task => {
        if (groupedTasks.hasOwnProperty(task.date)) {
            groupedTasks[task.date].push(task);
        } else {
            groupedTasks[task.date] = [task];
        }
    });

        // Determine the key based on the filterOption
    let key: string;
    if (filterOption === "Date") {
        key = currentDate.format("MMMM YYYY"); // Format Dayjs object to "February 2024"
    } else if (filterOption === 'Week') {
        key = currentWeek.startOf('week').format("MMMM YYYY"); // Format Dayjs object to "February 2024"
    } else {
        key = currentMonth.startOf('month').format("MMMM YYYY"); // Format Dayjs object to "February 2024"
    }

    let date: string[] = [];
    if (filterOption === "Date") {
        date.push(currentDate.format('YYYY-MM-DD')); // Format Dayjs object to "February 2024"
    } else if (filterOption === 'Week') {
        const fromDate = currentWeek.startOf('week').format("YYYY-MM-DD"); // Format Dayjs object to "February 2024"
        const toDate = currentWeek.endOf('week').format("YYYY-MM-DD");
        date.push(fromDate);
        date.push(toDate);
    } else {
        const fromDate = currentMonth.startOf('month').format("YYYY-MM-DD"); // Format Dayjs object to "February 2024"
        const toDate = currentMonth.endOf('month').format("YYYY-MM-DD");
        date.push(fromDate);
        date.push(toDate);
    }

    // Retrieve requestedOn from local storage
    const requestedOnString = localStorage.getItem('requestedOn');
    const requestedOn: RequestedOn = requestedOnString ? JSON.parse(requestedOnString) : {};

    // Update requestedOn with the new date
    requestedOn[key] = date;

    // Update requestedOn in local storage
    localStorage.setItem('requestedOn', JSON.stringify(requestedOn));


    // Store the approvalRequestsData in local storage as an object
    const approvalRequestedData: { [date: string]: Task[] } = groupedTasks;
    localStorage.setItem('approvalRequestedData', JSON.stringify(approvalRequestedData));

    // Assuming userId is available in your component's scope

    // Retrieve rejectedKeys from local storage for the specific userId
    const rejectedKeysString = localStorage.getItem('rejectedKeys');
    console.log("rejectedKeysString", rejectedKeysString);

    if (rejectedKeysString) {
        const parsedRejectedKeys: RejectedKeys = JSON.parse(rejectedKeysString);
        console.log("rejectedKeys", parsedRejectedKeys);

        // Check if userId exists in rejectedKeys
        if (parsedRejectedKeys.hasOwnProperty(userId)) {
            // Get the rejectedKeys for the specific userId
            const userRejectedKeys = parsedRejectedKeys[userId];

            // Check if 'submit' exists in rejectedKeys for the specific user
            const date = requestData.length > 0 ? requestData[0].date : '';
            if (userRejectedKeys.some((key) => key.date === date)) {
                // Remove 'date' from rejectedKeys for the specific user
                const updatedRejectedKeys = userRejectedKeys.filter((key) => key.date !== date);

                // Update rejectedKeys in local storage for the specific user
                parsedRejectedKeys[userId] = updatedRejectedKeys;
                localStorage.setItem('rejectedKeys', JSON.stringify(parsedRejectedKeys));
            }
        }
    }

    // Set the success notification
    notification.success({
        message: 'Submission Successful',
        description: 'Task details submitted successfully!',
    });

    // Navigate to approval requests page
    //navigate('/manager/approvalrequests');
};

  const columns: ColumnsType<Task> = [
    {
      title: 'Sl.no',
      width:'132px',
      //sorter: (a: Task, b: Task) => (a.slNo && b.slNo ? a.slNo - b.slNo : 0),
      dataIndex: 'slNo',
      key: 'slNo',
      fixed: 'left',
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
      title: 'Title',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'title',
      key: 'title',
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
    },
    {
      title: 'End Time',
      //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
      dataIndex: 'endTime',
      key: 'endTime',
      fixed: 'left',
    },
    {
      title: 'Total Hours',
      //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'totalHours',
      key: 'totalHours',
      fixed: 'left',
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
    // {
    //   title: 'Actions',
    //   dataIndex: 'actions',
    //   key: 'actions',
    //   render: (_, record, index) => {
    //     const isDateSelected = selectedKeysToHide.includes(record.date); // Assuming record.date represents the date of the task
    //     return (
    //       <div>
    //         <EditOutlined
    //           onClick={() => handleEditTask(record.idx)}
    //           style={{
    //             marginRight: '8px',
    //             cursor: isDateSelected ? 'not-allowed' : 'pointer',
    //             color: isDateSelected ? 'grey' : 'blue',
    //             fontSize: '20px',
    //           }}
    //           disabled={isDateSelected}
    //         />
    //         <DeleteOutlined
    //           onClick={() => handleDeleteTask(record.idx)}
    //           style={{
    //             cursor: isDateSelected ? 'not-allowed' : 'pointer',
    //             color: isDateSelected ? 'grey' : 'red',
    //             fontSize: '20px',
    //           }}
    //           disabled={isDateSelected}
    //         />
    //       </div>
    //     );
    //   },
    // }    
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record, index) => {
        const isExistingTask = taskList.some(task => task.idx === record.idx);
        const isDateSelected = selectedKeysToHide.includes(record.date);
        
        // Filter tasks by userId
        const userTasks = taskList.filter(task => task.userId === record.userId);
        
        // Check if the user has tasks for the selected date
        const hasUserTasksForDate = userTasks.some(task => task.date === record.date);
    
        return (
          <div>
            <EditOutlined
              onClick={() => handleEditTask(record.idx)}
              style={{
                marginRight: '8px',
                cursor: (isDateSelected || !hasUserTasksForDate) ? 'not-allowed' : 'pointer',
                color: (isDateSelected || !hasUserTasksForDate) ? 'grey' : 'blue', 
                fontSize: '20px',
              }}
              disabled={isDateSelected || !hasUserTasksForDate}
            />
            <DeleteOutlined
              onClick={() => handleDeleteTask(record.idx)}
              style={{
                cursor: (isDateSelected || !hasUserTasksForDate) ? 'not-allowed' : 'pointer',
                color: (isDateSelected || !hasUserTasksForDate) ? 'grey' : 'red',
                fontSize: '20px',
              }}
              disabled={isDateSelected || !hasUserTasksForDate}
            />
          </div>
        );
      },
    }    
    
       
  ]

  return (
    <ConfigProvider theme={config}>
      <div className='createuser-main'>
        <div className='header'>
          <div>
            <h1>Add Task</h1>
          </div>
          { filterOption === 'Month' ? (
            <div style={{display:'flex', justifyContent:'flex-end'}}>
              <div className='date'>From: {dayjs(currentMonth).format('YYYY-MM-DD')}</div>
              <div className='date' style={{ marginLeft: '40px' }}>To: {dayjs(currentMonth).endOf('month').format('YYYY-MM-DD')}</div>
            </div>
            ) : filterOption === 'Week' ? (
              <div style={{display:'flex', justifyContent:'flex-end'}}>
                <div className='date'>From: {dayjs(currentWeek).format('YYYY-MM-DD')}</div>
                <div className='date' style={{ marginLeft: '40px' }}>To: {dayjs(currentWeek).endOf('week').format('YYYY-MM-DD')}</div>
              </div>
            )  : (
              <div className='date'>Date: {currentDate.format('YYYY-MM-DD')}</div>
            )
          }
        </div>
        {(filterOption === 'Date' || ((filterOption === 'Week' || filterOption === 'Month') && isEdited)) || isFormEnabled  ? ( <form onSubmit={handleFormOnSubmit}>
            <div>
              {isFormEnabled && (
                <CloseCircleOutlined
                  style={{ margin: '10px 20px', display: 'flex', justifyContent: 'flex-end', color: 'black', width:'900px' }}
                  onClick={handleToggleForm} // Call the handleToggleForm function on click
                />
              )}
              <div style={{display:'flex', alignItems:'center'}}>
                <div style={{width:'35%'}}>
                  <div className='section-addtask' style={{width:'125%'}}>
                    <div className='create-layout-addtask-left  '>
                      <div style={{marginBottom:'10px'}}>
                        <label style={{color:'#0B4266'}} htmlFor='addTaskID'><span style={{color:'red', paddingRight:'5px'}}>*</span>Date</label>
                      </div>
                      {/* <input
                        type="date"
                        style={{ width: '100%' }}
                        className='timepicker'
                      /> */}
                      <Input
                        type='date'
                        placeholder='Enter your Employee ID'
                        style={{height:'50%'}}
                        value={currentDate.format('YYYY-MM-DD')} 
                        // value={
                        //   filterOption === 'Month'
                        //     ? currentMonth.startOf('month').format('YYYY-MM-DD')
                        //     : filterOption === 'Week'
                        //     ? currentWeek.startOf('week').format('YYYY-MM-DD')
                        //     : currentDate.format('YYYY-MM-DD')
                        // }
                        onChange={(e) => handleInputChange('date', e.target.value)}
                      />
                      {/* <DatePicker
                          value={dayjs(currentDate)} // Convert currentDate to Dayjs object
                          format="YYYY-MM-DD" // Specify the date format
                          onChange={(date, dateString) => handleInputChange('date', dateString)} // Use dateString to get the selected date
                          style={{ width: '100%', height:'35%' }} // Adjust the width as needed
                      /> */}
                    </div>
                    {/* <div className='create-layout-addtask-left  '>
                      <div style={{marginBottom:'10px'}}>
                        <label htmlFor='addTaskID'>User ID</label>
                      </div>
                      <Input
                        placeholder='Enter your Employee ID'
                        value={addTask.userId}
                        onChange={(e) => handleInputChange('userId', e.target.value)}  
                      />
                    </div> */}
                    <div className='create-layout-addtask'>
                      <div>
                        <label style={{color:'#0B4266'}} htmlFor='task'><span style={{color:'red', paddingRight:'5px'}}>*</span>Work Location</label>
                      </div>
                      <div style={{height:'50%'}}>
                        <select
                          id='task'
                          style={{height:'100%'}}
                          value={addTask.workLocation}
                          onChange={(e) => handleInputChange('workLocation', e.target.value)}
                        >
                          {workLocation.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>
                      
                    </div>
                  </div>
                  <div className='section-addtask' style={{width:'125%'}}>
                    <div className='create-layout-addtask'>
                      <div>
                        <label style={{color:'#0B4266'}} htmlFor='task'><span style={{color:'red', paddingRight:'5px'}}>*</span>Task</label>
                      </div>
                      <div style={{height:'50%'}}>
                        <select
                          id='task'
                          style={{height:'100%'}}
                          value={addTask.task}
                          onChange={(e) => handleInputChange('task', e.target.value)}
                        >
                          {taskOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>
                      
                    </div>
                    {addTask.task === 'Meeting' && (
                          // <div className='section-addtask' style={{width:'61%'}}>
                          //   <div className='create-layout-addtask'>
                          //     <div>
                          //       <label style={{ color:'#0B4266' }} htmlFor='title'>Meeting</label>
                          //     </div>
                          //     <div>
                          //       <select
                          //         id='task'
                          //         value={addTask.title}
                          //         onChange={(e) => handleInputChange('title', e.target.value)}
                          //       >
                          //         {meetingTitle.map((option, index) => (  // Use 'index' as the key
                          //           <option key={index} value={option}>
                          //             {option}
                          //           </option>
                          //         ))}
                          //       </select>
                          //     </div>
                          //   </div>
                          // </div>
                          <div className='create-layout-addtask'>
                              <div>
                                <label style={{ color:'#0B4266' }} htmlFor='title'><span style={{color:'red', paddingRight:'5px'}}>*</span>Meeting</label>
                              </div>
                              <div style={{height:'50%'}}>
                                <select
                                  id='task'
                                  style={{height:'100%'}}
                                  value={addTask.title}
                                  onChange={(e) => handleInputChange('title', e.target.value)}
                                >
                                  {meetingTitle.map((option, index) => (  // Use 'index' as the key
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                          </div>
                    )}
                    {(addTask.task === 'Project'|| addTask.task==='Learning' || addTask.task==='Training') && (
                      // <div className='section-addtask' style={{width:'61%'}}>
                      //   <div className='create-layout-addtask'>
                      //     <div>
                      //       <label style={{ color:'#0B4266' }} htmlFor='title'>{addTask.task}</label>
                      //     </div>
                      //     <div>
                      //       <select
                      //         id='task'
                      //         value={addTask.title}
                      //         onChange={(e) => handleInputChange('title', e.target.value)}  // Corrected 'title' to 'task'
                      //       >
                      //         {projectTitle.map((option, index) => (  // Use 'index' as the key
                      //           <option key={index} value={option}>
                      //             {option}
                      //           </option>
                      //         ))}
                      //       </select>
                      //     </div>
                      //   </div>
                      // </div>
                      <div className='create-layout-addtask'>
                      <div>
                        <label style={{ color:'#0B4266' }} htmlFor='title'><span style={{color:'red', paddingRight:'5px'}}>*</span>{addTask.task}</label>
                      </div>
                      <div style={{height:'50%'}}>
                        <select
                          id='task'
                          style={{height:'100%'}}
                          value={addTask.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}  // Corrected 'title' to 'task'
                        >
                          {projectTitle.map((option, index) => (  // Use 'index' as the key
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    )}

                  </div>
                  
                  <div className='section-addtask' style={{width:'125%',height: '110px'}}>
                      <div className='create-layout-addtask-left'>
                        <div>
                          <label htmlFor='startTime'><span style={{color:'red', paddingRight:'5px'}}>*</span>Start Time</label>
                        </div>
                        <TimePicker
                          style={{height:'40%'}}
                          value={
                            addTask.startTime
                              ? dayjs(addTask.startTime, 'hh:mm A') // Convert to dayjs here
                              : null
                          }
                          onChange={(time, timeString) =>
                            handleInputChange('startTime', timeString)
                          }
                          className='timepicker'
                          format='hh:mm A' // Set the format to include AM/PM
                        />
                      </div>
                      <div className='create-layout-addtask'>
                        <div>
                          <label style={{color:'#0B4266'}} htmlFor='endTime'><span style={{color:'red', paddingRight:'5px'}}>*</span>End Time</label>
                        </div>
                        <TimePicker
                          style={{height:'40%'}}
                          value={
                            addTask.endTime
                              ? dayjs(addTask.endTime, 'HH:mm A') // Convert to dayjs here
                              : null
                          }
                          onChange={(time, timeString) =>
                            handleInputChange('endTime', timeString)
                          }
                          className='timepicker'
                          format='hh:mm A' 
                          rootClassName='timer'
                        />
                      </div>
                  </div>
                  <div className='section-addtask' style={{width:'125%', marginBottom:'30px'}}>
                      
                    <div className='create-layout-addtask-left  '>
                        <div style={{marginBottom:'10px'}}>
                          <label style={{color:'#0B4266'}} htmlFor='totalHours'><span style={{color:'red', paddingRight:'5px'}}>*</span>Total Hours</label>
                        </div>
                        <Input
                          placeholder='Enter your Total Hours'
                          style={{height:'65%'}}
                          value={addTask.totalHours}
                          onChange={(e) => handleInputChange('totalHours', e.target.value)}
                          
                        />
                      </div>
                      <div className='create-layout-addtask-reportingTo  '>
                        <div className='create-layout-reportingTo'>
                          <label style={{color:'#0B4266'}} htmlFor='reportingTo'><span style={{color:'red', paddingRight:'5px'}}>*</span>Reporting To</label>
                        </div>
                        <select
                          id='reportingTo-addtask'
                          style={{height:'60%'}}
                          value={addTask.reportingTo}
                          onChange={(e) => handleInputChange('reportingTo', e.target.value)}
                        >
                          <option value=''>Select Reporting To</option>
                          {reportingOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div> 
                  </div>  
                  <div>
                  <div className='create-layout-description'>
                        <div>
                          <label style={{color:'#0B4266'}}><span style={{color:'red', paddingRight:'5px'}}>*</span>Description</label>
                        </div>
                        <textarea
                          value={addTask.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className='description-input'
                          style={{width:'240%'}}
                        />
                  </div>
                  </div>
                </div>
                <div className='chart-container' style={{ marginLeft: "150px",width:'750px'}}>
                  {/* <img
                  src={asset}
                  alt="..."
                  style={{ marginLeft: "auto",width:'750px', height:'200px'}}
                  /> */}
                  <Chart
                      options={pieChartDataInForm.options}
                      series={pieChartDataInForm.series}
                      type="pie"
                      width="480"
      
                      
                  />

                </div>
              </div>
            </div>
            <div className='button' style={{marginBottom:'10px', width:'300px'}}>
              <Button  id='cancel-addtask' onClick={handleClearSubmit} style={{width:'7%'}}>
                Clear
              </Button>
              {isEdited ? (
              <Button id={addTask.totalHours? 'submit-addtask-active':'submit-addtask'} onClick={handleFormSubmit}>
                Save
              </Button>
            ):(
              <Button  id={addTask.totalHours? 'submit-addtask-active':'submit-addtask'} onClick={handleFormSubmit}>
                Add Task
              </Button>
            )}
            </div>

        </form>):null}
        <>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 20px' }}>
            <div style={{display:'flex'}}>
              <Button id='submit-icon' onClick={handleLeftArrowClick}> 
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

            </div>
            
            {/* <Input
            className="search-addtask"
            placeholder="Search by Date"
            allowClear
            suffix={<SearchOutlined style={{ color: "#04172480" }} />}
            onChange={(e) => {
            //  console.log("Search input value:", e.target.value);
              setSearchInput(e.target.value);
            }}
          /> */}
         
          <div style={{display:'flex', justifyContent:'flex-end'}}>
          {/* <button type='button' id='submit-less' onClick={handleLeftArrowClick}>
            <LeftOutlined />
          </button> */}

        {/* <Select
           
            style={{
              marginTop: '10px',
              display: 'flex',
              padding: '0.5em 2em',
              border: 'transparent',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '4px',
              color:'white',
              background: '#0B4266',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
            defaultValue="Date"
            onChange={handleFilterChange}
        >
          <Select.Option value="Date">Date</Select.Option>
          <Select.Option value="Week">Week</Select.Option>
          <Select.Option value="Month">Month</Select.Option>
        </Select> */}
        { !isButtonDisabled && (
        <Button
          id='submit-addtask-active'
          style={{marginRight:'10px'}}
          onClick={handleRequestForm}
          disabled={isButtonDisabled}
        >
          Request
        </Button>
        )

        }
        
        {!cancelButton && !(filterOption === 'Date' && !isFormEnabled) && (
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
          {/* <button type='button' id='submit-less' onClick={handleRightArrowClick}>
            <RightOutlined />
          </button> */}
          </div>
        </div>
      </div>
        <Table
            style={{fontSize:'12px', fontFamily:'poppins', fontWeight:'normal', color: '#0B4266'}}
            className='addtask-table'
            columns={columns}
            dataSource={filteredTasks}
            pagination={false}
          />
            <Button id='submit-overall' onClick={handleOverallSubmit}>
              Submit
            </Button>
        </>
      </div>
    </ConfigProvider>
  );
};
export default AddTask;