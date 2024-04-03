// import React,{useEffect, useState, useRef} from 'react'
// import { useNavigate } from 'react-router-dom';
// import { ColumnsType } from 'antd/es/table'
// import { EditOutlined, FolderViewOutlined} from '@ant-design/icons';
// import { Progress } from 'antd';
// import dayjs from 'dayjs';
// import { v4 as uuidv4 } from 'uuid';
// import '../Styles/ApprovalRequest.css';
// import {
//   Avatar,
//   Space,
//   Button,
//   Table,
//   Modal,
//   Form,
//   Input,
//   Select,
//   ConfigProvider,
//   Tooltip,
//   Tag,
//   Popover,
//   message,
//   Checkbox,
//   Pagination,
//   Menu,
//   Dropdown,
// } from "antd";
// import moment from "moment";
// import { ExpandableConfig } from 'antd/lib/table/interface';
// import 'moment/locale/en-in';
// import {
//   UserOutlined,
//   DownOutlined,
//   UpOutlined,
// } from "@ant-design/icons";
// import { Task } from '../Employee/AddTask';
// import { groupBy } from 'lodash';
// import { ConstructionOutlined } from '@mui/icons-material';
// import { TableRowSelection } from 'antd/lib/table/interface';
// import { RequestedOn } from '../Employee/AddTask';
// import type { ThemeConfig } from "antd";
// import { theme } from "antd";
// import { SelectedKeys, RejectedKeys, RecentRejected } from '../Manager/MonthTasks';

// const config: ThemeConfig = {
//   token: {
//     colorPrimary: "#0B4266",
//     colorPrimaryBg: "white",
//   },
// };

//   interface DateTask{
//     key: string;
//     task: Task[];
//   }


// export interface TaskObject {
//   [date: string]: {
//     key: string;
//     tasks: Task[];
//   };
// }

// export interface SetGroupedTasks{
//   [key: string]: GroupedTasks
// }
// export interface UserGroupedTask {
//   [userId: string]: SetGroupedTasks;   
  
// }
// export interface GroupedTasks {
//   key: string;
//   slNo?: number;
//   month: string;
//   tasks: TaskObject;
//   daysFilled: number;
//   totalDaysInMonth: number;
// }


// const UserMonthlyTask:React.FC = () => { 
//   const userId = '1234'; // Replace 'YOUR_USER_ID' with the actual user id you want to check
//   const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
//   const [rejectedKeys, setRejectedKeys] = useState<RecentRejected[]>([]);
//   const navigate = useNavigate();
//   //const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
//   const [selectedRows, setSelectedRows] = useState<string[]>([]);
//   const [selectedInnerRows, setSelectedInnerRows] = useState<string[]>([]);
//   //const[daysInMonth, getDaysInMonth]=useState<string[]>([]);
//   const [groupedTasks, setGroupedTasks] = useState<UserGroupedTask>({});
//   // State declaration with two keys
//   //const [groupedTasks, setGroupedTasks] = useState<{ [month: string]: { [date: string]: GroupedTasks } }>({});
//   const [expandedRow, setExpandedRow] = useState<string | null>(null);
//   const [expandedInnerRow, setExpandedInnerRow] = useState<string | null>(null);
//   const [modalVisible, setModalVisible] = useState<boolean>(false);
//   const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
//   const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
//   const [comments, setComments] = useState('');
//   const [commentVisible, setCommentVisible] = useState(false);
//   const [approvalRequests, setApprovalRequests] = useState<DateTask[]>([]);
//   const [monthTasks, setMonthTasks] = useState<TaskObject[]>([]);
//   useEffect(() => {
//       // Retrieve approvalRequestsData from local storage
//       const storedData = localStorage.getItem('approvalRequestedData');
//       console.log("approvalRequests", storedData);
//       if (storedData) {
//           const approvalRequestsData: { [key: string]: Task[] } = JSON.parse(storedData);
//           console.log("approvalRequests", approvalRequestsData);

//           // Convert the object to an array of DateTask objects
//           const dateTasks: DateTask[] = Object.keys(approvalRequestsData).map(key => ({
//               key: key,
//               task: approvalRequestsData[key]
//           }));
//           console.log("approvalRequests-datetasks", dateTasks);

//           setApprovalRequests(dateTasks); // Update the state with fetched data
//       }
//       console.log("approvalRequests-approvalrequests", approvalRequests);
//   }, []); // Fetch data only once on component mount

//   useEffect(() => {
//         const storedKeysString: string | null = localStorage.getItem('selectedKeys');
//         if (storedKeysString !== null) {
//             const storedKeys: SelectedKeys = JSON.parse(storedKeysString);
           
//             if (storedKeys.hasOwnProperty(userId)) {
//                 setSelectedKeys(storedKeys[userId]);
//             } else {
//                 console.log("User ID not found in stored keys");
//             }
//         } else {
//             console.log("else-useEffect", storedKeysString);
//         }
//   }, []);

//   useEffect(() => {
//       const storedKeysString: string | null = localStorage.getItem('rejectedKeys');
//       if (storedKeysString !== null) {
//           const storedKeys: RejectedKeys = JSON.parse(storedKeysString);
//           const userRejectedKeys = storedKeys[userId];
//           if (userRejectedKeys) {
//             console.log("userRejectedKeys", userRejectedKeys);
//               setRejectedKeys(userRejectedKeys);
//           }
//       } else {
//           console.log("else-useEffect", storedKeysString);
//       }
//   }, []);


//   useEffect(() => {
//     console.log("useeffect", approvalRequests.length);
//     if (approvalRequests.length > 0) { // Check if approvalRequests has data
//         // Process approvalRequests data
//         handleGroupedTasks(approvalRequests);
//     }
//   }, [approvalRequests]);

//   useEffect(() => {
//     const storedData = localStorage.getItem('groupedTasks');
//     if (storedData && (selectedKeys.length > 0 || rejectedKeys.length>0)) {
//       const parsedData: UserGroupedTask = JSON.parse(storedData);
//       const updatedData = Object.keys(parsedData).reduce((acc: UserGroupedTask, userId: string) => {
//         const userData = parsedData[userId];
        
//         // Check if userData is not null or undefined
//         if (userData) {
//           const filteredSetGroupedTasks: SetGroupedTasks = {};
//           Object.keys(userData).forEach((monthKey: string) => {
//             const monthData = userData[monthKey];
//             const filteredTasks: TaskObject = {};
//             Object.keys(monthData.tasks).forEach((dateKey: string) => {
//               if (!selectedKeys.includes(dateKey) && !rejectedKeys.some((rejected) => rejected.date === dateKey)) {
//                 filteredTasks[dateKey] = monthData.tasks[dateKey];
//               }
//             });
//             if (Object.keys(filteredTasks).length > 0) {
//               filteredSetGroupedTasks[monthKey] = { ...monthData, tasks: filteredTasks };
//             }
//           });
//           if (Object.keys(filteredSetGroupedTasks).length > 0) {
//             acc[userId] = filteredSetGroupedTasks;
//           }
//         }

//         return acc;
//       }, {});
//       setGroupedTasks(updatedData);
//     }
//   }, [selectedKeys, rejectedKeys]);


//   const handleReject = () => {
//     setCommentVisible(true);
//   };

//   const handleCancel = () => {
//     setCommentVisible(false);
//   };

//   const handleInputChange = (e:any) => {
//     setComments(e.target.value);
//   };

//   const handleSubmit = () => {
//     // Handle submission logic here
//     console.log('Comments:', comments);
//     setCommentVisible(false);
//   };
  
//   function getDaysInMonth(month: number, year: number) {
//     // month is 0-based in JavaScript
//     return new Date(year, month + 1, 0).getDate();
//   }
  
//   const handleGroupedTasks = (requestData: DateTask[]) => {
//     // Group tasks by month
//     console.log("handleGroupedtasks- requestData", requestData);
//     const grouped = groupBy(requestData, (task: DateTask) => dayjs(task.key).format("YYYY-MM"));
//     console.log("handleGroupedTasks-grouped", grouped);
//     // Retrieve existing data from local storage
//     const existingDataJSON = localStorage.getItem('groupedTasks');
//     const existingData: UserGroupedTask = existingDataJSON ? JSON.parse(existingDataJSON) : {};
  
//     // Process each month's tasks
//     for (const monthKey in grouped) {
//       console.log("monthKey", monthKey);
//       const tasksArray = grouped[monthKey] as DateTask[];
//       console.log("tasksArray", tasksArray);
//       const firstTaskDate = dayjs(tasksArray[0].key, 'YYYY-MM-DD');
//       const formattedMonth = firstTaskDate.format("MMMM YYYY");
//       const totalDaysInMonth = getDaysInMonth(firstTaskDate.month(), firstTaskDate.year());
  
//       let daysFilled = 0;
//       const tasks: TaskObject = {};
//       tasksArray.forEach(taskObj => {
//         console.log("taskObj", taskObj);
//         const dateKey = dayjs(taskObj.key, 'YYYY-MM-DD').format('YYYY-MM-DD');
//         if (existingData[userId]?.hasOwnProperty(monthKey)) {
//           if (!existingData[userId][monthKey]?.tasks.hasOwnProperty(dateKey)) {
//             // Create a new date key entry with all tasks from the tasksArray
//             existingData[userId][monthKey].tasks[dateKey] = { key: uuidv4(), tasks: taskObj.task };
//             daysFilled++;
//           } else {
//             if (existingData[userId][monthKey]?.tasks[dateKey].tasks.length === 0) {
//               console.log("sasi", dateKey);
//               return;
//             }
//             existingData[userId][monthKey].tasks[dateKey].tasks = [...taskObj.task];
//           }
//         } else {
//           const dateUUID = uuidv4(); // Generate unique key for the date
//           tasks[dateKey] = { key: dateUUID, tasks: taskObj.task };
//           daysFilled++;
//         }
//       });
  
//       if (!existingData[userId]?.hasOwnProperty(monthKey)) {
//         const monthUUID = uuidv4(); // Generate unique key for the month
//         existingData[userId] = existingData[userId] || {};
//         existingData[userId][monthKey] = {
//           key: monthUUID,
//           month: formattedMonth,
//           daysFilled,
//           totalDaysInMonth,
//           tasks
//         };
//       } else {
//         existingData[userId][monthKey].daysFilled = daysFilled; // Update daysFilled
//       }
//     }
  
//     // Set the updated data to local storage
//     localStorage.setItem('groupedTasks', JSON.stringify(existingData));
  
//     // Update the state with the combined data
//     // You'll need to manage the state accordingly as per your application's structure
//     setGroupedTasks(existingData);
//     setApprovalRequests([]);
//   };
  
//   const handleRowSelection = (selectedRowKeys: React.Key[]) => {
//     console.log("handleRowSelection selectedRowKeys", selectedRowKeys); // Output selectedRowKeys to console
//     setSelectedRows(selectedRowKeys as string[]);
//   };


//   const rowSelection = {
//     onChange: (selectedRowKeys: React.Key[], selectedRows: TaskObject[]) => {
//       console.log('selectedRowKeys', selectedRowKeys, 'selectedRows: ', selectedRows);
//       setSelectedInnerRows(selectedRowKeys as string[]);
//       console.log(selectedInnerRows);
//     },
//     getCheckboxProps: (record: TaskObject) => ({
//       disabled: false, // Column configuration not to be checked
//       key: record.key,
//     }),
//   }; //not in use

//   useEffect(() => {
//     console.log("selectedInnerRows", selectedInnerRows);
//   }, [selectedInnerRows]);

//     const handleToggleRowExpand = (record: GroupedTasks, event: React.MouseEvent<HTMLElement>) => {
//       // Update the expandedRow state using the functional form of setState
//       setExpandedRow(prevExpandedRow => prevExpandedRow === record.month ? null : record.month);
//       // Prevent event propagation
//       event.stopPropagation();
//     };//not in use

//     const handleToggleInnerRowExpand = (record: TaskObject) => {
//       const taskKeys = Object.keys(record?.tasks);
//       if (taskKeys.length > 0) {
//         // Get the first key from the tasks object
//         const firstTaskKey = taskKeys[0];
//         // Update the state with the first task key
//         setExpandedInnerRow(prevExpandedInnerRow => {
//           // Check if the current expanded row is the same as the first task key
//           if (prevExpandedInnerRow === firstTaskKey) {
//             // If it is, collapse the row by setting expandedInnerRow to null
//             return null;
//           } else {
//             // Otherwise, expand the row by setting expandedInnerRow to the first task key
//             return firstTaskKey;
//           }
//         });
//       }
//       console.log("handleToggleInnerRowExpand", expandedInnerRow);
//     };//not in use
  
//     const rowClassName = (record: GroupedTasks, index: number) => {
//       return index % 2 === 0 ? 'even-row' : 'odd-row';
//     };//not in use

//     const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
//       console.log("monthTaskData-monthtasks", monthTasks)
//       console.log("dateData", dateData);
//       if (!dateData) return {}; // Check if dateData is undefined or null
//       return dateData ;
//     });

//     const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
//         console.log("monthTasksData",taskObject);
//         const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
//         console.log("date", date)
//         const { key, tasks } = taskObject[date];
//         return { key, task: tasks }; // Assuming 'tasks' property is mapped to 'task' in DateTask
//     });

  

//     const handleInnerRowSelection = (selectedRowKeys: React.Key[]) => {
//       console.log("handleInnerRowSelection selectedRowKeys", selectedRowKeys); // Output selectedRowKeys to console
//       setSelectedInnerRows(selectedRowKeys as string[]);
//     };

 
//     const column: ColumnsType<DateTask> = [
//         {
//             title: 'Select All',
//             dataIndex: 'date',
//             key: 'date',
//             width: '20%',
//             fixed: 'left',
//             render: (_, record: DateTask) => {
//                 // Get the specific month key

//                 const date = record.task.length > 0 ? record.task[0].date : '';
//                 return date;
//             },
//         },
//         {
//             title: '',
//             dataIndex: 'tasks',
//             key: 'tasks',
//             width: '60%',
//             render: (_, record: DateTask) => {
//                 // Initialize variables to store task hours and total hours
//                 let totalHours = 0;
//                 const taskHours: { [key: string]: number } = {};
//                 // Iterate over each task in the record
//                 record.task.forEach(task => {
//                     const totalHoursForTask = parseFloat(task.totalHours || '0');
//                     totalHours += totalHoursForTask; // Accumulate total hours
//                     taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
//                 });

//                 // Calculate extra hours if total hours exceed 9
//                 const extraHours = totalHours > 9 ? totalHours - 9 : 0;

//                 return (
//                     <div>
//                         <ul style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', padding: 0 }}>
//                             {/* Render task hours for each task */}
//                             {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
//                                 <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                     <div style={{ paddingRight: '20px' }}>
//                                         <div style={{ color: 'grey', paddingBottom: '5px' }}>
//                                             {taskName}
//                                         </div>
//                                         <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
//                                             {taskTotalHours}H
//                                         </div>
//                                     </div>
//                                     <div>
//                                         <Progress
//                                             type="circle"
//                                             percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
//                                             width={60}
//                                         />
//                                     </div>
//                                 </li>
//                             ))}
//                             {/* Render extra hours and total hours */}
//                             <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                 <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                                     Extra Hours
//                                 </div>
//                                 <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
//                                     {extraHours.toFixed(2)}H
//                                 </div>
//                             </li>
//                             <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                 <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                                     Total Hours
//                                 </div>
//                                 <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
//                                     {totalHours}H
//                                 </div>
//                             </li>
//                         </ul>
//                     </div>
//                 );
//             },
//         },
//         Table.EXPAND_COLUMN
//     ];

//     const innerColumn: ColumnsType<Task> = [
//       {
//         title: 'Sl.no',
//         className: 'ant-table-column-title',
//         dataIndex: 'slNo',
//         key: 'slNo',
//         fixed: 'left',
//         render: (_, __, index) => <span>{index + 1}</span>,
//       }, 
//       {
//         title: 'Work Location',
//         //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
//         dataIndex: 'workLocation',
//         key: 'workLocation',
//         fixed: 'left',
//       }, 
//       {
//         title: 'Task',
//         sorter: (a: Task, b: Task) => {
//           return a.task.localeCompare(b.task);
//         },
//         dataIndex: 'task',
//         key: 'task',
//         fixed: 'left',
//       },
//       {
//         title: 'Title',
//         sorter: (a: Task, b: Task) => {
//           return a.project.localeCompare(b.project);
//         },
//         dataIndex: 'task',
//         key: 'task',
//         fixed: 'left',
//       },
//       {
//         title: 'Start Time',
//         sorter: (a: Task, b: Task) => {
//           return a.startTime.localeCompare(b.startTime);
//         },
//         dataIndex: 'startTime',
//         key: 'startTime',
//         fixed: 'left',
//       },
//       {
//         title: 'End Time',
//         sorter: (a: Task, b: Task) => {
//           return a.endTime.localeCompare(b.endTime);
//         },
//         dataIndex: 'endTime',
//         key: 'endTime',
//         fixed: 'left',
//       },
//       {
//         title: 'Total Hours',
//         sorter: (a: Task, b: Task) => {
//           return a.totalHours.localeCompare(b.totalHours);
//         },
//         dataIndex: 'totalHours',
//         key: 'totalHours',
//         fixed: 'left',
//       },
//       {
//         title: 'Description',
//         sorter: (a: Task, b: Task) => {
//           return a.description.localeCompare(b.description);
//         },
//         dataIndex: 'description',
//         key: 'description',
//         fixed: 'left',
//       },
//     ];
    
//     const columns: ColumnsType<GroupedTasks> = [
//       {
//         title: 'Sl.no',
//         className: 'ant-table-column-title',
//         dataIndex: 'slNo',
//         key: 'slNo',
//         fixed: 'left',
//         render: (_, __, index) => <span>{index + 1}</span>,
//       },    
//       {
//         title: "Employee",
//         className: ' ant-table-column-title',
//         dataIndex: "tasks",
//         render: (tasks: { [date: string]: { key: string; tasks: Task[] } }) => {
//           const userId = tasks[Object.keys(tasks)[0]].tasks[0]?.userId || '';
//           return (
//             <Space className="flex gap-5">
//               <Avatar icon={<UserOutlined />} size={45} />
//               <div>
//                 <div>
//                   <strong>Sasi Kumar</strong>
//                 </div>
//                 <div>{userId}</div>
//               </div>
//             </Space>
//           );
//         },
//         // sorter: (a: GroupedTasks, b: GroupedTasks) => {
//         //   const userIdA = a.tasks[Object.keys(a.tasks)[0]].tasks[0]?.userId || '';
//         //   const userIdB = b.tasks[Object.keys(b.tasks)[0]].tasks[0]?.userId || '';
//         //   return userIdA.localeCompare(userIdB);
//         // },
//       },          
//       {
//         title: 'Month',
//         //sorter: (a, b) => a.month.localeCompare(b.month),
//         className: 'ant-table-column-title',
//         dataIndex: 'month',
//         key: 'month',
//         fixed: 'left',
//       },
//       {
//         title: 'Requested On',
//         className: 'ant-table-column-title',
//         dataIndex: 'month', // Use the month key from the data to fetch the requestedOn data
//         key: 'date',
//         fixed: 'left',
//         render: (month: string) => {
//             // Retrieve the requestedOn from local storage
//             const requestedOnString = localStorage.getItem('requestedOn');
//             const requestedOn: RequestedOn = requestedOnString ? JSON.parse(requestedOnString) : {};
    
//             // Retrieve the dates array corresponding to the month
//             const dates = requestedOn[month] || [];
    
//             // If dates array is empty, return empty string
//             if (dates.length === 0) return '';
    
//             // Format dates array as a string to display
//             let formattedDates: string;
//             if (dates.length === 1) {
//                 // If there is only one date, display it
//                 formattedDates = dates[0];
//             } else {
//                 // If there are two dates, display in "From: date1 To: date2" format
//                 formattedDates = `From: ${dates[0]} To: ${dates[1]}`;
//             }
    
//             return formattedDates;
//         },
//       },     
//       {
//         title: 'Days Filled',
//         className: 'ant-table-column-title',
//         dataIndex: 'daysFilled',
//         key: 'daysFilled',
//         render: (daysFilled, record) => {
//           const dateKeysFilled = Object.keys(record.tasks).length;
//           return (
//             <span>{`${dateKeysFilled} / ${record.totalDaysInMonth}`}</span>
//           );
//         },
//         //sorter: (a: GroupedTasks, b: GroupedTasks) => Object.keys(a.tasks).length - Object.keys(b.tasks).length,
//       },    
//       Table.EXPAND_COLUMN
//     ];
  
//     const expandable: ExpandableConfig<GroupedTasks> = {
//       expandedRowRender: (record: GroupedTasks) => {
//         const taskHours: { [key: string]: number } = {};
//         for (const dateKey in record.tasks) {
//           record.tasks[dateKey].tasks.forEach(task => {
//             if (taskHours.hasOwnProperty(task.task)) {
//               taskHours[task.task] += parseFloat(task.totalHours || '0');
//             } else {
//               taskHours[task.task] = parseFloat(task.totalHours || '0');
//             }
//           });
//         }
        
//         // After calculating the total hours for each task, convert them to fixed decimals
//         for (const taskName in taskHours) {
//           if (taskHours.hasOwnProperty(taskName)) {
//             taskHours[taskName] = parseFloat(taskHours[taskName].toFixed(2));
//           }
//         }
        
//         const totalHours = Math.floor(Object.values(taskHours).reduce((acc, curr) => acc + curr, 0));
//         const regularHours = Math.min(totalHours, 9);
//         const extraHours = totalHours - regularHours;
    
//         if (expandedRow === record.month) {
//           return (
//             <div>
//               <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none' }}>
//                 {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
//                   <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
//                     <div style={{ paddingRight: '20px' }}>
//                       <div style={{ color: 'grey', paddingBottom: '5px' }}>
//                         {taskName}
//                       </div>
//                       <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
//                         {taskTotalHours}H
//                       </div>
//                     </div>
//                     <div>
//                       <Progress
//                         type="circle"
//                         percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
//                         width={60}
//                       />
//                     </div>
//                   </div>
//                 ))}
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
//                   <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                     Extra Hours
//                   </div>
//                   <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
//                     {extraHours}H
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
//                   <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                     Total Hours
//                   </div>
//                   <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
//                     {totalHours}H
//                   </div>
//                 </div>
//               </ul>
//             </div>
//           );
//         }
//         return null;
//       },
//       expandRowByClick: true,
//       //expandIcon: () => null
//     }; //not in use
    
    
//     const aggregatedData: GroupedTasks[] = Object.keys(groupedTasks).flatMap((userId: string) => {
//       const userGroupedTasks = groupedTasks[userId];
//       return Object.keys(userGroupedTasks).map((monthKey: string) => {
//         console.log("aggregatedData-monthKey", monthKey);
//         const monthData = userGroupedTasks[monthKey];
//         console.log("aggregatedData-monthData", monthData);
//         const monthTasks: TaskObject = {};
//         let daysFilled = 0;
//         for (const dateKey in monthData.tasks) {
//           if (Object.keys(monthData.tasks[dateKey].tasks).length > 0) {
//             monthTasks[dateKey] = monthData.tasks[dateKey];
//             daysFilled++;
//           }
//         }
//         const totalDaysInMonth = monthData.totalDaysInMonth;
//         console.log("aggregatedData", monthData);
//         return {
//           key: monthData.key,
//           month: monthData.month,
//           tasks: monthTasks,
//           daysFilled: daysFilled,
//           totalDaysInMonth: totalDaysInMonth
//         };
//       });
//     });
  
//     const flattenedData = (groupedTasks: TaskObject) => {
//       const tasks: TaskObject[] = [];
//       const keys = Object.keys(groupedTasks);
//       console.log("keys", keys);
//       // Iterate over each key
//       keys.forEach(key => {
//           // Find the monthData corresponding to the current key
//           const groupedData = groupedTasks[key];
//           console.log("monthdata", groupedData);
//           if (groupedData) {
//               // Convert monthData into TaskObject
//               const taskObject: TaskObject = {
//                   [key]: {
//                       key: groupedData.key,
//                       tasks: groupedData.tasks
//                   }
//               };
//               tasks.push(taskObject);
//           }
//       });
  
//       return tasks;
//   };
  
//     const handleRowClick = (
//       record: TaskObject,
//       formattedMonth: string,
//       event: React.MouseEvent<HTMLElement>
//     ) => {
//       setModalContent(
//         <div>
//           <Table
//                 rowSelection={{
//                     type: 'checkbox',
//                     selectedRowKeys: selectedInnerRows,
//                     onChange: handleInnerRowSelection
//                 }}
//                 style={{
//                     backgroundColor: 'white',
//                     border: '1px solid grey',
//                     borderRadius: '5px',
//                 }}
//                 columns={column} 
//                 rowClassName="rowstyle"
//                 dataSource={monthTasksData}
//                 pagination={false}
//                 expandable={{
//                     expandedRowRender: (record: DateTask) => {
//                         const handleInnerRowExpand = () => {
//                             return (
//                                 <Table
//                                     columns={innerColumn as ColumnsType<Task>}
//                                     dataSource={record.task} // Pass all tasks in the date as dataSource
//                                     pagination={false}
//                                 />
//                             );
//                         };
                        
//                         return (
//                             <>
//                                 {handleInnerRowExpand()}
//                             </>
//                         );
//                     },
//                     expandRowByClick: true,
//                     expandIcon: ({ expanded, onExpand, record }) =>
//                         expanded ? (
//                             <UpOutlined onClick={e => onExpand(record, e)} style={{float:'right'}} />
//                         ) : (
//                             <DownOutlined onClick={e => onExpand(record, e)} style={{float: 'right'}}/>
//                         ),
//                 }}
                
                
//             />
//         </div>
//       );
//       // Set the modal content and make the modal visible
//       setModalVisible(true);
    
//       // Prevent event propagation
//       event.stopPropagation();
//     };//not in use
     
//   return (
//     <ConfigProvider theme={config}>
//       <div>
//           <Table
//             rowSelection={{
//               type: 'checkbox',
//               selectedRowKeys: selectedRows,
//               onChange: handleRowSelection,
//               getCheckboxProps: (record: GroupedTasks) => ({
//                 // Use the `key` field as the identifier for row selection
//                 key: record.key,
//                 disabled: false, // You can adjust these additional props as needed
//               }),
//             }}  
//             onRow={(record: GroupedTasks) => ({
//               onClick: (event: React.MouseEvent<HTMLElement>) => {
//                 const userId = record.tasks[Object.keys(record.tasks)[0]].tasks[0]?.userId;
//                 setSelectedUserId(userId); // Set the userId in state
//                 // Extract necessary data from the GroupedTasks record
//                 const monthYear = record.month;
//                 const [monthName, year] = monthYear.split(' ');
//                 const monthNumber = moment().month(monthName).format('MM');
//                 const formattedMonth = `${year}-${monthNumber}`;
//                 // Convert GroupedTasks record into TaskObject
//                 const tasksObject: TaskObject = record.tasks;
//                 console.log("onRow-tasksObject", tasksObject);
//                 console.log("taskObject", tasksObject);
//                 const tasksForClickedMonth: TaskObject[] = flattenedData(
//                   tasksObject
//                 );
//                 console.log("onRow-tasksForClickedMonth", tasksForClickedMonth);
//                 setMonthTasks(tasksForClickedMonth);
//                 // Pass TaskObject and formattedMonth to handleRowClick
//                 //handleRowClick(tasksObject, formattedMonth, event);
//                 navigate(`/employee/monthtasks?formattedMonth=${formattedMonth}&userId=${userId}`, {state: {
//                   formattedMonth: monthYear, //formattedMonth
//                   userId: userId,
//                   tasksObject: tasksObject,
//                   tasksForClickedMonth: tasksForClickedMonth,
//               }});
//               },
//             })}
//             rowClassName={(record: GroupedTasks, index: number) =>
//               index % 2 === 0 ? 'even-row' : 'odd-row'
//             }
//             className='custom-table'
//             columns={columns}
//            dataSource={aggregatedData}
//             pagination={false}
//           />
        
//       </div>
//       <Modal
//         title={
//           modalContent ? (
//             <div>
//               <Space className="flex gap-5">
//                 <Avatar icon={<UserOutlined />} size={45} />
//                 <div>
//                   <div>
//                     <strong>Sasi Kumar</strong>
//                   </div>
//                   {/* Displaying the userId */}
//                   <div>{selectedUserId}</div>
//                 </div>
//               </Space>
//             </div>
//           ) : null
//         }
//         visible={modalVisible}
//         onCancel={() => setModalVisible(false)}
//         footer={null}
//         width="80%"
//       >
//         {modalContent}
//         <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
//           <Button style={{width:'10%', backgroundColor:'green', color:'white'}}>Approve</Button>
//           <Button style={{ width: '10%', backgroundColor: 'red', color: 'white' }} onClick={handleReject}>
//             Reject
//           </Button>
//           <Modal
//             title="Comments"
//             className='modalTitle'
//             visible={commentVisible}
//             onCancel={handleCancel}
//             footer={[
//               <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
//                 Submit
//               </Button>,
//             ]}
//           >
//             <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
//           </Modal>
//         </div>
//       </Modal>
//     </ConfigProvider>
//   );
  
// }

// export default UserMonthlyTask

import React from 'react'

const UserMonthlyTask = () => {
  return (
    <div>UserMonthlyTask</div>
  )
}

export default UserMonthlyTask