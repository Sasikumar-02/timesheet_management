import React, { useEffect, useState } from 'react'
import { ColumnsType } from 'antd/es/table';
import { Space, Avatar, Button,notification, Modal, Select, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import '../Styles/AddTask.css';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
    CheckOutlined,
    CloseOutlined
  } from "@ant-design/icons";
import { Table } from 'antd/lib';
import api from '../../Api/Api-Service';
import { DecodedToken } from '../Employee/EmployeeTaskStatus';
import { jwtDecode } from 'jwt-decode';
import { ThemeConfig, ConfigProvider } from 'antd';

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
    const [taskTable,setTaskTable]= useState<TaskTable[]>([]);
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [taskName, setTaskName]= useState<string>('');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [approvalVisible, setApprovalVisible]=useState(false);
    const [statuses, setStatuses]= useState<boolean>(false);
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
                        return {
                            taskId: task.taskId,
                            projectName: task.projectName,
                            taskName: task.taskName,
                            startDate: task.startDate,
                            estimatedEndDate: task.estimatedEndDate,
                            endDate: task.endDate,
                            taskStatus: task.taskStatus,
                            taskDescription: task.taskDescription,
                            employees: task.employees
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
        }, []);

        const fetchData = async (taskId:any) => {
            try {
                const response = await api.get('/api/v1/task/fetch-timesheet-by-task', {
                    params: { taskId }
                });
                setTaskData(response.data.response.data);
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'There is no data in the taskName'
                });
            }
        };

        const handleRowSelection = (selectedRowKeys:any, selectedRows:any) => {
          // Extracting uniqueRequestId array from selectedRows
          console.log("handleRowSelection", selectedRows, selectedRowKeys);
          // Update selectedRows state with the array of uniqueRequestId
          setSelectedRows(selectedRowKeys);
        };

        const handleRowClick = (record: any) => {
          console.log("record-onRow", record);
          setTaskName(record.taskName);
          fetchData(record.taskId)
          setModalVisible(true);
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

    const handleApproveTask =(taskId: any)=>{
      setApprovalVisible(true);
      handleApproveSubmit(taskId);
    }
    const handleRejectTask = (taskId: any) => {
      setCommentVisible(true);
      handleSubmit(taskId);
    };
  
    const handleCancel = () => {
      setCommentVisible(false);
      setComments(''); // Clear comments when modal is canceled
    };
  
    const handleInputChange = (e:any) => {
      setComments(e.target.value);
    };
  
    const handleSubmit = async (taskId: any) => {
      try {
        const payload = {
          taskId: taskId,
          approvalStatus: "Rejected",
          approvalComments: comments,
        };
  
        // Send the payload to the API
        const response = await api.put('/api/v1/timeSheet/review-task-completion', payload);
        
        console.log(response?.data); // Optionally handle the response data
  
        // Reset the modal state
        setStatuses(prev=>!prev);
        setCommentVisible(false);
        setComments('');
        setSelectedRows([]);
      } catch (error) {
        console.error('Error occurred:', error);
        // Optionally handle errors
      }
    };

    const handleApproveSubmit=async(taskId: any)=>{
      try {
        const payload = {
          taskId: taskId,
          approvalStatus: "Approved",
          approvalComments: comments,
        };
  
        // Send the payload to the API
        const response = await api.put('/api/v1/timeSheet/review-task-completion', payload);
        
        console.log(response?.data); // Optionally handle the response data
  
        // Reset the modal state
        setStatuses(prev=>!prev);
        setApprovalVisible(false);
      } catch (error) {
        console.error('Error occurred:', error);
        // Optionally handle errors
      }
    } //need to work

    
    const handleComplete = async (taskId: any) => {
      try {
        console.log("handleComplete-payload", taskId);
        const response = await api.put('/api/v1/task/task-completion-update', null, {
          params: {
            taskId: taskId,
            isCompleted: true,
          }
        });
        console.log("handleComplete-response", response);
      } catch (err) {
        notification.error({
          message:'error',
          description:'You have already Completed the task / No task for this taskName'
        })
      }
    }
    
    
    const handleClick=()=>{
      navigate('/manager/taskassign');
    }

    const columns: ColumnsType<any> = [
      {
        title: 'Sl. No',
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
        render: (text, record, index) => index + 1,
      },
      {
        title: 'Project',
        dataIndex: 'projectName',
        key: 'projectName',
        fixed: 'left',
      },
      {
        title: 'Task Name',
        dataIndex: 'taskName',
        key: 'taskName',
        fixed: 'left',
      },
      {
        title: 'Start Date',
        dataIndex: 'startDate',
        key: 'startDate',
        fixed: 'left',
      },
      {
        title: 'Estimated End Date',
        dataIndex: 'estimatedEndDate',
        key: 'estimatedEndDate',
        fixed: 'left',
      },
      {
        title: 'End Date',
        dataIndex: 'endDate',
        key: 'endDate',
        fixed: 'left',
        render: (text: string) => text ? text : '➖', // Display '➖' if the field is empty
      },
      {
        title: 'Employees',
        dataIndex: 'employees',
        key: 'employees',
        fixed: 'left',
        render: (employees: EmployeeDetails[]) => (
          <>
            {employees.map((employee, index) => (
              <div key={index} style={{ display: 'flex' }}>
                <div>
                  <strong>{employee.employeeName}</strong>
                </div>
              </div>
            ))}
          </>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'taskDescription',
        key: 'taskDescription',
        fixed: 'left',
      },
      {
        title: 'Status',
        dataIndex: 'taskStatus',
        key: 'taskStatus',
        fixed: 'left',
      },
      ...(role === 'ROLE_MANAGER'
        ? [
            {
              title: 'Actions',
              dataIndex: 'managerActions',
              key: 'managerActions',
              render: (_: any, record: any) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <EditOutlined
                    onClick={() => handleEditTask(record)}
                    style={{
                      marginRight: '8px',
                      cursor: 'pointer',
                      color: 'blue',
                      fontSize: '20px',
                    }}
                  />
                  <DeleteOutlined
                    onClick={() => handleDeleteTask(record?.timeSheetId)}
                    style={{
                      cursor: 'pointer',
                      color: 'red',
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
              title: 'Actions',
              dataIndex: 'employeeActions',
              key: 'employeeActions',
              render: (_: any, record: any) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    style={{
                      width: '80%',
                      backgroundColor: '#0B4266',
                      color: 'white',
                      cursor: 'pointer',
                      height: '100%',
                    }}
                    key="submit"
                    type="primary"
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
              title: 'Review',
              dataIndex: 'reviewActions',
              key: 'reviewActions',
              render: (_: any, record: any) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <Button
                    onClick={() => handleRejectTask(record?.timeSheetId)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#eb362cdb',
                      color: 'white',
                      fontSize: '16px',
                      marginRight:'3px',
                      width: '100px',
                      height: '41px',
                    }}
                  >
                    {/* <CloseOutlined style={{color: 'white'}}/> */}
                  Reject</Button>
                  <Button
                    onClick={() => handleApproveTask(record?.timeSheetId)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: '#8ed27d',
                      color: 'white',
                      fontSize: '16px',
                      width: '100px',
                      height: '41px',
                    }}
                  >
                    {/* <CheckOutlined style={{color:'white'}}/> */}
                    Approve</Button>
                </div>
              ),
            },
          ]
        : []),
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
      <div>
        <div style={{display:'flex', justifyContent:'space-between', margin:'10px 20px'}}>
            <div style={{ color: '#0B4266', margin: '10px 20px' }}>
                <h1>Assigned Task Details</h1>
            </div>
          <Button id='cancel-new' onClick={handleClick}>Assign Task</Button>
        </div>
          <Table
              // rowSelection={{
              //   type: 'checkbox',
              //   selectedRowKeys: selectedRows,
              //   onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
              // }}
              style={{ fontSize: '12px', fontFamily: 'poppins', fontWeight: 'normal', color: '#0B4266' }}
              className='addtask-table'
              // onRow={(record: any) => ({
              //   onClick: (event: React.MouseEvent<HTMLElement>) => {
              //     console.log("record-onRow", record);
              //     navigate(`/manager/employeetaskassigndetails?${record.taskName}`, { state: { taskId: record.taskId, taskName: record.taskName } });
              //   },
              // })}
              onRow={(record: any) => ({
                onClick: (event: React.MouseEvent<HTMLElement>) => handleRowClick(record),
              })}
              columns={columns}
              dataSource={taskTable}
              pagination={false}
              rowKey="taskId"
            />
            <Modal
                  title={taskName}
                  visible={modalVisible}
                  onCancel={() => setModalVisible(false)}
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
                          columns={innerColumns} // Pass appropriate columns for taskData
                          dataSource={filteredDataSource} // Assuming taskData is an array
                        // pagination={true}
                      />
                    )}
                  </div>
                </div>
                  
              </Modal>
              <Modal
                title="Comments"
                className='modalTitle'
                visible={commentVisible}
                onCancel={handleCancel}
                footer={[
                    <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white', cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer' }} key="submit" type="primary" onClick={handleSubmit}>
                    Submit
                    </Button>,
                ]}
                >
                <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
              </Modal>
      </div>
    </ConfigProvider>
  )
}

export default TaskAssignTable