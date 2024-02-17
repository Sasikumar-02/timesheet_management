import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from './Layout';
import { Button, Space, message } from 'antd';
import {Avatar, notification} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  UserOutlined,
} from "@ant-design/icons";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import dayjs from "dayjs";
import '../Styles/UserProfile.css';
const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Fetch user data based on userId (Assuming you have stored user data in local storage)
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const user = storedUsers.find((user: any) => user.userId === userId);

    setUserData(user);
  }, [userId]);

  const handleEditClick = () => {
    // Navigate to the /createuser/:userId route with the user data as a parameter
    navigate(`/createuser/${userId}`, { state: { userData } });
  };

  const handleDeleteClick = () => {
    // Assuming you have a function to delete the user by ID
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const updatedUsers = storedUsers.filter((user: any) => user.userId !== userId);

    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Display a success message
    message.success('User deleted successfully');

    // Navigate back to /userdetails
    navigate('/userdetails');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleDateClick = (arg: DateClickArg) => {
    // arg.date is the clicked date
    const clickedDate = dayjs(arg.date);
  
    // Check if the clicked date is in the future
    if (clickedDate.isAfter(dayjs(), 'day')) {
      // Display a notification if the date is in the future
      notification.warning({
        message: 'Date Restriction',
        description: 'Restricted to open future dates.',
      });
    } else {
      // Format the date to the desired format (you may need to adjust the format)
      const formattedDate = clickedDate.format('YYYY-MM-DD');
  
      // Navigate to the /addtask route with the date as a query parameter
      navigate(`/addtask?date=${formattedDate}`);
    }
  };
  return (
    <DashboardLayout>
      <p>Admin &gt; Timesheet Management &gt; User Details &gt; User Profile</p>
      <div className='userprofile-main'>
        <div className='userdetails'> 
          <div>
            <h1>User Profile</h1>
          </div>
          <div>
              <button type='button' id='userdetails-submit' onClick={handleDeleteClick}>
                Delete User
              </button>
          </div>
        </div>
        <div className='userprofile-main-dev'>
          <div>
            <Space>
                <Avatar icon={<UserOutlined />} size={45} />
                <div>
                  <div>
                    <strong>
                      {userData.name}
                    </strong>
                  </div>
                  <div className='desingation-style'>{userData.designation}</div>
                </div>
            </Space>
          </div>
          <div>
            <div>
            <label htmlFor='email' className='label-div'>Email</label>
            </div>
            <div className='diplaydetails'>{userData.email}</div>     
          </div>
          <div>
            <div>
            <label htmlFor='userId'className='label-div'>Employee ID</label>
            </div>
            <div className='diplaydetails'>{userData.userId}</div>     
          </div>
          <div>
            <div>
            <label htmlFor='role' className='label-div'>Role</label>
            </div>
            <div className='diplaydetails'>{userData.role}</div>     
          </div>
          <div>
            <div>
            <label htmlFor='reportingTo' className='label-div'>Reporting TO</label>
            </div>
            <div className='diplaydetails'>{userData.reportingTo}</div>     
          </div>
          <div>
          <EditOutlined onClick={handleEditClick} />
          </div>
        </div>
      </div>
      <div className='userprofile-main'>
          <h2>User Timesheet</h2>
      </div>
      <div style={{display:'flex', flexDirection:'row'}}>
        <div style={{width:'100%', marginLeft:'20px'}}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={"dayGridMonth"}
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height={"90vh"}
          dateClick={handleDateClick}
          eventClassNames="calendar" // Add your custom class to events
        />
        </div>
        <div style={{width:'50%',border: '1px solid #E6E6E6', margin:'0px 20px'}}>
          <h1 className='userprofile-main'>History</h1>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
