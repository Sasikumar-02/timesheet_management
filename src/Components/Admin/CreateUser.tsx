import React, { useState, useEffect } from 'react';
import { ConfigProvider, Input, notification, Select } from 'antd';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../Api/Api-Service';
import { ThemeConfig } from 'antd/lib';

const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

  export interface User {
      [key: string]: string | number | undefined;
      slNo?: number;
      name: string;
      userId: string;
      email: string;
      designation: string;
      role: string;
      reportingTo: string;
    }
const CreateUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { Option } = Select; 
  const { state: editUserData } = useLocation();
  const isEdit = Boolean(editUserData);
  const navigate = useNavigate();
 const [employees, setEmployees] = useState<any[]>([]);
 const [managers, setManagers] = useState<any[]>([]);
const reportingOptions = managers.map((manager)=>`${manager.firstName} ${manager.lastName}`)

 const nameOptions = employees
 .map(employee => `${employee.firstName} ${employee.lastName}`);
  
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_API_KEY}/api/v1/admin/employee-list`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = response?.data?.response?.data;
        console.log('Fetched data:', data);
        setEmployees(data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_API_KEY}/api/v1/admin/fetch-manager-list`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data =response?.data?.response?.data;
        console.log('Fetched data:', data);
        setManagers(data); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); 
  }, []);

  
  const [user, setUser] = useState<User>({
    name: '',
    userId: '',
    email: '',
    designation: '',
    role: 'Role',
    reportingTo: '',
  });

  useEffect(() => {
    if (editUserData) {
      setUser(editUserData.userData);
    } else if (isEdit && userId) {
      const storedUsersJSON = localStorage.getItem('users');
      const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      const user = storedUsers.find((user: any) => user.userId === userId);

      if (user) {
        setUser(user);
      }
    }
  }, [editUserData, userId, isEdit]);

  const handleInputChange = (field: keyof User, value: string) => {
    setUser((prevUser:any) => ({ ...prevUser, [field]: value }));
  };

  const handleSave = () => {
    console.log('User data saved:', user);
    updateLocalStorage(user);
    notification.success({
      message: 'Success',
      description: 'User data saved successfully!',
    });
    navigate('/hr/userdetails');
  };

  const handleSubmit = () => {
    const newSlNo = getUniqueSlNo();
    const newUser = { ...user, slNo: newSlNo };
    addOrUpdateLocalStorage(newUser);
    notification.success({
      message: 'Success',
      description: 'User added successfully!',
    });
    setUser({
      name: '',
      userId: '',
      email: '',
      designation: '',
      role: 'Role',
      reportingTo: '',
    });
  };

  const addOrUpdateLocalStorage = (userData: User) => {
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const existingUserIndex = storedUsers.findIndex((u: User) => u.userId === userData.userId);

    if (existingUserIndex !== -1) {
      storedUsers[existingUserIndex] = userData;
    } else {
      storedUsers.push(userData);
    }

    localStorage.setItem('users', JSON.stringify(storedUsers));
  };

  const getUniqueSlNo = () => {
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    if (storedUsers.length > 0) {
      return storedUsers[storedUsers.length - 1].slNo + 1;
    } else {
      return 1;
    }
  };

  const handleCancel = () => {
    setUser({
      name: '',
      userId: '',
      email: '',
      designation: '',
      role: 'Role',
      reportingTo: '',
    });
  };

  const updateLocalStorage = (userData: User) => {
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    const updatedUsers = storedUsers.map((u: User) =>
      u.userId === userData.userId ? userData : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

console.log("employees data", employees);
  return (
    <ConfigProvider theme={config}>
      <p>Admin &gt; Timesheet Management &gt; {isEdit ? 'Edit User' : 'Create User'}</p>
      <div className='createuser-main'>
        <h1>{isEdit ? 'Edit User' : 'Create User'}</h1>
        <form>
        <div className='section-createuser'>
            <div className='create-layout-addtask'>
              <div>
                <label htmlFor='name'><span style={{color:'red', paddingRight:'5px'}}>*</span>Name</label>
              </div>
              <Select
                id='name'
                style={{textAlign:'left', marginTop:'10px', width:'100%'}}
                value={user.name}
                onChange={(value) => handleInputChange('name', value)}
              >
                <Option value=''>Enter your name</Option>
                {nameOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
              </Select>
            </div>

              <div className='create-layout-addtask'>
                <div>
                <label htmlFor='userId'><span style={{color:'red', paddingRight:'5px'}}>*</span>Employee ID</label>
                </div>
                <Input
                  placeholder='Enter your Employee ID'
                  value={user.userId}
                  onChange={(e) => handleInputChange('userId', e.target.value)}
                  className='inputbox'
                />
              </div>
            </div>
            <div className='section-createuser'>
              <div className='create-layout-addtask'>
                <div>
                <label htmlFor='email'><span style={{color:'red', paddingRight:'5px'}}>*</span>Email</label>
                </div>
                <Input
                  placeholder='Enter your E-mail ID'
                  value={user.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className='inputbox'
                  prefix={
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 32 32'
                      fill='none'
                    >
                      <g clipPath='url(#clip0_11_8)'>
                        <path
                          d='M26.6667 5.33331H5.33335C3.86669 5.33331 2.68002 6.53331 2.68002 7.99998L2.66669 24C2.66669 25.4666 3.86669 26.6666 5.33335 26.6666H26.6667C28.1334 26.6666 29.3334 25.4666 29.3334 24V7.99998C29.3334 6.53331 28.1334 5.33331 26.6667 5.33331ZM26.6667 10.6666L16 17.3333L5.33335 10.6666V7.99998L16 14.6666L26.6667 7.99998V10.6666Z'
                          fill='#041724'
                        />
                      </g>
                      <defs>
                        <clipPath id='clip0_11_8'>
                          <rect width='32' height='32' fill='white' />
                        </clipPath>
                      </defs>
                    </svg>
                  }
                />
              </div>
              <div className='create-layout-addtask'>
                <label htmlFor='designation' className='text'><span style={{color:'red', paddingRight:'5px'}}>*</span>
                  Designation
                </label>
                <Input
                  placeholder='Enter your Designation'
                  value={user.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className='inputbox-designation'
                />
              </div>
            </div>
            <div className='create-layout'>
              <label><span style={{color:'red', paddingRight:'5px'}}>*</span>Role</label>
            </div>
            <div>
              <input
                type='radio'
                className='role-input'
                style={{width:'20px'}}
                value='Manager'
                checked={user.role === 'Human Resource'}
                onChange={() => handleInputChange('role', 'Human Resource')}
              />
              <label>Human Resource</label>
              <label>
                <input
                  type='radio'
                  style={{width:'20px'}}
                  className='role-input'
                  value='Team Leader'
                  checked={user.role === 'Manager'}
                  onChange={() => handleInputChange('role', 'Manager')}
                />
                Manager
              </label>
              <label>
                <input
                  type='radio'
                  style={{width:'20px'}}
                  className='role-input'
                  value='Team Member'
                  checked={user.role === 'Team Member'}
                  onChange={() => handleInputChange('role', 'Team Member')}
                />
                Team Member
              </label>
            </div>
            {['Manager', 'Team Member'].includes(user.role) && (
              <div>
                <div className='create-layout'>
                  <label htmlFor='reportingTo'><span style={{color:'red', paddingRight:'5px'}}>*</span>Reporting To</label>
                </div>
                <Select
                  id='reportingTo'
                  style={{height:'120%', width:'25%', marginLeft:'20px'}}
                  value={user.reportingTo}
                  onChange={(value) => handleInputChange('reportingTo', value)}
                >
                  <Option value=''>Select Reporting To</Option>
                  {reportingOptions.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              </div>
            )}
          <div className='button'>
            <button type='button' id='cancel' onClick={handleCancel}>
              Cancel
            </button>
            <button type='button' id='submit' onClick={isEdit ? handleSave : handleSubmit}>
              {isEdit ? 'Save' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </ConfigProvider>
  );
};

export default CreateUser;

