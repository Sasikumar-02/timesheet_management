import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Table, notification, Space, Avatar, Select, Button } from 'antd';
import api from '../../Api/Api-Service';
import '../Styles/AddTask.css';
import '../Styles/CreateUser.css';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";

const { Option } = Select;

// Define the type of your task data
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

const EmployeeTaskAssignDetails = () => {
    const location = useLocation();
    const { taskId, taskName } = location.state;
    const [taskData, setTaskData] = useState<TaskData | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
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

        fetchData();
    }, [taskId]);

    const handleEmployeeChange = (value: string) => {
        setSelectedEmployee(value);
    };

    const handleClearFilter=()=>{
        setSelectedEmployee(null);
    }

    const filteredDataSource = selectedEmployee ?
        Object.values(taskData || {})
            .flatMap(tasks => tasks)
            .filter(task => task.employeeId === selectedEmployee)
        : Object.values(taskData || {}).flatMap(tasks => tasks);

    const columns = [
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

    return (
        <div>
            <div className='header'>
                <div style={{ color: '#0B4266', margin: '10px 20px' }}>
                    <h1>{taskName}</h1>
                </div>
            </div>
            <div style={{display:'flex', alignItems:'left'}}>
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
            {taskData ? (
                <Table
                    dataSource={filteredDataSource}
                    columns={columns}
                    rowKey="timeSheetId"
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default EmployeeTaskAssignDetails;
