// import React,{useState, useEffect} from 'react'
// import moment from 'moment'
// import isEqual from 'lodash/isEqual';
// import {
//     UserOutlined,
//     DownOutlined,
//     UpOutlined,
// } from "@ant-design/icons";
// import { useParams, useLocation } from 'react-router-dom';
// import {Button, Modal, Progress, Input, Space, Avatar } from 'antd';
// import DashboardLayout from './Layout'
// import { ColumnsType } from 'antd/es/table'
// import { Table } from 'antd'
// import { TaskObject } from './ApprovalRequest'
// import { Task } from './AddTask'
// import ApprovalRequest from './ApprovalRequest';
// interface DateTask{
//     key: string;
//     task: Task[];
// }

// export interface RecentRejected {
//     date: string;
//     comment: string;
// }
// interface ApprovalRequestsProps{
//     setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>;
// }
// const MonthTasks: React.FC<ApprovalRequestsProps> = ({setSelectedKeys}) => {
//     const location = useLocation();
//     const { formattedMonth, userId, tasksForClickedMonth, tasksObject } = location.state;

//     const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
//     // const {formattedMonth='', userId=''}=useParams();
//     const [monthTasks, setMonthTasks] = useState<{ [key: string]: TaskObject }>({});
//     const [selectedRows, setSelectedRows] = useState<string[]>([]);
//     //const [selectedKeys, setSelectedKeys]=useState<string[]>([]);
//     const [rowTask, setRowTask]= useState<string[]>([]);
//     const [comments, setComments] = useState('');
//     const [commentVisible, setCommentVisible] = useState(false);
//     const [monthTasksData, setMonthTasksData] = useState<DateTask[]>([]);
//     const [rejectKeys, setRejectKeys]= useState<RecentRejected[]>([]);
//     const [rejectDates, setRejectDates]= useState<RecentRejected[]>([]);
//     console.log("received data", formattedMonth,userId, tasksForClickedMonth)
//     useEffect(() => {
//         setMonthTasks(tasksForClickedMonth);
//         setRowTask(tasksObject);
//     }, [tasksForClickedMonth, tasksObject]);
    
//     useEffect(() => {
//         const storedKeysString: string | null = localStorage.getItem('selectedKeys');
//         if (storedKeysString !== null) {
//             const storedKeys: string[] = JSON.parse(storedKeysString);
//             setSelectedKeys(storedKeys);
//         } else {
//            console.log("else-useEffect", storedKeysString);
//         }
//     }, []);
    
    


//     const handleRowSelection = (selectedRowKeys: React.Key[]) => {
//         setSelectedRows(selectedRowKeys as string[]);
//         setSelectedKeys(selectedRowKeys as string[]);
//         console.log("handleRowSelection", selectedRowKeys);
//     };

//     const handleReject = () => {
//         setCommentVisible(true);
//         //call the handleSubmit funtion here and get the comments
//         let key: any[] = [];
//         let date: any[] = [];
//         const updatedMonthTasksData = monthTasksData.filter(row => {
//             const isRowIncluded = selectedRows.includes(row.key);
//             if (isRowIncluded) {
//                 if (!key.includes(row.key)) {
//                     key.push(row.key);
//                     const datekey = row.task.length > 0 ? row.task[0].date : '';
//                     date.push(datekey);
//                 }
//             }
//             return !isRowIncluded;
//         });
//         setRejectDates(key);
//         setRejectKeys(date);
//         setMonthTasksData(updatedMonthTasksData);
//         setSelectedRows([]);
//     };
    
    
//       const handleCancel = () => {
//         setCommentVisible(false);
//       };

//       const handleSubmit = () => {
//         // Handle submission logic here
//         let date: any[]=[];
//         let key: any[]=[];
//         date = rejectKeys;
//         key = rejectDates;
//         console.log("rejectedKeys in handleSubmit", date);
//         console.log("key in handleSubmit", key);
//        // Get stored rejected keys from localStorage or initialize an empty array if none exists
//        const storedRejectedKeys: any[] = JSON.parse(localStorage.getItem('rejectedKeys') || '[]');
    
//     //    // Filter out keys that are already present in storedRejectedKeys to avoid duplicates
//     //    const newKeysToAdd = date.filter(newKey => !storedRejectedKeys.includes(newKey));
   
//     //    // Update storedRejectedKeys with the new keys to add
//     //    const updatedRejectedKeys: any[] = [...storedRejectedKeys, ...newKeysToAdd];
//     //    localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
//      // Filter out keys that are already present in storedRejectedKeys to avoid duplicates
//      const newKeysToAdd = date.filter(newKey => !storedRejectedKeys.includes(newKey));
   
//      // Update storedRejectedKeys with the new keys to add
//      const updatedRejectedKeys: { date: string; comment: string }[] = [
//         ...newKeysToAdd.map(dateKey => ({ date: dateKey, comment: comments }))
//     ];
//      localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
    
//         // Store recent rejected dates along with comments in the local storage under the key "recentRejected"
//         const recentRejected: { date: string; comment: string }[] = JSON.parse(localStorage.getItem('recentRejected') || '[]');
//         const updatedRecentRejected: { date: string; comment: string }[] = [
//             ...date.map(dateKey => ({ date: dateKey, comment: comments }))
//         ];
//         localStorage.setItem('recentRejected', JSON.stringify(updatedRecentRejected));
    
    
//         const updatedMonthTasksDataObj = Object.keys(monthTasks).reduce((acc: { [key: string]: TaskObject }, dateKey: string) => {
//             const dateData = monthTasks[dateKey];
//             const filteredData = Object.fromEntries(Object.entries(dateData).filter(([date, data]) => !key.includes(data.key)));
//             console.log("filteredData", filteredData);
//             if (Object.keys(filteredData).length > 0) {
//                 acc[dateKey] = filteredData;
//             }
//             return acc;
//         }, {});
    
//         setMonthTasks(updatedMonthTasksDataObj);
//         console.log("handleRejected-updatedMonthTasksDataObj", updatedMonthTasksDataObj);
    
//         console.log('Comments:', comments);
//         setCommentVisible(false);
//       };
    

//     const handleInputChange = (e:any) => {
//         setComments(e.target.value);
//       };

//     //   const handleApprove = () => {
//     //     // Filter out the selected row from the groupedTasks state
//     //     const updatedGroupedTasks = { ...groupedTasks };
//     //     console.log("handleApprove", updatedGroupedTasks);
//     //     // Iterate through selected rows
//     //     selectedInnerRows.forEach(rowKey => {
//     //         // Check if the rowKey exists in updatedGroupedTasks and if its tasks property is defined
//     //         if (updatedGroupedTasks[rowKey]?.tasks) {
//     //             const tasks = updatedGroupedTasks[rowKey].tasks;
//     //             // Iterate through tasks for each date
//     //             Object.values(tasks).forEach(dateTasks => {
//     //                 // Iterate through individual tasks
//     //                 dateTasks.tasks.forEach(task => {
//     //                     // Add a special CSS class or inline style to change the background color to green
//     //                     (task as Task & { backgroundColor?: string }).backgroundColor = 'green'; // Adjust this to your styling needs
//     //                 });
//     //             });
//     //         }
//     //     });
//     //     console.log("updatedGroupedTaks", updatedGroupedTasks);
//     //     // Update the selectedInnerRows array to remove the approved row
//     //     setSelectedInnerRows([]);
    
//     //     // Close the modal
//     //     setModalVisible(false);
    
//     //     // Update the state with the modified groupedTasks
//     //     setGroupedTasks(updatedGroupedTasks);
//     // };

//     const handleApprove = async () => {
//         let key: any[] = [];
//         let date: any[] = [];
//         const updatedMonthTasksData = monthTasksData.filter(row => {
//             const isRowIncluded = selectedRows.includes(row.key);
//             if (isRowIncluded) {
//                 if (!key.includes(row.key)) {
//                     key.push(row.key);
//                     const datekey = row.task.length > 0 ? row.task[0].date : '';
//                     date.push(datekey);
//                 }
//             }
//             return !isRowIncluded;
//         });
    
//         setSelectedKeys(date);
    
//         // Get stored keys from localStorage or initialize an empty array if none exists
//         const storedSelectedKeys: any[] = JSON.parse(localStorage.getItem('selectedKeys') || '[]');
//         const storedRejectedKeys: any[] = JSON.parse(localStorage.getItem('rejectedKeys') || '[]');
    
//         // Filter out keys that are already present in storedSelectedKeys to avoid duplicates
//         const newKeysToAdd = date.filter(newKey => !storedSelectedKeys.includes(newKey));
    
//         // Update storedSelectedKeys with the new keys to add
//         const updatedSelectedKeys: any[] = [...storedSelectedKeys, ...newKeysToAdd];
//         localStorage.setItem('selectedKeys', JSON.stringify(updatedSelectedKeys));
    
//         // Remove keys from rejectedKeys
//         const updatedRejectedKeys: any[] = storedRejectedKeys.filter(rejectedKey => !key.includes(rejectedKey));
//         localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
    
//         // Update recent approved tasks in local storage
//         const storedRecentApproved: any[] = JSON.parse(localStorage.getItem('recentApproved') || '[]');
//         const updatedRecentApproved: any[] = [...date];
//         localStorage.setItem('recentApproved', JSON.stringify(updatedRecentApproved));
    
//         // Wait for the localStorage to be updated before continuing
//         await new Promise(resolve => setTimeout(resolve, 0));
    
//         console.log("key", key);
//         console.log("handleApprove-updatedMonthTasksData", updatedMonthTasksData);
    
//         setMonthTasksData(updatedMonthTasksData);
    
//         const updatedMonthTasksDataObj = Object.keys(monthTasks).reduce((acc: { [key: string]: TaskObject }, dateKey: string) => {
//             const dateData = monthTasks[dateKey];
//             const filteredData = Object.fromEntries(Object.entries(dateData).filter(([date, data]) => !key.includes(data.key)));
//             console.log("filteredData", filteredData);
//             if (Object.keys(filteredData).length > 0) {
//                 acc[dateKey] = filteredData;
//             }
//             return acc;
//         }, {});
    
//         setMonthTasks(updatedMonthTasksDataObj);
//         console.log("handleApprove-updatedMonthTasksDataObj", updatedMonthTasksDataObj);
    
//         setSelectedRows([]);
//     };

//     // const monthTaskData: TaskObject[] = Object.keys(monthTasks).map((dateKey: string) => {
//     //     const dateData = monthTasks[dateKey];
//         // const dateTasks: { [date: string]: { key: string; tasks: Task[] } } = {};
//         // for (const dateKey in dateData) {
//         //     dateTasks[dateKey] = {
//         //         key: dateData[dateKey].key,
//         //         tasks: dateData[dateKey].tasks
//         //     };
//         // }
//     //     console.log("monthTaskData", dateTasks);
//     //     return dateTasks;
//     // });

//     // const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
//     //     console.log("monthTaskData-monthtasks", monthTasks)
//     //     console.log("dateData", dateData);
//     //     if (!dateData) return {}; // Check if dateData is undefined or null
//     //     // const taskObject: TaskObject = {};
//     //     // Object.entries(dateData).forEach(([date, data]) => {
//     //     //     taskObject[date] = {
//     //     //         key: data?.key,
//     //     //         tasks: data?.tasks
//     //     //     };
//     //     // });
//     //     // console.log("taskObject",taskObject);
//     //     // return taskObject;
//     //     return dateData ;
//     // });

//     const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
//         console.log("monthTaskData-monthtasks", monthTasks)
//         console.log("dateData", dateData);
//         if (!dateData) return {}; // Check if dateData is undefined or null
//         // const taskObject: TaskObject = {};
//         // Object.entries(dateData).forEach(([date, data]) => {
//         //     taskObject[date] = {
//         //         key: data?.key,
//         //         tasks: data?.tasks
//         //     };
//         // });
//         // console.log("taskObject",taskObject);
//         // return taskObject;
//         return dateData ;
//     });

//     // const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
//     //     console.log("monthTasksData",taskObject);
//     //     const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
//     //     console.log("date", date)
//     //     const { key, tasks } = taskObject[date];
//     //     return { key, task: tasks }; // Assuming 'tasks' property is mapped to 'task' in DateTask
//     // });
    
//     useEffect(() => {
//         // Process the monthTaskDatas and store it in the state
//         const processedMonthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
//             const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
//             const { key, tasks } = taskObject[date];
//             return { key, task: tasks }; // Store the data according to the DateTask interface
//         });
    
//         // Check if the processed data is different from the current state
//         if (!isEqual(processedMonthTasksData, monthTasksData)) {
//             // Update the state with the processed data
//             setMonthTasksData(processedMonthTasksData);
//         }
//     }, [monthTaskDatas, monthTasksData]); // Add monthTasksData to the dependency array
    

//     // const monthTaskDataskey: TaskObject[] = Object.values(rowTask).map(dateData => {
//     //     console.log("monthTaskData-monthtasks", monthTasks)
//     //     console.log("dateData", dateData);
//     //     if (!dateData) return {}; // Check if dateData is undefined or null
//     //     // const taskObject: TaskObject = {};
//     //     // Object.entries(dateData).forEach(([date, data]) => {
//     //     //     taskObject[date] = {
//     //     //         key: data?.key,
//     //     //         tasks: data?.tasks
//     //     //     };
//     //     // });
//     //     // console.log("taskObject",taskObject);
//     //     // return taskObject;
//     //     return dateData;
//     // });

//     // const monthTaskDatas: TaskObject[] = Object.entries(tasksForClickedMonth).map(([key, dateData]) => {
//     //     console.log("monthTaskData-tasksForClickedMonth", tasksForClickedMonth)
//     //     console.log("dateData", dateData);
//     //     if (!dateData) return {}; // Check if dateData is undefined or null
//     //     const taskObject: TaskObject = {};
//     //     taskObject[key] = dateData;
//     //     console.log("taskObject", taskObject);
//     //     return taskObject;
//     // });
//     // const flattenedData = (groupedTasks: TaskObject[] | undefined) => {
//     //     console.log("groupedTasks",groupedTasks);
//     //     if (!groupedTasks) {
//     //         return [];
//     //     }
//     //     const tasks: TaskObject[] = [];
//     //     groupedTasks?.forEach(taskObject => {
//     //         Object.keys(taskObject)?.forEach(key => {
//     //             const value = taskObject[key];
//     //             tasks.push({
//     //                 [key]: {
//     //                     key: value.key,
//     //                     tasks: value.tasks
//     //                 }
//     //             });
//     //         });
//     //     });
//     //     return tasks;
//     // };

//     const getColumn = (formattedMonth: string) => {
//         const column: ColumnsType<DateTask> = [
//             {
//                 title: 'Select All',
//                 dataIndex: 'date',
//                 key: 'date',
//                 width: '20%',
//                 fixed: 'left',
//                 render: (_, record: DateTask) => {
//                     // Get the specific month key

//                     const date = record.task.length > 0 ? record.task[0].date : '';
//                     return date;
//                     // const date = record.task.map(date=>date.date);
//                     // return date;
//                     // const monthKey = Object.keys(record).find(
//                     //     key =>
//                     //         moment(key).format('YYYY-MM') ===
//                     //         moment(formattedMonth, 'YYYY-MM').format('YYYY-MM')
//                     // );
//                     // if (!monthKey) return null; // If monthKey is not found, return null
    
//                     // // Get the formatted date for the month key
//                     // const formattedDate = moment(monthKey).format('YYYY-MM-DD');
//                     // return formattedDate;
//                 },
//             },
//             {
//                 title: '',
//                 dataIndex: 'tasks',
//                 key: 'tasks',
//                 width: '60%',
//                 render: (_, record: DateTask) => {
//                     // Initialize variables to store task hours and total hours
//                     let totalHours = 0;
//                     const taskHours: { [key: string]: number } = {};
//                     // Iterate over each task in the record
//                     record.task.forEach(task => {
//                         const totalHoursForTask = parseFloat(task.totalHours || '0');
//                         totalHours += totalHoursForTask; // Accumulate total hours
//                         taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
//                     });
    
//                     // Calculate extra hours if total hours exceed 9
//                     const extraHours = totalHours > 9 ? totalHours - 9 : 0;
    
//                     return (
//                         <div>
//                             <ul style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', padding: 0 }}>
//                                 {/* Render task hours for each task */}
//                                 {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
//                                     <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                         <div style={{ paddingRight: '20px' }}>
//                                             <div style={{ color: 'grey', paddingBottom: '5px' }}>
//                                                 {taskName}
//                                             </div>
//                                             <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
//                                                 {taskTotalHours}H
//                                             </div>
//                                         </div>
//                                         <div>
//                                             <Progress
//                                                 type="circle"
//                                                 percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
//                                                 width={60}
//                                             />
//                                         </div>
//                                     </li>
//                                 ))}
//                                 {/* Render extra hours and total hours */}
//                                 <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                     <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                                         Extra Hours
//                                     </div>
//                                     <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
//                                         {extraHours.toFixed(2)}H
//                                     </div>
//                                 </li>
//                                 <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
//                                     <div style={{ color: '#0B4266', paddingRight: '20px' }}>
//                                         Total Hours
//                                     </div>
//                                     <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
//                                         {totalHours}H
//                                     </div>
//                                 </li>
//                             </ul>
//                         </div>
//                     );
//                 },
//             },
//             Table.EXPAND_COLUMN
//         ];
    
//         return column;
//     };
    

//     const innerColumn: ColumnsType<Task> = [
//         {
//           title: 'Sl.no',
//           className: 'ant-table-column-title',
//           dataIndex: 'slNo',
//           key: 'slNo',
//           fixed: 'left',
//           render: (_, __, index) => <span>{index + 1}</span>,
//         },  
//         {
//           title: 'Task',
//           sorter: (a: Task, b: Task) => {
//             return a.task.localeCompare(b.task);
//           },
//           dataIndex: 'task',
//           key: 'task',
//           fixed: 'left',
//         },
//         {
//           title: 'Start Time',
//           sorter: (a: Task, b: Task) => {
//             return a.startTime.localeCompare(b.startTime);
//           },
//           dataIndex: 'startTime',
//           key: 'startTime',
//           fixed: 'left',
//         },
//         {
//           title: 'End Time',
//           sorter: (a: Task, b: Task) => {
//             return a.endTime.localeCompare(b.endTime);
//           },
//           dataIndex: 'endTime',
//           key: 'endTime',
//           fixed: 'left',
//         },
//         {
//           title: 'Total Hours',
//           sorter: (a: Task, b: Task) => {
//             return a.totalHours.localeCompare(b.totalHours);
//           },
//           dataIndex: 'totalHours',
//           key: 'totalHours',
//           fixed: 'left',
//         },
//         {
//           title: 'Description',
//           sorter: (a: Task, b: Task) => {
//             return a.description.localeCompare(b.description);
//           },
//           dataIndex: 'description',
//           key: 'description',
//           fixed: 'left',
//         },
//     ];
//     return (
//         <DashboardLayout>
//             <div style={{display:'flex', alignItems:'flex-start', margin:'10px 20px'}}>
//               <Space className="flex gap-5">
//                 <Avatar icon={<UserOutlined />} size={65} />
//                 <div>
//                   <div>
//                     <strong style={{fontSize:'20px'}}>Sasi Kumar</strong>
//                   </div>
//                   {/* Displaying the userId */}
//                   <div style={{textAlign:'left', fontSize:'16px'}}>{userId}</div>
//                 </div>
//               </Space>
              
//             </div>
//             <div style={{fontWeight:'bold', color:'#0B4266',fontSize:'20px',textAlign:'center', margin:'10px 20px'}}>{formattedMonth}</div>
//             <Table
//                 rowSelection={{
//                     type: 'checkbox',
//                     selectedRowKeys: selectedRows,
//                     onChange: handleRowSelection
//                 }}
//                 style={{
//                     backgroundColor: 'white',
//                     // border: '1px solid grey',
//                     // borderRadius: '5px',
//                 }}
//                 columns={getColumn(formattedMonth)} 
//                 rowClassName="rowstyle"
//                 dataSource={monthTasksData}
//                 pagination={false}
//                 // expandable={{
//                 //     expandedRowRender: (record: DateTask) => {
//                 //         const handleInnerRowExpand = (dateKey: string) => {
//                 //             const tasksForDate = record.task.find(task => task.date === dateKey);
//                 //             return (
//                 //                 <Table
//                 //                     columns={innerColumn as ColumnsType<Task>}
//                 //                     dataSource={tasksForDate ? [tasksForDate] : []} // Pass an array with the task if found, otherwise an empty array
//                 //                     pagination={false}
//                 //                 />
//                 //             );
//                 //         };
                        
//                 //         return (
//                 //             <>
//                 //                 {record.task.map(task => (
//                 //                     <div key={task.date}>
//                 //                         <div>Date: {task.date}</div>
//                 //                         {handleInnerRowExpand(task.date)}
//                 //                     </div>
//                 //                 ))}
//                 //             </>
//                 //         );
//                 //     },
//                 //     expandRowByClick: true,
//                 //     expandIcon: () => null,
//                 // }}

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
//             <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
//                 <Button style={{width:'10%', backgroundColor:'green', color:'white'}} onClick={handleApprove}>Approve</Button>
//                 <Button style={{ width: '10%', backgroundColor: 'red', color: 'white' }} onClick={handleReject}>
//                   Reject
//                 </Button>
//                 <Modal
//                   title="Comments"
//                   className='modalTitle'
//                   visible={commentVisible}
//                   onCancel={handleCancel}
//                   footer={[
//                     // <Button key="cancel" onClick={handleCancel}>
//                     //   Cancel
//                     // </Button>,
//                     <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
//                       Submit
//                     </Button>,
//                   ]}
//                 >
//                   <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
//                 </Modal>
//               </div> 
//         </DashboardLayout>

//     )
// }

// export default MonthTasks

import React,{useState, useEffect, SetStateAction} from 'react'
import moment from 'moment'
import isEqual from 'lodash/isEqual';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import { useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {Button, Modal, Progress, Input, Space, Avatar, Select, ConfigProvider } from 'antd';
import DashboardLayout from './Layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine , Label} from 'recharts';
import { ColumnsType } from 'antd/es/table'
import { Table } from 'antd'
import { TaskObject } from './ApprovalRequest'
import { Task } from './AddTask'
import ApprovalRequest from './ApprovalRequest';
import '../Styles/ApprovalRequest.css';
import type { ThemeConfig } from "antd";
import { Pie } from 'react-chartjs-2';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

import { theme } from "antd";
import { DateTask } from './AddTask';

const config: ThemeConfig = {
    token: {
      colorPrimary: "#0b4266",
      colorPrimaryBg: "white",
      colorFillAlter: "rgba(231, 236, 240, 0.3)",
      colorPrimaryBgHover: "white",
      borderRadiusLG: 4,
      colorFill: "#0b4266",
      colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
    },
  };
export interface RecentRejected {
    date: string;
    comment: string;
}

interface ApprovalRequestsProps{
    setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>;
}
const MonthTasks: React.FC<ApprovalRequestsProps> = ({setSelectedKeys}) => {
    const {Option}= Select
    const location = useLocation();
    const { formattedMonth, userId, tasksForClickedMonth, tasksObject } = location.state;
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    // const {formattedMonth='', userId=''}=useParams();
    const [monthTasks, setMonthTasks] = useState<{ [key: string]: TaskObject }>({});
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    //const [selectedKeys, setSelectedKeys]=useState<string[]>([]);
    const [rowTask, setRowTask]= useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [monthTasksData, setMonthTasksData] = useState<DateTask[]>([]);
    const [rejectKeys, setRejectKeys]= useState<RecentRejected[]>([]);
    const [rejectDates, setRejectDates]= useState<RecentRejected[]>([]);
    const [hoveredRow, setHoveredRow] = useState<DateTask | null>(null); // Initialize hoveredRow with DateTask or null
    const [chartData, setChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] }); // Initialize chartData with appropriate types
    console.log("received data", formattedMonth,userId, tasksForClickedMonth)
    const [chartOptions, setChartOptions] = useState({});
    const [chartSeries, setChartSeries] = useState<number[]>([]);
    // Function to prepare data for the pie chart
    const preparePieChartData = () => {
        // Initialize an object to store total hours per task
        const taskHoursPerDay: { [key: string]: number } = {};
    
        // Iterate over each day's tasks data
        monthTasksData.forEach(dateTask => {
            const tasks = dateTask.task;
    
            // Iterate over each task for the current day
            tasks.forEach(task => {
                const taskName = task.task;
                const totalHours = parseFloat(task.totalHours || '0');
    
                // Accumulate total hours for each task
                taskHoursPerDay[taskName] = (taskHoursPerDay[taskName] || 0) + totalHours;
            });
        });
    
        // Extract task names and total hours as series data for the pie chart
        const seriesData = Object.values(taskHoursPerDay);
        const labels = Object.keys(taskHoursPerDay);
    
        // Set up options for the pie chart
        const options = {
            chart: {
                type: 'pie',
            },
            labels: labels,
        };
    
        setChartOptions(options);
        setChartSeries(seriesData);
    };

      // Function to extract date from tasks
      function extractDateFromTasks(tasks: Task[]): string | null {
        // Assuming all tasks have the same date
        return tasks.length > 0 ? tasks[0].date : null;
    }
    
    let chartDatas: { date: string, percentage: number | null }[] = [];
    let desiredMonth: string | null = null;
    
    if (monthTasksData.length > 0 && monthTasksData[0].task.length > 0) {
        desiredMonth = monthTasksData[0].task[0].date;
    }
    
    if (desiredMonth) {
        const startDate = dayjs(desiredMonth).startOf('month').toDate();
        const endDate = dayjs(desiredMonth).endOf('month').toDate();
    
        const totalHoursPerDay = monthTasksData.map(dateTask => {
            const totalHours = dateTask.task.reduce((total, task) => total + parseFloat(task.totalHours), 0);
            return { date: extractDateFromTasks(dateTask.task), totalHours };
        });
    
        const extraHoursPerDay = monthTasksData.map(dateTask => {
            const totalHours = dateTask.task.reduce((total, task) => total + parseFloat(task.totalHours), 0);
            const extraHours = totalHours - 8; // Assuming 8 hours is a regular workday
            return { date: extractDateFromTasks(dateTask.task), extraHours };
        });
    
        const percentageExtraHoursPerDay = extraHoursPerDay.map(({ date, extraHours }) => {
            const totalHours = totalHoursPerDay.find(day => day.date === date)?.totalHours || 0;
            const percentage = totalHours >= 9 ? (extraHours / totalHours) * 100 : 0;
            return { date, percentage };
        });
    
        const allDatesInMonth = [];
        let currentDate = dayjs(startDate);
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            allDatesInMonth.push(currentDate.format('YYYY-MM-DD'));
            currentDate = currentDate.add(1, 'day');
        }
    
        chartDatas = allDatesInMonth.map(date => {
            const dataForDate = percentageExtraHoursPerDay.find(data => data.date === date);
            return { date, percentage: dataForDate ? dataForDate.percentage : 0 };
        });
    } else {
        console.log('No tasks found or invalid date range.');
    }
    
    
    

    useEffect(() => {
        // Prepare data for the pie chart when monthTasksData changes
        preparePieChartData();
    }, [monthTasksData]);

    useEffect(() => {
        setMonthTasks(tasksForClickedMonth);
        setRowTask(tasksObject);
    }, [tasksForClickedMonth, tasksObject]);
    
    useEffect(() => {
        const storedKeysString: string | null = localStorage.getItem('selectedKeys');
        if (storedKeysString !== null) {
            const storedKeys: string[] = JSON.parse(storedKeysString);
            setSelectedKeys(storedKeys);
        } else {
           console.log("else-useEffect", storedKeysString);
        }
    }, []);
    
    


    const handleRowSelection = (selectedRowKeys: React.Key[]) => {
        setSelectedRows(selectedRowKeys as string[]);
        setSelectedKeys(selectedRowKeys as string[]);
        console.log("handleRowSelection", selectedRowKeys);
    };

    const handleReject = () => {
        setCommentVisible(true);
        //call the handleSubmit funtion here and get the comments
        let key: any[] = [];
        let date: any[] = [];
        const updatedMonthTasksData = monthTasksData.filter(row => {
            const isRowIncluded = selectedRows.includes(row.key);
            if (isRowIncluded) {
                if (!key.includes(row.key)) {
                    key.push(row.key);
                    const datekey = row.task.length > 0 ? row.task[0].date : '';
                    date.push(datekey);
                }
            }
            return !isRowIncluded;
        });
        setRejectDates(key);
        setRejectKeys(date);
        setMonthTasksData(updatedMonthTasksData);
        setSelectedRows([]);
    };
    
    
      const handleCancel = () => {
        setCommentVisible(false);
      };

      const handleSubmit = () => {
        // Handle submission logic here
        let date: any[]=[];
        let key: any[]=[];
        date = rejectKeys;
        key = rejectDates;
        console.log("rejectedKeys in handleSubmit", date);
        console.log("key in handleSubmit", key);
       // Get stored rejected keys from localStorage or initialize an empty array if none exists
       const storedRejectedKeys: any[] = JSON.parse(localStorage.getItem('rejectedKeys') || '[]');
    
    //    // Filter out keys that are already present in storedRejectedKeys to avoid duplicates
    //    const newKeysToAdd = date.filter(newKey => !storedRejectedKeys.includes(newKey));
   
    //    // Update storedRejectedKeys with the new keys to add
    //    const updatedRejectedKeys: any[] = [...storedRejectedKeys, ...newKeysToAdd];
    //    localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
     // Filter out keys that are already present in storedRejectedKeys to avoid duplicates
     const newKeysToAdd = date.filter(newKey => !storedRejectedKeys.includes(newKey));
   
     // Update storedRejectedKeys with the new keys to add
     const updatedRejectedKeys: { date: string; comment: string }[] = [
        ...newKeysToAdd.map(dateKey => ({ date: dateKey, comment: comments }))
    ];
     localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
    
        // Store recent rejected dates along with comments in the local storage under the key "recentRejected"
        const recentRejected: { date: string; comment: string }[] = JSON.parse(localStorage.getItem('recentRejected') || '[]');
        const updatedRecentRejected: { date: string; comment: string }[] = [
            ...date.map(dateKey => ({ date: dateKey, comment: comments }))
        ];
        localStorage.setItem('recentRejected', JSON.stringify(updatedRecentRejected));
    
    
        const updatedMonthTasksDataObj = Object.keys(monthTasks).reduce((acc: { [key: string]: TaskObject }, dateKey: string) => {
            const dateData = monthTasks[dateKey];
            const filteredData = Object.fromEntries(Object.entries(dateData).filter(([date, data]) => !key.includes(data.key)));
            console.log("filteredData", filteredData);
            if (Object.keys(filteredData).length > 0) {
                acc[dateKey] = filteredData;
            }
            return acc;
        }, {});
    
        setMonthTasks(updatedMonthTasksDataObj);
        console.log("handleRejected-updatedMonthTasksDataObj", updatedMonthTasksDataObj);
    
        console.log('Comments:', comments);
        setCommentVisible(false);
      };
    

    const handleInputChange = (e:any) => {
        setComments(e.target.value);
      };

    //   const handleApprove = () => {
    //     // Filter out the selected row from the groupedTasks state
    //     const updatedGroupedTasks = { ...groupedTasks };
    //     console.log("handleApprove", updatedGroupedTasks);
    //     // Iterate through selected rows
    //     selectedInnerRows.forEach(rowKey => {
    //         // Check if the rowKey exists in updatedGroupedTasks and if its tasks property is defined
    //         if (updatedGroupedTasks[rowKey]?.tasks) {
    //             const tasks = updatedGroupedTasks[rowKey].tasks;
    //             // Iterate through tasks for each date
    //             Object.values(tasks).forEach(dateTasks => {
    //                 // Iterate through individual tasks
    //                 dateTasks.tasks.forEach(task => {
    //                     // Add a special CSS class or inline style to change the background color to green
    //                     (task as Task & { backgroundColor?: string }).backgroundColor = 'green'; // Adjust this to your styling needs
    //                 });
    //             });
    //         }
    //     });
    //     console.log("updatedGroupedTaks", updatedGroupedTasks);
    //     // Update the selectedInnerRows array to remove the approved row
    //     setSelectedInnerRows([]);
    
    //     // Close the modal
    //     setModalVisible(false);
    
    //     // Update the state with the modified groupedTasks
    //     setGroupedTasks(updatedGroupedTasks);
    // };

    const handleApprove = async () => {
        let key: any[] = [];
        let date: any[] = [];
        const updatedMonthTasksData = monthTasksData.filter(row => {
            const isRowIncluded = selectedRows.includes(row.key);
            if (isRowIncluded) {
                if (!key.includes(row.key)) {
                    key.push(row.key);
                    const datekey = row.task.length > 0 ? row.task[0].date : '';
                    date.push(datekey);
                }
            }
            return !isRowIncluded;
        });
    
        setSelectedKeys(date);
    
        // Get stored keys from localStorage or initialize an empty array if none exists
        const storedSelectedKeys: any[] = JSON.parse(localStorage.getItem('selectedKeys') || '[]');
        const storedRejectedKeys: any[] = JSON.parse(localStorage.getItem('rejectedKeys') || '[]');
    
        // Filter out keys that are already present in storedSelectedKeys to avoid duplicates
        const newKeysToAdd = date.filter(newKey => !storedSelectedKeys.includes(newKey));
    
        // Update storedSelectedKeys with the new keys to add
        const updatedSelectedKeys: any[] = [...storedSelectedKeys, ...newKeysToAdd];
        localStorage.setItem('selectedKeys', JSON.stringify(updatedSelectedKeys));
    
        // Remove keys from rejectedKeys
        const updatedRejectedKeys: any[] = storedRejectedKeys.filter(rejectedKey => !key.includes(rejectedKey));
        localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
    
        // Update recent approved tasks in local storage
        const storedRecentApproved: any[] = JSON.parse(localStorage.getItem('recentApproved') || '[]');
        const updatedRecentApproved: any[] = [...date];
        localStorage.setItem('recentApproved', JSON.stringify(updatedRecentApproved));
    
        // Wait for the localStorage to be updated before continuing
        await new Promise(resolve => setTimeout(resolve, 0));
    
        console.log("key", key);
        console.log("handleApprove-updatedMonthTasksData", updatedMonthTasksData);
    
        setMonthTasksData(updatedMonthTasksData);
    
        const updatedMonthTasksDataObj = Object.keys(monthTasks).reduce((acc: { [key: string]: TaskObject }, dateKey: string) => {
            const dateData = monthTasks[dateKey];
            const filteredData = Object.fromEntries(Object.entries(dateData).filter(([date, data]) => !key.includes(data.key)));
            console.log("filteredData", filteredData);
            if (Object.keys(filteredData).length > 0) {
                acc[dateKey] = filteredData;
            }
            return acc;
        }, {});
    
        setMonthTasks(updatedMonthTasksDataObj);
        console.log("handleApprove-updatedMonthTasksDataObj", updatedMonthTasksDataObj);
    
        setSelectedRows([]);
    };

    // const monthTaskData: TaskObject[] = Object.keys(monthTasks).map((dateKey: string) => {
    //     const dateData = monthTasks[dateKey];
        // const dateTasks: { [date: string]: { key: string; tasks: Task[] } } = {};
        // for (const dateKey in dateData) {
        //     dateTasks[dateKey] = {
        //         key: dateData[dateKey].key,
        //         tasks: dateData[dateKey].tasks
        //     };
        // }
    //     console.log("monthTaskData", dateTasks);
    //     return dateTasks;
    // });

    // const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
    //     console.log("monthTaskData-monthtasks", monthTasks)
    //     console.log("dateData", dateData);
    //     if (!dateData) return {}; // Check if dateData is undefined or null
    //     // const taskObject: TaskObject = {};
    //     // Object.entries(dateData).forEach(([date, data]) => {
    //     //     taskObject[date] = {
    //     //         key: data?.key,
    //     //         tasks: data?.tasks
    //     //     };
    //     // });
    //     // console.log("taskObject",taskObject);
    //     // return taskObject;
    //     return dateData ;
    // });

    const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
        console.log("monthTaskData-monthtasks", monthTasks)
        console.log("dateData", dateData);
        if (!dateData) return {}; // Check if dateData is undefined or null
        // const taskObject: TaskObject = {};
        // Object.entries(dateData).forEach(([date, data]) => {
        //     taskObject[date] = {
        //         key: data?.key,
        //         tasks: data?.tasks
        //     };
        // });
        // console.log("taskObject",taskObject);
        // return taskObject;
        return dateData ;
    });

    // const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
    //     console.log("monthTasksData",taskObject);
    //     const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
    //     console.log("date", date)
    //     const { key, tasks } = taskObject[date];
    //     return { key, task: tasks }; // Assuming 'tasks' property is mapped to 'task' in DateTask
    // });
    
    useEffect(() => {
        // Process the monthTaskDatas and store it in the state
        const processedMonthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
            const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
            const { key, tasks } = taskObject[date];
            return { key, task: tasks }; // Store the data according to the DateTask interface
        });
    
        // Check if the processed data is different from the current state
        if (!isEqual(processedMonthTasksData, monthTasksData)) {
            // Update the state with the processed data
            setMonthTasksData(processedMonthTasksData);
        }
    }, [monthTaskDatas, monthTasksData]); // Add monthTasksData to the dependency array
    

    // const monthTaskDataskey: TaskObject[] = Object.values(rowTask).map(dateData => {
    //     console.log("monthTaskData-monthtasks", monthTasks)
    //     console.log("dateData", dateData);
    //     if (!dateData) return {}; // Check if dateData is undefined or null
    //     // const taskObject: TaskObject = {};
    //     // Object.entries(dateData).forEach(([date, data]) => {
    //     //     taskObject[date] = {
    //     //         key: data?.key,
    //     //         tasks: data?.tasks
    //     //     };
    //     // });
    //     // console.log("taskObject",taskObject);
    //     // return taskObject;
    //     return dateData;
    // });

    // const monthTaskDatas: TaskObject[] = Object.entries(tasksForClickedMonth).map(([key, dateData]) => {
    //     console.log("monthTaskData-tasksForClickedMonth", tasksForClickedMonth)
    //     console.log("dateData", dateData);
    //     if (!dateData) return {}; // Check if dateData is undefined or null
    //     const taskObject: TaskObject = {};
    //     taskObject[key] = dateData;
    //     console.log("taskObject", taskObject);
    //     return taskObject;
    // });
    // const flattenedData = (groupedTasks: TaskObject[] | undefined) => {
    //     console.log("groupedTasks",groupedTasks);
    //     if (!groupedTasks) {
    //         return [];
    //     }
    //     const tasks: TaskObject[] = [];
    //     groupedTasks?.forEach(taskObject => {
    //         Object.keys(taskObject)?.forEach(key => {
    //             const value = taskObject[key];
    //             tasks.push({
    //                 [key]: {
    //                     key: value.key,
    //                     tasks: value.tasks
    //                 }
    //             });
    //         });
    //     });
    //     return tasks;
    // };

    const handleRowHover = (record: DateTask) => {
        setHoveredRow(record); // Ensure hoveredRow is initialized correctly
        
        // Initialize an object to store total hours for each task name
        const taskTotalHours: { [key: string]: number } = {};
        
        // Calculate total hours for each task name
        record.task.forEach(task => {
            const totalHoursForTask = parseFloat(task.totalHours || '0');
            // Accumulate total hours for each task name
            taskTotalHours[task.task] = (taskTotalHours[task.task] || 0) + totalHoursForTask;
        });
        
        // Calculate total hours for all tasks
        let totalHours = Object.values(taskTotalHours).reduce((acc, curr) => acc + curr, 0);
        
        // If total hours are less than 9, consider them as 9
        totalHours = Math.max(totalHours, 9);
        console.log("totalHours", totalHours);
        
        // Calculate percentages for each task based on total hours
        const percentages = Object.entries(taskTotalHours).map(([taskName, taskTotalHours]) => ({
            taskName,
            percentage: ((taskTotalHours / totalHours) * 100).toFixed(2),
        }));
        console.log("percentage", percentages);
        // Update chart data state
        setChartData({
            labels: percentages.map(entry => entry.taskName),
            series: percentages.map(entry => parseFloat(entry.percentage)),
        });
    };
    
    
    const handleRowLeave = () => {
        setHoveredRow(null); // Clear the hovered row
    };

    const getColumn = (formattedMonth: string) => {
        const column: ColumnsType<DateTask> = [
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Get the specific month key

                    const date = record.task.length > 0 ? record.task[0].date : '';
                    return date;
                    // const date = record.task.map(date=>date.date);
                    // return date;
                    // const monthKey = Object.keys(record).find(
                    //     key =>
                    //         moment(key).format('YYYY-MM') ===
                    //         moment(formattedMonth, 'YYYY-MM').format('YYYY-MM')
                    // );
                    // if (!monthKey) return null; // If monthKey is not found, return null
    
                    // // Get the formatted date for the month key
                    // const formattedDate = moment(monthKey).format('YYYY-MM-DD');
                    // return formattedDate;
                },
            },
            {
                title: 'Project',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let projectTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Project') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            projectTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {projectTotalHours}H
                        </div>
                    );
                },
            },
            {
                title: 'Meeting',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let meetingTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Meeting') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            meetingTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {meetingTotalHours}H
                        </div>
                    );
                },
            },            
            {
                title: 'Training',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let trainingTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Training') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            trainingTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {trainingTotalHours}H
                        </div>
                    );
                },
            },
            {
                title: 'Learning',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let learningTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Learning') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            learningTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {learningTotalHours}H
                        </div>
                    );
                },
            },            
            {
                title: 'Shift Hours',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize variables to store task hours and total hours
                    let totalHours = 0;
                    const taskHours: { [key: string]: number } = {};
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        const totalHoursForTask = parseFloat(task.totalHours || '0');
                        totalHours += totalHoursForTask; // Accumulate total hours
                        taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
                    });

                    // Calculate extra hours if total hours exceed 9
                    const extraHours = totalHours > 9 ? totalHours - 9 : 0;

                    // Filter and render only the total hours for the 'Project' tasks
                    return (
                        <div>
                            {totalHours}H
                        </div>
                    );
                },
            },
            {
                title: 'Extra Hours',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize variables to store task hours and total hours
                    let totalHours = 0;
                    const taskHours: { [key: string]: number } = {};
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        const totalHoursForTask = parseFloat(task.totalHours || '0');
                        totalHours += totalHoursForTask; // Accumulate total hours
                        taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
                    });

                    // Calculate extra hours if total hours exceed 9
                    const extraHours = totalHours > 9 ? totalHours - 9 : 0;

                    // Filter and render only the total hours for the 'Project' tasks
                    return (
                        <div>
                            {extraHours}H
                        </div>
                    );
                },
            },
            Table.EXPAND_COLUMN
        ];
    
        return column;
    };
    

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
          title: 'Task',
          sorter: (a: Task, b: Task) => {
            return a.task.localeCompare(b.task);
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
    return (
        <DashboardLayout>
            <div style={{display:'flex', alignItems:'flex-start', margin:'10px 20px'}}>
                <div>
                    <Space className="flex gap-5">
                        <Avatar icon={<UserOutlined />} size={65} />
                        <div>
                        <div>
                            <strong style={{fontSize:'20px'}}>Sasi Kumar</strong>
                        </div>
                        {/* Displaying the userId */}
                        <div style={{textAlign:'left', fontSize:'16px'}}>{userId}</div>
                        </div>
                    </Space>
                </div>
                {/* <div>
                    <div style={{ width: '300px', margin: '20px auto' }}>
                        <Chart
                            options={{ labels: chartData.labels }}
                            series={chartData.series}
                            type="pie"
                            width="100%"
                        />
                    </div>
                </div>
                <div>
                    <Chart options={chartOptions} series={chartSeries} type="pie" width="380" />
                </div>
                <div>
                    <LineChart width={800} height={400} data={chartDatas} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Percentage of Extra Hours Worked', angle: -90, position: 'insideMiddle' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
                    </LineChart>
                </div> */}

            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 20px', alignItems: 'center' }}>
                <div style={{ 
                    transition: 'box-shadow .3s',
                    boxShadow: '0 0 4px rgba(33,33,33,.2)',  
                    borderRadius: '5px', 
                    padding: '46px', 
                    width: '48%', 
                    height: '100%', 
                    boxSizing: 'border-box',
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                }}>
                    <Chart options={chartOptions} series={chartSeries} type="pie" width="380" />
                </div>
                <div style={{ transition: 'box-shadow .3s',
                    boxShadow: '0 0 4px rgba(33,33,33,.2)',  borderRadius: '5px', padding: '20px', width: '48%', boxSizing: 'border-box' }}>
                    <LineChart width={700} height={300} data={chartDatas} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Percentage of Extra Hours Worked', angle: -90, position: 'insideMiddle', style: { paddingRight: '5px' } }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
                    </LineChart>
                </div>
            </div>

            <div style={{fontWeight:'bold', color:'#0B4266',fontSize:'20px',textAlign:'center', margin:'10px 20px'}}>{formattedMonth}</div>
            <ConfigProvider theme={config}>
                <Table
                    rowSelection={{
                        type: 'checkbox',
                        selectedRowKeys: selectedRows,
                        onChange: handleRowSelection
                    }}
                    onRow={(record) => ({
                        onMouseEnter: () => handleRowHover(record), // Handle mouse enter event
                        onMouseLeave: () => handleRowLeave(), // Handle mouse leave event
                    })}
                    columns={getColumn(formattedMonth)} 
                    //rowClassName="rowstyle"
                    className='table-striped-rows approvalrequests-table'
                    dataSource={monthTasksData}
                    pagination={false}
                    // expandable={{
                    //     expandedRowRender: (record: DateTask) => {
                    //         const handleInnerRowExpand = (dateKey: string) => {
                    //             const tasksForDate = record.task.find(task => task.date === dateKey);
                    //             return (
                    //                 <Table
                    //                     columns={innerColumn as ColumnsType<Task>}
                    //                     dataSource={tasksForDate ? [tasksForDate] : []} // Pass an array with the task if found, otherwise an empty array
                    //                     pagination={false}
                    //                 />
                    //             );
                    //         };
                            
                    //         return (
                    //             <>
                    //                 {record.task.map(task => (
                    //                     <div key={task.date}>
                    //                         <div>Date: {task.date}</div>
                    //                         {handleInnerRowExpand(task.date)}
                    //                     </div>
                    //                 ))}
                    //             </>
                    //         );
                    //     },
                    //     expandRowByClick: true,
                    //     expandIcon: () => null,
                    // }}

                    expandable={{
                        expandedRowRender: (record: DateTask) => {
                            const handleInnerRowExpand = () => {
                                return (
                                    
                                    <Table
                                        columns={innerColumn as ColumnsType<Task>}
                                        dataSource={record.task} // Pass all tasks in the date as dataSource
                                        pagination={false}
                                    />
                                );
                            };
                            
                            return (
                                <>
                                    {handleInnerRowExpand()}
                                </>
                            );
                        },
                        expandRowByClick: true,
                        expandIcon: ({ expanded, onExpand, record }) =>
                            expanded ? (
                                <UpOutlined onClick={e => onExpand(record, e)} style={{float:'right'}} />
                            ) : (
                                <DownOutlined onClick={e => onExpand(record, e)} style={{float: 'right'}}/>
                            ),
                    }} 
                />     
            </ConfigProvider>
            <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
                
                <Button style={{height:'200%' ,width: '100px', backgroundColor: 'red', color: 'white', marginRight:'10px' }} onClick={handleReject}>
                  Reject
                </Button>
                <Button style={{height:'200%', width:'100px', backgroundColor:'green', color:'white'}} onClick={handleApprove}>Approve</Button>
                <Modal
                  title="Comments"
                  className='modalTitle'
                  visible={commentVisible}
                  onCancel={handleCancel}
                  footer={[
                    // <Button key="cancel" onClick={handleCancel}>
                    //   Cancel
                    // </Button>,
                    <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
                      Submit
                    </Button>,
                  ]}
                >
                  <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
                </Modal>
              </div> 
        </DashboardLayout>

    )
}

export default MonthTasks