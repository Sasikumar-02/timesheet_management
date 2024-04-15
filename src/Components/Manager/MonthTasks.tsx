import React,{useState, useEffect, SetStateAction} from 'react'
import ReactDOM  from 'react-dom';
import moment from 'moment'
import isEqual from 'lodash/isEqual';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import { Doughnut } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {Button, Modal, Progress, Input, Space, Avatar, Select, ConfigProvider , message, Menu} from 'antd';
import { Tooltip as AntdTooltip } from 'antd';
import DashboardLayout from '../Dashboard/Layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid,Tooltip, Legend, ResponsiveContainer, ReferenceLine , Label, PieChart, Cell} from 'recharts';
import { ColumnsType } from 'antd/es/table'
import { Table, Dropdown } from 'antd'
import { TaskObject } from './ApprovalRequest';
import { Task } from '../Employee/AddTask'
import ApprovalRequest from './ApprovalRequest';
import '../Styles/ApprovalRequest.css';
import '../Styles/AddTask.css';
import type { ThemeConfig } from "antd";
import Chart from 'react-apexcharts';
//import { Chart } from 'chart.js/auto';
import { ApexOptions } from 'apexcharts';
import { theme } from "antd";
import { DateTask } from '../Employee/AddTask';
import { saveAs } from 'file-saver';
// import * as XLSX from 'xlsx';
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
    const [statuses, setStatuses]= useState<boolean>(false);
    const {Option}= Select
    const location = useLocation();
    const { uniqueRequestId, employeeId, formattedMonth, employeeName } = location.state;
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [projectTotalHours, setProjectTotalHours]=useState<any[]>([]);
    const [learningTotalHours, setLearningTotalHours]=useState<any[]>([]);
    const [trainingTotalHours, setTrainingTotalHours]=useState<any[]>([]);
    const [otherTaskTotalHours, setOtherTaskTotalHours]=useState<any[]>([]);
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
        Other:0
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
    //const [chartData, setChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] }); // Initialize chartData with appropriate types
    const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
    console.log("received data",uniqueRequestId, employeeId, formattedMonth)
    const [modalVisible, setModalVisible] = useState(false);
    const [clickedRecord, setClickedRecord] = useState<any>();
    // const [chartOptions, setChartOptions] = useState<ChartOptions>({
    //     labels: [],
    //     colors: [],
    //     chart: {
    //         type: 'pie', // or any other default chart type
    //     },
    // });
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
console.log("statuses",statuses);
const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
        legend: {
          position: 'right' as const, // Display the legend at the right side
          align: 'center' as const, // Align the legend to the start of the position (right side)
        }
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
    console.log("monthName, year",monthName, year);
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
    console.log("response-pie", response?.data?.response?.data?.categoryPercentages);
    setPieChartData(response?.data?.response?.data?.categoryPercentages);
    }
    catch(err){
        throw err;
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
    console.log("response-dough", response?.data?.response?.data);
    setDoughChartData(response?.data?.response?.data?.locationPercentages);
    }
    catch(err){
        throw err;
    }  
}
    useEffect(() => {
        // Check if uniqueRequestId is defined and is an array
        console.log("uniqueRequestId", uniqueRequestId);
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
            console.log("taskDelayed",taskDelayed);
            setIsDelayed(taskDelayed);
              console.log('response-new', response?.data?.response?.data);
              setMonthTasks(response?.data?.response?.data);
              // Process response data here
            } catch (error) {
              console.error("Error fetching data:", error);
              // Handle error here, such as displaying an error message to the user
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
   
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Add more colors as needed
    
    const exportCharts = (): Promise<{ pieChartImage: string; lineChartImage: string }> => {
        return new Promise((resolve, reject) => {
            // Get chart containers
            const pieChartContainer = document.getElementById('pie-chart-container') as HTMLCanvasElement;
            const lineChartContainer = document.getElementById('line-chart-container') as HTMLCanvasElement;
    
            // Create promises for each chart export
            const pieChartPromise = html2canvas(pieChartContainer, { backgroundColor: '#ffffff' }); // Set background color to white
            const lineChartPromise = html2canvas(lineChartContainer, { backgroundColor: '#ffffff' }); // Set background color to white
    
            // Wait for both promises to resolve
            Promise.all([pieChartPromise, lineChartPromise])
                .then(([pieCanvas, lineCanvas]) => {
                    // Convert canvas elements to PNG images
                    const pieChartImage = pieCanvas.toDataURL('image/png');
                    const lineChartImage = lineCanvas.toDataURL('image/png');
    
                    // Resolve with the images
                    resolve({ pieChartImage, lineChartImage });
                })
                .catch(error => {
                    reject(error); // Reject if there's an error exporting the charts
                });
        });
    };    
    
    
    const handleRowSelection = (selectedRowKeys: React.Key[], selectedRows: any[]) => {
        setSelectedRows(selectedRowKeys as string[]);
        const projectTotalHoursArray = selectedRows.map(row => row.projectTotalHours);
        const trainingTotalHoursArray = selectedRows.map(row => row.trainingTotalHours);
        const meetingTotalHoursArray = selectedRows.map(row => row.meetingTotalHours);
        const learningTotalHoursArray = selectedRows.map(row => row.learningTotalHours);
        const otherTaskTotalHoursArray = selectedRows.map(row => row.otherTaskTotalHours);
        const overallTotalHoursArray = selectedRows.map(row => row.overallTotalHours);
        const extraTotalHoursArray = selectedRows.map(row => row.extraTotalHours);
        
        setProjectTotalHours(projectTotalHoursArray);
        setTrainingTotalHours(trainingTotalHoursArray);
        setMeetingTotalHours(meetingTotalHoursArray);
        setLearningTotalHours(learningTotalHoursArray);
        setOtherTaskTotalHours(otherTaskTotalHoursArray);
        setOverallTotalHours(overallTotalHoursArray);
        setExtraTotalHours(extraTotalHoursArray);
    
        console.log("handleRowSelection", selectedRowKeys, selectedRows);
    };
    

    const handleRowClick = (record: any) => {
        console.log("handleRowClick",record);
        const uniqueRequestId = record.uniqueRequestId;
        fetchDataByUniqueId(uniqueRequestId);
        setModalVisible(true);
    };
    const fetchOverallDataByUniqueId = async () => {
        try {
            const newData: any[] = [];
            // Use Promise.all to await all API calls concurrently
            await Promise.all(
                uniqueRequestId.map(async (id: any) => {
                    const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${id}`);
                    newData.push(response.data.response.data);
                })
            );
            // Update the state with the new data
            setOverallData(newData);
        } catch (err) {
            console.error('Error fetching overall data:', err);
        }
    };

    useEffect(() => {
        fetchOverallDataByUniqueId();
    }, [monthTasks]); // Empty dependency array means it only runs once, similar to componentDidMount

    const fetchDataByUniqueId = async (uniqueRequestId: string) => {
        try {
            const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${uniqueRequestId}`);
            console.log('Response data:', response?.data);
            setClickedRecord(response?.data?.response?.data);
            // Process response data if needed
        } catch (error) {
            console.error('Error fetching data by unique ID:', error);
            // Handle error here
        }
    };

    const fetchTaskByUniqueId = async (uniqueRequestIds:any[]) => {
        console.log('exportToExcel - 1', uniqueRequestIds);
        try {
            // Map each uniqueRequestId to a promise that fetches its corresponding tasks
            console.log('exportToExcel - 2')
            const tasksPromises = uniqueRequestIds.map(async (uniqueRequestId) => {
                const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${uniqueRequestId}`);
                return response?.data?.response?.data;
            });
    
            // Wait for all promises to resolve
            const tasks = await Promise.all(tasksPromises);
            console.log("exportToExcel -tasks", tasks);
            return tasks;
        } catch (error) {
            console.error('Error fetching data by unique IDs:', error);
            throw error; // Rethrow the error for handling in the caller function
        }
    };

    useEffect(() => {
        preparePieChartImage();
        prepareLineChartImage();
    }, [monthTasks]);

    const preparePieChartImage = () => {
        // Your pie chart logic to render on a canvas
        const chartCanvas = document.getElementById('pie-chart-container') as HTMLCanvasElement;
        if (chartCanvas) {
            html2canvas(chartCanvas).then(canvas => {
                const imageData = canvas.toDataURL('image/png');
                setChartImages(prevImages => [...prevImages, { name: 'PieChart.png', data: imageData }]);
            });
        }
    };

    const prepareLineChartImage = () => {
        // Your line chart logic to render on a canvas
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
        setComments(''); // Clear comments when modal is canceled
      };
    
      const handleInputChange = (e:any) => {
        setComments(e.target.value);
      };
    
      const handleSubmit = async () => {
        try {
          const payload = {
            approvalStatus: "Rejected",
            approvalComments: comments,
            uniqueRequestId: selectedRows, // Assuming id is the property in each selected row that holds the uniqueRequestId
            learningTotalHours:learningTotalHours,
            meetingTotalHours: meetingTotalHours,
            projectTotalHours: projectTotalHours,
            otherTaskTotalHours: otherTaskTotalHours,
            trainingTotalHours: trainingTotalHours,
            overallTotalHours:overallTotalHours,
            extraTotalHours: extraTotalHours
          };
    
          // Send the payload to the API
          const response = await api.put('/api/v1/timeSheet/timesheet-approval', payload);
          
          console.log(response?.data); // Optionally handle the response data
    
          // Reset the modal state
          setStatuses(prev=>!prev);
          setCommentVisible(false);
          setComments('');
          setSelectedRows([]);
        } catch (error) {
          console.error('Error occurred:', error);
          // Optionally handle errors
        }
      };

      const handleApprove = async () => {
        try {
            if(selectedRows.length>0){
                console.log("handleApprove-selectedRows", selectedRows);
                const payload = {
                    approvalStatus: "Approved",
                    uniqueRequestId: selectedRows, // Assuming id is the property in each selected row that holds the uniqueRequestId
                    learningTotalHours:learningTotalHours,
                    meetingTotalHours: meetingTotalHours,
                    projectTotalHours: projectTotalHours,
                    otherTaskTotalHours: otherTaskTotalHours,
                    trainingTotalHours: trainingTotalHours,
                    overallTotalHours:overallTotalHours,
                    extraTotalHours: extraTotalHours
                };
                
                const response = await api.put('/api/v1/timeSheet/timesheet-approval', payload);
                setStatuses(prev=>!prev);
                setSelectedRows([]);
                console.log("handleApprove",response?.data); // Optionally handle the response data
            }
        } catch (error) {
          console.error('Error occurred:', error);
          // Optionally handle errors
        }
      };
    
    // Function to convert date to "Month Year" format
    function formatDateToMonthYear(dateString: any) {
        const [year, month] = dateString.split('-');
        const date = new Date(year, month - 1); // Months are zero-based in JavaScript
        const monthName = date.toLocaleString('default', { month: 'long' });
        return `${monthName} ${year}`;
    }


    const exportToExcel = async () => {
        try {
            let imgId1: number;
            let imgId2: number;
            console.log("exportToExcel - selectedRows", selectedRows);
            console.log("exportToExcel - monthTasks", monthTasks);
            
            let dataToExport: any[] = [];
            if (selectedRows?.length > 0) {
                console.log("sleectedRows", selectedRows);
                let ids = monthTasks
                    .filter(row => selectedRows.includes(row.uniqueRequestId))
                    .map(row => row.uniqueRequestId);
                const fetchedData = await fetchTaskByUniqueId(ids);
            
                // Flatten the fetchedData array of arrays
                dataToExport = fetchedData.flat();
            } else {
                // If no rows are selected, export all monthTasks data
                console.log("sleectedRows -1", overallData)
                dataToExport = overallData.flat();
            }
            // Map over dataToExport to extract values for Excel
            const data = dataToExport.map((rowData: any) => {
                return [
                    rowData.date || '',          // Date
                    rowData.workLocation || '',  // Work Location
                    rowData.task || '',          // Task
                    rowData.project || '',       // Title
                    rowData.startTime || '',     // Start Time
                    rowData.endTime || '',       // End Time
                    rowData.totalHours || '',    // Shift Hours
                    rowData.description || '',   // Description
                    rowData.reportingTo || ''   // Reporting To
                ];
            });
            console.log("exportToExcel - dataToExport", dataToExport);
                
            const header = ['Date', 'Work Location', 'Task', 'Project', 'Start Time', 'End Time', 'Shift Hours', 'Description', 'Reporting To'];         
    
            // Flatten the array
            console.log("exportToExcel- data", data);
            
            // Create a workbook and add a worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');
    
            worksheet.views = [{
                showGridLines: false
            }];
    
            // Add Timesheet row with background color, bold, and 24px font size
            const timesheetRow = worksheet.addRow(['TimeSheet']);
            timesheetRow.font = { bold: true, size: 24, color: { argb: 'FFFFFF' } };
            timesheetRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '0B4266' } // Blue color
            };
    
            // Add Name and Month rows with specified values
            const nameRow = worksheet.addRow([]);
            nameRow.getCell(1).value = 'Name:';
            nameRow.getCell(1).font = { bold: true }; // Making "Name:" bold
            nameRow.getCell(2).value = employeeName;
            const userIdRow = worksheet.addRow([]);
            userIdRow.getCell(1).value = 'UserID:';
            userIdRow.getCell(1).font = { bold: true }; // Making "Name:" bold
            userIdRow.getCell(2).value = employeeId;
    
            const monthRow = worksheet.addRow([]);
            monthRow.getCell(1).value = 'Month:';
            monthRow.getCell(1).font = { bold: true }; // Making "Month:" bold
            monthRow.getCell(2).value = formattedMonth; // Dynamically convert date to "Month Year" format
                
            // Add empty rows
            for (let i = 0; i < 1; i++) {
                worksheet.addRow([]);
            }
    
            // Call exportCharts to get the images
            const { pieChartImage, lineChartImage } = await exportCharts();
    
            // Calculate the current row number
            const currentRow = worksheet.rowCount + 2;
    
            // Add the images to the worksheet
            const pieChartImageId = workbook.addImage({
                base64: pieChartImage.replace(/^data:image\/png;base64,/, ''),
                extension: 'png',
            });
    
            const lineChartImageId = workbook.addImage({
                base64: lineChartImage.replace(/^data:image\/png;base64,/, ''),
                extension: 'png',
            });
    
            //Add both images to the same row
            worksheet.addImage(pieChartImageId, {
                tl: { col: 1, row: currentRow } as ExcelJS.Anchor, // Top-left cell
                br: { col: 4, row: currentRow + 13 }as ExcelJS.Anchor, // Bottom-right cell
            });
    
            worksheet.addImage(lineChartImageId, {
                tl: { col: 5, row: currentRow } as ExcelJS.Anchor, // Top-left cell
                br: { col: 8, row: currentRow + 13 } as ExcelJS.Anchor, // Bottom-right cell
            });
            
            // Add a row with horizontal gridline (6th row)
            const gridlineRow = worksheet.addRow(Array(header.length).fill('')); // Add empty content for each column
            gridlineRow.eachCell(cell => {
                cell.border = {
                    bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                };
            });
    
            // Add header row with styles starting from 8th row
            const headerRow = worksheet.addRow(header);
            headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }; // Make the text bold and white
    
            // Set background color for header cells
            headerRow.eachCell(cell => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '0B4266' } // Blue color
                };
            });

            console.log("exportToExcel - Data to export:", data);

            // Add data rows
            data?.forEach(rowData => {
                console.log("exportToExcel - rowData", rowData);
                const row = worksheet.addRow(rowData);
                // Set border and text alignment for data rows
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { horizontal: 'left' }; // Align text to the left
                });
            });
    
    
            // Set column widths based on header length
            worksheet.columns?.forEach((column, index) => {
                if (index < header.length) {
                    column.width = 23; // Adjust width as needed
                } else {
                    column.hidden = true; // Hide columns beyond the header length
                }
            });
    
            // Add a row with horizontal gridline (6th row)
            const gridlineRowEnd = worksheet.addRow(Array(worksheet.columns?.length).fill('')); // Add empty content for each column
            gridlineRowEnd.eachCell(cell => {
                cell.border = {
                    bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                };
            });
    
            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
            setSelectedRows([]);
    
        } catch (error) {
            console.error('Error exporting to Excel:', error);
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
        // Parse the decimal hours string
        const [hoursStr, minutesStr] = decimalHours.split(':');
        const hours = parseInt(hoursStr);
        const minutes = parseInt(minutesStr);
    
        // Return the formatted string
        if (hours === 0 && minutes === 0) {
            return '➖';
        }
        return `${hours}h ${minutes}min`;
      };

  
    const column: ColumnsType<any> = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            fixed: 'left',
            render: (_, record: any) => (
                
                <div style={{ display: 'flex', alignItems: 'center' }}>
                {isDelayed.includes(record.date) && (
                    <AntdTooltip title={"You have submitted the task after the deadline"}>
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
            title: 'Project',
            dataIndex: 'projectTotalHours',
            key: 'projectTotalHours',
            // width: '15%',
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
            title: 'Meeting',
            dataIndex: 'meetingTotalHours',
            key: 'meetingTotalHours',
            // width: '15%',
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
            title: 'Training',
            dataIndex: 'trainingTotalHours',
            key: 'trainingTotalHours',
            // width: '15%',
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
            title: 'Learning',
            dataIndex: 'learningTotalHours',
            key: 'learningTotalHours',
            // width: '15%',
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
            title: 'Other',
            dataIndex: 'otherTaskTotalHours',
            key: 'otherTaskTotalHours',
            // width: '15%',
            fixed: 'left',
            render: (_, record) => {
                return (
                    <div>
                        {hoursDecimalToHoursMinutes(record?.otherTaskTotalHours)}
                    </div>
                );
            }
        },            
        {
            title: 'Total Hours',
            dataIndex: 'overallTotalHours',
            key: 'overallTotalHours',
            // width: '15%',
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
            title: 'Extra Hours',
            dataIndex: 'extraHours',
            key: 'extraHours',
            // width: '15%',
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
            title: 'Status',
            dataIndex: 'taskStatus',
            key: 'taskStatus',
            // width: '10%',
        },
    ];

    const innerColumn: ColumnsType<any> = [
        {
          title: 'Sl. No',
        //   width: '132px',
          dataIndex: 'slNo',
          key: 'slNo',
          fixed: 'left',
          render: (text, record, index) => index + 1,
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
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'task',
          key: 'task',
          fixed: 'left',
        },
        {
          title: 'Project',
          //sorter: (a: Task, b: Task) => a.task.localeCompare(b.task),
          dataIndex: 'project',
          key: 'project',
          fixed: 'left',
        },
        {
          title: 'Date',
        //   sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
          dataIndex: 'date',
          key: 'date',
          fixed: 'left',
        },
        {
          title: 'Start Time',
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
          title: 'End Time',
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
          title: 'Total Hours',
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

    // JSX for modal content
    const modalContent = clickedRecord && (
        <Table
            className='addtask-table'
            columns={innerColumn as ColumnsType<any>}
            dataSource={clickedRecord}
            pagination={false}
        />
    );

    return (
        <div id="dashboardLayout" className='flex gap-5'>
            <>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{display:'flex', alignItems:'flex-start', margin:'10px 0px 10px 20px'}}>
                            <div>
                                <Space className="flex gap-5">
                                    <Avatar icon={<UserOutlined />} size={65} />
                                    <div>
                                    <div>
                                        <strong style={{fontSize:'20px'}}>{employeeName}</strong>
                                    </div>
                                    {/* Displaying the userId */}
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
                        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'50%'}} id='pie-chart-container'>
                             <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Task Percentage</h2>
                           <div style={{ height: '300px' }}>
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
                        <div style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '5px', padding: '20px', width:'48%' }} id='line-chart-container'>
                            <h2 style={{ textAlign: 'left', color:'#0B4266', marginTop:'0px' }}>Work Location Percentage</h2>
                            <div style={{ height: '300px' }}>
                                <Doughnut data={data} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Select
                            showSearch
                            style={{ width: 200, marginRight: 8, height: 40 }}
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
                                // onMouseEnter: () => handleRowHover(record),
                                // onMouseLeave: handleRowLeave,
                            })}
                            columns={column} 
                            className='table-striped-rows approvalrequests-table'
                            dataSource={monthTasks.filter(task => selectedStatus ? task.taskStatus === selectedStatus : true)}
                            pagination={false}
                            rowKey="uniqueRequestId" // Set the rowKey prop to 'uniqueRequestId'
                        />   
                        <Modal
                           title={clickedRecord && clickedRecord.tasks?.length > 0 ? dayjs(clickedRecord.tasks[0].date).format('MMMM DD, YYYY') : ""}
                            visible={modalVisible}
                            onCancel={() => setModalVisible(false)}
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
                
            </>
        </div>

    )
}

export default MonthTasks;
