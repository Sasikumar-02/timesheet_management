import React, { useEffect, useState } from "react";
import { Badge, Dropdown, Menu } from "antd";
import { CheckOutlined } from '@ant-design/icons';

interface RequestedOn {
  [key: string]: string[]; 
}

interface TaskRequestedOn {
  [userId: string]: RequestedOn; 
}

const Notification: React.FC = () => {
  const [taskRequestedOn, setTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [approveTaskRequestedOn, setApproveTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [userRole, setUserRole]= useState<String|null>('');
  useEffect(() => {
    const dataFromLocalStorage = localStorage.getItem('taskRequestedOn');
    if (dataFromLocalStorage) {
      const parsedData: TaskRequestedOn = JSON.parse(dataFromLocalStorage);
      setTaskRequestedOn(parsedData);
    }
  }, []);

  useEffect(()=>{
    const role =localStorage.getItem('role');
    setUserRole(role);
  })
  const handleApprove = (userId: string, month: string, date: string) => {
    const updatedTaskRequestedOn = { ...taskRequestedOn };
    if (!updatedTaskRequestedOn[userId]) {
        updatedTaskRequestedOn[userId] = {};
    }
    if (!updatedTaskRequestedOn[userId][month]) {
        updatedTaskRequestedOn[userId][month] = [];
    }
    updatedTaskRequestedOn[userId][month] = updatedTaskRequestedOn[userId][month].filter(d => d !== date);
    if (updatedTaskRequestedOn[userId][month].length === 0) {
        delete updatedTaskRequestedOn[userId][month];
    }
    if (Object.keys(updatedTaskRequestedOn[userId]).length === 0) {
        delete updatedTaskRequestedOn[userId];
    }

    setTaskRequestedOn(updatedTaskRequestedOn);
    const updatedApproveTaskRequestedOn = { ...approveTaskRequestedOn };
    if (!updatedApproveTaskRequestedOn[userId]) {
        updatedApproveTaskRequestedOn[userId] = {};
    }
    if (!updatedApproveTaskRequestedOn[userId][month]) {
        updatedApproveTaskRequestedOn[userId][month] = [];
    }
    updatedApproveTaskRequestedOn[userId][month] = [...updatedApproveTaskRequestedOn[userId][month], date];
    setApproveTaskRequestedOn(updatedApproveTaskRequestedOn);
    localStorage.setItem('taskRequestedOn', JSON.stringify(updatedTaskRequestedOn));
    localStorage.setItem('approveTaskRequestedOn', JSON.stringify(updatedApproveTaskRequestedOn));
};


 
  let notificationMenu:any = null;
  let notificationCount:number=0;

  if (userRole === 'ROLE_MANAGER') {
    notificationCount = Object.keys(taskRequestedOn).length;
    notificationMenu = (
      <div>
        <Menu style={{ marginRight: "-40px", marginTop: "-20px" }}>
          <Menu.Item key="notifications">
            {Object.entries(taskRequestedOn).map(([userId, months]) => (
              <div key={userId}>
                {Object.entries(months).map(([month, dates]) => (
                  <div key={month}>
                    {dates.map((date) => (
                      <div key={date}>
                        <p>
                          <span style={{ marginRight: '5px' }}>
                            {userId}: {date}
                          </span>
                          <CheckOutlined
                            style={{ color: 'green', fontWeight: 'bold' }}
                            onClick={() => handleApprove(userId, month, date)}
                          />
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </Menu.Item>
        </Menu>
      </div>
    );
  } else{
    notificationMenu=null;
  }

  return (
    <Dropdown overlay={() => notificationMenu} trigger={["click"]}>
      <div className="notification-menu" style={{ cursor: 'pointer' }}>
        <Badge className="flex" count={notificationCount}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            style={{ marginTop: "-20px" }}
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16 29.3333C17.4666 29.3333 18.6666 28.1333 18.6666 26.6666H13.3333C13.3333 28.1333 14.52 29.3333 16 29.3333ZM24 21.3333V14.6666C24 10.5733 21.8133 7.14665 18 6.23998V5.33331C18 4.22665 17.1066 3.33331 16 3.33331C14.8933 3.33331 14 4.22665 14 5.33331V6.23998C10.1733 7.14665 7.99998 10.56 7.99998 14.6666V21.3333L5.33331 24V25.3333H26.6666V24L24 21.3333Z"
              fill="#041724"
            />
          </svg>
        </Badge>
      </div>
    </Dropdown>
  );
};

export default Notification;

