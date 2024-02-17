import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import '../Styles/Dashboard.css';

const Headerbar: React.FC = () => {
  const handlePlusClick = () => {
    // Button action
  };

  return (
    <div className='headerstyle'>
      <Input className='search' placeholder="Search Here" suffix={<SearchOutlined />} />
      <Button
       type="text"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="23" viewBox="0 0 16 16" fill="none">
            <g clipPath="url(#clip0_223_13393)">
              <path d="M19 10H10V19H7V10H-2V7H7V-2H10V7H19V10Z" fill="#0B4266" />
            </g>
            <defs>
              <clipPath id="clip0_223_13393">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        }
        onClick={handlePlusClick}
      />
      <Button
         type="text"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 32 32" fill="none">
            <path d="M15.9999 29.3335C17.4666 29.3335 18.6666 28.1335 18.6666 26.6668H13.3333C13.3333 28.1335 14.5199 29.3335 15.9999 29.3335ZM23.9999 21.3335V14.6668C23.9999 10.5735 21.8133 7.14683 17.9999 6.24016V5.3335C17.9999 4.22683 17.1066 3.3335 15.9999 3.3335C14.8933 3.3335 13.9999 4.22683 13.9999 5.3335V6.24016C10.1733 7.14683 7.99992 10.5602 7.99992 14.6668V21.3335L5.33325 24.0002V25.3335H26.6666V24.0002L23.9999 21.3335Z" fill="#041724" />
          </svg>
        }
        onClick={handlePlusClick}
      />
      <Button
        type="text"
        icon={<UserOutlined style={{ fontSize: 22 }} />}
      />
    </div>
  );
};

export default Headerbar;
