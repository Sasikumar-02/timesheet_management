import React,{useEffect, useState, useRef} from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table'
import { EditOutlined, FolderViewOutlined} from '@ant-design/icons';
import { Progress, notification } from 'antd';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import '../Styles/ApprovalRequest.css';
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
import * as ExcelJS from 'exceljs';
import { ExpandableConfig } from 'antd/lib/table/interface';
import 'moment/locale/en-in';
import {
  UserOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Task, DateTask } from '../Employee/AddTask';
import { groupBy } from 'lodash';
import { ConstructionOutlined, RecordVoiceOver } from '@mui/icons-material';
import { TableRowSelection } from 'antd/lib/table/interface';
import { RequestedOn } from '../Employee/AddTask';
import type { ThemeConfig } from "antd";
import { theme } from "antd";
import api from '../../Api/Api-Service';
import { DatePicker } from 'antd';
import moment, { Moment } from 'moment';
import { saveAs } from 'file-saver';
const {Option}= Select;
const config: ThemeConfig = {
  token: {
    colorPrimary: "#0B4266",
    colorPrimaryBg: "white",
  },
};

export interface TaskObject {
  [date: string]: DateTask
}

export interface SetGroupedTasks{
  [key: string]: GroupedTasks
}
export interface UserGroupedTask {
  [userId: string]: SetGroupedTasks;    
}
export interface GroupedTasks {
  uniqueRequestId: string[];
  slNo?: number;
  employeeName: string;
  employeeId: string;
  month: string;
  daysRequested: string;
  totalDays: number;
  daysFilled: number;
}

const ApprovalRequest:React.FC = () => { 
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const year = queryParams.get('year');
  const month = queryParams.get('month');
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedInnerRows, setSelectedInnerRows] = useState<string[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [expandedInnerRow, setExpandedInnerRow] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<JSX.Element | null>(null);
  const [exportMonthName, setExportMonthName]= useState<string|undefined>(undefined);
  const [comments, setComments] = useState('');
  const [commentVisible, setCommentVisible] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<DateTask[]>([]);
  const [monthTasks, setMonthTasks] = useState<TaskObject[]>([]);
  const [userTasks, setUserTasks]= useState<GroupedTasks[]>([]);
  const currentYear = year? year:  new Date().getFullYear();
  const currentMonth = month? month: new Date().toLocaleDateString('default', { month: 'long' });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const getMonths = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1);
      return {
        value: i + 1,
        label: date.toLocaleDateString('default', { month: 'long' })
      };
    });
  };

  const getYears = () => {
    const startYear = parseInt(currentYear as string, 10) - 50; 
    const endYear = parseInt(currentYear as string, 10) + 50; 
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
};


  const months = getMonths();
  const years = getYears();

  const handleMonthChange = (value:any) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value:any) => {
    setSelectedYear(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/v1/timeSheet/fetch-requests-by-reportingTo', {
          params: {
            month: selectedMonth,
            year: selectedYear
          }
        });
        setUserTasks(response?.data?.response?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleClearFilters = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };

  const fetchTaskByUniqueId = async (uniqueRequestIds: any[]) => {
    try {
            const response = await api.post(`/api/v1/timeSheet/fetch-tasks-by-uniqueIds`,{
              uniqueRequestIds:uniqueRequestIds
            });
            return response?.data?.response?.data;
    } catch (error:any) {
        console.error('Error fetching data by unique IDs:', error);
        //throw error; 
        notification.error({
          message:error?.response?.data?.action,
          description: error?.response?.data?.message
        })
    }
};
const exportToExcel = async () => {
  try {
    let workbook = new ExcelJS.Workbook();
    if (selectedRows?.length > 0) {
      let finalIds: any[] = [];
      selectedRows.forEach((ids: any) => {
        ids.forEach((id: any) => {
          finalIds.push(id);
        });
      });
      const fetchedData = await fetchTaskByUniqueId(finalIds);
      Object.entries(fetchedData).forEach(([employeeId]) => {
        let employeeName = fetchedData[employeeId].employeeName;
        let tasks = fetchedData[employeeId].tasks; 

        const worksheet = workbook.addWorksheet(`${employeeName}-${employeeId}`);
        worksheet.views = [{ showGridLines: false }];
      
        const header = [
          'Date',
          'Work Location',
          'Task',
          'Project',
          'Start Time',
          'End Time',
          'Shift Hours',
          'Description',
          'Reporting To',
        ];

        worksheet.views = [{
          showGridLines: false
      }];
      const timesheetRow = worksheet.addRow(['TimeSheet']);
      timesheetRow.font = { bold: true, size: 24, color: { argb: 'FFFFFF' } };
      timesheetRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '0B4266' }
      };
      const nameRow = worksheet.addRow([]);
      nameRow.getCell(1).value = 'Name:';
      nameRow.getCell(1).font = { bold: true }; 
      nameRow.getCell(2).value = employeeName;
      const userIdRow = worksheet.addRow([]);
      userIdRow.getCell(1).value = 'UserID:';
      userIdRow.getCell(1).font = { bold: true }; 
      userIdRow.getCell(2).value = employeeId;

      const monthRow = worksheet.addRow([]);
      monthRow.getCell(1).value = 'Month:';
      monthRow.getCell(1).font = { bold: true }; 
      monthRow.getCell(2).value = selectedMonth+' '+selectedYear; 
      for (let i = 0; i < 1; i++) {
          worksheet.addRow([]);
      }
        const headerRow = worksheet.addRow(header);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0B4266' } };
        });
        tasks.forEach((rowData: any) => {
          const dataRow = worksheet.addRow([
            rowData.date || '',
            rowData.workLocation || '',
            rowData.task || '',
            rowData.project || '',
            rowData.startTime || '',
            rowData.endTime || '',
            rowData.totalHours || '',
            rowData.description || '',
            rowData.reportingTo || '',
          ]);
          dataRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
            cell.alignment = { horizontal: 'left' };
          });
        });
        worksheet.columns?.forEach((column, index) => {
          if (index < header.length) {
            column.width = 23;
          } else {
            column.hidden = true;
          }
        });
      });
      
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
    setSelectedRows([]);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};


  const handleReject = () => {
    setCommentVisible(true);
  };

  const handleCancel = () => {
    setCommentVisible(false);
  };

  const handleInputChange = (e:any) => {
    setComments(e.target.value);
  };

  const handleSubmit = () => {
    setCommentVisible(false);
  };
  
  function getDaysInMonth(month: number, year: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  const handleRowSelection = (selectedRowKeys:any, selectedRows:any) => {
    const uniqueRequestIds = selectedRows.map((row:any) => row.uniqueRequestId);
    setSelectedRows(uniqueRequestIds);
  };


  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: TaskObject[]) => {
      setSelectedInnerRows(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: TaskObject) => ({
      disabled: false, 
      key: record.key,
    }),
  }; 

  useEffect(() => {
    console.log("selectedInnerRows", selectedInnerRows);
  }, [selectedInnerRows]);

    const handleToggleRowExpand = (record: GroupedTasks, event: React.MouseEvent<HTMLElement>) => {
      setExpandedRow(prevExpandedRow => prevExpandedRow === record.month ? null : record.month);
      event.stopPropagation();
    };

    const handleToggleInnerRowExpand = (record: TaskObject) => {
      const taskKeys = Object.keys(record?.tasks);
      if (taskKeys.length > 0) {
        const firstTaskKey = taskKeys[0];
        setExpandedInnerRow(prevExpandedInnerRow => {
          if (prevExpandedInnerRow === firstTaskKey) {
            return null;
          } else {
            return firstTaskKey;
          }
        });
      }
    };
  
    const rowClassName = (record: GroupedTasks, index: number) => {
      return index % 2 === 0 ? 'even-row' : 'odd-row';
    };

    const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
      if (!dateData) return {}; 
      return dateData ;
    });

    const monthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
      const date = Object.keys(taskObject)[0]; 
      const { key, tasks } = taskObject[date];
      return { key, tasks, status: "Pending" }; 
  });
  
    const handleInnerRowSelection = (selectedRowKeys: React.Key[]) => {
      setSelectedInnerRows(selectedRowKeys as string[]);
    };

    const handleExportOption = async (key: string) => {
      try {
          if (key === 'all') {
              await exportToExcel();
          } else if (selectedRows?.length > 0) {
              await exportToExcel();
          } else {
              message.warning('Please select rows to export.');
          }
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
    
    const column: ColumnsType<DateTask> = [
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Select All</div>,
            dataIndex: 'date',
            key: 'date',
            width: '20%',
            fixed: 'left',
            render: (_, record: DateTask) => {
                const date = record.tasks.length > 0 ? record.tasks[0].date : '';
                return date;
            },
        },
        {
            title: '',
            dataIndex: 'tasks',
            key: 'tasks',
            width: '60%',
            render: (_, record: DateTask) => {
                let totalHours = 0;
                const taskHours: { [key: string]: number } = {};
                record.tasks.forEach(task => {
                    const totalHoursForTask = parseFloat(task.totalHours || '0');
                    totalHours += totalHoursForTask;
                    taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask;
                });
                const extraHours = totalHours > 9 ? totalHours - 9 : 0;
                return (
                    <div>
                        <ul style={{ display: 'flex', flexDirection: 'row', listStyle: 'none', padding: 0 }}>
                            {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                    <div style={{ paddingRight: '20px' }}>
                                        <div style={{ color: 'grey', paddingBottom: '5px' }}>
                                            {taskName}
                                        </div>
                                        <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
                                            {taskTotalHours}H
                                        </div>
                                    </div>
                                    <div>
                                        <Progress
                                            type="circle"
                                            percent={Math.round((taskTotalHours / 9) * 100)} 
                                            width={60}
                                        />
                                    </div>
                                </li>
                            ))}
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                <div style={{ color: '#0B4266', paddingRight: '20px' }}>
                                    Extra Hours
                                </div>
                                <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
                                    {extraHours.toFixed(2)}H
                                </div>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white', margin: '5px' }}>
                                <div style={{ color: '#0B4266', paddingRight: '20px' }}>
                                    Total Hours
                                </div>
                                <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
                                    {totalHours}H
                                </div>
                            </li>
                        </ul>
                    </div>
                );
            },
        },
        Table.EXPAND_COLUMN
    ];

    const innerColumn: ColumnsType<Task> = [
      {
        title: 'Sl.no',
        className: 'ant-table-column-title',
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
        render: (_, __, index) => <span>{index + 1}</span>,
      }, 
      {
        title: 'Work Location',
        //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
        dataIndex: 'workLocation',
        key: 'workLocation',
        fixed: 'left',
      }, 
      {
        title: 'Task',
        sorter: (a: Task, b: Task) => {
          return a.task.localeCompare(b.task);
        },
        dataIndex: 'task',
        key: 'task',
        fixed: 'left',
      },
      {
        title: 'Title',
        sorter: (a: Task, b: Task) => {
          return a.project.localeCompare(b.project);
        },
        dataIndex: 'task',
        key: 'task',
        fixed: 'left',
      },
      {
        title: 'Start Time',
        sorter: (a: Task, b: Task) => {
          return a.startTime.localeCompare(b.startTime);
        },
        dataIndex: 'startTime',
        key: 'startTime',
        fixed: 'left',
      },
      {
        title: 'End Time',
        sorter: (a: Task, b: Task) => {
          return a.endTime.localeCompare(b.endTime);
        },
        dataIndex: 'endTime',
        key: 'endTime',
        fixed: 'left',
      },
      {
        title: 'Total Hours',
        sorter: (a: Task, b: Task) => {
          return a.totalHours.localeCompare(b.totalHours);
        },
        dataIndex: 'totalHours',
        key: 'totalHours',
        fixed: 'left',
      },
      {
        title: 'Description',
        sorter: (a: Task, b: Task) => {
          return a.description.localeCompare(b.description);
        },
        dataIndex: 'description',
        key: 'description',
        fixed: 'left',
      },
    ];
    
    const columns: ColumnsType<GroupedTasks> = [
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>S.No</div>,
        className: 'ant-table-column-title',
        dataIndex: 'slNo',
        key: 'slNo',
        fixed: 'left',
        render: (_, __, index) => <span>{index + 1}</span>,
      },    
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Employee</div>,
        className: ' ant-table-column-title',
        dataIndex: "employeeId",
        render: (employeeId, record) => (
          <Space className="flex gap-5">
            <Avatar icon={<UserOutlined />} size={45} />
            <div>
              <div>
                <strong>{record.employeeName}</strong>
              </div>
              <div>{employeeId}</div>
            </div>
          </Space>
        ),
      },          
      {
        title:<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Month</div>,
        className: 'ant-table-column-title',
        dataIndex: 'month',
        key: 'month',
        fixed: 'left',
      },
      {
        title:<div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Requested Days</div>,
        className: 'ant-table-column-title',
        dataIndex: 'daysRequested', 
        key: 'daysRequested',
        fixed: 'left',
      },     
      {
        title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Days Approved</div>,
        className: 'ant-table-column-title',
        dataIndex: 'daysFilled',
        key: 'daysFilled',
        render: (daysFilled, record) => (
          <span>{`${daysFilled} / ${record.totalDays}`}</span>
        ),
      },    
      Table.EXPAND_COLUMN
    ];
    
  
    // const expandable: ExpandableConfig<GroupedTasks> = {
    //   expandedRowRender: (record: GroupedTasks) => {
    //     const taskHours: { [key: string]: number } = {};
    //     for (const dateKey in record.tasks) {
    //       record.tasks[dateKey].tasks.forEach(task => {
    //         if (taskHours.hasOwnProperty(task.task)) {
    //           taskHours[task.task] += parseFloat(task.totalHours || '0');
    //         } else {
    //           taskHours[task.task] = parseFloat(task.totalHours || '0');
    //         }
    //       });
    //     }
        
    //     // After calculating the total hours for each task, convert them to fixed decimals
    //     for (const taskName in taskHours) {
    //       if (taskHours.hasOwnProperty(taskName)) {
    //         taskHours[taskName] = parseFloat(taskHours[taskName].toFixed(2));
    //       }
    //     }
        
    //     const totalHours = Math.floor(Object.values(taskHours).reduce((acc, curr) => acc + curr, 0));
    //     const regularHours = Math.min(totalHours, 9);
    //     const extraHours = totalHours - regularHours;
    
    //     if (expandedRow === record.month) {
    //       return (
    //         <div>
    //           <ul style={{ display: 'flex', justifyContent: 'space-around', listStyle: 'none' }}>
    //             {Object.entries(taskHours).map(([taskName, taskTotalHours], index) => (
    //               <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //                 <div style={{ paddingRight: '20px' }}>
    //                   <div style={{ color: 'grey', paddingBottom: '5px' }}>
    //                     {taskName}
    //                   </div>
    //                   <div style={{ fontWeight: "bold", fontSize: '20px', color: 'black' }}>
    //                     {taskTotalHours}H
    //                   </div>
    //                 </div>
    //                 <div>
    //                   <Progress
    //                     type="circle"
    //                     percent={Math.round((taskTotalHours / 9) * 100)} // Ensure it's an integer
    //                     width={60}
    //                   />
    //                 </div>
    //               </div>
    //             ))}
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //               <div style={{ color: '#0B4266', paddingRight: '20px' }}>
    //                 Extra Hours
    //               </div>
    //               <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: "bold", fontSize: '20px' }}>
    //                 {extraHours}H
    //               </div>
    //             </div>
    //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid black', borderRadius: '20px', padding: '10px 20px', backgroundColor: 'white' }}>
    //               <div style={{ color: '#0B4266', paddingRight: '20px' }}>
    //                 Total Hours
    //               </div>
    //               <div style={{ border: '1px solid grey', backgroundColor: '#F5F7F9', padding: '20px 10px', borderRadius: '10px', color: '#0B4266', fontWeight: 'bold', fontSize: '20px' }}>
    //                 {totalHours}H
    //               </div>
    //             </div>
    //           </ul>
    //         </div>
    //       );
    //     }
    //     return null;
    //   },
    //   expandRowByClick: true,
    //   //expandIcon: () => null
    // }; 
    
    const handleRowClick = (
      record: TaskObject,
      formattedMonth: string,
      event: React.MouseEvent<HTMLElement>
    ) => {
      setModalContent(
        <div>
          <Table
                // rowSelection={{
                //     type: 'checkbox',
                //     selectedRowKeys: selectedInnerRows,
                //     onChange: handleInnerRowSelection
                // }}
                style={{
                    backgroundColor: 'white',
                    border: '1px solid grey',
                    borderRadius: '5px',
                }}
                columns={column} 
                rowClassName="rowstyle"
               // dataSource={monthTasksData}
                pagination={false}
                // expandable={{
                //     expandedRowRender: (record: DateTask) => {
                //         const handleInnerRowExpand = () => {
                //             return (
                //                 <Table
                //                     columns={innerColumn as ColumnsType<Task>}
                //                     dataSource={record.tasks} // Pass all tasks in the date as dataSource
                //                     pagination={false}
                //                 />
                //             );
                //         };
                        
                //         return (
                //             <>
                //                 {handleInnerRowExpand()}
                //             </>
                //         );
                //     },
                //     expandRowByClick: true,
                //     expandIcon: ({ expanded, onExpand, record }) =>
                //         expanded ? (
                //             <UpOutlined onClick={e => onExpand(record, e)} style={{float:'right'}} />
                //         ) : (
                //             <DownOutlined onClick={e => onExpand(record, e)} style={{float: 'right'}}/>
                //         ),
                // }}
                
                
            />
        </div>
      );
      setModalVisible(true);
      event.stopPropagation();
    };//not in use
     
  return (
    <ConfigProvider theme={config}>
      <div>
        <div style={{display:'flex', justifyContent:'space-between'}}>
        <div style={{display:'flex', justifyContent:'flex-start'}}>
            <Select
              style={{ width: 120, height:40, marginLeft:'20px' }}
              className='regenerateactive'
              placeholder="Select Month"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              {months.map(month => (
                <Option key={month.value} value={month.label}>
                  {month.label}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 80,height:40, marginLeft:'20px' }}
              className='regenerateactive'
              placeholder="Select Year"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {years.map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>

              <Button
             
                  style={{ height: 40, marginRight: "30px", borderRadius: "4px", width:'102px', textAlign:"center", marginLeft:'20px', marginTop:'20px', paddingTop:'8px'}}
                  className='regenerateactive'
                  onClick={handleClearFilters}
              >
              Clear Filter
              </Button>
          </div>
          <div style={{marginRight:'20px', marginTop:'25px'}}>
              <Dropdown overlay={exportMenu} placement="bottomLeft">
                <Button
                  type="primary"
                  style={{ marginLeft: "8px", height: "40px", width:'75px', background:'#0B4266', color:'white'}}
                >
                  Export
                </Button>
              </Dropdown>
          </div>
        </div>
         
          <Table
            rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedRows,
                onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
            }}
            style={{cursor:'pointer'}}
            onRow={(record: GroupedTasks) => ({
              onClick: (event: React.MouseEvent<HTMLElement>) => {
                const { uniqueRequestId, employeeId, month, employeeName } = record;
                setExportMonthName(month);
                const [monthName, year] = month.split(/\s+/);
                const monthNumber = moment().month(monthName).format('MMMM');
                const formattedMonth = `${monthNumber}-${year}`;
                navigate(`/manager/monthtasks?formattedMonth=${formattedMonth}&userId=${employeeId}`, {state: {
                  uniqueRequestId,
                  formattedMonth: month, 
                  employeeId: employeeId,
                  employeeName:employeeName
              }});
              },
            })}
            rowClassName={(record: GroupedTasks, index: number) =>
              index % 2 === 0 ? 'even-row' : 'odd-row'
            }
            className='custom-table'
            columns={columns}
           dataSource={userTasks}
            pagination={false}
            rowKey="uniqueRequestId" 

          />
        
      </div>
      {/* <Modal
        title={
          modalContent ? (
            <div>
              <Space className="flex gap-5">
                <Avatar icon={<UserOutlined />} size={45} />
                <div>
                  <div>
                    <strong>Sasi Kumar</strong>
                  </div>
                  {/* Displaying the userId 
                  <div>{selectedUserId}</div>
                </div>
              </Space>
            </div>
          ) : null
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="80%"
      >
        {modalContent}
        <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>
          <Button style={{width:'10%', backgroundColor:'green', color:'white'}}>Approve</Button>
          <Button style={{ width: '10%', backgroundColor: 'red', color: 'white' }} onClick={handleReject}>
            Reject
          </Button>
          <Modal
            title="Comments"
            className='modalTitle'
            visible={commentVisible}
            onCancel={handleCancel}
            footer={[
              <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white' }} key="submit" type="primary" onClick={handleSubmit}>
                Submit
              </Button>,
            ]}
          >
            <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
          </Modal>
        </div>
      </Modal> */}
    </ConfigProvider>
  );
  
}
export default ApprovalRequest
