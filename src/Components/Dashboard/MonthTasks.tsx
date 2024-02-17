import React,{useState, useEffect} from 'react'
import moment from 'moment'
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import { useParams, useLocation } from 'react-router-dom';
import {Button, Modal, Progress, Input, Space, Avatar } from 'antd';
import DashboardLayout from './Layout'
import { ColumnsType } from 'antd/es/table'
import { Table } from 'antd'
import { TaskObject } from './ApprovalRequest'
import { Task } from './AddTask'
interface DateTask{
    key: string;
    task: Task[];
}
const MonthTasks = () => {
    const location = useLocation();
    const { formattedMonth, userId, tasksForClickedMonth, tasksObject } = location.state;

    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    // const {formattedMonth='', userId=''}=useParams();
    const [monthTasks, setMonthTasks] = useState<{ [key: string]: TaskObject }>({});
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [rowTask, setRowTask]= useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    console.log("received data", formattedMonth,userId, tasksForClickedMonth)
    useEffect(() => {
        setMonthTasks(tasksForClickedMonth);
        setRowTask(tasksObject);
    }, [tasksForClickedMonth, tasksObject]);

    const handleRowSelection = (selectedRowKeys: React.Key[]) => {
        setSelectedRows(selectedRowKeys as string[]);
        console.log("handleRowSelection", selectedRowKeys);
    };

    const handleReject = () => {
        setCommentVisible(true);
      };
    
      const handleCancel = () => {
        setCommentVisible(false);
      };

      const handleSubmit = () => {
        // Handle submission logic here
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

    const monthTaskData: TaskObject[] = Object.keys(monthTasks).map((dateKey: string) => {
        const dateData = monthTasks[dateKey];
        const dateTasks: { [date: string]: { key: string; tasks: Task[] } } = {};
        for (const dateKey in dateData) {
            dateTasks[dateKey] = {
                key: dateData[dateKey].key,
                tasks: dateData[dateKey].tasks
            };
        }
        console.log("monthTaskData", dateTasks);
        return dateTasks;
    });

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

    const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
        console.log("monthTasksData",taskObject);
        const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
        console.log("date", date)
        const { key, tasks } = taskObject[date];
        return { key, task: tasks }; // Assuming 'tasks' property is mapped to 'task' in DateTask
    });
    

    const monthTaskDataskey: TaskObject[] = Object.values(rowTask).map(dateData => {
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
        return dateData;
    });

    // const monthTaskDatas: TaskObject[] = Object.entries(tasksForClickedMonth).map(([key, dateData]) => {
    //     console.log("monthTaskData-tasksForClickedMonth", tasksForClickedMonth)
    //     console.log("dateData", dateData);
    //     if (!dateData) return {}; // Check if dateData is undefined or null
    //     const taskObject: TaskObject = {};
    //     taskObject[key] = dateData;
    //     console.log("taskObject", taskObject);
    //     return taskObject;
    // });
    const flattenedData = (groupedTasks: TaskObject[] | undefined) => {
        console.log("groupedTasks",groupedTasks);
        if (!groupedTasks) {
            return [];
        }
        const tasks: TaskObject[] = [];
        groupedTasks?.forEach(taskObject => {
            Object.keys(taskObject)?.forEach(key => {
                const value = taskObject[key];
                tasks.push({
                    [key]: {
                        key: value.key,
                        tasks: value.tasks
                    }
                });
            });
        });
        return tasks;
    };

    const getColumn = (formattedMonth: string) => {
        const column: ColumnsType<DateTask> = [
            {
                title: 'Select All',
                dataIndex: 'date',
                key: 'date',
                width: '20%',
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
                title: '',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '60%',
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
            <div style={{fontWeight:'bold', color:'#0B4266',fontSize:'20px',textAlign:'center', margin:'10px 20px'}}>{formattedMonth}</div>
            <Table
                rowSelection={{
                    type: 'checkbox',
                    selectedRowKeys: selectedRows,
                    onChange: handleRowSelection
                }}
                style={{
                    backgroundColor: 'white',
                    // border: '1px solid grey',
                    // borderRadius: '5px',
                }}
                columns={getColumn(formattedMonth)} 
                rowClassName="rowstyle"
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