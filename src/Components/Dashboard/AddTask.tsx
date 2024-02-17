import React, { useState, useEffect, useCallback } from 'react';
import { Input, TimePicker, Select, notification, DatePicker} from 'antd';
import { SearchOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import '../Styles/CreateUser.css';
import DashboardLayout from './Layout';
import '../Styles/AddTask.css';
import {Table} from 'antd';
import { ColumnsType } from "antd/es/table";
import ApprovalRequest from './ApprovalRequest';
import { EditOutlined, DeleteOutlined,CloseCircleOutlined,LeftOutlined, RightOutlined } from '@ant-design/icons';
import Dashboard from './Dashboard';
export interface Task {
  key?:string;
  idx: number; // Add this line
  date: string;
  userId: string;
  task: string;
  startTime: string;
  endTime: string;
  totalHours: string;
  description: string;
  reportingTo: string;
  slNo?: number;
}

type AddTaskProps = {
  setPieChartData: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  setApprovalRequestsData: React.Dispatch<React.SetStateAction<Task[]>>;
  approvalRequestsData: Task[];
};

const AddTask: React.FC<AddTaskProps> = ({ setPieChartData, setApprovalRequestsData }) => {
  const navigate = useNavigate();
  const [deletedTask, setDeletedTask] = useState(false);
  const [formWidth, setFormWidth] = useState(800);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const [addTask, setAddTask] = useState<Task>({
    idx: 1, // Set initial idx
    date: currentDate.format('YYYY-MM-DD'),
    userId: '123',
    task: '',
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
 const updateSlNo = (tasks: Task[], deleteTask: boolean): Task[] => {
  return tasks.map((task, index) => ({
    ...task,
    slNo: index + 1,
    idx: deleteTask ? index + 1 : task.idx
  }));
};

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
    width: formWidth + 'px',
  };
  
  const handleInputChange = (field: keyof Task, value: string) => {
    if (field === 'date') {
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

    // Assuming deletedTask is a state variable
    const updatedTaskList = updateSlNo(storedTaskList, deletedTask);

    setTaskList(updatedTaskList);
    setFilteredTasks(updatedTaskList);
  }, [deletedTask]); // Include deletedTask in the dependency array

  useEffect(() => {
    // Filter tasks based on the addTask.date when it changes
    if (addTask.date) {
      const filtered = taskList.filter(task => task.date === addTask.date);
      setFilteredTasks(updateSlNo(filtered, deletedTask)); // Update slNo when loading tasks
    } else {
      // If no date is selected, display all tasks
      setFilteredTasks(updateSlNo(taskList, deletedTask)); // Update slNo when loading tasks
    }
  }, [addTask.date, taskList]);

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
    let filtered: Task[] = [];

    if (searchInput) {
      // If there is a search input, filter tasks based on date or month
      const searchDate = dayjs(searchInput);
      filtered = taskList.filter((task) => {
        if (filterOption === 'Date') {
          return dayjs(task.date).isSame(searchDate, 'day');
        } else if (filterOption === 'Week') {
          const startOfWeek = currentWeek.startOf('week');
          const endOfWeek = currentWeek.endOf('week');
          return (
            (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
            (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek))
          );
        } else if (filterOption === 'Month') {
          // Format the searchInput in the same way as the task date
          const formattedSearchMonth = searchDate.format('MMMM');
          return dayjs(task.date).format('MMMM') === formattedSearchMonth;
        }
        return false;
      });
    }  else {
      // If no search input, apply the regular filtering based on filterOption and currentDate
      if (filterOption === 'Date') {
        filtered = taskList.filter((task) => task.date === dayjs(currentDate).format('YYYY-MM-DD'));
        console.log("useEffect-date", filtered)
      } else if (filterOption === 'Week') {
        const startOfWeek = currentWeek.startOf('week');
        const endOfWeek = currentWeek.endOf('week');
        filtered = taskList.filter(
          (task) =>
            (dayjs(task.date).isSame(startOfWeek) || dayjs(task.date).isAfter(startOfWeek)) &&
            (dayjs(task.date).isSame(endOfWeek) || dayjs(task.date).isBefore(endOfWeek))
        );
        console.log("useeffect-week", filtered);
      } else if (filterOption === 'Month') {
        const startOfMonth = currentMonth.startOf('month');
        const endOfMonth = currentMonth.endOf('month');
        filtered = taskList.filter(
          (task) =>
            (dayjs(task.date).isSame(startOfMonth) || dayjs(task.date).isAfter(startOfMonth)) &&
            (dayjs(task.date).isSame(endOfMonth) || dayjs(task.date).isBefore(endOfMonth))
        );
        console.log("useeffect", filtered);
      }
    }

    setFilteredTasks(updateSlNo(filtered, deletedTask));
  //  console.log("useeffect filtered-task", filteredTasks);
  }, [isEdited, filterOption, currentDate, currentMonth, currentWeek, taskList, searchInput]);

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
  
    // If you want to reset the form when disabling it, you can reset the form state here
    if (!isFormEnabled) {
      setAddTask({
        date: dayjs(currentDate).format('YYYY-MM-DD'),
        userId: '123',
        task: '',
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
    console.log("---fd1", dayjs(addTask.date).format('YYYY-MM-DD'), dayjs(addTask.startTime).format('hh:mm A'), dayjs(addTask.endTime).format('hh:mm A'));
    // Check for overlapping tasks in the specified time range
    const overlappingTask = taskList.find((task) => {
      const newTaskStartTime = dayjs(addTask.startTime, 'hh:mm A');
      const newTaskEndTime = dayjs(addTask.endTime, 'hh:mm A');
      const taskStartTime = dayjs(task.startTime, 'hh:mm A');
      const taskEndTime = dayjs(task.endTime, 'hh:mm A');
    
      // Check if the new task overlaps with any existing task
      return (
        !isEdited && task.date === addTask.date &&
        (
          ((newTaskStartTime.isSame(taskStartTime) || newTaskStartTime.isAfter(taskStartTime))&& newTaskStartTime.isBefore(taskEndTime)) ||
          ((newTaskEndTime.isSame(taskStartTime) || newTaskEndTime.isAfter(taskStartTime))&& newTaskEndTime.isBefore(taskEndTime)) ||
          (newTaskStartTime.isBefore(taskStartTime) && (newTaskEndTime.isSame(taskEndTime)|| newTaskEndTime.isAfter(taskEndTime)))
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
      const updatedTaskList = taskList.map((task) =>
        task.idx === addTask.idx ? { ...addTask } : task
      );
      setTaskList(updatedTaskList);
      setFilteredTasks(updateSlNo(updatedTaskList, deletedTask));
      localStorage.setItem('taskList', JSON.stringify(updatedTaskList));
      setIsEdited(false);
    } else {
      // Update the taskList
      const updatedTaskList = [...taskList, { ...addTask, idx: taskList.length + 1 }];
      setTaskList(updatedTaskList);
      setFilteredTasks(updateSlNo(updatedTaskList, deletedTask));
      localStorage.setItem('taskList', JSON.stringify(updatedTaskList));
    }
  
    // Clear the form with the default date and reset idx
    setAddTask({
      idx: taskList.length + 2, // Set a new idx
      date: dayjs(currentDate).format('YYYY-MM-DD'),
      userId: '123',
      task: '',
      startTime: '',
      endTime: '',
      totalHours: '',
      description: '',
      reportingTo: '',
    });
    setIsEdited(false);
    setIsFormSubmitted(true);
  };

  const handleClearSubmit = () => {
    // Clear the form with the default date and set idx
    setAddTask({
      date: dayjs(addTask.date).format('YYYY-MM-DD'),
      userId: '123',
      task: '',
      startTime: '',
      endTime: '',
      totalHours:'',
      description: '',
      reportingTo: '',
      idx: addTask.idx 
    });
  }
  
  const handleEditTask = (idx: number) => {
    // Implement the logic to edit the task based on date, startTime, and endTime
    // You can use the setAddTask function to update the form fields with the selected task's details
    setIsEdited(true);
    const taskToEdit = taskList.find((task) => task.idx === idx);
    if (taskToEdit) {
      setAddTask({
        date: taskToEdit.date,
        userId: taskToEdit.userId,
        task: taskToEdit.task,
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
    // Toggle the deletedTask flag
    setDeletedTask(true);
    // Save idx in state
    setDeletedTaskIdx(idx);
  }, []);

  useEffect(() => {
    if (deletedTask) {
      // Implement the logic to delete the task based on idx
      const updatedTaskList = taskList.filter((task) => task.idx !== deletedTaskIdx);

      // Reindex the idx starting from 1 and use deletedTask flag
      const reindexedTaskList = updateSlNo(updatedTaskList, deletedTask);

      setTaskList(reindexedTaskList);
      setFilteredTasks(reindexedTaskList);

      // Update localStorage
      localStorage.setItem('taskList', JSON.stringify(reindexedTaskList));

      // Reset the deletedTask flag after updating
      setDeletedTask(false);
    }
  }, [deletedTask, deletedTaskIdx]);

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

  const handleOverallSubmit = () => {
    // Prepare the data to be sent
    const requestData: Task[] = filteredTasks.map(task => ({
        date: task.date,
        userId: task.userId,
        task: task.task,
        startTime: task.startTime,
        endTime: task.endTime,
        totalHours: task.totalHours,
        description: task.description,
        reportingTo: task.reportingTo,
        idx: task.idx,
    }));

    // Set the success notification
    notification.success({
        message: 'Submission Successful',
        description: 'Task details submitted successfully!',
    });
    navigate('/approvalrequests')
    // Set the approvalRequestsData state
    console.log("handleOverAllsubmit", requestData);
    setApprovalRequestsData(requestData);

    // Store the approvalRequestsData in local storage
    localStorage.setItem('approvalRequestsData', JSON.stringify(requestData));
};

  const columns: ColumnsType<Task> = [
    {
      title: 'Sl.no',
      sorter: (a: Task, b: Task) => (a.slNo && b.slNo ? a.slNo - b.slNo : 0),
      dataIndex: 'slNo',
      key: 'slNo',
      fixed: 'left',
    },
    {
      title: 'Task',
      sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'task',
      key: 'task',
      fixed: 'left',
    },
    {
      title: 'Date',
      sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
      dataIndex: 'date',
      key: 'date',
      fixed: 'left',
    },
    {
      title: 'Start Time',
      sorter: (a: Task, b: Task) => a.startTime.localeCompare(b.startTime),
      dataIndex: 'startTime',
      key: 'startTime',
      fixed: 'left',
    },
    {
      title: 'End Time',
      sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
      dataIndex: 'endTime',
      key: 'endTime',
      fixed: 'left',
    },
    {
      title: 'Total Hours',
      sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
      dataIndex: 'totalHours',
      key: 'totalHours',
      fixed: 'left',
    },
    {
      title: 'Description',
      sorter: (a: Task, b: Task) => a.description.localeCompare(b.description),
      dataIndex: 'description',
      key: 'description',
      fixed: 'left',
    },
    {
      title: 'Reporting To',
      sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      dataIndex: 'reportingTo',
      key: 'reportingTo',
      fixed: 'left',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record, index) => (
        <div>
          <EditOutlined
            onClick={() => handleEditTask(record.idx)}
            style={{
              marginRight: '8px',
              cursor: 'pointer',
              color: 'blue',
              fontSize: '20px',
            }}
          />
          <DeleteOutlined
            onClick={() => handleDeleteTask(record.idx)}
             style={{
              cursor: 'pointer',
              color:  'red',
              fontSize: '20px',
            }}
          />
        </div>
    )}
  ]

  return (
    <DashboardLayout>
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
        {(filterOption === 'Date' || ((filterOption === 'Week' || filterOption === 'Month') && isEdited)) || isFormEnabled  ? ( <form id="myForm" style={borderStyle}>
            <div>
            {isFormEnabled && (
              <CloseCircleOutlined
                style={{ margin: '10px 20px', display: 'flex', justifyContent: 'flex-end', color: 'red' }}
                onClick={handleToggleForm} // Call the handleToggleForm function on click
              />
            )}
              <div className='section-addtask'>
              <div className='create-layout-addtask-left  '>
                  <div style={{marginBottom:'10px'}}>
                    <label htmlFor='addTaskID'>Date</label>
                  </div>
                  {/* <input
                    type="date"
                    style={{ width: '100%' }}
                    className='timepicker'
                  /> */}
                  <Input
                    type='date'
                    placeholder='Enter your Employee ID'
                    value={currentDate.format('YYYY-MM-DD')} 
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
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
                    <label htmlFor='task'>Task</label>
                  </div>
                  <div>
                    <select
                      id='task'
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
              </div>
              <div className='section-addtask'>
                <div className='create-layout-addtask-left'>
                  <div>
                    <label htmlFor='startTime'>Start Time</label>
                  </div>
                  <TimePicker
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
                    <label htmlFor='endTime'>End Time</label>
                  </div>
                  <TimePicker
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
              <div className='section-addtask'>
                
              <div className='create-layout-addtask-left  '>
                  <div style={{marginBottom:'10px'}}>
                    <label htmlFor='totalHours'>Total Hours</label>
                  </div>
                  <Input
                    placeholder='Enter your Total Hours'
                    value={addTask.totalHours}
                    onChange={(e) => handleInputChange('totalHours', e.target.value)}
                    
                  />
                </div>
                <div className='create-layout-addtask-reportingTo  '>
                  <div className='create-layout-reportingTo'>
                    <label htmlFor='reportingTo'>Reporting To</label>
                  </div>
                  <select
                    id='reportingTo-addtask'
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
                    <label>Description</label>
                  </div>
                  <textarea
                    value={addTask.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className='description-input'
                  />
                </div>
              </div>
            </div>
              
            
            <div className='button'>
              <button type='button' id='cancel-addtask' onClick={handleClearSubmit}>
                Clear
              </button>
              {isEdited ? (
              <button type='button' id='submit-addtask' onClick={handleFormSubmit}>
                Save
              </button>
            ):(
              <button type='button' id='submit-addtask' onClick={handleFormSubmit}>
                Add Task
              </button>
            )}
            </div>

        </form>):null}
        <>
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', margin:'10px 20px' }}>
            <Input
            className="search-addtask"
            placeholder="Search by Date"
            allowClear
            suffix={<SearchOutlined style={{ color: "#04172480" }} />}
            onChange={(e) => {
            //  console.log("Search input value:", e.target.value);
              setSearchInput(e.target.value);
            }}
          />
         {!(filterOption === 'Date' && !isFormEnabled) && (
            <button
              id='cancel'
              onClick={handleToggleForm}
              disabled={isFormEnabled} // Disable the button when the form is enabled
            >
              Add Task
            </button>
          )}
          <div style={{display:'flex', justifyContent:'flex-end'}}>
          <button type='button' id='submit-less' onClick={handleLeftArrowClick}>
            <LeftOutlined />
          </button>

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
      </div>
        <Table
            columns={columns}
            dataSource={filteredTasks}
            pagination={false}
          />
            <button type='button' id='submit-overall' onClick={handleOverallSubmit}>
              Submit
            </button>
        </>
      </div>
    </DashboardLayout>
  );
};
export default AddTask;