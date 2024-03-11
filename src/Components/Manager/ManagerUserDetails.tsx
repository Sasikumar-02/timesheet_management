import React from 'react';
import { Avatar, Space, Table } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import DashboardLayout from '../Dashboard/Layout';
import { Task } from '../Employee/AddTask';
import { TaskObject, UserGroupedTask, GroupedTasks } from './ApprovalRequest';
import '../Styles/ApprovalRequest.css';
import '../Styles/AddTask.css';
import { useLocation, Link } from 'react-router-dom';
const ManagerUserDetails = () => {
 const location = useLocation();
 const {title}= location.state;
  // Access groupedTask and taskList from local storage
  const groupedTasks: UserGroupedTask = JSON.parse(localStorage.getItem('groupedTasks') || '{}');
  const taskList: Task[] = JSON.parse(localStorage.getItem('taskList') || '[]');

  // Create a set to store userIds with tasks having titles
  const userIdsWithTitles = new Set<string>();

  // Iterate over taskList to find userIds with tasks having titles
  taskList.forEach(task => {
    if (task.title) {
      userIdsWithTitles.add(task.userId);
    }
  });

  
  
 // Create a Set to store unique user IDs
const uniqueUserIds = new Set<string>();


let rowNumber = 1;

// Define dataSource with row numbers
const dataSource = Object.values(groupedTasks).flatMap((userTasks) => {
  console.log("dataSource groupedTasks", groupedTasks);
  console.log("dataSource userTasks", userTasks);
  return Object.values(userTasks).flatMap(monthTasks => {
    console.log("dataSource monthTasks", monthTasks);
    return Object.values(monthTasks.tasks).flatMap(dayTasks => {
      console.log("dataSource dayTasks", dayTasks);
      return dayTasks.tasks.filter(task => {
        if (task.title === title && !uniqueUserIds.has(task.userId)) {
          uniqueUserIds.add(task.userId);
          return true;
        }
        return false;
      }).map(task => ({
        slNo: rowNumber++, // Increment rowNumber for each task
        userId: task.userId,
        role: 'Team Member', // Assuming role is fixed for now
        email: 'sasikumarmurugan02@gmail.com', // Assuming email is fixed for now
        designation: 'Frontend', // Assuming designation is fixed for now
      }));
    });
  });
});


  // Define columns for the table
  const columns = [
    {
      title: 'Sl.no',
      dataIndex: 'slNo',
      key: 'slNo',
      fixed: 'left' as const, // Fixing this column to the left
      width: 80, // Specify a fixed width for the column
    },
    {
      title: 'Employee',
      dataIndex: 'userId',
      render: (userId: string) => (
        <Space className="flex gap-5">
          <Avatar icon={<UserOutlined />} size={45} />
          <div>
            <div>
              <strong>Sasi Kumar</strong>
            </div>
            <div>{userIdsWithTitles.has(userId) ? `${userId}` : 'Employee'}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: () => <div>Team Member</div>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: () => <div>sasikumarmurugan02@gmail.com</div>,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      render: () => <div>Frontend</div>,
    },
  ];

  return (
    <DashboardLayout>
      <div>{title}</div>
      <Link to="/dashboard">
        <Table
          columns={columns}
          className='custom-table'
          dataSource={dataSource}
          pagination={false} 
          scroll={{ x: 1500 }} 
          onRow={(record, rowIndex) => {
            return {
              onClick: event => {
                // Navigate to the dashboard when a row is clicked
              },
            };
          }}
        />
      </Link>


    </DashboardLayout>
  );
};

export default ManagerUserDetails;
