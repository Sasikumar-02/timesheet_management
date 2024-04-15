import React,{useEffect, useState, useRef} from 'react'
import { useNavigate } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table'
import { EditOutlined, FolderViewOutlined} from '@ant-design/icons';
import { Progress } from 'antd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import '../Styles/ApprovalRequest.css';
import {
  Avatar,
  Space,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  ConfigProvider,
  Tooltip,
  Tag,
  Popover,
  message,
  Checkbox,
  Pagination,
  Menu,
  Dropdown,
} from "antd";

import { ExpandableConfig } from 'antd/lib/table/interface';
import 'moment/locale/en-in';
import {
  UserOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Task, DateTask } from '../Employee/AddTask';
import { groupBy } from 'lodash';
import { ConstructionOutlined, RecordVoiceOver } from '@mui/icons-material';
import { TableRowSelection } from 'antd/lib/table/interface';
import { RequestedOn } from '../Employee/AddTask';
import type { ThemeConfig } from "antd";
import { theme } from "antd";
//import { SelectedKeys, RejectedKeys, RecentRejected } from './MonthTasks';
import api from '../../Api/Api-Service';
import { DatePicker } from 'antd';
import moment, { Moment } from 'moment';
//import 'antd/dist/antd.css';
const {Option}= Select;
const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "white",
  },
};

export interface TaskObject {
  [date: string]: DateTask
}

export interface SetGroupedTasks{
  [key: string]: GroupedTasks
}
export interface UserGroupedTask {
  [userId: string]: SetGroupedTasks;   
  
}
export interface GroupedTasks {
  uniqueRequestId: string[];
  slNo?: number;
  employeeName: string;
  employeeId: string;
  month: string;
  daysRequested: string;
  totalDays: number;
  daysFilled: number;
 
}

const ApprovalRequest:React.FC = () => { 
  //const userId = '1234'; // Replace 'YOUR_USER_ID' with the actual user id you want to check
  const userId ='1234';
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  //const [rejectedKeys, setRejectedKeys] = useState<RecentRejected[]>([]);
  const navigate = useNavigate();
  //const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedInnerRows, setSelectedInnerRows] = useState<string[]>([]);
  //const[daysInMonth, getDaysInMonth]=useState<string[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<UserGroupedTask>({});
  // State declaration with two keys
  //const [groupedTasks, setGroupedTasks] = useState<{ [month: string]: { [date: string]: GroupedTasks } }>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandedInnerRow, setExpandedInnerRow] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [comments, setComments] = useState('');
  const [commentVisible, setCommentVisible] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<DateTask[]>([]);
  const [monthTasks, setMonthTasks] = useState<TaskObject[]>([]);
  const [userTasks, setUserTasks]= useState<GroupedTasks[]>([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('default', { month: 'long' });

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1);
      return {
        value: i + 1,
        label: date.toLocaleDateString('default', { month: 'long' })
      };
    });
  };

  const getYears = () => {
    const startYear = currentYear - 50; // Adjust this value to set the starting year
    const endYear = currentYear + 50; // Adjust this value to set the ending year
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  };


  const months = getMonths();
  const years = getYears();

  const handleMonthChange = (value:any) => {
    setSelectedMonth(value);
    // Update selected date here
  };

  const handleYearChange = (value:any) => {
    setSelectedYear(value);
    // Update selected date here
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/v1/timeSheet/fetch-requests-by-reportingTo', {
          params: {
            month: selectedMonth,
            year: selectedYear
          }
        });
        console.log("response-my", selectedMonth, selectedYear);
        console.log("response-data", response?.data?.response?.data);
        setUserTasks(response?.data?.response?.data);
        // Process response data here
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error here, such as displaying an error message to the user
      }
    };
  
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleClearFilters = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };
  
  
  // useEffect(() => {
  //     // Retrieve approvalRequestsData from local storage
  //     const storedData = localStorage.getItem('approvalRequestedData');
  //     console.log("approvalRequests", storedData);
  //     if (storedData) {
  //         const approvalRequestsData: { [key: string]: Task[] } = JSON.parse(storedData);
  //         console.log("approvalRequests", approvalRequestsData);

  //         // Convert the object to an array of DateTask objects
  //         const dateTasks: DateTask[] = Object.keys(approvalRequestsData).map(key => ({
  //           key: key,
  //           tasks: approvalRequestsData[key], // Assuming approvalRequestsData[key] represents tasks
  //           status: "Pending" // Assuming you want to set status as "Pending" initially
  //       }));
        
  //         console.log("approvalRequests-datetasks", dateTasks);

  //         setApprovalRequests(dateTasks); // Update the state with fetched data
  //     }
  //     console.log("approvalRequests-approvalrequests", approvalRequests);
  // }, []); // Fetch data only once on component mount

  // useEffect(() => {
  //       const storedKeysString: string | null = localStorage.getItem('selectedKeys');
  //       if (storedKeysString !== null) {
  //           const storedKeys: SelectedKeys = JSON.parse(storedKeysString);
           
  //           if (storedKeys.hasOwnProperty(userId)) {
  //               setSelectedKeys(storedKeys[userId]);
  //           } else {
  //               console.log("User ID not found in stored keys");
  //           }
  //       } else {
  //           console.log("else-useEffect", storedKeysString);
  //       }
  // }, []);

  // useEffect(() => {
  //     const storedKeysString: string | null = localStorage.getItem('rejectedKeys');
  //     if (storedKeysString !== null) {
  //         const storedKeys: RejectedKeys = JSON.parse(storedKeysString);
  //         const userRejectedKeys = storedKeys[userId];
  //         if (userRejectedKeys) {
  //           console.log("userRejectedKeys", userRejectedKeys);
  //             setRejectedKeys(userRejectedKeys);
  //         }
  //     } else {
  //         console.log("else-useEffect", storedKeysString);
  //     }
  // }, []);


  // useEffect(() => {
  //   console.log("useeffect", approvalRequests.length);
  //   if (approvalRequests.length > 0) { // Check if approvalRequests has data
  //       // Process approvalRequests data
  //       handleGroupedTasks(approvalRequests);
  //   }
  // }, [approvalRequests]);

//   useEffect(() => {
//     const storedData = localStorage.getItem('groupedTasks');
//     if (storedData && (selectedKeys.length > 0 || rejectedKeys.length > 0)) {
//         const parsedData: UserGroupedTask = JSON.parse(storedData);
//         const updatedData = { ...parsedData }; // Create a copy of the parsed data

//         // Check if there are tasks to filter for the specified user
//         if (selectedKeys.length > 0) {
//             // Filter tasks for the specified user (e.g., userId='1234')
//             if (updatedData[userId]) {
//                 Object.keys(updatedData[userId]).forEach(monthKey => {
//                     const monthData = updatedData[userId][monthKey];
//                     const filteredTasks: TaskObject = {};
//                     Object.keys(monthData.tasks).forEach(dateKey => {
//                         if (!selectedKeys.includes(dateKey) && !rejectedKeys.some(rejected => rejected.date === dateKey)) {
//                             filteredTasks[dateKey] = monthData.tasks[dateKey];
//                         }
//                     });
//                     if (Object.keys(filteredTasks).length > 0) {
//                         updatedData[userId][monthKey].tasks = filteredTasks;
//                     } else {
//                         delete updatedData[userId][monthKey];
//                     }
//                 });
//             }
//         }

//         // Update the state with the filtered data
//         setGroupedTasks(updatedData);
//     }
// }, [selectedKeys, rejectedKeys]);



  const handleReject = () => {
    setCommentVisible(true);
  };

  const handleCancel = () => {
    setCommentVisible(false);
  };

  const handleInputChange = (e:any) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    // Handle submission logic here
    console.log('Comments:', comments);
    setCommentVisible(false);
  };
  
  function getDaysInMonth(month: number, year: number) {
    // month is 0-based in JavaScript
    return new Date(year, month + 1, 0).getDate();
  }
  
  // const handleGroupedTasks = (requestData: DateTask[]) => {
  //   //Group tasks by month
  //   console.log("handleGroupedtasks- requestData", requestData);
  //   const grouped = groupBy(requestData, (task: DateTask) => dayjs(task.key).format("YYYY-MM"));
  //   console.log("handleGroupedTasks-grouped", grouped);
  //   // Retrieve existing data from local storage
  //   const existingDataJSON = localStorage.getItem('groupedTasks');
  //   const existingData: UserGroupedTask = existingDataJSON ? JSON.parse(existingDataJSON) : {};
  
  //   // Process each month's tasks
  //   for (const monthKey in grouped) {
  //     console.log("monthKey", monthKey);
  //     const tasksArray = grouped[monthKey] as DateTask[];
  //     console.log("tasksArray", tasksArray);
  //     const firstTaskDate = dayjs(tasksArray[0].key, 'YYYY-MM-DD');
  //     const formattedMonth = firstTaskDate.format("MMMM YYYY");
  //     const totalDaysInMonth = getDaysInMonth(firstTaskDate.month(), firstTaskDate.year());
  
  //     let daysFilled = 0;
  //     const tasks: TaskObject = {};
  //     tasksArray.forEach(taskObj => {
  //       console.log("taskObj", taskObj);
  //       const dateKey = dayjs(taskObj.key, 'YYYY-MM-DD').format('YYYY-MM-DD');
  //       if (existingData[userId]?.hasOwnProperty(monthKey)) {
  //         if (!existingData[userId][monthKey]?.tasks.hasOwnProperty(dateKey)) {
  //           // Create a new date key entry with all tasks from the tasksArray
  //           existingData[userId][monthKey].tasks[dateKey] = { key: uuidv4(), tasks: taskObj.tasks, status: 'Pending' };
  //           daysFilled++;
  //         } else {
  //           if (existingData[userId][monthKey]?.tasks[dateKey].tasks.length === 0) {
  //             console.log("sasi", dateKey);
  //             return;
  //           }
  //           existingData[userId][monthKey].tasks[dateKey].tasks = [...taskObj.tasks];
  //         }
  //       } else {
  //         const dateUUID = uuidv4(); // Generate unique key for the date
  //         tasks[dateKey] = { key: dateUUID, tasks: taskObj.tasks, status:'Pending' };
  //         daysFilled++;
  //       }
  //     });
  
  //     if (!existingData[userId]?.hasOwnProperty(monthKey)) {
  //       const monthUUID = uuidv4(); // Generate unique key for the month
  //       existingData[userId] = existingData[userId] || {};
  //       existingData[userId][monthKey] = {
  //         key: monthUUID,
  //         month: formattedMonth,
  //         daysFilled,
  //         totalDaysInMonth,
  //         tasks
  //       };
  //     } else {
  //       existingData[userId][monthKey].daysFilled = daysFilled; // Update daysFilled
  //     }
  //   }
  
  //   // Set the updated data to local storage
  //   localStorage.setItem('groupedTasks', JSON.stringify(existingData));
  
  //   // Update the state with the combined data
  //   // You'll need to manage the state accordingly as per your application's structure
  //   setGroupedTasks(existingData);
  //   setApprovalRequests([]);
  // };
  
  const handleRowSelection = (selectedRowKeys: React.Key[]) => {
    console.log("handleRowSelection selectedRowKeys", selectedRowKeys); // Output selectedRowKeys to console
    setSelectedRows(selectedRowKeys as string[]);
  };


  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: TaskObject[]) => {
      console.log('selectedRowKeys', selectedRowKeys, 'selectedRows: ', selectedRows);
      setSelectedInnerRows(selectedRowKeys as string[]);
      console.log(selectedInnerRows);
    },
    getCheckboxProps: (record: TaskObject) => ({
      disabled: false, // Column configuration not to be checked
      key: record.key,
    }),
  }; //not in use

  useEffect(() => {
    console.log("selectedInnerRows", selectedInnerRows);
  }, [selectedInnerRows]);

    const handleToggleRowExpand = (record: GroupedTasks, event: React.MouseEvent<HTMLElement>) => {
      // Update the expandedRow state using the functional form of setState
      setExpandedRow(prevExpandedRow => prevExpandedRow === record.month ? null : record.month);
      // Prevent event propagation
      event.stopPropagation();
    };//not in use

    const handleToggleInnerRowExpand = (record: TaskObject) => {
      const taskKeys = Object.keys(record?.tasks);
      if (taskKeys.length > 0) {
        // Get the first key from the tasks object
        const firstTaskKey = taskKeys[0];
        // Update the state with the first task key
        setExpandedInnerRow(prevExpandedInnerRow => {
          // Check if the current expanded row is the same as the first task key
          if (prevExpandedInnerRow === firstTaskKey) {
            // If it is, collapse the row by setting expandedInnerRow to null
            return null;
          } else {
            // Otherwise, expand the row by setting expandedInnerRow to the first task key
            return firstTaskKey;
          }
        });
      }
      console.log("handleToggleInnerRowExpand", expandedInnerRow);
    };//not in use
  
    const rowClassName = (record: GroupedTasks, index: number) => {
      return index % 2 === 0 ? 'even-row' : 'odd-row';
    };//not in use

    const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
      console.log("monthTaskData-monthtasks", monthTasks)
      console.log("dateData", dateData);
      if (!dateData) return {}; // Check if dateData is undefined or null
      return dateData ;
    });

    const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
      const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
      const { key, tasks } = taskObject[date];
      return { key, tasks, status: "Pending" }; // Include 'tasks' and set status as "Pending"
  });
  
    const handleInnerRowSelection = (selectedRowKeys: React.Key[]) => {
      console.log("handleInnerRowSelection selectedRowKeys", selectedRowKeys); // Output selectedRowKeys to console
      setSelectedInnerRows(selectedRowKeys as string[]);
    };
    
    const column: ColumnsType<DateTask> = [
        {
            title: 'Select All',
            dataIndex: 'date',
            key: 'date',
            width: '20%',
            fixed: 'left',
            render: (_, record: DateTask) => {
                // Get the specific month key

                const date = record.tasks.length > 0 ? record.tasks[0].date : '';
                return date;
            },
        },
        {
            title: '',
            dataIndex: 'tasks',
            key: 'tasks',
            width: '60%',
            render: (_, record: DateTask) => {
                // Initialize variables to store task hours and total hours
                let totalHours = 0;
                const taskHours: { [key: string]: number } = {};
                // Iterate over each task in the record
                record.tasks.forEach(task => {
                    const totalHoursForTask = parseFloat(task.totalHours || '0');
                    totalHours += totalHoursForTask; // Accumulate total hours
                    taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
                });

                // Calculate extra hours if total hours exceed 9
                const extraHours = totalHours > 9 ? totalHours - 9 : 0;

                return (
                    <div>
                        <ul style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', padding: 0 }}>
                            {/* Render task hours for each task */}
                            {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                    <div style={{ paddingRight: '20px' }}>
                                        <div style={{ color: 'grey', paddingBottom: '5px' }}>
                                            {taskName}
                                        </div>
                                        <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
                                            {taskTotalHours}H
                                        </div>
                                    </div>
                                    <div>
                                        <Progress
                                            type="circle"
                                            percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
                                            width={60}
                                        />
                                    </div>
                                </li>
                            ))}
                            {/* Render extra hours and total hours */}
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                <div style={{ color: '#0B4266', paddingRight: '20px' }}>
                                    Extra Hours
                                </div>
                                <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
                                    {extraHours.toFixed(2)}H
                                </div>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                <div style={{ color: '#0B4266', paddingRight: '20px' }}>
                                    Total Hours
                                </div>
                                <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
                                    {totalHours}H
                                </div>
                            </li>
                        </ul>
                    </div>
                );
            },
        },
        Table.EXPAND_COLUMN
    ];

    const innerColumn: ColumnsType<Task> = [
      {
        title: 'Sl.no',
        className: 'ant-table-column-title',
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
        render: (_, __, index) => <span>{index + 1}</span>,
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
        sorter: (a: Task, b: Task) => {
          return a.task.localeCompare(b.task);
        },
        dataIndex: 'task',
        key: 'task',
        fixed: 'left',
      },
      {
        title: 'Title',
        sorter: (a: Task, b: Task) => {
          return a.project.localeCompare(b.project);
        },
        dataIndex: 'task',
        key: 'task',
        fixed: 'left',
      },
      {
        title: 'Start Time',
        sorter: (a: Task, b: Task) => {
          return a.startTime.localeCompare(b.startTime);
        },
        dataIndex: 'startTime',
        key: 'startTime',
        fixed: 'left',
      },
      {
        title: 'End Time',
        sorter: (a: Task, b: Task) => {
          return a.endTime.localeCompare(b.endTime);
        },
        dataIndex: 'endTime',
        key: 'endTime',
        fixed: 'left',
      },
      {
        title: 'Total Hours',
        sorter: (a: Task, b: Task) => {
          return a.totalHours.localeCompare(b.totalHours);
        },
        dataIndex: 'totalHours',
        key: 'totalHours',
        fixed: 'left',
      },
      {
        title: 'Description',
        sorter: (a: Task, b: Task) => {
          return a.description.localeCompare(b.description);
        },
        dataIndex: 'description',
        key: 'description',
        fixed: 'left',
      },
    ];
    
    const columns: ColumnsType<GroupedTasks> = [
      {
        title: 'Sl.no',
        className: 'ant-table-column-title',
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
        render: (_, __, index) => <span>{index + 1}</span>,
      },    
      {
        title: "Employee",
        className: ' ant-table-column-title',
        dataIndex: "employeeId",
        render: (employeeId, record) => (
          <Space className="flex gap-5">
            <Avatar icon={<UserOutlined />} size={45} />
            <div>
              <div>
                <strong>{record.employeeName}</strong>
              </div>
              <div>{employeeId}</div>
            </div>
          </Space>
        ),
      },          
      {
        title: 'Month',
        className: 'ant-table-column-title',
        dataIndex: 'month',
        key: 'month',
        fixed: 'left',
      },
      {
        title: 'Requested Days',
        className: 'ant-table-column-title',
        dataIndex: 'daysRequested', // Assuming 'requestedOn' is the property in userTasks containing requestedOn data
        key: 'daysRequested',
        fixed: 'left',
      },     
      {
        title: 'Days Approved',
        className: 'ant-table-column-title',
        dataIndex: 'daysFilled',
        key: 'daysFilled',
        render: (daysFilled, record) => (
          <span>{`${daysFilled} / ${record.totalDays}`}</span>
        ),
      },    
      Table.EXPAND_COLUMN
    ];
    
  
    // const expandable: ExpandableConfig<GroupedTasks> = {
    //   expandedRowRender: (record: GroupedTasks) => {
    //     const taskHours: { [key: string]: number } = {};
    //     for (const dateKey in record.tasks) {
    //       record.tasks[dateKey].tasks.forEach(task => {
    //         if (taskHours.hasOwnProperty(task.task)) {
    //           taskHours[task.task] += parseFloat(task.totalHours || '0');
    //         } else {
    //           taskHours[task.task] = parseFloat(task.totalHours || '0');
    //         }
    //       });
    //     }
        
    //     // After calculating the total hours for each task, convert them to fixed decimals
    //     for (const taskName in taskHours) {
    //       if (taskHours.hasOwnProperty(taskName)) {
    //         taskHours[taskName] = parseFloat(taskHours[taskName].toFixed(2));
    //       }
    //     }
        
    //     const totalHours = Math.floor(Object.values(taskHours).reduce((acc, curr) => acc + curr, 0));
    //     const regularHours = Math.min(totalHours, 9);
    //     const extraHours = totalHours - regularHours;
    
    //     if (expandedRow === record.month) {
    //       return (
    //         <div>
    //           <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none' }}>
    //             {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
    //               <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //                 <div style={{ paddingRight: '20px' }}>
    //                   <div style={{ color: 'grey', paddingBottom: '5px' }}>
    //                     {taskName}
    //                   </div>
    //                   <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
    //                     {taskTotalHours}H
    //                   </div>
    //                 </div>
    //                 <div>
    //                   <Progress
    //                     type="circle"
    //                     percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
    //                     width={60}
    //                   />
    //                 </div>
    //               </div>
    //             ))}
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //               <div style={{ color: '#0B4266', paddingRight: '20px' }}>
    //                 Extra Hours
    //               </div>
    //               <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
    //                 {extraHours}H
    //               </div>
    //             </div>
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //               <div style={{ color: '#0B4266', paddingRight: '20px' }}>
    //                 Total Hours
    //               </div>
    //               <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
    //                 {totalHours}H
    //               </div>
    //             </div>
    //           </ul>
    //         </div>
    //       );
    //     }
    //     return null;
    //   },
    //   expandRowByClick: true,
    //   //expandIcon: () => null
    // }; //not in use
    
    
    // const aggregatedData: GroupedTasks[] = Object.keys(groupedTasks).flatMap((userId: string) => {
    //   const userGroupedTasks = groupedTasks[userId];
    //   return Object.keys(userGroupedTasks).map((monthKey: string) => {
    //     console.log("aggregatedData-monthKey", monthKey);
    //     const monthData = userGroupedTasks[monthKey];
    //     console.log("aggregatedData-monthData", monthData);
    //     const monthTasks: TaskObject = {};
    //     let daysFilled = 0;
    //     for (const dateKey in monthData.tasks) {
    //       if (Object.keys(monthData.tasks[dateKey].tasks).length > 0) {
    //         monthTasks[dateKey] = monthData.tasks[dateKey];
    //         daysFilled++;
    //       }
    //     }
    //     const totalDaysInMonth = monthData.totalDaysInMonth;
    //     console.log("aggregatedData", monthData);
    //     return {
    //       key: monthData.key,
    //       month: monthData.month,
    //       tasks: monthTasks,
    //       daysFilled: daysFilled,
    //       totalDaysInMonth: totalDaysInMonth
    //     };
    //   });
    // });
  
  //   const flattenedData = (groupedTasks: TaskObject) => {
  //     const tasks: TaskObject[] = [];
  //     const keys = Object.keys(groupedTasks);
  //     console.log("keys", keys);
  //     // Iterate over each key
  //     keys.forEach(key => {
  //         // Find the monthData corresponding to the current key
  //         const groupedData = groupedTasks[key];
  //         console.log("monthdata", groupedData);
  //         if (groupedData) {
  //             // Convert monthData into TaskObject
  //             const taskObject: TaskObject = {
  //                 [key]: {
  //                     key: groupedData.key,
  //                     tasks: groupedData.tasks,
  //                     status: groupedData.status
  //                 }
  //             };
  //             tasks.push(taskObject);
  //         }
  //     });
  
  //     return tasks;
  // };
  
    const handleRowClick = (
      record: TaskObject,
      formattedMonth: string,
      event: React.MouseEvent<HTMLElement>
    ) => {
      setModalContent(
        <div>
          <Table
                // rowSelection={{
                //     type: 'checkbox',
                //     selectedRowKeys: selectedInnerRows,
                //     onChange: handleInnerRowSelection
                // }}
                style={{
                    backgroundColor: 'white',
                    border: '1px solid grey',
                    borderRadius: '5px',
                }}
                columns={column} 
                rowClassName="rowstyle"
               // dataSource={monthTasksData}
                pagination={false}
                // expandable={{
                //     expandedRowRender: (record: DateTask) => {
                //         const handleInnerRowExpand = () => {
                //             return (
                //                 <Table
                //                     columns={innerColumn as ColumnsType<Task>}
                //                     dataSource={record.tasks} // Pass all tasks in the date as dataSource
                //                     pagination={false}
                //                 />
                //             );
                //         };
                        
                //         return (
                //             <>
                //                 {handleInnerRowExpand()}
                //             </>
                //         );
                //     },
                //     expandRowByClick: true,
                //     expandIcon: ({ expanded, onExpand, record }) =>
                //         expanded ? (
                //             <UpOutlined onClick={e => onExpand(record, e)} style={{float:'right'}} />
                //         ) : (
                //             <DownOutlined onClick={e => onExpand(record, e)} style={{float: 'right'}}/>
                //         ),
                // }}
                
                
            />
        </div>
      );
      // Set the modal content and make the modal visible
      setModalVisible(true);
    
      // Prevent event propagation
      event.stopPropagation();
    };//not in use
     
  return (
    <ConfigProvider theme={config}>
      <div>
          <div style={{display:'flex', justifyContent:'flex-start'}}>
            <Select
              style={{ width: 120, height:40, marginLeft:'20px' }}
              className='regenerateactive'
              placeholder="Select Month"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {months.map(month => (
                <Option key={month.value} value={month.label}>
                  {month.label}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 80,height:40, marginLeft:'20px' }}
              className='regenerateactive'
              placeholder="Select Year"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>

              <Button
             
                  style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'102px', textAlign:"center", marginLeft:'20px', marginTop:'20px', paddingTop:'8px'}}
                  className='regenerateactive'
                  onClick={handleClearFilters}
              >
              Clear Filter
              </Button>
          </div>

          <Table
            onRow={(record: GroupedTasks) => ({
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                const { uniqueRequestId, employeeId, month, employeeName } = record;
                setSelectedUserId(userId); // Set the userId in state
                // Extract necessary data from the GroupedTasks record
                const [monthName, year] = month.split(' ');
                const monthNumber = moment().month(monthName).format('MM');
                const formattedMonth = `${year}-${monthNumber}`;
                
                // Pass TaskObject and formattedMonth to handleRowClick
                //handleRowClick(tasksObject, formattedMonth, event);
                navigate(`/manager/monthtasks?formattedMonth=${formattedMonth}&userId=${employeeId}`, {state: {
                  uniqueRequestId,
                  formattedMonth: month, 
                  employeeId: employeeId,
                  employeeName:employeeName
              }});
              },
            })}
            rowClassName={(record: GroupedTasks, index: number) =>
              index % 2 === 0 ? 'even-row' : 'odd-row'
            }
            className='custom-table'
            columns={columns}
           dataSource={userTasks}
            pagination={false}

          />
        
      </div>
      <Modal
        title={
          modalContent ? (
            <div>
              <Space className="flex gap-5">
                <Avatar icon={<UserOutlined />} size={45} />
                <div>
                  <div>
                    <strong>Sasi Kumar</strong>
                  </div>
                  {/* Displaying the userId */}
                  <div>{selectedUserId}</div>
                </div>
              </Space>
            </div>
          ) : null
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="80%"
      >
        {modalContent}
        <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
          <Button style={{width:'10%', backgroundColor:'green', color:'white'}}>Approve</Button>
          <Button style={{ width: '10%', backgroundColor: 'red', color: 'white' }} onClick={handleReject}>
            Reject
          </Button>
          <Modal
            title="Comments"
            className='modalTitle'
            visible={commentVisible}
            onCancel={handleCancel}
            footer={[
              <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
                Submit
              </Button>,
            ]}
          >
            <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
          </Modal>
        </div>
      </Modal>
    </ConfigProvider>
  );
  
}
export default ApprovalRequest
