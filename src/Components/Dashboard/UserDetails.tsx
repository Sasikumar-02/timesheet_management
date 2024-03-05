import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link} from 'react-router-dom';
import '../Styles/CreateUser.css'
import { User } from './CreateUser';
import '../Styles/UserDetails.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
    Avatar,
    Space,
    Button,
    Table,
    Modal,
    Form,
    Input,
    Select,
    ConfigProvider,
    Tooltip,
    Tag,
    Popover,
    message,
    Checkbox,
    Pagination,
    Menu,
    Dropdown,
  } from "antd";
  import moment from "moment";
  import 'moment/locale/en-in';
  import {
    UserOutlined,
    SearchOutlined,
    PlusCircleOutlined,
    InfoCircleOutlined,
    ExclamationCircleFilled,
  } from "@ant-design/icons";
  import { ColumnsType } from "antd/es/table";
import DashboardLayout from './Layout';
  import '../Styles/Login.css';
  const { Option } = Select;
  moment.locale("en-in");

  function getUniqueValues(
    userz: User[],
    key: keyof User
  ): string[] {
    const uniqueValues: Set<string> = new Set();
  
    userz.forEach((user) => {
      const value = user[key];
      if (Array.isArray(value)) {
        value.forEach((item) => uniqueValues.add(item));
      } else if (typeof value === "string") {
        uniqueValues.add(value);
      }
    });
  
    return Array.from(uniqueValues);
  }


const UserDetails:React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [employeeData, setEmployeeData]= useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [pageSize, setPageSize] = useState<number | "All">(5);
  const [totalItemCount, setTotalItemCount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const initialFilters = {
    role: null,
    designation: null,
  };
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState({
    role: "Filter by Role",
    designation: "Filter by Designation",
  });
  const defaultPageSize = 5;
  const [selectedEmployeeDataForExport, setSelectedEmployeeDataForExport] =
  useState<User[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate= useNavigate();
  const uniqueRoles: string[] = getUniqueValues(users, "role");
  const uniqueDesignations: string[] = getUniqueValues(
    users,
    "designation"
  );
 
  useEffect(() => {
    console.log("applyfilters")
    applyFilters();
  }, [filters, users]);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUsersJSON = localStorage.getItem('users');
    const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
    // Set unique slNo for each user
    const usersWithSlNo = storedUsers.map((user:any, index:any) => ({
      ...user,
      slNo: index + 1,
    }));
    setUsers(usersWithSlNo);
  }, []);

  useEffect(() => {
    if (searchText.trim() !== "") {
        const filteredEmployees = users.filter(
            (employee: any) =>
              (employee.userId && employee.userId.toLowerCase().includes(searchText.toLowerCase())) ||
              (employee.name && employee.name.toLowerCase().includes(searchText.toLowerCase())) ||
              (employee.email && employee.email.toLowerCase().includes(searchText.toLowerCase()))
          );   
      setFilteredData(filteredEmployees);
    } else {
      setFilteredData(users);
    }
  }, [searchText, users]);

  useEffect(() => {
    // Fetch data based on the updated filters, search text, and the current page
    console.log("useEffect");
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, filters, searchText]);

  const handleSearchInputChange = (value: string) => {
    setSearchText(value);
  };
  
  // useEffect(() => {
  //   console.log("useEffect")
  //   fetchData(currentPage, pageSize);
  // }, [currentPage, pageSize]);

  const fetchData = async (pageNumber: number = 1, size: number | "All" = 50) => {
    if (isSubmitting) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const storedUsersJSON = localStorage.getItem('users');
      const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      // Create a copy of the storedUsers array
      let filteredUsers = [...storedUsers];
  
      // Apply filters
      if (filters.role) {
        filteredUsers = filteredUsers.filter((user: any) => user.role === filters.role);
      }
  
      if (filters.designation) {
        filteredUsers = filteredUsers.filter((user: any) => user.designation === filters.designation);
      }
  
      console.log("Filters:", filters);
      console.log("Filtered Users after role filter:", filteredUsers);
  
      const totalCount = filteredUsers.length;
      console.log("pagenumber", pageNumber  )
      // Calculate start and end index for pagination based on the filtered data
      const startIndex = (pageNumber - 1) * (size === 'All' ? totalCount : size);
      const endIndex = size === 'All' ? totalCount : startIndex + size;
      console.log("start, end", startIndex, endIndex)
            // Slice the filtered data based on pagination
      const data = filteredUsers.slice(startIndex, endIndex);
      console.log("Data after pagination:", data);
  
      const mappedData = data.map((employee: any, index: number) => ({
        key: employee.userId,
        slNo: startIndex + index + 1,
        name: employee.name,
        userId: employee.userId,
        email: employee.email,
        designation: employee.designation,
        role: employee.role,
        reportingTo: employee.reportingTo,
      }));
  
      console.log("Mapped Data:", mappedData);
  
      setFilteredData(mappedData);
      setIsSubmitting(false);
      setTotalItemCount(totalCount);
      setCurrentPage(pageNumber);
      setPageSize(size);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error fetching data:', error);
    }
  };
  
  // useEffect(() => {
  //   if (searchText.trim() !== "") {
  //       const filteredEmployees = users.filter(
  //           (employee: any) =>
  //             (employee.userId && employee.userId.toLowerCase().includes(searchText.toLowerCase())) ||
  //             (employee.name && employee.name.toLowerCase().includes(searchText.toLowerCase())) ||
  //             (employee.email && employee.email.toLowerCase().includes(searchText.toLowerCase()))
  //         );
          
  //     setSearchResults(filteredEmployees);
  //   } else {
  //     setSearchResults([]);
  //   }
  // }, [searchText]);

  // const applyFilters = () => {
  //   let filteredEmployees = [...users];
  //   //console.log("filtered Employess", filteredEmployees);
  //   if (filters.role) {
  //     filteredEmployees = filteredEmployees.filter(
  //       (employee) => employee.role === filters.role
  //     );
  //   }
  //   if (filters.designation) {
  //     filteredEmployees = filteredEmployees.filter(
  //       (employee) => employee.designation === filters.designation
  //     );
  //   }
  //   console.log("filtered Employess", filteredEmployees);
  //   setFilteredData(filteredEmployees);
  // };

  const applyFilters = (pageNumber: number = 1, size: number | "All" = 50) => {
    let filteredEmployees = [...users];
  
    if (filters.role) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.role === filters.role
      );
    }
  
    if (filters.designation) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.designation === filters.designation
      );
    }
  
    console.log("Filtered Employees:", filteredEmployees);
  
    const totalCount = filteredEmployees.length;
  
    // Calculate start and end index for pagination based on the filtered data
    const startIndex = (pageNumber - 1) * (size === 'All' ? totalCount : size);
    const endIndex = size === 'All' ? totalCount : startIndex + size;
  
    // Slice the filtered data based on pagination
    const data = filteredEmployees.slice(startIndex, endIndex);
  
    console.log("Filtered Data after pagination:", data);
  
    const mappedData = data.map((employee: any, index: number) => ({
      key: employee.userId,
      slNo: startIndex + index + 1,
      name: employee.name,
      userId: employee.userId,
      email: employee.email,
      designation: employee.designation,
      role: employee.role,
      reportingTo: employee.reportingTo,
    }));
  
    console.log("Mapped Data:", mappedData);
  
    setFilteredData(mappedData);
    setTotalItemCount(totalCount);
    setCurrentPage(pageNumber);
    setPageSize(size);
  };
  
  // const handleSearchInputChange = (value: string) => {
  //   setSearchText(value);
  // };
 
  // const handleFilterChange = (
  //   filterType: keyof typeof filters,
  //   value: string | string[] | null
  // ) => {
  //   const updatedFilters = { ...filters, [filterType]: value };
  //   setIsFilterActive(
  //     Object.values(updatedFilters).some((filter) => {
  //       return filter !== null && filter !== '' && filter !== undefined;
  //     })
  //   );
  
  //   // Update the state with the new filters
  //   setFilters(updatedFilters);
  
  //   // Fetch data based on the updated filters and the current page
  //   fetchData(1, pageSize);
  // };
  
  const handleFilterChange = (
    filterType: keyof typeof filters,
    value: string | string[] | null
  ) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setIsFilterActive(
      Object.values(updatedFilters).some((filter) => {
        return filter !== null && filter !== '' && filter !== undefined;
      })
    );
  
    // Update the state with the new filters
    setFilters(updatedFilters);
  
    // Reset the current page to 1 and fetch data with the updated filters and page size
    setCurrentPage(1);
    setPageSize(defaultPageSize); // Assuming you have a defaultPageSize constant or variable
    fetchData(1, defaultPageSize);
  };
  
  const handleClearFilters = () => {
    setFilters(initialFilters);
    setPlaceholderValues({
      role: "Filter by Role",
      designation: "Filter by Designation",
    });
    setSelectedRows([]);
    setIsFilterActive(false);
    setSelectedRole(null);
  };
  
  const exportToExcel = () => {
    try {
      const dataToExport = selectedEmployeeDataForExport.length > 0 ? selectedEmployeeDataForExport : filteredData;
      const header = Object.keys(dataToExport[0]);
      const data = dataToExport.map((row) => header.map((fieldName) => row[fieldName]));
  
      const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([header, ...data]);
      const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
      saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };
  
  const exportMenu = (
    <Menu onClick={(e) => handleExportOption(e.key as string)}>
      <Menu.Item key="selectedData">Export</Menu.Item>
      <Menu.Item key="all">Export All</Menu.Item>
    </Menu>
  );
  const handleExportOption = (key: string) => {
    if (key === 'all' || selectedEmployeeDataForExport.length === 0) {
      // Notify if no rows are selected
      if (selectedRows.length === 0) {
        message.warning('Please select rows to export.');
        return;
      }
      // Proceed with export
      exportToExcel();
    } else {
      exportToExcel();
    }
  };
  
  const exportCSV = (data: User[]) => {
    const filename = `employee_data_${moment().format(
      "YYYY-MM-DD_HH-mm-ss"
    )}.csv`;
    const csvLink = document.createElement("a");
    const csv = data.map((item) => Object.values(item).join(",")).join("\n");
    csvLink.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    csvLink.download = filename;
    csvLink.click();
  };

  const handleImportOption = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const fileInput = e.target;
//   const files = fileInput.files;

//   if (files && files.length > 0) {
//     console.log("one");
//     const file = files[0];

//     // Check if the file is of the expected type (Excel)
//     if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//       console.log("two");
//       try {
//         console.log("three");
//         const arrayBuffer = await readFileAsync(file);
//         const data = new Uint8Array(arrayBuffer);
//         console.log("data", data);

//         // Assuming XLSX format for simplicity
//         const workbook = XLSX.read(data, { type: 'array' });
//         console.log("workbook", workbook);

//         // Assuming the first sheet is the relevant data
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];

//         // Convert sheet data to JSON
//         const importedData: any[] = XLSX.utils.sheet_to_json(sheet, {
//           header: 1,
//         });

//         console.log("importedData", importedData);

//         // Convert the imported data to an object
//         const objectData: { [key: string]: any } = {};
//         const headers = importedData[0];

//         for (let i = 1; i < importedData.length; i++) {
//           const row = importedData[i];
//           const rowData: { [key: string]: any } = {};

//           for (let j = 0; j < headers.length; j++) {
//             // Check if the value is not undefined before adding it to the object
//             if (row[j] !== undefined) {
//               rowData[headers[j]] = row[j];
//             }
//           }

//           // Check if the row has any defined values before adding it to the object
//           if (Object.values(rowData).some((value) => value !== undefined)) {
//             objectData[`row${i}`] = rowData;
//           }
//         }

//         console.log("objectData", objectData);

//         // Store the object data in an array
//         const dataArray = Object.values(objectData);

//         // Check if the filtered data has rows
//         if (dataArray.length > 0) {
//           console.log("four");
//           // Update the local storage or state with the filtered data
//           localStorage.setItem('users', JSON.stringify(dataArray));
//           setUsers(dataArray);
//           message.success('Data imported successfully!');
//         } else {
//           console.log("five");
//           message.warning('No valid data found in the imported file.');
//         }
//       } catch (error) {
//         console.log("six");
//         console.error('Error reading file:', error);
//         message.error('Error reading file. Please try again.');
//       } finally {
//         console.log("seven");
//         // Clear the file input value
//         fileInput.value = '';
//       }
//     } else {
//       console.log("eight");
//       console.error('Invalid file type. Please select a valid Excel file.');
//       message.error('Invalid file type. Please select a valid Excel file.');
//     }
//   }
// };

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const fileInput = e.target;
  const files = fileInput.files;

  if (files && files.length > 0) {
    const file = files[0];

    // Check if the file is of the expected type (Excel)
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      try {
        const arrayBuffer = await readFileAsync(file);
        const data = new Uint8Array(arrayBuffer);

        // Assuming XLSX format for simplicity
        const workbook = XLSX.read(data, { type: 'array' });

        // Assuming the first sheet is the relevant data
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet data to JSON
        const importedData: any[] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
        });

        // Convert the imported data to an object
        const objectData: { [key: string]: any } = {};
        const headers = importedData[0];

        for (let i = 1; i < importedData.length; i++) {
          const row = importedData[i];
          const rowData: { [key: string]: any } = {};

          for (let j = 0; j < headers.length; j++) {
            // Check if the value is not undefined before adding it to the object
            if (row[j] !== undefined) {
              rowData[headers[j]] = row[j];
            }
          }

          // Check if the row has any defined values before adding it to the object
          if (Object.values(rowData).some((value) => value !== undefined)) {
            objectData[`row${i}`] = rowData;
          }
        }

        // Store the object data in an array
        const dataArray = Object.values(objectData);

        // Merge the imported data with the existing users
        const mergedData = [...users, ...dataArray];

        // Update the local storage or state with the merged data
        localStorage.setItem('users', JSON.stringify(mergedData));
        setUsers(mergedData);
        message.success('Data imported successfully!');
      } catch (error) {
        console.error('Error reading file:', error);
        message.error('Error reading file. Please try again.');
      } finally {
        // Clear the file input value
        fileInput.value = '';
      }
    } else {
      console.error('Invalid file type. Please select a valid Excel file.');
      message.error('Invalid file type. Please select a valid Excel file.');
    }
  }
};

  
  const readFileAsync = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject(new Error('Failed to read file.'));
        }
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsArrayBuffer(file);
    });
  };
  


  const filterOptions = (
    <>
      <div
        style={{
          marginBottom: 16,
          marginTop: 15,
          display: "flex",
          justifyContent:'space-between'
          
        }}
      >
        <div
            // style={{
            //   marginTop: "-48px",
            //   display: "flex",
            //   alignItems: "center",
            //   justifyContent: "flex-end",
            //   marginLeft: "1110px",
            // }}
        >
          <Input
            className="search"
            placeholder="Search by Name or ID"
            allowClear
            suffix={<SearchOutlined style={{ color: "#04172480" }} />}
            onChange={(e: any) => handleSearchInputChange(e.target.value)}
            style={{marginLeft:'20px'}}
          />
        </div>
        <div>
          <Select
            showSearch
            style={{ width: 200, marginRight: 8,height:40 }}
            placeholder={placeholderValues.role}
            onChange={(value) => {
              handleFilterChange("role", value);
              setSelectedRole(value);
            }}
            value={selectedRole !== null ? selectedRole : undefined}
            virtual
            listHeight={200}
          >
            <Option value={null}>All Roles</Option>
            {uniqueRoles.map((role) => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            showSearch
            style={{ width: 200, marginRight: 8, height:40}}
            placeholder={placeholderValues.designation}
            onChange={(value) => handleFilterChange("designation", value)}
            value={filters.designation !== null ? filters.designation : []}
            virtual
            listHeight={150}
          >
            <Option value={null}>All Designations</Option>
            {selectedRole
              ? uniqueDesignations
                  .filter((designation) =>
                    employeeData.some(
                      (employee) =>
                        employee.role === selectedRole &&
                        employee.designation === designation
                    )
                  )
                  .map((designation) => (
                    <Option key={designation} value={designation}>
                      {designation}
                    </Option>
                  ))
              : uniqueDesignations.map((designation) => (
                  <Option key={designation} value={designation}>
                    {designation}
                  </Option>
                ))}
          </Select>
        </div>
        <div>
          <Button
            style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'65px', textAlign:"center", marginLeft:'20px', marginTop:'0px', paddingTop:'8px'}}
            className='regenerateactive'
            onClick={handleClearFilters}
          >
          Clear
          </Button>
        </div>
        <div style={{marginRight:'20px'}}>
          <Dropdown overlay={exportMenu} placement="bottomLeft">
            <Button
              type="primary"
              style={{ marginLeft: "8px", height: "40px", width:'75px'}}
            >
              Export
            </Button>
          </Dropdown>
        </div>
        <div style={{ marginRight: '20px' }}>
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          accept=".xlsx, .xls"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <Button
          type="primary"
          style={{ marginLeft: '8px', height: '40px', width: '75px' }}
          onClick={handleImportOption}
        >
          Import
        </Button>
      </div>
      </div>
    </>
  );
  const handleRowSelection = (selectedRowKeys: React.Key[]) => {
    const selectedRowKeysString = selectedRowKeys
      .filter((key) => key !== undefined && key!==null)  // Filter out undefined values
      .map((key) => key.toString());
      console.log("selectedRowKeysString", selectedRowKeysString);
    const selectedEmployees = users.filter((employee) =>
      selectedRowKeysString.includes(employee.userId)
    );
    
    setSelectedEmployeeDataForExport(selectedEmployees);
    setSelectedRows(selectedRowKeysString);
    //setHideExport(selectedRowKeys.length === 0);
  };
  
  const handleRowClick = (record: User, index: number) => {
    if (!viewModalVisible) {
      const userPath = `/userprofile/${record.userId}`;
    // Navigate to the user profile page
    navigate(userPath);
    }
  };

  // const handlePageSizeChange = (current: number, size: number) => {
  //   console.log("current",current,size)
  //   const pageSizeValue = size ? totalItemCount : size;
  //   console.log("pagesizevalue",pageSizeValue);
  //   setPageSize(size);
  //   console.log(size);
  //   const newPage = size ? current : 1;
  //   console.log("newpage",newPage)
  //   setCurrentPage(newPage);
  //   fetchData(newPage, pageSizeValue);
  // };

  // const handlePageSizeChange = (current: number, size: number) => {
  //   const newPageSize = size === 50 ? size : Number(size);
  //   const newPage = size === pageSize ? current : 1;
  //   setCurrentPage(newPage);  // Move this line up
  //   setPageSize(newPageSize);
    
  
  //   fetchData(newPage, newPageSize);
  // };

  
  // const paginationOptions: any = {
  //   showSizeChanger: true,
  //   defaultPageSize: 5,
  //   pageSizeOptions: ["5", "10", "20", "50"],
  //   onChange: handlePageSizeChange,
  //   onShowSizeChange: handlePageSizeChange,
  // };


  const handleCreateUserClick = () => {
    // Navigate to the "/createuser" route
    navigate('/createuser');
  };


  // Remove the existing paginationOptions object

  const handlePaginationChange = (page: number, pageSize?: number) => {
    console.log("pagination change", page, pageSize);
    setCurrentPage(page);
    setPageSize(pageSize || 50);
    fetchData(page, pageSize || 50);
  };
  

// const handlePageSizeChange = (current: number, size: number) => {
//   setCurrentPage(1);  // Reset to the first page when changing pageSize
//   setPageSize(size);
//   fetchData(1, size);
// };
const handlePageSizeChange = (current: number, size: number) => {
  console.log("handlePageSizeChange", current, size);
    const newPageSize = size === 50 ? size : Number(size);
    const newPage = size === pageSize ? current : 1;
    setCurrentPage(newPage);  
    setPageSize(newPageSize);
    
  
    fetchData(newPage, newPageSize);
  };
const paginationOptions: any = {
  total: totalItemCount,
  current: currentPage,
  pageSize: pageSize || defaultPageSize, // Use defaultPageSize if pageSize is not set
  showSizeChanger: true,
  pageSizeOptions: ["5", "10", "20", "50"],
  // onChange: handlePaginationChange,
  // onShowSizeChange: handlePageSizeChange,
  onChange: handlePageSizeChange,
  onShowSizeChange: handlePageSizeChange,
};


  const columns: ColumnsType<User> = [
    {
        title: 'Sl.no',
        sorter: (a: User, b: User) => {
          // Check if a.slNo and b.slNo are defined before comparison
          if (a.slNo !== undefined && b.slNo !== undefined) {
            return a.slNo - b.slNo;
          }
          // Handle the case where slNo is undefined for one or both users
          return 0;
        },
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
    },
    {
      title: "Employee",
      dataIndex: "userId",
      sorter: (a: User, b: User) =>
        a.name.localeCompare(b.name),
      width: 450,
      render: (_, employee) => (
        <Space className="flex gap-5">
            <Avatar icon={<UserOutlined />} size={45} />
          <div>
            <div>
              <strong>
                {employee.name}
              </strong>
            </div>
            <div>{employee.userId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      width: 500,
      sorter: (a: User, b: User) =>
        a.role.localeCompare(b.role),
      dataIndex: "role",
      key: "role",
      fixed: "left",
    },
    {
        title: "Email",
        width: 350,
        sorter: (a: User, b: User) =>
          a.email.localeCompare(b.email),
        dataIndex: "email",
        key: "email",
        fixed: "left",
      },
    {
      title: "Designation",
      width: 350,
      sorter: (a: User, b: User) =>
        a.designation.localeCompare(b.designation),
      dataIndex: "designation",
      key: "designation",
      fixed: "left",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 150,
      fixed: "right",
      render: (_, user) => (
        <Space>
          {/* Add the "View" button with Link to navigate to /userprofile */}
          <Link to={`/userprofile/${user.userId}`}>
            <Button type="primary" icon={<InfoCircleOutlined />} title="View" />
          </Link>
        </Space>
      ),
    },
  ];
  return (
    <DashboardLayout>
      <p>Admin &gt; Timesheet Management &gt; User Details</p>
      <div className='createuser-main'>
        <div className='userdetails'> 
          <div>
            <h1>User Details</h1>
          </div>
        <div className='button'>
            <button type='button' id='userdetails-submit' onClick={handleCreateUserClick}>
              Create User
            </button>
        </div>
      </div>
      {filterOptions}
      <>
      <Table 
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRows,
            onChange: handleRowSelection,
          }}
          
          columns={columns}
          dataSource={filteredData}
          onRow={(record, index: any) => ({
            onClick: () => handleRowClick(record, index),
          })}
          pagination={false}
        />
        <Pagination {...paginationOptions} style={{ margin: '10px 20px ', textAlign: 'right' }} />
        </>
    </div>
    </DashboardLayout>
  );
};

export default UserDetails;
