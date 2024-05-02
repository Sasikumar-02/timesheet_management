import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const user = storedUsers.find((user: any) => user.userId === userId);

    setUserData(user);
  }, [userId]);

  const handleEditClick = () => {
    navigate(`/hr/createuser/${userId}`, { state: { userData } });
  };

  const handleDeleteClick = () => {
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const updatedUsers = storedUsers.filter((user: any) => user.userId !== userId);

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    message.success('User deleted successfully');
    navigate('/hr/userdetails');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  const handleDateClick = (arg: DateClickArg) => {
    const clickedDate = dayjs(arg.date);
    if (clickedDate.isAfter(dayjs(), 'day')) {
      notification.warning({
        message: 'Date Restriction',
        description: 'Restricted to open future dates.',
      });
    } else {
      const formattedDate = clickedDate.format('YYYY-MM-DD');
      navigate(`/employee/addtask?date=${formattedDate}`);
    }
  };
  return (
    <>
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
    </>
  );
};

export default UserProfile;
