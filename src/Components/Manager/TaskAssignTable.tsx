import React, { useEffect, useState } from 'react'
import { ColumnsType } from 'antd/es/table';
import { Space, Avatar, Button,notification, Modal, Select, Input, Typography, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import '../Styles/AddTask.css';
import '../Styles/TaskAssignTable.css';
import '../Styles/ApprovalRequest.css';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
    CheckOutlined,
    CloseOutlined
  } from "@ant-design/icons";
import '../Styles/CreateUser.css';
import { Table } from 'antd/lib';
import * as yup from "yup";
import api from '../../Api/Api-Service';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
import { ThemeConfig, ConfigProvider } from 'antd';
import { Formik, FormikHelpers, ErrorMessage } from 'formik';
const {Option}= Select;

interface EmployeeDetails{
    employeeName?:string;
    employeeId?:string;
}
interface TaskTable{
    taskId?:string;
    projectName?:string;
    taskName?:string;
    startDate?:string;
    estimatedEndDate?:string;
    endDate?:string;
    employees?:EmployeeDetails;
    taskDescription?:string;
    taskStatus?:string;
    isExistingData?:boolean;
}

interface EmployeeGrades {
  [employeeId: string]: string; // Key-value pairs where the key is a string (employeeId) and the value is also a string (grade)
}
interface approveTask{
  taskId:string;
  approvalStatus:string;
  employeeGrades:EmployeeGrades;
}

type TaskData = {
  [key: string]: {
      date: string;
      managerAssignedTaskId: number;
      managerTaskName: string;
      totalHours: number;
      description: string;
      timeSheetId: number;
      employeeId: string;
      employeeName: string;
      taskStatus: string;
  }[];
};


const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

const TaskAssignTable = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const decoded = jwtDecode(token || "") as DecodedToken;
    const role = decoded.Role
    const [selectedData, setSelectedData] = useState<EmployeeGrades>({});
    console.log("selectedData", selectedData);
    const [employee, setEmployee]= useState<EmployeeDetails[]>([])
    const [taskTable,setTaskTable]= useState<any[]>([]); //TaskTable
    const [specificTaskTable, setSpecificTaskTable]= useState<any>(); //TaskTable
    const [employeeEndDate, setEmployeeEndDate]= useState(null);
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [taskName, setTaskName]= useState<string>('');
    const [taskId, setTaskId]= useState<any>();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [approvalVisible, setApprovalVisible]=useState(false);
    const [statuses, setStatuses]= useState<boolean>(false);
    const [error, setError] = useState('');
    const [hoveredRecord, setHoveredRecord] = useState(null);
    const grade: any[]=["Excellent", "Good", "Needs Improvement", "Poor"];
    console.log("taskTable,employee", taskTable);

        // const handleEmployees = async (employeeId: string[]) => {
        //     try {
        //         // Fetch all employee details
        //         console.log("employeeId", employeeId);
        //         let filteredEmployees:any[]=[];
        //         employeeId.map(async(empId: any)=>{
        //           const response = await api.get(`/api/v1/employee/fetch-employee-by-id/${empId}`);
        //           response.data.response.data.map((emp:any)=>{
        //             filteredEmployees.push({
        //               employeeName: `${emp.firstName} ${emp.lastName}`,
        //               employeeId: emp.userId
        //             })
        //           })
        //         })
        //         return filteredEmployees;
        //         // Update the state with the filtered employee data
        //         //setEmployee(filteredEmployees);
        //     } catch (error) {
        //         console.error("Error fetching employees:", error);
        //     }
        // };
        
        
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
                    
                    // Map over tasks and call handleEmployees for each task
                    const updatedTaskTablePromises = response?.data?.response?.data?.map(async (task: any) => {
                        // const filteredEmployees = await handleEmployees(task.employees);
                        let employeeNames:any[]=[];
                        task.employees.map((emp:any)=>{
                          employeeNames.push({
                            employeeName: emp.employeeName,
                            employeeId: emp.employeeId,
                          })
                        })
                        setEmployee(employeeNames);
                        return {
                            taskId: task.taskId,
                            projectName: task.projectName,
                            taskName: task.taskName,
                            startDate: task.startDate,
                            estimatedEndDate: task.estimatedEndDate,
                            endDate: task.endDate,
                            taskStatus: task.taskStatus,
                            taskDescription: task.taskDescription,
                            employees: task.employees,
                            isExistingData: task.isExistData
                        };
                    });
        
                    // Wait for all handleEmployees calls to complete
                    const updatedTaskTable = await Promise?.all(updatedTaskTablePromises);
        
                    // Update the task table state with the new data
                    setTaskTable(updatedTaskTable);
                } catch (error) {
                    throw error;
                }
            };

        
            fetchData();
        }, [statuses]);

        const handleEmployeeEndDate = async (value: any) => {
          console.log("handleEmployeeEndDate-value", value);
          try {
            const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
            console.log("handleEmployeeEndDate-response",response);
            response.data.response.data.map((emp:any)=>{
              emp.employees.map((empId:any)=>{
                if(empId.employeeId === value){
                  setEmployeeEndDate(empId.completedDate)
                }
              })
            })
          } catch (error) {
            console.error('Error occurred while fetching data:', error);
            // Handle error if needed
          }
        };
        

        // useEffect hook to handle data display after state update
        useEffect(() => {
          if (specificTaskTable) {
            console.log('Task data available:', specificTaskTable);
          }
        }, [specificTaskTable]);

        const fetchData = async (taskId:any) => {
            try {
                const response = await api.get('/api/v1/task/fetch-timesheet-by-task', {
                    params: { taskId }
                });
                
                setTaskData(response.data.response.data);
            } catch (error:any) {
              notification.error({
                message:error?.response?.data?.response?.action,
                description: error?.response?.data?.message
              })
            }
        };

        const handleRowSelection = (selectedRowKeys:any, selectedRows:any) => {
          // Extracting uniqueRequestId array from selectedRows
          console.log("handleRowSelection", selectedRows, selectedRowKeys);
          // Update selectedRows state with the array of uniqueRequestId
          setSelectedRows(selectedRowKeys);
        };

        useEffect(() => {
          if (taskData !== null ) {
            console.log("handleRowClick-if taskData", taskData);
            setModalVisible(true);
          }
        },[taskData])

        const handleAddMore = (values: any, { setSubmitting, resetForm }: FormikHelpers<any>) => {
          console.log("handleAddMore-values", values);
          const { members, approvalGrade } = values;
          setSelectedData({ ...selectedData, [members]: approvalGrade });
          setEmployeeEndDate(null);
          resetForm();
        };
        

        const hoursDecimalToHoursMinutes = (decimalHours:any) => {
          // Split the decimal value into hours and minutes
          const hours = Math.floor(decimalHours);
          const minutes = Math.round((decimalHours - hours) * 100);
          console.log("hours minutes",hours, minutes)
          // Return the formatted string
          if(hours===0 && minutes===0){
              return '➖';
          }
          return `${hours}h ${minutes}min`;
      };

        const handleRowClick = (record: any) => {
          console.log("record-onRow", record);
          setTaskName(record.taskName);
          fetchData(record.taskId);
          //console.log("fetchData", fetchData(record.taskId));
          console.log("handleRowClick-taskData", taskData);
          
          // setModalVisible(true);
        };
        

      const handleEmployeeChange = (value: string) => {
        setSelectedEmployee(value);
    };

    const handleClearFilter=()=>{
        setSelectedEmployee(null);
    }
        
    


    const handleEditTask=(record:any)=>{
        console.log("handleEditTask-record", record);
        navigate('/manager/taskassign', {state:{record}})
    }
    const handleDeleteTask=(record: any)=>{

    }

    const handleApproveTask =async(task:any, taskId: any)=>{
      console.log("handleRejectTask-1", taskId);
      setTaskId(taskId);
      setApprovalVisible(true);
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for state update
      setSpecificTaskTable(task)
    }
    const handleRejectTask = async(task:any, taskId: any) => {
      console.log("handleRejectTask", taskId);
      console.log("handleRejectTask-task", task);
      
      setTaskId(taskId);
      setCommentVisible(true);
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for state update
      setSpecificTaskTable(task);
    };
  
    const handleCancel = () => {
      setCommentVisible(false);
      setComments(''); // Clear comments when modal is canceled
    };
  
    const handleInputChange = (e:any) => {
      setComments(e.target.value);
      setError('');
    };
  
    const handleSubmit = async () => {
      if (!comments.trim()) {
        setError('Comments field is required.');
        return;
      }
      try {
        const payload = {
          taskId: taskId,
          approvalStatus: "Rejected",
          rejectionComments: comments,
        };
    
        // Send the payload to the API
        const response = await api.put('/api/v1/task/review-task-completion', payload);
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
        })
      } catch (error:any) {
        notification.error({
          message:error?.response?.data?.action,
          description: error?.response?.data?.message
        })
      } finally{
        setStatuses(prev => !prev);
        setCommentVisible(false);
        setComments('');
        setSelectedRows([]);
      }
    };
    

    const handleApproveSubmit=async(taskId: any, selectedData:any)=>{
      try {
        const payload = {
          taskId: taskId,
          approvalStatus: "Approved",
          employeeGrades: selectedData,
        };
        console.log("handleApproveSubmit-payload", payload);
  
        // Send the payload to the API
        const response = await api.put('/api/v1/task/review-task-completion', payload);
        console.log("handleApproveSubmit-response",response?.data); // Optionally handle the response data
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
        })
        setSelectedData({});
      } catch (error:any) {
        console.error('Error occurred:', error);
        notification.error({
          message:error?.response?.data?.response?.action,
          description: error?.response?.data?.message
        })
      } finally{
         setStatuses(prev=>!prev);
         setApprovalVisible(false);
      }
    } 
    
    const handleComplete = async (taskId: any) => {
      try {
        console.log("handleComplete-payload", taskId);
        const response = await api.put('/api/v1/task/task-completion-update', null, {
          params: {
            taskId: taskId,
            isCompleted: true,
          }
        });
        notification.success({
          message:response?.data?.response?.action,
          description:response?.data?.message,
        })
        setStatuses(prev=>!prev);
        console.log("handleComplete-response", response);
      } catch (error:any) {
        notification.error({
          message:error?.response?.data?.response?.action,
          description: error?.response?.data?.message
        })
      }
    }
    
    
    const handleClick=()=>{
      navigate('/manager/taskassign');
    }

    const handleModalVisible=()=>{
    setModalVisible(false);
    setTaskData(null);
    }

    const columns: ColumnsType<any> = [
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>S.No</div>,
        dataIndex: 'slNo',
        key: 'slNo',
        width: 'max-content',  
        fixed: 'left',
        render: (text, record, index) => index + 1,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Task Name</div>,
        dataIndex: 'taskName',
        width: 'max-content',  
        key: 'taskName',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project</div>,
        dataIndex: 'projectName',
        width: 'max-content',  
        key: 'projectName',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Start Date</div>,
        width: 'max-content',  
        dataIndex: 'startDate',
        key: 'startDate',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Estimated End Date</div>,
        width: 'max-content',  
        dataIndex: 'estimatedEndDate',
        key: 'estimatedEndDate',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>End Date</div>,
        width: 'max-content',  
        dataIndex: 'endDate',
        key: 'endDate',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text?text:'➖'}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Employees</div>,
        width: 'max-content',  
        dataIndex: 'employees',
        key: 'employees',
        fixed: 'left',
        render: (employees: EmployeeDetails[]) => (
          <>
            {employees.map((employee, index) => (
              <div key={index} style={{ display: 'flex' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <strong>{employee.employeeName}</strong>
                </div>
              </div>
            ))}
          </>
        ),
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Description</div>,
        width: 'max-content',  
        dataIndex: 'taskDescription',
        key: 'taskDescription',
        fixed: 'left',
        // render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</div>,
        width: 'max-content',  
        dataIndex: 'taskStatus',
        key: 'taskStatus',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      ...(role === 'ROLE_MANAGER'
        ? [
            {
              title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Actions</div>,
              width: 'max-content',  
              dataIndex: 'managerActions',
              key: 'managerActions',
              render: (_: any, record: any) => (
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={(e) => e.stopPropagation()}>
                  <EditOutlined
                    onClick={() => handleEditTask(record)}
                    style={{
                      marginRight: '8px',
                      cursor: (record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? 'not-allowed' :'pointer',
                      color: (record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? '#ccc' : 'blue',
                      fontSize: '20px',
                    }}
                  />
                  <DeleteOutlined
                    onClick={() => handleDeleteTask(record?.timeSheetId)}
                    style={{
                      cursor: ( record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? 'not-allowed' :'pointer',
                      color: (record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? '#ccc' : 'red',
                      fontSize: '20px',
                    }}
                  />
                </div>
              ),
            },
          ]
        : role === 'ROLE_EMPLOYEE'
        ? [
            {
              title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Actions</div>,
              width: 'max-content', 
              dataIndex: 'employeeActions',
              key: 'employeeActions',
              render: (_: any, record: any) => (
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={(e) => e.stopPropagation()}>
                  <Button
                    style={{
                      width: '80%',
                      backgroundColor: (record.taskStatus==='Approved' || record.taskStatus==='Completed') ? '#ccc' : '#0B4266',
                      color: 'white',
                      cursor: record.taskStatus==='Approved' || record.taskStatus==='Completed'?'not-allowed':'pointer',
                      height: '100%',
                    }}
                    key="submit"
                    type="primary"
                    disabled={record.taskStatus==='Approved' || record.taskStatus==='Completed'}
                    onClick={() => handleComplete(record.taskId)}
                  >
                    Complete
                  </Button>
                </div>
              ),
            },
          ]
        : []),
        ...(role === 'ROLE_MANAGER'
        ? [
            {
              title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Review</div>,
              width: 'max-content', 
              dataIndex: 'reviewActions',
              key: 'reviewActions',
              render: (_: any, record: any) => {
                console.log("record-review", record);
                return (
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => {
                        if (record.endDate !== null) {
                          handleRejectTask(record, record?.taskId);
                        }
                      }}
                      style={{
                        cursor: record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected' ? 'not-allowed' : 'pointer',
                        backgroundColor: (record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? '#ccc' : '#eb362cdb',
                        color: 'white',
                        fontSize: '16px',
                        marginRight: '3px',
                        width: '100px',
                        height: '41px',
                      }}
                      disabled={record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected'}
                      title={
                          record.endDate === null
                              ? 'The task is not completed yet'
                              : record.taskStatus === 'Approved'
                              ? 'The task is already approved'
                              : record.taskStatus === 'Rejected'
                              ? 'The task is already rejected'
                              : ''
                      }
                    >
                      Reject
                    </Button>
                    <Button
                        onClick={() => {
                            if (record.endDate !== null) {
                                handleApproveTask(record, record?.taskId);
                            }
                        }}
                        style={{
                            cursor: record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected' ? 'not-allowed' : 'pointer',
                            backgroundColor: (record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected') ? '#ccc' : '#8ed27d',
                            color: 'white',
                            fontSize: '16px',
                            width: '100px',
                            height: '41px',
                        }}
                        disabled={record.endDate === null || record.taskStatus === 'Approved' || record.taskStatus === 'Rejected'}
                        title={
                            record.endDate === null
                                ? 'The task is not completed yet'
                                : record.taskStatus === 'Approved'
                                ? 'The task is already approved'
                                : record.taskStatus === 'Rejected'
                                ? 'The task is already rejected'
                                : ''
                        }
                    >
                        Approve
                    </Button>

                  </div>
                );
              },
            },
          ]
        : []),    
    ];

    const approveColumns: ColumnsType<any> = [
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>S.No</div>,
        dataIndex: 'slNo',
        key: 'slNo',
        width: 'max-content',  
        fixed: 'left',
        render: (text, record, index) => index + 1,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Employee</div>,
        dataIndex: 'employeeName',
        width: 'max-content',  
        key: 'employeeName',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Grade</div>,
        dataIndex: 'grade',
        width: 'max-content',  
        key: 'grade',
        fixed: 'left',
        render: (text: string) => <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>,
      },   
    ];

    const modalColumns = [
      { title: 'Task Name', dataIndex: 'taskName' },
      { title: 'Project Name', dataIndex: 'projectName' },
      { title: 'Start Date', dataIndex: 'startDate' },
      { title: 'End Date', dataIndex: 'endDate' },
      { title: 'Estimated End Date', dataIndex: 'estimatedEndDate' },
    ];
    

      const innerColumns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Employee',
            className: 'ant-table-column-title',
            dataIndex: 'employeeId',
            render: (employeeId: any, record: any) => (
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
            title: 'Total Hours',
            dataIndex: 'totalHours',
            key: 'totalHours',
            render: (_:any, record:any) => {
              return (
                <div>
                    {hoursDecimalToHoursMinutes(record?.totalHours)}
                </div>
              );
          }
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        }, 
        
    ];

    const filteredDataSource = selectedEmployee ?
        Object.values(taskData || {})
            .flatMap(tasks => tasks)
            .filter(task => task.employeeId === selectedEmployee)
        : Object.values(taskData || {}).flatMap(tasks => tasks);

  return (
    <ConfigProvider theme={config}>
      <div className='createuser-main'>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <div style={{ color: '#0B4266' }}>
                <h1>Assigned Task Details</h1>
            </div>
          {role==='ROLE_MANAGER'&&(
            <Button id='cancel-new' onClick={handleClick} style={{marginTop:'30px'}}>Assign Task</Button>
          )}
        </div>
          <Table
              // rowSelection={{
              //   type: 'checkbox',
              //   selectedRowKeys: selectedRows,
              //   onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
              // }}
              style={{ fontSize: '12px', fontFamily: 'poppins', fontWeight: 'normal', color: '#0B4266', cursor: 'pointer' }}
              className='addtask-table'
              // onRow={(record: any) => ({
              //   onClick: (event: React.MouseEvent<HTMLElement>) => {
              //     console.log("record-onRow", record);
              //     navigate(`/manager/employeetaskassigndetails?${record.taskName}`, { state: { taskId: record.taskId, taskName: record.taskName } });
              //   },
              // })}
              onRow={(record: any) => ({
                onMouseEnter: () => {
                  setHoveredRecord(record); // Set hovered record
                  console.log("Hovered Record:", record); // Log the record when mouse enters
                },
                onMouseLeave: () => setHoveredRecord(null), // Clear hovered record when leaving row
                onClick: (event: React.MouseEvent<HTMLElement>) => handleRowClick(record),
                style: {
                  cursor: record.isExistingData ? 'pointer' : 'not-allowed',
                  backgroundColor: hoveredRecord === record ? '#f0f0f0' : 'transparent', // Highlight hovered row
                },
              })}
              
              columns={columns}
              dataSource={taskTable}
              pagination={false}
              rowKey="taskId"
            />
            <Modal
                  title={taskName}
                  className='monthTasks'
                  visible={modalVisible}
                  onCancel={handleModalVisible}
                  footer={null}
              >
                <div style={{display:'flex',flexDirection:'column', alignItems:'left' }}> 
                  <div style={{display:'flex', alignItems:'left',width: '1058px'}}>
                    <Select
                        placeholder="Filter by Employee"
                        style={{ width: 200, marginRight: 8, height: 40, marginLeft:'20px' }}
                        onChange={handleEmployeeChange}
                        allowClear
                    >
                        {taskData && Object.keys(taskData).map(employeeId => (
                            <Option key={employeeId} value={employeeId}>{taskData[employeeId][0].employeeName}</Option>
                        ))}
                    </Select>
                    <Button type="default" onClick={handleClearFilter} style={{ width: '100px', height: '40px' }}>Clear Filter</Button>
                  </div>
                  <div>
                    {taskData && (
                      <Table
                          columns={innerColumns} 
                          dataSource={filteredDataSource} 
                      />
                    )}
                  </div>
                </div>
                  
              </Modal>
              <Modal
                title={<div style={{textAlign:'center'}}>Rejection Comment</div>}
                className='modalTitle'
                visible={commentVisible}

                onCancel={handleCancel}
                footer={[
                    <Button style={{ width: '100px', backgroundColor: '#0B4266', color: 'white', cursor: 'pointer', height:'100%' }} key="submit" type="primary" onClick={handleSubmit}>
                    Submit
                    </Button>,
                ]}
                style={{ display: 'block' }}
                
                >
                  <div>

                  {specificTaskTable && ( 
                       <div style={{ display: 'flex', marginBottom:'10px' }}>
                       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                         <div style={{color:'#0B4266'}}><b>Task Name:</b> {specificTaskTable.taskName}</div>
                         <div style={{color:'#0B4266'}}><b>Due Date:</b> {specificTaskTable.estimatedEndDate}</div>
                       </div>
                       <div style={{ borderLeft: '1px solid #0B4266', margin: '0 10px' }}></div>
                       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                         <div style={{ marginLeft: '55px',color:'#0B4266' }}><b>Start Date:</b> {specificTaskTable.startDate}</div>
                         <div style={{ marginLeft: '55px',color:'#0B4266' }}><b>End Date:</b> {specificTaskTable.endDate}</div>
                       </div>
                     </div>    
                        )}
                      <div>
                        <div style={{ textAlign: 'left', color:'#0B4266', fontWeight:'bold' }}>
                          <p>
                            <span style={{ color: 'red' }}>*</span> Comments
                          </p>
                          <Input.TextArea 
                            placeholder='Write here...' 
                            rows={4} 
                            value={comments} 
                            onChange={handleInputChange} 
                          />
                          {error && <div style={{ color: 'red', fontWeight:'normal' }}>{error}</div>}
                        </div>
                      </div>
                  </div>
                        
                
              </Modal>
              <Modal
                title="Approve"
                className='modalTitle'
                visible={approvalVisible}
                onCancel={()=>setApprovalVisible(false)}
                footer={false}
              >
               
                  <div>
                  {specificTaskTable && ( 
                       <div style={{ display: 'flex', marginBottom:'10px' }}>
                       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                         <div style={{color:'#0B4266'}}><b>Task Name:</b> {specificTaskTable.taskName}</div>
                         <div style={{color:'#0B4266'}}><b>Due Date:</b> {specificTaskTable.estimatedEndDate}</div>
                       </div>
                       <div style={{ borderLeft: '1px solid #0B4266', margin: '0 10px' }}></div>
                       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                         <div style={{ marginLeft: '55px',color:'#0B4266' }}><b>Start Date:</b> {specificTaskTable.startDate}</div>
                         <div style={{ marginLeft: '55px',color:'#0B4266' }}><b>End Date:</b> {employeeEndDate===null?'NA':employeeEndDate}</div>
                       </div>
                     </div>    
                        )}
                  </div>
                  <div>
                    <Formik
                      initialValues={{
                        members: '',
                        approvalGrade: '',
                      }}
                      validationSchema={yup.object({
                        members: yup.string().required("Employee is required"),
                        approvalGrade: yup.string().required('Grade is required'),
                      })}              
                      onSubmit={handleAddMore}
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
                        <div style={{display:'flex', flexDirection:'column'}}>
                          <div>
                            <div style={{display:'flex', justifyContent:'space-between '}}>
                              <Form.Item
                                label='Employee'
                                className="label-strong"
                                name="members"
                                required
                                style={{ padding: "10px"}}
                              >
                                <Select
                                    style={{
                                        height: "30px",
                                        width: "250px",
                                        borderRadius: "4px",
                                        margin: "0px",
                                    }}
                                    value={values.members}
                                    onChange={(value, option) => {
                                        setFieldValue("members", value);
                                        console.log("members-v", value);
                                        handleEmployeeEndDate(value);
                                    }}
                                    onBlur={() => {
                                        setFieldTouched("members", true);
                                    }}
                                >
                                    <Select.Option value="" disabled>
                                        Select the Employee
                                    </Select.Option>
                                    {employee.map((option, index) => (
                                            <Select.Option key={index} value={option.employeeId}>
                                                {option.employeeName}
                                            </Select.Option>
                                        ))
                                    }
                                </Select>
                                <div>
                                  <Typography.Text
                                      type="danger"
                                      style={{ wordBreak: "break-word", textAlign: "left" }}
                                  >
                                      <ErrorMessage name="members" />
                                  </Typography.Text>
                                </div>
                              </Form.Item>
                              <Form.Item
                                label="Grade"
                                className="label-strong"
                                name="approvalGrade"
                                required
                                style={{ padding: "10px" }}
                              >
                                <Select
                                    style={{
                                      height: "30px",
                                      width: "250px",
                                      borderRadius: "4px",
                                      margin: "0px",
                                    }}
                                    value={values.approvalGrade}
                                    onChange={(value, option) => {
                                      setFieldValue("approvalGrade", value); 
                                    }}
                                    onBlur={() => {
                                      setFieldTouched("approvalGrade", true);
                                    }}
                                  >
                                    <Select.Option value="" disabled>
                                      Select the Grade
                                    </Select.Option>
                                    {grade.map((option, index) => ( 
                                      <Option key={index} value={option}>
                                        {option}
                                      </Option>
                                    ))}
                                  </Select>
                                  <div>
                                    <Typography.Text
                                      type="danger"
                                      style={{ wordBreak: "break-word", textAlign: "left" }}
                                    >
                                      <ErrorMessage name="approvalGrade" /> 
                                    </Typography.Text>
                                  </div>
                              </Form.Item>
                          </div>
                          <div style={{display:'flex', justifyContent:'flex-end', marginRight:'20px'}}>
                            <Button htmlType="submit" style={{background:'#E7ECF0',color:'#0B4266', width:'100px', height:'100%',alignSelf: 'flex-end', cursor:'pointer' }}>Add More</Button>    
                          </div>
                        
                        </div>

                          <Table
                            columns={approveColumns}
                            dataSource={Object.entries(selectedData).map(([employeeId, grade], index) => ({
                              slNo: index + 1,
                              employeeName: employeeId, 
                              grade: grade
                            }))}
                            pagination={false}
                          />

                          <div style={{display:'flex', justifyContent:'flex-end', marginRight:'20px'}}>
                          <Button
                            type="primary"
                            style={{ width: '20%', height: '100%' }}
                            onClick={()=>handleApproveSubmit(taskId, selectedData)}
                          >
                            Submit
                          </Button>
                          </div>
                        </div>
                      </Form>
                      )}
                    </Formik>
                  </div>
                
            </Modal>
      </div>
    </ConfigProvider>
  )
}

export default TaskAssignTable