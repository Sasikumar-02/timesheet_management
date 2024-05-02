  import React, { useState, useEffect, useRef } from 'react';
  import { useLocation, useNavigate, Link} from 'react-router-dom';
  import { EditOutlined, DeleteOutlined,CloseCircleOutlined,LeftOutlined, RightOutlined } from '@ant-design/icons';
  import '../Styles/CreateUser.css'
  import { User } from './CreateUser';
  import '../Styles/UserDetails.css';
  import '../Styles/AddTask.css'
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
    import '../Styles/Login.css';
    import { ThemeConfig } from 'antd/lib';
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

    const config: ThemeConfig = {
      token: {
        colorPrimary: "#0B4266",
        colorPrimaryBg: "#E7ECF0",
      },
    };

    const defaultPageSize = 5;

  const UserDetails:React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [employeeData, setEmployeeData]= useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [pageSize, setPageSize] = useState<number | "All">(defaultPageSize);
    const [totalItemCount, setTotalItemCount] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [searchText, setSearchText] = useState("");
    const initialFilters = {
      role: null,
      designation: null,
    };
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedDesignation, setSelectedDesignation]=useState<string | null>(null);
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [placeholderValues, setPlaceholderValues] = useState({
      role: "Filter by Role",
      designation: "Filter by Designation",
    });
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
      const storedUsersJSON = localStorage.getItem('users');
      const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      const usersWithSlNo = storedUsers.map((user:any, index:any) => ({
        ...user,
        slNo: index + 1,
      }));
      setUsers(usersWithSlNo);
    }, []);

    useEffect(() => {
      if (searchText.trim() !== "") {
        const filteredUsers = users.filter((user) =>
          user.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (typeof user.userId === 'string' && user.userId.toLowerCase().includes(searchText.toLowerCase())) ||
          user.email.toLowerCase().includes(searchText.toLowerCase())
        );
        setSearchResults(filteredUsers);
        console.log("useeffect search", filteredUsers);
      } else {
        setSearchResults([]);
        console.log("useeffect search", users);
      }
    }, [searchText, users]);

    const displayedData = searchResults.length > 0 ? searchResults : filteredData;
    

    useEffect(() => {
      console.log("useEffect");
      fetchData(currentPage, pageSize);
    }, [currentPage, pageSize, filters, searchText]);

    const handleSearchInputChange = (value: string) => {
      console.log("useeffect Search input value:", value); 
      setSearchText(value);
    };
    
    useEffect(() => {
      console.log("useEffect")
      fetchData(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const fetchData = async (pageNumber: number = 1, size: number | "All") => {
      if (isSubmitting) {
        return;
      }
    
      setIsSubmitting(true);
    
      try {
        const storedUsersJSON = localStorage.getItem('users');
        const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
        let filteredUsers = [...storedUsers];
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
        const startIndex = (pageNumber - 1) * (size === 'All' ? totalCount : size);
        const endIndex = size === 'All' ? totalCount : startIndex + size;
        console.log("start, end", startIndex, endIndex)
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

    const applyFilters = (pageNumber: number = 1, size: number | "All"=50) => {
      let filteredEmployees = [...users];
    
      if (filters.role) {
        filteredEmployees = filteredEmployees.filter(
          (employee) => employee.role === filters.role
        );
        console.log("filteredEmployees-role inside", filteredEmployees);
      }

      
    
      if (filters.designation) {
        filteredEmployees = filteredEmployees.filter(
          (employee) => employee.designation === filters.designation
        );
        console.log("filteredEmployees-designation inside", filteredEmployees);
      }
    
      console.log("filteredEmployees outside", filteredEmployees);

      const totalCount = filteredEmployees.length;
      const startIndex = (pageNumber - 1) * (size === 'All' ? totalCount : size);
      const endIndex = size === 'All' ? totalCount : startIndex + size;
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
      setFilters(updatedFilters);
      setCurrentPage(1);
      setPageSize(defaultPageSize);
      if (filterType === 'role') {
        setSelectedRole(value as string | null);
      }
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
      setSelectedDesignation(null);
    };
    
    const exportToExcel = () => {
      try {
          let dataToExport = selectedEmployeeDataForExport.length > 0 ? selectedEmployeeDataForExport : filteredData;
          
          if (selectedRows.length > 0) {
              dataToExport = dataToExport.filter((row) => selectedRows.includes(row.userId));
          }
  
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
      
        if (selectedRows.length === 0) {
          message.warning('Please select rows to export.');
          return;
        }
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
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    const files = fileInput.files;

    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        try {
          const arrayBuffer = await readFileAsync(file);
          const data = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const importedData: any[] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
          });
          const objectData: { [key: string]: any } = {};
          const headers = importedData[0];

          for (let i = 1; i < importedData.length; i++) {
            const row = importedData[i];
            const rowData: { [key: string]: any } = {};

            for (let j = 0; j < headers.length; j++) {
              if (row[j] !== undefined) {
                rowData[headers[j]] = row[j];
              }
            }
            if (Object.values(rowData).some((value) => value !== undefined)) {
              objectData[`row${i}`] = rowData;
            }
          }
          const dataArray = Object.values(objectData);
          const mergedData = [...users, ...dataArray];
          localStorage.setItem('users', JSON.stringify(mergedData));
          setUsers(mergedData);
          message.success('Data imported successfully!');
        } catch (error) {
          console.error('Error reading file:', error);
          message.error('Error reading file. Please try again.');
        } finally {
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

    const handleEditClick = (userId: string) => {
      const userData = users.find((user) => user.userId === userId);
      navigate(`/hr/createuser/${userId}`, { state: { userData } });
    };
  
    const handleDeleteClick = (userId: string) => {
      const storedUsersJSON = localStorage.getItem('users');
      const storedUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      const updatedUsers = storedUsers.filter((user: any) => user.userId !== userId);
      setUsers(updatedUsers);
     
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      message.success('User deleted successfully');
  };
  
  
    const filterOptions = (
      <>
        <div
          style={{
            marginBottom: 16,
            marginTop: 15,
            display: "flex",  
            flexDirection:'row',
            justifyContent:'space-between',
            marginRight:10
            
          }}
        >
          <div style={{display:'flex'}}>
            <div
                style={{
                  marginRight:10,
                  display: "flex",
                  alignItems: "center",
                  
                }}
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
                style={{ width: 200, marginRight: 8, height: 40 }}
                placeholder={placeholderValues.designation}
                onChange={(value) => {
                  handleFilterChange("designation", value)
                  setSelectedDesignation(value);
                }}
                value={selectedDesignation !== null ? selectedDesignation : undefined}
                virtual
                listHeight={150}
              >
                <Option value={null}>All Designations</Option>
                {/* Display all uniqueDesignations without filtering */}
                {uniqueDesignations.map((designation) => (
                  <Option key={designation} value={designation}>
                    {designation}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Button
                style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'80%', textAlign:"center", marginTop:'0px', paddingTop:'8px', marginLeft:'5px'}}
                className='regenerateactive'
                onClick={handleClearFilters}
              >
              Clear Filters
              </Button>
            </div>
          </div>
          <div style={{display:'flex'}}>
            <div style={{marginRight:'20px'}}>
                <Dropdown overlay={exportMenu} placement="bottomLeft">
                  <Button
                    type="primary"
                    style={{ marginLeft: "8px", height: "40px", width:'75px', background:'#0B4266', color:'white'}}
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
                style={{ marginLeft: '8px', height: '40px', width: '75px', background:'#0B4266', color:'white' }}
                onClick={handleImportOption}
              >
                Import
              </Button>
            </div>
        </div>
          
        
        </div>
        
      </>
    );

    const handleRowSelection = (selectedRowKeys: React.Key[]) => {
      setSelectedRows(selectedRowKeys as string[]);
      console.log("handleRowSelection", selectedRowKeys);
  };

    
    const handleRowClick = (record: User) => {
      if (!viewModalVisible) {
        const userPath = `/hr/userprofile/${record.userId}`;
      navigate(userPath);
      }
    };

    
    const handleCreateUserClick = () => {
      navigate('/hr/createuser');
    };
   const handlePaginationChange = (page: number, pageSize?: number) => {
      console.log("pagination change", page, pageSize);
      setCurrentPage(page);
      setPageSize(pageSize || 50);
      fetchData(page, pageSize || 50);
    };


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
      pageSize: pageSize || defaultPageSize,
      showSizeChanger: true,
      pageSizeOptions: ["5", "10", "20", "50"],
      onChange: handlePageSizeChange,
      onShowSizeChange: handlePageSizeChange,
    };
    


    const columns: ColumnsType<User> = [
      {
          title: 'Sl.no',
          sorter: (a: User, b: User) => {
          
            if (a.slNo !== undefined && b.slNo !== undefined) {
              return a.slNo - b.slNo;
            }
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
        // sorter: (a: User, b: User) =>
        //   a.role.localeCompare(b.role),
        dataIndex: "role",
        key: "role",
        fixed: "left",
      },
      {
          title: "Email",
          width: 350,
          // sorter: (a: User, b: User) =>
          //   a.email.localeCompare(b.email),
          dataIndex: "email",
          key: "email",
          fixed: "left",
        },
      {
        title: "Designation",
        width: 350,
        // sorter: (a: User, b: User) =>
        //   a.designation.localeCompare(b.designation),
        dataIndex: "designation",
        key: "designation",
        fixed: "left",
      },
      {
        title: "Reporting To",
        width: 350,
        // sorter: (a: User, b: User) =>
        //   a.reportingTo.localeCompare(b.reportingTo),
        dataIndex: "reportingTo",
        key: "reportingTo",
        fixed: "left",
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record, index) => {
          return (
            <div onClick={(event) => event.stopPropagation()}>
                <EditOutlined
                    onClick={() => handleEditClick(record.userId)}
                    style={{ marginRight: "8px", cursor: "pointer", color: "blue", fontSize: "20px" }}
                />
                <DeleteOutlined
                    onClick={() => handleDeleteClick(record.userId)}
                    style={{
                        cursor: "pointer",
                        color: "red",
                        fontSize: "20px",
                    }}
                />

            </div>
          );
        },
      }    
    ];

    useEffect(() => {
    console.log("useEffect search 1", filteredData); 
  }, [filteredData]);

    
    return (
      <ConfigProvider theme={config}>
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
            className='addtask-table'
            columns={columns}
            dataSource={displayedData}
            onRow={(record, index: any) => ({
              onClick: (event) => {
                  handleRowClick(record);
              },
            })}
            pagination={{...paginationOptions, pageSize:pageSize}}
          />
          {/* <Pagination {...paginationOptions} style={{ margin: '10px 20px ', textAlign: 'right' }} /> */}
          </>
      </div>
      </ConfigProvider>
    );
  };

  export default UserDetails;
