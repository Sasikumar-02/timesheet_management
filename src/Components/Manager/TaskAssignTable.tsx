import React, { useEffect, useState } from 'react'
import { ColumnsType } from 'antd/es/table';
import { Space, Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@mui/icons-material';
import '../Styles/AddTask.css';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
  } from "@ant-design/icons";
import { Table } from 'antd/lib';
import api from '../../Api/Api-Service';

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
    employees?:EmployeeDetails;
    taskDescription?:string;
    taskStatus?:string;
}
const TaskAssignTable = () => {
    const navigate = useNavigate();
    const [taskTable,setTaskTable]= useState<TaskTable[]>([]);
    console.log("taskTable,employee", taskTable);

        const handleEmployees = async (employeeId: string[]) => {
            try {
                // Fetch all employee details
                const response = await api.get('/api/v1/employee/fetch-reporting-manager-users');
                const allEmployees = response.data.response.data;
        
                // Filter the employee details based on the employeeId array
                const filteredEmployees = allEmployees
                    .filter((emp: any) => employeeId.includes(emp.userId))
                    .map((emp: any) => ({
                        employeeName: `${emp.firstName} ${emp.lastName}`,
                        employeeId: emp.userId
                    }));
                    return filteredEmployees;
                // Update the state with the filtered employee data
                //setEmployee(filteredEmployees);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        };
        
        
        useEffect(() => {
            const fetchData = async () => {
                try {
                    const response = await api.get('/api/v1/task/fetch-created-tasks-by-manager');
                    
                    // Map over tasks and call handleEmployees for each task
                    const updatedTaskTablePromises = response.data.response.data.map(async (task: any) => {
                        const filteredEmployees = await handleEmployees(task.employees);
                        return {
                            taskId: task.taskId,
                            projectName: task.projectName,
                            taskName: task.taskName,
                            startDate: task.startDate,
                            estimatedEndDate: task.estimatedEndDate,
                            taskStatus: task.taskStatus,
                            taskDescription: task.taskDescription,
                            employees: filteredEmployees
                        };
                    });
        
                    // Wait for all handleEmployees calls to complete
                    const updatedTaskTable = await Promise.all(updatedTaskTablePromises);
        
                    // Update the task table state with the new data
                    setTaskTable(updatedTaskTable);
                } catch (error) {
                    throw error;
                }
            };
        
            fetchData();
        }, []);
        
    


    const handleEditTask=(record:any)=>{
        console.log("handleEditTask-record", record);
        navigate('/manager/taskassign', {state:{record}})
    }
    const handleDeleteTask=(record: any)=>{

    }
    const handleClick=()=>{
      navigate('/manager/taskassign');
    }

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
          title: 'Project',
          // sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
          dataIndex: 'projectName',
          key: 'projectName',
          fixed: 'left',
        },
        {
          title: 'Task Name',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'taskName',
          key: 'taskName',
          fixed: 'left',
        },
        {
          title: 'Start Date',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'startDate',
          key: 'startDate',
          fixed: 'left',
        },
        {
          title: 'Estimated End Date',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'estimatedEndDate',
          key: 'estimatedEndDate',
          fixed: 'left',
        },
        {
            title: 'Employees',
            dataIndex: 'employees',
            key: 'employees',
            fixed: 'left',
            render: (employees: EmployeeDetails[]) => (
                // <Space className="flex gap-5" direction='vertical'>
                    // {employees.map((employee, index) => (
                    //     <div key={index} style={{display:'flex'}}>
                    //         <Avatar icon={<UserOutlined />} size={45} />
                    //         <div style={{marginLeft:'5px'}}>
                    //             <div>
                    //                 <strong>{employee.employeeName}</strong>
                    //             </div>
                    //             <div>{employee.employeeId}</div>
                    //         </div>
                    //     </div>
                    // ))}
                // </Space>
                <>
                    {employees.map((employee, index) => (
                        <div key={index} style={{display:'flex'}}>
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
          //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
          dataIndex: 'taskDescription',
          key: 'taskDescription',
          fixed: 'left',
        }, 
        {
            title: 'Status',
            //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
            dataIndex: 'taskStatus',
            key: 'taskStatus',
            fixed: 'left',
        }, 
        {
          title: 'Actions',
          dataIndex: 'actions',
          key: 'actions',
          render: (_, record, index) => {
        
            return (
              <div>
                <EditOutlined
                  onClick={() => handleEditTask(record)}
                  style={{
                    marginRight: '8px',
                    cursor: 'pointer', //|| !hasUserTasksForDate
                    color: 'blue', //|| !hasUserTasksForDate
                    fontSize: '20px',
                  }}
                />
                <DeleteOutlined
                  onClick={() => handleDeleteTask(record?.timeSheetId)}
                  style={{
                    cursor: 'pointer', //|| !hasUserTasksForDate
                    color: 'red', //|| !hasUserTasksForDate
                    fontSize: '20px',
                  }}
                />
              </div>
            );
          },
        }    
        
          
      ]

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 20px'}}>
        <h2 >Assign Task Details</h2>
        <Button id='cancel-new' onClick={handleClick}>Assign Task</Button>
      </div>
        <Table
            style={{ fontSize: '12px', fontFamily: 'poppins', fontWeight: 'normal', color: '#0B4266' }}
            className='addtask-table'
            columns={columns}
            dataSource={taskTable}
            pagination={false}
          />
    </div>
  )
}

export default TaskAssignTable