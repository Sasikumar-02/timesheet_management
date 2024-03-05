// import React, { useEffect, useState } from "react";
// import { Badge, List, Avatar, Dropdown, Menu } from "antd";
// import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

// interface Notification {
//   id: number;
//   message: string;
// }

// interface DataNotification {
//   notificationId: number;
//   notificationMessage: string;
//   notificationType: string;
//   createdOn: string;
// }

// interface RequestedOn {
//   [key: string]: string[]; // Each key represents a month (e.g., "February 2024") with an array of dates
// }

// interface TaskRequestedOn {
//   [userId: string]: RequestedOn; // Each key represents a month (e.g., "February 2024") with an array of dates
// }

// const Notification: React.FC = () => {
//   const [taskRequestedOn, setTaskRequestedOn] = useState<TaskRequestedOn>({});
//   // Fetch data from localStorage when component mounts
//   useEffect(() => {
//     const dataFromLocalStorage = localStorage.getItem('taskRequestedOn');
//     if (dataFromLocalStorage) {
//       const parsedData: TaskRequestedOn = JSON.parse(dataFromLocalStorage);
//       setTaskRequestedOn(parsedData);
//     }
//   }, []);

//   // Dummy data for notifications
//   const DataOfNotification: DataNotification[] = [
//     {
//       notificationId: 1,
//       notificationMessage: "Birthday today: John Doe",
//       notificationType: "Birthday",
//       createdOn: "2024-01-16T08:00:00Z",
//     },
//     {
//       notificationId: 2,
//       notificationMessage: "Meeting reminder: Project XYZ meeting at 10:00 AM",
//       notificationType: "Meeting",
//       createdOn: "2024-01-16T09:00:00Z",
//     },
//     {
//       notificationId: 3,
//       notificationMessage: "Task assigned: Review document for approval",
//       notificationType: "Task",
//       createdOn: "2024-01-16T10:00:00Z",
//     },
//   ];

//   // Function to handle approval of task request
//   const handleApprove = (userId: string, month: string, date: string) => {
//     // Update taskRequestedOn
//     const updatedTaskRequestedOn = { ...taskRequestedOn };
//     if (!updatedTaskRequestedOn[userId]) {
//       updatedTaskRequestedOn[userId] = {};
//     }
//     if (!updatedTaskRequestedOn[userId][month]) {
//       updatedTaskRequestedOn[userId][month] = [];
//     }
//     updatedTaskRequestedOn[userId][month] = updatedTaskRequestedOn[userId][month].filter(d => d !== date);
//     setTaskRequestedOn(updatedTaskRequestedOn);

//     // Store updated data in localStorage
//     localStorage.setItem('taskRequestedOn', JSON.stringify(updatedTaskRequestedOn));
//   };

//   const notificationMenu = (
//     <div>
//       <Menu style={{ marginRight: "-40px", marginTop: "-20px" }}>
//         <Menu.Item key="notifications">
//           {Object.entries(taskRequestedOn).map(([userId, months]) => (
//             <div key={userId}>
//               {/* <h3>User ID: {userId}</h3> */}
//               {Object.entries(months).map(([month, dates]) => (
//                 <div key={month}>
//                   {/* <h4>Month: {month}</h4> */}
//                   {dates.map((date) => (
//                     <div key={date}>
//                       <p>
//                         <span style={{marginRight:'5px'}}>
//                             {userId}: {date}
//                         </span>
//                         <CheckOutlined
//                             style={{ color: 'green', fontWeight: 'bold' }}
//                             onClick={() => handleApprove(userId, month, date)}
//                         />

//                       </p>
//                       {/* Render approve and reject icons */}
//                       {/* <button onClick={() => handleApprove(userId, month, date)}>Approve</button> */}
//                       {/* <button onClick={() => handleReject(userId, month, date)}>Reject</button> */}
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           ))}
//         </Menu.Item>
//       </Menu>
//     </div>
//   );
  

//   return (
//     <Dropdown overlay={notificationMenu} trigger={["click"]}>
//       <div className="notification-menu" style={{ cursor: 'pointer' }}>
//         <Badge className="flex" dot={Object.keys(taskRequestedOn).length > 0}>
//             <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width="32"
//             height="32"
//             style={{ marginTop: "-20px" }}
//             viewBox="0 0 32 32"
//             fill="none"
//             >
//             <path
//                 d="M16 29.3333C17.4666 29.3333 18.6666 28.1333 18.6666 26.6666H13.3333C13.3333 28.1333 14.52 29.3333 16 29.3333ZM24 21.3333V14.6666C24 10.5733 21.8133 7.14665 18 6.23998V5.33331C18 4.22665 17.1066 3.33331 16 3.33331C14.8933 3.33331 14 4.22665 14 5.33331V6.23998C10.1733 7.14665 7.99998 10.56 7.99998 14.6666V21.3333L5.33331 24V25.3333H26.6666V24L24 21.3333Z"
//                 fill="#041724"
//             />
//             </svg>
//         </Badge>
//     </div>
//     </Dropdown>
//   );
// };

// export default Notification;

import React, { useEffect, useState } from "react";
import { Badge, Dropdown, Menu } from "antd";
import { CheckOutlined } from '@ant-design/icons';

interface RequestedOn {
  [key: string]: string[]; // Each key represents a month (e.g., "February 2024") with an array of dates
}

interface TaskRequestedOn {
  [userId: string]: RequestedOn; // Each key represents a month (e.g., "February 2024") with an array of dates
}

const Notification: React.FC = () => {
  const [taskRequestedOn, setTaskRequestedOn] = useState<TaskRequestedOn>({});
  const [approveTaskRequestedOn, setApproveTaskRequestedOn] = useState<TaskRequestedOn>({});

  // Fetch data from localStorage when component mounts
  useEffect(() => {
    const dataFromLocalStorage = localStorage.getItem('taskRequestedOn');
    if (dataFromLocalStorage) {
      const parsedData: TaskRequestedOn = JSON.parse(dataFromLocalStorage);
      setTaskRequestedOn(parsedData);
    }
  }, []);

  // Function to handle approval of task request
  const handleApprove = (userId: string, month: string, date: string) => {
    // Update taskRequestedOn
    const updatedTaskRequestedOn = { ...taskRequestedOn };
    if (!updatedTaskRequestedOn[userId]) {
      updatedTaskRequestedOn[userId] = {};
    }
    if (!updatedTaskRequestedOn[userId][month]) {
      updatedTaskRequestedOn[userId][month] = [];
    }
    updatedTaskRequestedOn[userId][month] = updatedTaskRequestedOn[userId][month].filter(d => d !== date);
    setTaskRequestedOn(updatedTaskRequestedOn);

    // Update approveTaskRequestedOn
    const updatedApproveTaskRequestedOn = { ...approveTaskRequestedOn };
    if (!updatedApproveTaskRequestedOn[userId]) {
      updatedApproveTaskRequestedOn[userId] = {};
    }
    if (!updatedApproveTaskRequestedOn[userId][month]) {
      updatedApproveTaskRequestedOn[userId][month] = [];
    }
    updatedApproveTaskRequestedOn[userId][month] = [...updatedApproveTaskRequestedOn[userId][month], date];
    setApproveTaskRequestedOn(updatedApproveTaskRequestedOn);

    // Store updated data in localStorage
    localStorage.setItem('taskRequestedOn', JSON.stringify(updatedTaskRequestedOn));
    localStorage.setItem('approveTaskRequestedOn', JSON.stringify(updatedApproveTaskRequestedOn));
  };

  const notificationCount = Object.keys(taskRequestedOn).length;

  const notificationMenu = (
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

  return (
    <Dropdown overlay={notificationMenu} trigger={["click"]}>
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

