import React,{useState, useEffect, SetStateAction} from 'react'
import ReactDOM  from 'react-dom';
import moment from 'moment'
import isEqual from 'lodash/isEqual';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
    ArrowLeftOutlined
} from "@ant-design/icons";
import { Doughnut } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import dayjs from 'dayjs';
import {Button, Modal, Progress, Input, Space, Avatar, Select, ConfigProvider , message, Menu, notification} from 'antd';
import { Tooltip as AntdTooltip } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid,Tooltip, Legend, ResponsiveContainer, ReferenceLine , Label, PieChart, Cell} from 'recharts';
import { ColumnsType } from 'antd/es/table'
import { Table, Dropdown } from 'antd'
import { TaskObject } from './ApprovalRequest';
import { Task } from '../Employee/AddTask'
import ApprovalRequest from './ApprovalRequest';
import '../Styles/ApprovalRequest.css';
import '../Styles/AddTask.css';
import '../Styles/CreateUser.css'
import type { ThemeConfig } from "antd";
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { theme } from "antd";
import { DateTask } from '../Employee/AddTask';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb } from 'pdf-lib';
import { toPng } from 'html-to-image';
import * as ExcelJS from 'exceljs';
import api from '../../Api/Api-Service';
export interface SelectedKeys {
    [userId: string]: string[];
}

export interface RecentRejected {
    date: string;
    comment: string;
}
export interface RejectedKeys {
    [userId: string]: RecentRejected[];
}


const config: ThemeConfig = {
    token: {
      colorPrimary: "#0b4266",
      colorPrimaryBg: "white",
      colorFillAlter: "rgba(231, 236, 240, 0.3)",
      colorPrimaryBgHover: "white",
      borderRadiusLG: 4,
      colorFill: "#0b4266",
      colorBgContainerDisabled: "rgba(0, 0, 0, 0.04)",
    },
  };

  interface ChartOptions {
    labels: string[];
    colors: string[];
    chart?: {
        type?: 'pie' | 'area' | 'line' | 'bar' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
    };
}

    interface ChartImage {
        name: string;
        data: string;
    }
    
    
const MonthTasks: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [statuses, setStatuses]= useState<boolean>(false);
    const {Option}= Select
    const { uniqueRequestId, employeeId, formattedMonth, employeeName } = location.state;
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [projectTotalHours, setProjectTotalHours]=useState<any[]>([]);
    const [learningTotalHours, setLearningTotalHours]=useState<any[]>([]);
    const [trainingTotalHours, setTrainingTotalHours]=useState<any[]>([]);
    const [interviewTotalHours, setInterviewTotalHours]=useState<any[]>([]);
    const [overallTotalHours, setOverallTotalHours]=useState<any[]>([]);
    const [extraTotalHours, setExtraTotalHours]=useState<any[]>([]);
    const [meetingTotalHours, setMeetingTotalHours]=useState<any[]>([]);
    const [isDelayed, setIsDelayed]=useState<any[]>([]);
    const [overallData, setOverallData] = useState<any[]>([]);
    const [pieChartData, setPieChartData]= useState({
        Learning: 0,
        Meeting: 0,
        Training: 0,
        Project: 0,
        Interview:0
    })
    const [doughChartData, setDoughChartData]= useState({
        ClientLocation: 0,
        Office: 0,
        OnDuty: 0,
        WorkFromHome: 0
    })
    const statusOptions = ['Pending', 'Approved', 'Rejected'];
    const initialFilters = {
        status: null
      };
      const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
      const [isFilterActive, setIsFilterActive] = useState(false);
      const [filters, setFilters] = useState(initialFilters);
      const [placeholderValues, setPlaceholderValues] = useState({
        status: "Filter by Role",
      });
    const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [clickedRecord, setClickedRecord] = useState<any>();
    const [chartImages, setChartImages] = useState<ChartImage[]>([]);
    const [chartSeries, setChartSeries] = useState<number[]>([]);
    const [monthTasks, setMonthTasks] = useState<any[]>([]);
    const CustomTooltip = ({ active, payload }: { active: boolean, payload: any[] }) => {
        if (active && payload && payload.length) {
          const { date } = payload[0].payload;
          const isdelayed = isDelayed.includes(date);
      
          return (
            <div style={{ backgroundColor: isdelayed ? 'orange' : 'transparent', padding: '5px' }}>
              {isdelayed && <span>You submitted the task after the deadline</span>}
            </div>
          );
        }
      
        return null;
      };
const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
          position: 'right' as 'right', 
          align: 'center' as 'center', 
        },
        tooltip: { 
            enabled: true, 
            backgroundColor: "white",
            titleColor: "#042a0b", 
            bodyColor: "#042a0b", 
            titleFont: { weight: 'bold' as 'bold' },
            padding: 10, 
            cornerRadius: 10, 
            borderColor: "#042a0b", 
            borderWidth: 2, 
            xAlign: "left" as "left", 
        },
      },
    width: 200,
    height: 300,
  };

  const data = {
    labels: Object.keys(doughChartData),
    datasets: [
      {
        data: Object.values(doughChartData),
        backgroundColor: [
            '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'
        ],
      },
    ],
  };

  const pieData = {
    labels: Object.keys(pieChartData),
    datasets: [{
        data: Object.values(pieChartData),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#9C27B0']
    }]
};
  

  useEffect(() => {
    const [monthName, year] = formattedMonth.split(/\s+/);
    fetchPieReport(monthName, year, employeeId);
    fetchDoughReport(monthName, year, employeeId);
}, [formattedMonth, employeeId, monthTasks]);



const fetchPieReport=async(month:any, year:any, employeeId:any)=>{
    try{
        const response = await api.get('/api/v1/timeSheet/monthly-task-distribution',{
        params:{
            month,
            year,
            employeeId
        } 
    })
    setPieChartData(response?.data?.response?.data?.categoryPercentages);
    }
    catch(error:any){
       // throw error;
       notification.error({
        message:error?.response?.data?.action,
        description: error?.response?.data?.message
      })
    }  
}

const fetchDoughReport=async(month:any, year:any, employeeId:any)=>{
    try{
        const response = await api.get('/api/v1/timeSheet/monthly-location-distribution',{
        params:{
            month,
            year,
            employeeId
        } 
    })
    setDoughChartData(response?.data?.response?.data?.locationPercentages);
    }
    catch(error:any){
        //throw error;
        notification.error({
            message:error?.response?.data?.action,
            description: error?.response?.data?.message
          })
    }  
}
    useEffect(() => {
        if (uniqueRequestId && Array.isArray(uniqueRequestId)) {
          const fetchData = async () => {      
            try {
              const response = await api.post("/api/v1/timeSheet/fetch-day-task-by-reportingTo",{
                 uniqueRequestIds: uniqueRequestId
              });
              let taskDelayed:any[] =[];
              response?.data?.response?.data?.map((task:any)=>{
                if(task?.delayed){
                    taskDelayed.push(task?.date);
                }
            })
            setIsDelayed(taskDelayed);
              setMonthTasks(response?.data?.response?.data);
            } catch (error:any) {
              notification.error({
                message:error?.response?.data?.action,
                description: error?.response?.data?.message
              })
            }
          };
          
          fetchData();
        }
      }, [statuses]);
      

    // useEffect(() => {
    //     preparePieChartImage();
    //     prepareLineChartImage();
    // }, [monthTasks]);

    // const preparePieChartImage = () => {
    //     // Your pie chart logic to render on a canvas
    //     const chartCanvas = document.getElementById('pie-chart-container') as HTMLCanvasElement;
    //     if (chartCanvas) {
    //         html2canvas(chartCanvas).then(canvas => {
    //             const imageData = canvas.toDataURL('image/png');
    //             setChartImages(prevImages => [...prevImages, { name: 'PieChart.png', data: imageData }]);
    //         });
    //     }
    // };

    // const prepareLineChartImage = () => {
    //     // Your line chart logic to render on a canvas
    //     const chartCanvas = document.getElementById('line-chart-container') as HTMLCanvasElement;
    //     if (chartCanvas) {
    //         html2canvas(chartCanvas).then(canvas => {
    //             const imageData = canvas.toDataURL('image/png');
    //             setChartImages(prevImages => [...prevImages, { name: 'LineChart.png', data: imageData }]);
    //         });
    //     }
    // };
   
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; 
    
    const exportCharts = (): Promise<{ pieChartImage: string; lineChartImage: string }> => {
        return new Promise((resolve, reject) => {
            const pieChartContainer = document.getElementById('pie-chart-container') as HTMLCanvasElement;
            const lineChartContainer = document.getElementById('line-chart-container') as HTMLCanvasElement;
            const pieChartPromise = html2canvas(pieChartContainer, { backgroundColor: '#ffffff' }); 
            const lineChartPromise = html2canvas(lineChartContainer, { backgroundColor: '#ffffff' }); 
            Promise.all([pieChartPromise, lineChartPromise])
                .then(([pieCanvas, lineCanvas]) => {
                    const pieChartImage = pieCanvas.toDataURL('image/png');
                    const lineChartImage = lineCanvas.toDataURL('image/png');
                    resolve({ pieChartImage, lineChartImage });
                })
                .catch(error => {
                    reject(error); 
                });
        });
    };    
    
    
    const handleRowSelection = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        setSelectedRows(selectedRowKeys as string[]);
        const projectTotalHoursArray = selectedRows.map(row => row.projectTotalHours);
        const trainingTotalHoursArray = selectedRows.map(row => row.trainingTotalHours);
        const meetingTotalHoursArray = selectedRows.map(row => row.meetingTotalHours);
        const learningTotalHoursArray = selectedRows.map(row => row.learningTotalHours);
        const interviewTotalHoursArray = selectedRows.map(row => row.interviewTotalHours);
        const overallTotalHoursArray = selectedRows.map(row => row.overallTotalHours);
        const extraTotalHoursArray = selectedRows.map(row => row.extraTotalHours);
        
        setProjectTotalHours(projectTotalHoursArray);
        setTrainingTotalHours(trainingTotalHoursArray);
        setMeetingTotalHours(meetingTotalHoursArray);
        setLearningTotalHours(learningTotalHoursArray);
        setInterviewTotalHours(interviewTotalHoursArray);
        setOverallTotalHours(overallTotalHoursArray);
        setExtraTotalHours(extraTotalHoursArray);
    };
    

    const handleRowClick = (record: any) => {
        const uniqueRequestId = record.uniqueRequestId;
        fetchDataByUniqueId(uniqueRequestId);
        setModalVisible(true);
    };
    const fetchOverallDataByUniqueId = async () => {
        try {
            const newData: any[] = [];
            await Promise.all(
                uniqueRequestId.map(async (id: any) => {
                    const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${id}`);
                    newData.push(response.data.response.data);
                })
            );
            setOverallData(newData);
        } catch (error:any) {
           // throw error;
           notification.error({
            message:error?.response?.data?.action,
            description: error?.response?.data?.message
          })
        }
    };

    useEffect(() => {
        fetchOverallDataByUniqueId();
    }, [monthTasks]); 

    const fetchDataByUniqueId = async (uniqueRequestId: string) => {
        try {
            const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${uniqueRequestId}`);
            setClickedRecord(response?.data?.response?.data);
        } catch (error) {
            console.error('Error fetching data by unique ID:', error);
        }
    };

    const fetchTaskByUniqueId = async (uniqueRequestIds:any[]) => {
        try {
            const tasksPromises = uniqueRequestIds.map(async (uniqueRequestId) => {
                const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${uniqueRequestId}`);
                return response?.data?.response?.data;
            });
            const tasks = await Promise.all(tasksPromises);
            return tasks;
        } catch (error) {
            console.error('Error fetching data by unique IDs:', error);
            throw error;
        //    notification.error({
        //     message:error?.response?.data?.action,
        //     description: error?.response?.data?.message
          //}) 
        }
    };

    useEffect(() => {
        preparePieChartImage();
        prepareLineChartImage();
    }, [monthTasks]);

    const preparePieChartImage = () => {
        const chartCanvas = document.getElementById('pie-chart-container') as HTMLCanvasElement;
        if (chartCanvas) {
            html2canvas(chartCanvas).then(canvas => {
                const imageData = canvas.toDataURL('image/png');
                setChartImages(prevImages => [...prevImages, { name: 'PieChart.png', data: imageData }]);
            });
        }
    };

    const prepareLineChartImage = () => {
        const chartCanvas = document.getElementById('line-chart-container') as HTMLCanvasElement;
        if (chartCanvas) {
            html2canvas(chartCanvas).then(canvas => {
                const imageData = canvas.toDataURL('image/png');
                setChartImages(prevImages => [...prevImages, { name: 'LineChart.png', data: imageData }]);
            });
        }
    };
   
    
    const handleReject = () => {
        if(selectedRows.length>0){
            setCommentVisible(true);
        }
      };
    
      const handleCancel = () => {
        setCommentVisible(false);
        setComments(''); 
      };
    
      const handleInputChange = (e:any) => {
        setComments(e.target.value);
      };
    
      const handleSubmit = async () => {
        try {
          const payload = {
            approvalStatus: "Rejected",
            approvalComments: comments,
            uniqueRequestId: selectedRows, 
            learningTotalHours:learningTotalHours,
            meetingTotalHours: meetingTotalHours,
            projectTotalHours: projectTotalHours,
            interviewTotalHours: interviewTotalHours,
            trainingTotalHours: trainingTotalHours,
            overallTotalHours:overallTotalHours,
            extraTotalHours: extraTotalHours
          };
          const response = await api.put('/api/v1/timeSheet/timesheet-approval', payload); 
          notification.success({
            message:response?.data?.response?.action,
            description:response?.data?.message,
          })
          setStatuses(prev=>!prev);
          setCommentVisible(false);
          setComments('');
          setSelectedRows([]);
        } catch (error:any) {
          notification.error({
            message:error?.response?.data?.response?.action,
            description: error?.response?.data?.message
          })
        }
      };

      const handleApprove = async () => {
        try {
            if(selectedRows.length>0){
                const payload = {
                    approvalStatus: "Approved",
                    uniqueRequestId: selectedRows, 
                    learningTotalHours:learningTotalHours,
                    meetingTotalHours: meetingTotalHours,
                    projectTotalHours: projectTotalHours,
                    interviewTotalHours: interviewTotalHours,
                    trainingTotalHours: trainingTotalHours,
                    overallTotalHours:overallTotalHours,
                    extraTotalHours: extraTotalHours
                };
                
                const response = await api.put('/api/v1/timeSheet/timesheet-approval', payload);
                notification.success({
                    message:response?.data?.response?.action,
                    description:response?.data?.message,
                  })
                setStatuses(prev=>!prev);
                setSelectedRows([]);
                console.log("handleApprove",response?.data); 
            }
        } catch (error:any) {
            notification.error({
                message:error?.response?.data?.response?.action,
                description: error?.response?.data?.message
              })
        }
      };
    function formatDateToMonthYear(dateString: any) {
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        return `${monthName} ${year}`;
    }
    const exportToExcel = async () => {
        try {
            let imgId1: number;
            let imgId2: number;
            let dataToExport: any[] = [];
            if (selectedRows?.length > 0) {
                console.log("sleectedRows", selectedRows);
                let ids = monthTasks
                    .filter(row => selectedRows.includes(row.uniqueRequestId))
                    .map(row => row.uniqueRequestId);
                const fetchedData = await fetchTaskByUniqueId(ids);
                dataToExport = fetchedData.flat();
            } else {
                console.log("sleectedRows -1", overallData)
                dataToExport = overallData.flat();
            }
            const data = dataToExport.map((rowData: any) => {
                return [
                    rowData.date || '',         
                    rowData.workLocation || '',  
                    rowData.task || '',        
                    rowData.project || '',      
                    rowData.startTime || '',    
                    rowData.endTime || '',      
                    rowData.totalHours || '',  
                    rowData.description || '', 
                    rowData.reportingTo || ''  
                ];
            });      
            const header = ['Date', 'Work Location', 'Task', 'Project', 'Start Time', 'End Time', 'Shift Hours', 'Description', 'Reporting To'];         
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
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
            monthRow.getCell(2).value = formattedMonth; 
            for (let i = 0; i < 1; i++) {
                worksheet.addRow([]);
            }
            const { pieChartImage, lineChartImage } = await exportCharts();
            const currentRow = worksheet.rowCount + 2;
            const pieChartImageId = workbook.addImage({
                base64: pieChartImage.replace(/^data:image\/png;base64,/, ''),
                extension: 'png',
            });
    
            const lineChartImageId = workbook.addImage({
                base64: lineChartImage.replace(/^data:image\/png;base64,/, ''),
                extension: 'png',
            });
            worksheet.addImage(pieChartImageId, {
                tl: { col: 1, row: currentRow } as ExcelJS.Anchor, 
                br: { col: 4, row: currentRow + 13 }as ExcelJS.Anchor, 
            });
    
            worksheet.addImage(lineChartImageId, {
                tl: { col: 5, row: currentRow } as ExcelJS.Anchor, 
                br: { col: 8, row: currentRow + 13 } as ExcelJS.Anchor, 
            });
            const gridlineRow = worksheet.addRow(Array(header.length).fill('')); 
            gridlineRow.eachCell(cell => {
                cell.border = {
                    bottom: { style: 'thin' } 
                };
            });
            const headerRow = worksheet.addRow(header);
            headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }; 
            headerRow.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0B4266' } 
                };
            });
            data?.forEach(rowData => {
                const row = worksheet.addRow(rowData);
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
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
            const gridlineRowEnd = worksheet.addRow(Array(worksheet.columns?.length).fill('')); 
            gridlineRowEnd.eachCell(cell => {
                cell.border = {
                    bottom: { style: 'thin' } 
                };
            });
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
            setSelectedRows([]);
    
        } catch (error:any) {
          //  throw error
          notification.error({
            message:error?.response?.data?.action,
            description: error?.response?.data?.message
          })
        }
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
        } catch (error:any) {
           // throw error
           notification.error({
            message:error?.response?.data?.action,
            description: error?.response?.data?.message
          })
        }
    };    
    const exportMenu = (
        <Menu onClick={(e) => handleExportOption(e.key as string)}>
          <Menu.Item key="selectedData">Export</Menu.Item>
          <Menu.Item key="all">Export All</Menu.Item>
        </Menu>
      );

      const hoursDecimalToHoursMinutes = (decimalHours:any) => {
        // Split the decimal value into hours and minutes
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 100);
        console.log("hours minutes",hours, minutes)
        // Return the formatted string
        if(hours===0 && minutes===0){
            return '➖';
        }
        return `${hours}h ${minutes}min`;
    };

    const hoursTimeToHoursMinutes = (decimalHours: string) => {
        const [hoursStr, minutesStr] = decimalHours.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);
        if (hours === 0 && minutes === 0) {
            return '➖';
        }
        return `${hours}h ${minutes}min`;
      };

      const handleClearFilter = () => {
        setSelectedStatus(null); 
    };

  
    const column: ColumnsType<any> = [
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Date</div>,
            dataIndex: 'date',
            key: 'date',
            fixed: 'left',
            render: (_, record: any) => (
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>{record.date}</div>
                {isDelayed.includes(record.date) && (
                    <AntdTooltip title={"Delayed Submission"}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1.2em"
                            height="1.2em"
                            viewBox="0 0 24 24"
                            >
                            <path
                            fill="orange"
                            d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m3.55 13.8l-4.08-2.51c-.3-.18-.48-.5-.48-.85V7.75c.01-.41.35-.75.76-.75s.75.34.75.75v4.45l3.84 2.31c.36.22.48.69.26 1.05c-.22.35-.69.46-1.05.24"
                            ></path>
                        </svg>
                  </AntdTooltip>
                )}
                  
              </div>
              
            )
        },  
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Manager Assigned Task</div>,
            dataIndex: 'managerAssignedTotalHours',
            key: 'managerAssignedTotalHours',
            fixed:'left',
            render: (_, record) => {
                console.log('record-managerAssignedTask', record)
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.managerAssignedTotalHours)}
                    </div>
                );
            }
        },      
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project</div>,
            dataIndex: 'projectTotalHours',
            key: 'projectTotalHours',
            fixed:'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.projectTotalHours)}
                    </div>
                );
            }
        },
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Meeting</div>,
            dataIndex: 'meetingTotalHours',
            key: 'meetingTotalHours',
            fixed: 'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.meetingTotalHours)}
                    </div>
                );
            }
        },            
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Training</div>,
            dataIndex: 'trainingTotalHours',
            key: 'trainingTotalHours',
            fixed:'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.trainingTotalHours)}
                    </div>
                );
            }
        },
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Learning</div>,
            dataIndex: 'learningTotalHours',
            key: 'learningTotalHours',
            fixed: 'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.learningTotalHours)}
                    </div>
                );
            }
        },  
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Interview</div>,
            dataIndex: 'interviewTotalHours',
            key: 'interviewTotalHours',
            fixed: 'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.interviewTotalHours)}
                    </div>
                );
            }
        },            
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Hours</div>,
            dataIndex: 'overallTotalHours',
            key: 'overallTotalHours',
            fixed:'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.overallTotalHours)}
                    </div>
                );
            }        
        },
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Extra Hours</div>,
            dataIndex: 'extraHours',
            key: 'extraHours',
            fixed:'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.extraHours)}
                    </div>
                );
            }
        },
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Status</div>,
            dataIndex: 'taskStatus',
            key: 'taskStatus',
        },
    ];

    const innerColumn: ColumnsType<any> = [
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>S.No</div>,
          dataIndex: 'slNo',
          key: 'slNo',
          fixed: 'left',
          render: (text, record, index) => index + 1,
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Work Location</div>,
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'workLocation',
          key: 'workLocation',
          fixed: 'left',
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Task</div>,
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'task',
          key: 'task',
          fixed: 'left',
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Project</div>,
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'project',
          key: 'project',
          fixed: 'left',
        },
        {
            title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Manager Assigned Task</div>,
            dataIndex: 'managerTaskName',
            key: 'managerTaskName',
            fixed: 'left',
            render: (text: string) => text ? text : '➖', 
        },  
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Date</div>,
        //   sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
          dataIndex: 'date',
          key: 'date',
          fixed: 'left',
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Start Time</div>,
          //sorter: (a: Task, b: Task) => a.startTime.localeCompare(b.startTime),
          dataIndex: 'startTime',
          key: 'startTime',
          fixed: 'left',
          render: (_, record) => {
            return (
                <div>
                    {hoursTimeToHoursMinutes(record?.startTime)}
                </div>
            );
        }
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>End Time</div>,
          //sorter: (a: Task, b: Task) => a.endTime.localeCompare(b.endTime),
          dataIndex: 'endTime',
          key: 'endTime',
          fixed: 'left',
          render: (_, record) => {
            return (
                <div>
                    {hoursTimeToHoursMinutes(record?.endTime)}
                </div>
            );
        }
        },
        {
          title: <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total</div>,
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'totalHours',
          key: 'totalHours',
          fixed: 'left',
          render: (_, record) => {
            return (
                <div>
                    {hoursDecimalToHoursMinutes(record?.totalHours)}
                </div>
            );
        }
        },
        {
          title: 'Description',
          //sorter: (a: Task, b: Task) => a.description.localeCompare(b.description),
          dataIndex: 'description',
          key: 'description',
          fixed: 'left',
        },
        {
          title: 'Reporting To',
          //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
          dataIndex: 'reportingTo',
          key: 'reportingTo',
          fixed: 'left',
        }, 
        {
          title: 'Status',
          //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
          dataIndex: 'taskStatus',
          key: 'taskStatus',
          fixed: 'left',
        }
      ]
    const modalContent = clickedRecord && (
        <Table
            columns={innerColumn as ColumnsType<any>}
            dataSource={clickedRecord}
            pagination={false}
        />
    );

    return (
        <div id="dashboardLayout" className='flex gap-5'>
            <div className='createuser-main'>
                <div className='header'>
                    <div>
                      <h1> <ArrowLeftOutlined style={{ marginRight: '10px' }} onClick={()=>{navigate('/manager/approvalrequest')}} />Monthly Task Details</h1>
                    </div>
                </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{display:'flex', alignItems:'flex-start', margin:'10px 0px 10px 20px'}}>
                            <div>
                                <Space className="flex gap-5">
                                    <Avatar icon={<UserOutlined />} size={65} />
                                    <div>
                                    <div>
                                        <strong style={{fontSize:'20px'}}>{employeeName}</strong>
                                    </div>
                                    <div style={{textAlign:'left', fontSize:'16px'}}>{employeeId}</div>
                                    </div>
                                </Space>
                            </div>
                            
                        </div>
                        <div style={{fontWeight:'bold', color:'#0B4266',fontSize:'20px',textAlign:'center', margin:'30px 20px 10px 0px'}}>{formattedMonth}</div>
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
                    
                    <div style={{display:'flex', justifyContent:'space-between', margin:'20px 20px', alignItems:'center'}}>
                        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%'}}>
                             <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Task By Category</h2>
                           <div style={{ height: '300px' }} id='pie-chart-container'>
                            <Pie data={pieData} options={chartOptions} />
                           </div>
                            {/* <PieChart width={600} height={300}>
                                <Pie
                                    data={Object.entries(pieChartData).map(([name, value]) => ({ name, value }))}
                                    cx={300}
                                    cy={150}
                                    labelLine={false}
                                    label={true}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {
                                        Object.entries(pieChartData).map(([name], index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))
                                    }
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value, entry) => <span style={{ color: 'black' }}>{value}</span>} />
                            </PieChart> */}
                            
                        </div>
                        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'48%' }}>
                            <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Work Location</h2>
                            <div style={{ height: '300px' }} id='line-chart-container'>
                                <Doughnut data={data} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'left' }}>
                        <Select
                            showSearch
                            style={{ width: 200, marginRight: 8, height: 40, marginLeft:'20px' }}
                            placeholder="Filter by Status"
                            onChange={(value) => setSelectedStatus(value)}
                            value={selectedStatus}
                        >
                            <Option value={null}>All Statuses</Option>
                            {statusOptions.map((status) => (
                                <Option key={status} value={status}>
                                    {status}
                                </Option>
                            ))}
                        </Select>
                        <Button type="default" onClick={handleClearFilter} style={{ width: '100px', height: '40px' }}>Clear Filter</Button>
                    </div>

                   
                    <ConfigProvider theme={config}>
                        <Table
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: selectedRows,
                                onChange: (selectedRowKeys:any, selectedRows:any[]) => handleRowSelection(selectedRowKeys, selectedRows)
                            }}
                            onRow={(record: any) => ({
                                onClick: () => handleRowClick(record),
                                
                            })}
                            columns={column} 
                            className='table-striped-rows approvalrequests-table'
                            dataSource={monthTasks.filter(task => selectedStatus ? task.taskStatus === selectedStatus : true)}
                            pagination={false}
                            rowKey="uniqueRequestId" 
                        />
                        <Modal
                            title={clickedRecord && clickedRecord.tasks?.length > 0 ? dayjs(clickedRecord.tasks[0].date).format('MMMM DD, YYYY') : ""}
                            visible={modalVisible}
                            onCancel={() => setModalVisible(false)}
                            className='monthTasks'
                            footer={null}
                        >
                            {modalContent}
                        </Modal>


                       

                    </ConfigProvider>
                    <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}> 
                    {selectedStatus !== 'Approved' && selectedStatus !== 'Rejected' && (
                        <>
                            <Button 
                                style={{
                                    height: '200%',
                                    width: '100px',
                                    backgroundColor: selectedRows.length===0?'#FC8267': 'red',
                                    color: 'white',
                                    marginRight: '10px',
                                    cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer'
                                }} 
                                onClick={handleReject} 
                                title={selectedRows.length === 0 ? "Please select the row to Reject" : ""}
                            >
                                Reject
                            </Button>
                            <Button 
                                style={{
                                    height: '200%', 
                                    width: '100px', 
                                    backgroundColor: selectedRows.length===0?'#6CB66B':'green', 
                                    color: 'white', 
                                    cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer'
                                }} 
                                onClick={handleApprove} 
                                title={selectedRows.length === 0 ? "Please select the row to Approve" : ""}
                            >
                                Approve
                            </Button>
                        </>
                    )}

                        <Modal
                        title="Comments"
                        className='modalTitle'
                        visible={commentVisible}
                        onCancel={handleCancel}
                        footer={[
                            <Button style={{ width: '20%', backgroundColor: '#0B4266', color: 'white', cursor: selectedRows.length === 0 ? 'not-allowed' : 'pointer' }} key="submit" type="primary" onClick={handleSubmit}>
                            Submit
                            </Button>,
                        ]}
                        >
                        <Input.TextArea placeholder='Write here...' rows={4} value={comments} onChange={handleInputChange} />
                        </Modal>
                    </div> 
                
            </div>
        </div>

    )
}

export default MonthTasks;
