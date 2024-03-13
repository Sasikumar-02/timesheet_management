import React, { useState, useEffect } from 'react';
import { ConfigProvider, Input, notification } from 'antd';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../../Api/Api-Service';
// import { User } from './CreateUser';
import DashboardLayout from '../Dashboard/Layout';
import { ThemeConfig } from 'antd/lib';
const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "#E7ECF0",
  },
};

interface UserDetails {
  profileUrl: string;
  userId: string;
  firstName: string;
  lastName: string;
  personalEmail: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  alternateMobileNumber: string | null;
  alternateMobileNumberCountryCode: string | null;
  emergencyContactPersonName: string | null;
  emergencyContactMobileNumber: string | null;
  emergencyContactMobileNumberCountryCode: string | null;
  department: string | null;
  role: string;
  designation: string;
  employmentType: string;
  shiftTiming: string;
  branch: string;
  currencyCode: string;
  salary: string;
  dateOfJoining: string;
  dateOfLeaving: string | null;
  lastLogin: string;
  offboardingReason: string | null;
  finalInteractionPdfName: string | null;
  finalInteractionPdfUrl: string | null;
  revokeReason: string | null;
  reportingManagerId: string;
  reportingMangerName: string;
  reportingManagerEmail: string;
  skills: string[];
  currentAddress: {
      addressLine1: string;
      addressLine2: string | null;
      landmark: string | null;
      district: string;
      zipcode: string;
      state: string;
      nationality: string;
  } | null;
  permanentAddress: {
      addressLine1: string;
      addressLine2: string | null;
      landmark: string | null;
      district: string;
      zipcode: string;
      state: string;
      nationality: string;
  } | null;
  userProjects: any[]; // Define the type of userProjects based on the actual structure
  active: boolean;
  willingToTravel: boolean;
  reportingManager: boolean;
}

export interface User {
    [key: string]: string | number | undefined;
    slNo?: number;
    name: string;
    userId: string;
    email: string;
    designation: string;
    role: string;
    reportingTo?: string;
  }
const CreateUser: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state: editUserData } = useLocation();
  const isEdit = Boolean(editUserData);
  const navigate = useNavigate();
 // const nameOptions = ['Sasi Kumar M', 'Gokul R', 'Ashif', 'Vetrivel'];
 const [employees, setEmployees] = useState<UserDetails[]>([]);
 const reportingOptions = employees
 .filter(employee => employee.reportingManager)
 .map(employee => `${employee.firstName} ${employee.lastName}`);

 const nameOptions = employees
 .map(employee => `${employee.firstName} ${employee.lastName}`);
  
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`${process.env.REACT_APP_API_KEY}/api/v1/admin/employee-list`);
        if (response.status !== 200) {
          throw new Error('Failed to fetch data');
        }
        const data = response.data.response.data;
        console.log('Fetched data:', data);
        setEmployees(data); // Set fetched data to state
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array to run effect only once on mount
  // const nameOptions = employees.map((employee) => {
  //   return {
  //     value: employee.userId, // Assuming employee ID can uniquely identify each employee
  //     label: `${employee.firstName} ${employee.lastName}`, // Concatenating firstName and lastName
  //   };
  // });

  
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
    // Implement logic to save updated user data
    console.log('User data saved:', user);

    // Update the user data in localStorage
    updateLocalStorage(user);
    
    // Show success notification
    notification.success({
      message: 'Success',
      description: 'User data saved successfully!',
    });

    // Redirect back to user details
    navigate('/hr/userdetails');
  };

  const handleSubmit = () => {
    const newSlNo = getUniqueSlNo(); // Get the unique slNo
    const newUser = { ...user, slNo: newSlNo };

    // Store user data in localStorage
    addOrUpdateLocalStorage(newUser);

    // Show success notification
    notification.success({
      message: 'Success',
      description: 'User added successfully!',
    });

    // Clear the form
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

    // Check if the user already exists in localStorage
    const existingUserIndex = storedUsers.findIndex((u: User) => u.userId === userData.userId);

    if (existingUserIndex !== -1) {
      // If user exists, update the user
      storedUsers[existingUserIndex] = userData;
    } else {
      // If user is new, add it to the list
      storedUsers.push(userData);
    }

    localStorage.setItem('users', JSON.stringify(storedUsers));
  };

  const getUniqueSlNo = () => {
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];

    // If there are existing users, return the next slNo
    if (storedUsers.length > 0) {
      return storedUsers[storedUsers.length - 1].slNo + 1;
    } else {
      // If there are no existing users, return 1 for the first row
      return 1;
    }
  };

  const handleCancel = () => {
    // Clear the form
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

  // const getUniqueSlNo = () => {
  //   const storedUsersJSON = localStorage.getItem('users');
  //   const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
  //   return storedUsers.length + 1;
  // };

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
              <select
                id='name'
                style={{textAlign:'left'}}
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              >
                <option value=''>Enter your name</option>
                {nameOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
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
                value='Manager'
                checked={user.role === 'Human Resource'}
                onChange={() => handleInputChange('role', 'Human Resource')}
              />
              <label>Human Resource</label>
              <label>
                <input
                  type='radio'
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
                <select
                  id='reportingTo'
                  value={user.reportingTo}
                  onChange={(e) => handleInputChange('reportingTo', e.target.value)}
                >
                  <option value=''>Select Reporting To</option>
                  {reportingOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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

