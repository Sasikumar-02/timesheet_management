import React,{useState, useEffect, SetStateAction} from 'react'
import ReactDOM  from 'react-dom';
import moment from 'moment'
import isEqual from 'lodash/isEqual';
import {
    UserOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import html2canvas from 'html2canvas';
import { useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import {Button, Modal, Progress, Input, Space, Avatar, Select, ConfigProvider , message, Menu} from 'antd';
import DashboardLayout from '../Dashboard/Layout'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine , Label, PieChart, Pie, Cell} from 'recharts';
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

interface ApprovalRequestsProps{
    setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>;
}
const MonthTasks: React.FC = () => {
    const [pdfExportInProgress, setPdfExportInProgress] = useState(false);
    const [selectedKeys, setSelectedKeys]= useState<string[]>([]);
    const {Option}= Select
    const location = useLocation();
    const { formattedMonth, userId, tasksForClickedMonth, tasksObject } = location.state;
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
    // const {formattedMonth='', userId=''}=useParams();
    const [monthTasks, setMonthTasks] = useState<{ [key: string]: TaskObject }>({});
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    //const [selectedKeys, setSelectedKeys]=useState<string[]>([]);
    const [rowTask, setRowTask]= useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [commentVisible, setCommentVisible] = useState(false);
    const [monthTasksData, setMonthTasksData] = useState<DateTask[]>([]);
    const [rejectKeys, setRejectKeys]= useState<RejectedKeys>({});
    const [rejectDates, setRejectDates]= useState<RejectedKeys>({});
    const [hoveredRow, setHoveredRow] = useState<DateTask | null>(null); // Initialize hoveredRow with DateTask or null
    //const [chartData, setChartData] = useState<{ labels: string[]; series: number[] }>({ labels: [], series: [] }); // Initialize chartData with appropriate types
    const [chartData, setChartData] = useState<{ name: string, value: number }[]>([]);
    console.log("received data", formattedMonth,userId, tasksForClickedMonth)
    const [modalVisible, setModalVisible] = useState(false);
    const [clickedRecord, setClickedRecord] = useState<DateTask | null>(null);
    const [chartOptions, setChartOptions] = useState<ChartOptions>({
        labels: [],
        colors: [],
        chart: {
            type: 'pie', // or any other default chart type
        },
    });
    const [chartImages, setChartImages] = useState<ChartImage[]>([]);
    const [chartSeries, setChartSeries] = useState<number[]>([]);
    useEffect(() => {
        preparePieChartImage();
        prepareLineChartImage();
    }, [monthTasksData]);

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
    // Function to prepare data for the pie chart
    // const preparePieChartData = () => {
    //     // Initialize an object to store total hours per task
    //     const taskHoursPerDay: { [key: string]: number } = {};
    
    //     // Iterate over each day's tasks data
    //     monthTasksData.forEach(dateTask => {
    //         const tasks = dateTask.task;
    
    //         // Iterate over each task for the current day
    //         tasks.forEach(task => {
    //             const taskName = task.task;
    //             const totalHours = parseFloat(task.totalHours || '0');
    
    //             // Accumulate total hours for each task
    //             taskHoursPerDay[taskName] = (taskHoursPerDay[taskName] || 0) + totalHours;
    //         });
    //     });
    
    //     // Extract task names and total hours as series data for the pie chart
    //     const seriesData = Object.values(taskHoursPerDay);
    //     console.log("seriesData", seriesData);
    //     const labels = Object.keys(taskHoursPerDay);
    //     console.log("seriesData labels", labels);
        
    //     // Set up options for the pie chart
    //     const options: ChartOptions = {
    //         chart: {
    //             type: 'pie',
    //         },
    //         labels: labels,
    //         colors: [], // Set colors as an empty array if not provided dynamically
    //     };
    
    //     setChartOptions(options);
    //     setChartSeries(seriesData);
    // };    

    const preparePieChartData = () => {
        const taskHoursPerDay: { [key: string]: number } = {};
        monthTasksData.forEach(dateTask => {
            const tasks = dateTask.task;

            tasks.forEach(task => {
                const taskName = task.task;
                const totalHours = parseFloat(task.totalHours || '0');

                taskHoursPerDay[taskName] = (taskHoursPerDay[taskName] || 0) + totalHours;
            });
        });

        const data = Object.entries(taskHoursPerDay).map(([taskName, totalHours]) => ({
            name: taskName,
            value: totalHours
        }));

        setChartData(data);
    };
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF']; // Add more colors as needed

      // Function to extract date from tasks
      function extractDateFromTasks(tasks: Task[]): string | null {
        // Assuming all tasks have the same date
        return tasks.length > 0 ? tasks[0].date : null;
    }
    
    let chartDatas: { date: string, percentage: number | null }[] = [];
    let desiredMonth: string | null = null;
    
    if (monthTasksData.length > 0 && monthTasksData[0].task.length > 0) {
        desiredMonth = monthTasksData[0].task[0].date;
    }
    
    if (desiredMonth) {
        const startDate = dayjs(desiredMonth).startOf('month').toDate();
        const endDate = dayjs(desiredMonth).endOf('month').toDate();
    
        const totalHoursPerDay = monthTasksData.map(dateTask => {
            const totalHours = dateTask.task.reduce((total, task) => total + parseFloat(task.totalHours), 0);
            return { date: extractDateFromTasks(dateTask.task), totalHours };
        });
    
        const extraHoursPerDay = monthTasksData.map(dateTask => {
            const totalHours = dateTask.task.reduce((total, task) => total + parseFloat(task.totalHours), 0);
            const extraHours = totalHours - 8; // Assuming 8 hours is a regular workday
            return { date: extractDateFromTasks(dateTask.task), extraHours };
        });
    
        const percentageExtraHoursPerDay = extraHoursPerDay.map(({ date, extraHours }) => {
            const totalHours = totalHoursPerDay.find(day => day.date === date)?.totalHours || 0;
            const percentage = totalHours >= 9 ? (extraHours / totalHours) * 100 : 0;
            return { date, percentage };
        });
    
        const allDatesInMonth = [];
        let currentDate = dayjs(startDate);
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
            allDatesInMonth.push(currentDate.format('YYYY-MM-DD'));
            currentDate = currentDate.add(1, 'day');
        }
    
        chartDatas = allDatesInMonth.map(date => {
            const dataForDate = percentageExtraHoursPerDay.find(data => data.date === date);
            return { date, percentage: dataForDate ? dataForDate.percentage : 0 };
        });
    } else {
        console.log('No tasks found or invalid date range.');
    }
    
    useEffect(() => {
        // Prepare data for the pie chart when monthTasksData changes
        preparePieChartData();
    }, [monthTasksData]);

    useEffect(() => {
        setMonthTasks(tasksForClickedMonth);
        setRowTask(tasksObject);
    }, [tasksForClickedMonth, tasksObject]);
    
    useEffect(() => {
        const storedKeysString: string | null = localStorage.getItem('selectedKeys');
        if (storedKeysString !== null) {
            const storedKeys: string[] = JSON.parse(storedKeysString);
            setSelectedKeys(storedKeys);
        } else {
           console.log("else-useEffect", storedKeysString);
        }
    }, []);
    
    
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
    
  
    // const exportCharts = (): Promise<{ pieChartImage: string; lineChartImage: string }> => {
    //     return new Promise((resolve, reject) => {
    //         // Get chart containers
    //         const pieChartContainer = document.getElementById('pie-chart-container') as HTMLDivElement;
    //         const lineChartContainer = document.getElementById('line-chart-container') as HTMLDivElement;
    
    //         // Set explicit dimensions for the chart containers
    //         const containerWidth = pieChartContainer.offsetWidth;
    //         const containerHeight = pieChartContainer.offsetHeight;
    //         const reducedWidth = containerWidth * 0.45; // You can adjust the reduction percentage as needed
    //         const reducedHeight = containerHeight * 0.7; // You can adjust the reduction percentage as needed
    //         pieChartContainer.style.width = reducedWidth + 'px';
    //         pieChartContainer.style.height = reducedHeight + 'px';
    //         lineChartContainer.style.width = containerWidth + 'px';
    //         lineChartContainer.style.height = containerHeight + 'px';
    
    //         // Create promises for each chart export
    //         const pieChartPromise = html2canvas(pieChartContainer, { backgroundColor: '#ffffff' }); // Set background color to white
    //         const lineChartPromise = html2canvas(lineChartContainer, { backgroundColor: '#ffffff' }); // Set background color to white
    
    //         // Wait for both promises to resolve
    //         Promise.all([pieChartPromise, lineChartPromise])
    //             .then(([pieCanvas, lineCanvas]) => {
    //                 // Convert canvas elements to PNG images
    //                 const pieChartImage = pieCanvas.toDataURL('image/png');
    //                 const lineChartImage = lineCanvas.toDataURL('image/png');
    
    //                 // Resolve with the images
    //                 resolve({ pieChartImage, lineChartImage });
    //             })
    //             .catch(error => {
    //                 reject(error); // Reject if there's an error exporting the charts
    //             })
    //             .finally(() => {
    //                 // Reset the styles
    //                 pieChartContainer.style.width = '';
    //                 pieChartContainer.style.height = '';
    //                 lineChartContainer.style.width = '';
    //                 lineChartContainer.style.height = '';
    //             });
    //     });
    // };
    
    

    const handleRowSelection = (selectedRowKeys: React.Key[]) => {
        setSelectedRows(selectedRowKeys as string[]);
        setSelectedKeys(selectedRowKeys as string[]);
        console.log("handleRowSelection", selectedRowKeys);
    };

    // Function to handle row click
    const handleRowClick = (record: DateTask) => {
        setModalVisible(true);
        setClickedRecord(record);
    };

    const handleReject = () => {
        setCommentVisible(true);
        let updatedRejectKeys: RejectedKeys = { ...rejectKeys };
        let updatedRejectDates: RejectedKeys = { ...rejectDates };
    
        const updatedMonthTasksData = monthTasksData.filter(row => {
            const isRowIncluded = selectedRows.includes(row.key);
            console.log("isRowIncluded", isRowIncluded);
            if (isRowIncluded) {
                const userId = '1234'; // Assuming a static userId for this example
                if (!updatedRejectKeys[userId]) {
                    updatedRejectKeys[userId] = [];
                    updatedRejectDates[userId] = [];
                }
                const datekey: string = row.task.length > 0 ? row.task[0].date : '';
                console.log("handleReject-datekey",datekey);
                updatedRejectKeys[userId].push({ date: datekey, comment: comments });
                updatedRejectDates[userId].push({ date: datekey, comment: comments });
            }
            return !isRowIncluded;
        });
    
        setRejectKeys(updatedRejectKeys);
        setRejectDates(updatedRejectDates);
        setMonthTasksData(updatedMonthTasksData);
        
    };
    
    
      const handleCancel = () => {
        setCommentVisible(false);
      };

      const handleSubmit = () => {
        let key: RejectedKeys = {};
        let date: RejectedKeys = {};
        const updatedMonthTasksData = monthTasksData.filter(row => {
            const isRowIncluded = selectedRows.includes(row.key);
            if (isRowIncluded) {
                const userId = '1234'; // Assuming a static userId for this example
                if (!key[userId]) {
                    key[userId] = [];
                    date[userId] = [];
                }
                key[userId].push({ date: row.task.length > 0 ? row.task[0].date : '', comment: comments }); // Assuming comment is empty
                date[userId].push({ date: row.task.length > 0 ? row.task[0].date : '', comment: comments }); // Assuming comment is empty
            }
            return !isRowIncluded;
        });
        const storedRejectedKeys: RejectedKeys = JSON.parse(localStorage.getItem('rejectedKeys') || '{}');
        const storedRecentRejected: RejectedKeys = JSON.parse(localStorage.getItem('recentRejected') || '{}');
    
        Object.keys(rejectKeys).forEach(userId => {
            console.log("userId -handleSubmit", userId);
            const userRejectedKeys = rejectKeys[userId];
            console.log("userRejectedKeys -handleSubmit", userRejectedKeys);
            const userComments = comments;
    
            // Update rejectedKeys
            const newKeysToAdd = userRejectedKeys.filter(newKey => !storedRejectedKeys[userId]?.some(item => item.date === newKey.date));
            storedRejectedKeys[userId] = [...(storedRejectedKeys[userId] || []), ...newKeysToAdd.map(item => ({ date: item.date, comment: userComments }))];
    
            // Update recentRejected
            storedRecentRejected[userId] = [...(storedRecentRejected[userId] || []), ...userRejectedKeys.map(item => ({ date: item.date, comment: userComments }))];
        });
    
        localStorage.setItem('rejectedKeys', JSON.stringify(storedRejectedKeys));
        localStorage.setItem('recentRejected', JSON.stringify(storedRecentRejected));

        console.log("key", key);
        console.log("handleReject-updatedMonthTasksData", updatedMonthTasksData);
    
        setMonthTasksData(updatedMonthTasksData);
    
        // Update monthTasks - Assuming monthTasks is an object containing tasks grouped by date
        const updatedMonthTasksDataObj: { [key: string]: TaskObject } = {};
    
        // Set the updated monthTasks data
        setMonthTasks(updatedMonthTasksDataObj);
        setSelectedRows([]);
        console.log('Comments:', comments);
        setCommentVisible(false);
    };
   
    const handleInputChange = (e:any) => {
        setComments(e.target.value);
      };

    const handleApprove = async () => {
        const userId = '1234'; // Assuming a static userId for this example
        let key: SelectedKeys = {};
        let date: SelectedKeys = {};
        const updatedMonthTasksData = monthTasksData.filter(row => {
            const isRowIncluded = selectedRows.includes(row.key);
            if (isRowIncluded) {
                if (!key[userId]) {
                    key[userId] = [];
                    date[userId] = [];
                }
                key[userId].push(row.key);
                const datekey = row.task.length > 0 ? row.task[0].date : '';
                date[userId].push(datekey);
            }
            return !isRowIncluded;
        });
    
        setSelectedKeys(date[userId]);
    
        // Get stored keys from localStorage or initialize an empty array if none exists
        const storedSelectedKeys: SelectedKeys = JSON.parse(localStorage.getItem('selectedKeys') || '{}');
        const storedRejectedKeys: RejectedKeys = JSON.parse(localStorage.getItem('rejectedKeys') || '{}');
    
        // Filter out keys that are already present in storedSelectedKeys to avoid duplicates
        const newKeysToAdd = date[userId].filter(newKey => !storedSelectedKeys[userId]?.includes(newKey));
    
        // Update storedSelectedKeys with the new keys to add
        storedSelectedKeys[userId] = [...(storedSelectedKeys[userId] || []), ...newKeysToAdd];
        localStorage.setItem('selectedKeys', JSON.stringify(storedSelectedKeys));
    
        // Remove keys from rejectedKeys
        const updatedRejectedKeys: RejectedKeys = {};
        Object.keys(storedRejectedKeys).forEach(uid => {
            updatedRejectedKeys[uid] = storedRejectedKeys[uid].filter(rejectedKey => !key[userId].includes(rejectedKey.date));
        });
        localStorage.setItem('rejectedKeys', JSON.stringify(updatedRejectedKeys));
    
        // Update recent approved tasks in local storage
        const storedRecentApproved: SelectedKeys = JSON.parse(localStorage.getItem('recentApproved') || '{}');
        storedRecentApproved[userId] = date[userId];
        localStorage.setItem('recentApproved', JSON.stringify(storedRecentApproved));
    
        // Wait for the localStorage to be updated before continuing
        await new Promise(resolve => setTimeout(resolve, 0));
    
        console.log("key", key);
        console.log("handleApprove-updatedMonthTasksData", updatedMonthTasksData);
    
        setMonthTasksData(updatedMonthTasksData);
    
        const updatedMonthTasksDataObj = Object.keys(monthTasks).reduce((acc: { [key: string]: TaskObject }, dateKey: string) => {
            const dateData = monthTasks[dateKey];
            const filteredData = Object.fromEntries(Object.entries(dateData).filter(([date, data]) => !key[userId].includes(data.key)));
            console.log("filteredData", filteredData);
            if (Object.keys(filteredData).length > 0) {
                acc[dateKey] = filteredData;
            }
            return acc;
        }, {});
    
        setMonthTasks(updatedMonthTasksDataObj);
        console.log("handleApprove-updatedMonthTasksDataObj", updatedMonthTasksDataObj);
    
        setSelectedRows([]);
    };

    const monthTaskDatas: TaskObject[] = Object.values(monthTasks).map(dateData => {
        console.log("monthTaskData-monthtasks", monthTasks)
        console.log("dateData", dateData);
        if (!dateData) return {}; // Check if dateData is undefined or null
        return dateData ;
    });

    
    useEffect(() => {
        // Process the monthTaskDatas and store it in the state
        const processedMonthTasksData: DateTask[] = monthTaskDatas.map(taskObject => {
            const date = Object.keys(taskObject)[0]; // Assuming there's only one key in TaskObject
            const { key, tasks } = taskObject[date];
            return { key, task: tasks }; // Store the data according to the DateTask interface
        });
    
        // Check if the processed data is different from the current state
        if (!isEqual(processedMonthTasksData, monthTasksData)) {
            // Update the state with the processed data
            setMonthTasksData(processedMonthTasksData);
        }
    }, [monthTaskDatas, monthTasksData]); // Add monthTasksData to the dependency array

    // const handleRowHover = (record: DateTask) => {
    //     setHoveredRow(record); // Ensure hoveredRow is initialized correctly
        
    //     // Initialize an object to store total hours for each task name
    //     const taskTotalHours: { [key: string]: number } = {};
        
    //     // Calculate total hours for each task name
    //     record.task.forEach(task => {
    //         const totalHoursForTask = parseFloat(task.totalHours || '0');
    //         // Accumulate total hours for each task name
    //         taskTotalHours[task.task] = (taskTotalHours[task.task] || 0) + totalHoursForTask;
    //     });
        
    //     // Calculate total hours for all tasks
    //     let totalHours = Object.values(taskTotalHours).reduce((acc, curr) => acc + curr, 0);
        
    //     // If total hours are less than 9, consider them as 9
    //     totalHours = Math.max(totalHours, 9);
    //     console.log("totalHours", totalHours);
        
    //     // Calculate percentages for each task based on total hours
    //     const percentages = Object.entries(taskTotalHours).map(([taskName, taskTotalHours]) => ({
    //         taskName,
    //         percentage: ((taskTotalHours / totalHours) * 100).toFixed(2),
    //     }));
    //     console.log("percentage", percentages);
    //     // Update chart data state
    //     setChartData({
    //         labels: percentages.map(entry => entry.taskName),
    //         series: percentages.map(entry => parseFloat(entry.percentage)),
    //     });
    // };
    
    const handleRowHover = (record: DateTask) => {
        setHoveredRow(record); // Ensure hoveredRow is initialized correctly
        
        // Initialize an object to store total hours for each task name
        const taskTotalHours: { [key: string]: number } = {};
        
        // Calculate total hours for each task name
        record.task.forEach(task => {
            const totalHoursForTask = parseFloat(task.totalHours || '0');
            // Accumulate total hours for each task name
            taskTotalHours[task.task] = (taskTotalHours[task.task] || 0) + totalHoursForTask;
        });
        
        // Calculate total hours for all tasks
        let totalHours = Object.values(taskTotalHours).reduce((acc, curr) => acc + curr, 0);
        
        // If total hours are less than 9, consider them as 9
        totalHours = Math.max(totalHours, 9);
        console.log("totalHours", totalHours);
        
        // Calculate percentages for each task based on total hours
        const percentages = Object.entries(taskTotalHours).map(([taskName, taskTotalHours]) => ({
            taskName,
            percentage: ((taskTotalHours / totalHours) * 100).toFixed(2),
        }));
        console.log("percentage", percentages);
        // Update chart data state
        const labels = percentages.map(entry => entry.taskName);
        const series = percentages.map(entry => parseFloat(entry.percentage));
    
        setChartData(labels.map((label, index) => ({ name: label, value: series[index] })));
    };
    
    const handleRowLeave = () => {
        setHoveredRow(null); // Clear the hovered row
    };

    // const exportToPDF = async () => {
    //     try {
    //         let pdfDoc = await PDFDocument.create();  
    //         const header = ['userId', 'Date', 'Meeting', 'Project', 'Learning', 'Training', 'Total Hours', 'Extra Hours']; // Updated header
    //         const page = pdfDoc.addPage([600, 600]);
    //         const { width, height } = page.getSize();
    //         const fontSize = 10; // Adjusted font size
    //         const padding = 20; // Adjusted padding
    //         const textHeight = fontSize + 5;
    
    //         let y = height - padding;
            

    //         console.log("exportToPDF - selectedRows", selectedRows);
    //         const dataToExport = selectedRows.length > 0 ? monthTasksData.filter(row => selectedRows.includes(row.key)) : [];
    //         console.log("exportToPDF - dataToExport", dataToExport);
          
    
    //         page.drawText('User Details', {
    //             x: padding,
    //             y: y,
    //             size: 18,
    //             font: await pdfDoc.embedFont('Helvetica-Bold'),
    //             color: rgb(0, 0, 0),
    //         });
    
    //         y -= textHeight;
    
    //         // Drawing table headers
    //         let x = padding;
    //         for (const heading of header) {
    //             page.drawText(heading, {
    //                 x: x,
    //                 y: y,
    //                 size: fontSize,
    //                 font: await pdfDoc.embedFont('Helvetica-Bold'),
    //                 color: rgb(0, 0, 0),
    //             });
    //             x += 70; // Adjusted padding to match data padding
    //         }
    
    //         y -= textHeight;
    
    //         for (const dateTask of dataToExport) {
    //             x = padding; // Reset x coordinate to padding
    //             const rowData: any[] = [
    //                 dateTask.task[0].userId,
    //                 dateTask.task[0].date, // Placeholder for Date
    //                 0, 0, 0, 0, // Initialize Meeting, Project, Training, Learning to 0
    //                 0, // Placeholder for totalHours
    //                 0, // Placeholder for extraHours
    //             ];
    
    //             for (const task of dateTask.task) {
    //                 if (task.task === 'Meeting') {
    //                     rowData[2] = parseFloat(task.totalHours || '0');
    //                 } else if (task.task === 'Project') {
    //                     rowData[3] = parseFloat(task.totalHours || '0');
    //                 } else if (task.task === 'Training') {
    //                     rowData[5] = parseFloat(task.totalHours || '0');
    //                 } else if (task.task === 'Learning') {
    //                     rowData[4] = parseFloat(task.totalHours || '0');
    //                 }
    //             }
    
    //            // Calculate totalHours and extraHours
    //             const totalHours = rowData.slice(2, 6).reduce((acc, val) => acc + (typeof val === 'string' ? parseFloat(val) : val), 0);
    //             const extraHours = totalHours > 9 ? totalHours - 9 : 0;
    
    //             rowData[6] = totalHours; // Index 6 for totalHours
    //             rowData[7] = extraHours; // Index 7 for extraHours
    
    //             for (const cell of rowData) {
    //                 page.drawText(cell.toString(), {
    //                     x: x,
    //                     y: y,
    //                     size: fontSize,
    //                     font: await pdfDoc.embedFont('Helvetica'),
    //                     color: rgb(0, 0, 0),
    //                 });
    //                 x += 70; // Increment x coordinate for the next cell
    //             }
    //             y -= textHeight; // Decrement y coordinate for the next row
    //         }
    
    //         const pdfBytes = await pdfDoc.save();
    //         const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    //         saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`);
    //     } catch (error) {
    //         console.error('Error exporting to PDF:', error);
    //     }
    // };
    
    // Function to export as PDF
    // const exportToPDF = () => {
    //     try {
            // const chartContainer1 = document.getElementById('pie-chart-container'); // Get pie chart container element
            // const chartContainer2 = document.getElementById('line-chart-container'); // Get line chart container element
            // if (!chartContainer1 || !chartContainer2) return;

            // html2canvas(chartContainer1).then(canvas1 => { // Convert pie chart container to canvas
            //     const imgData1 = canvas1.toDataURL('image/png'); // Convert canvas to image data
            //     const pdf = new jsPDF(); // Create new PDF document
            //     pdf.addImage(imgData1, 'PNG', 10, 10, 100, 100); // Add pie chart to PDF

            //     // Add page break
            //     pdf.addPage();

            //     html2canvas(chartContainer2).then(canvas2 => { // Convert line chart container to canvas
            //         const imgData2 = canvas2.toDataURL('image/png'); // Convert canvas to image data
            //         pdf.addImage(imgData2, 'PNG', 10, 10, 180, 100); // Add line chart to PDF
            //         pdf.save(`charts_and_table_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`); // Save PDF
            //     });
            // });
    //     } catch (error) {
    //         console.error('Error exporting to PDF:', error);
    //     }
    // };

    const exportToPDF = async () => {
        try {
            const chartContainer1 = document.getElementById('pie-chart-container'); // Get pie chart container element
            const chartContainer2 = document.getElementById('line-chart-container'); // Get line chart container element
            if (!chartContainer1 || !chartContainer2) return;
    
            // Configuration for html2canvas to capture with transparent background
            const html2canvasOptions = {
                backgroundColor: null,
            };
    
            html2canvas(chartContainer1, html2canvasOptions).then(async canvas1 => { // Convert pie chart container to canvas
                const imgData1 = canvas1.toDataURL('image/png'); // Convert canvas to image data
                const pdf = new jsPDF(); // Create new PDF document
                pdf.addImage(imgData1, 'PNG', 10, 10, 100, 100); // Add pie chart to PDF
    
                // Add page break
                pdf.addPage();
    
                html2canvas(chartContainer2, html2canvasOptions).then(async canvas2 => { // Convert line chart container to canvas
                    const imgData2 = canvas2.toDataURL('image/png'); // Convert canvas to image data
                    pdf.addImage(imgData2, 'PNG', 10, 10, 180, 100); // Add line chart to PDF
    
                    const pdfDoc = await PDFDocument.create(); // Create a new PDF document
    
                    const header = ['userId', 'Date', 'Meeting', 'Project', 'Learning', 'Training', 'Total Hours', 'Extra Hours']; // Updated header
                    const page = pdfDoc.addPage([600, 600]);
                    const { width, height } = page.getSize();
                    const fontSize = 10;
                    const padding = 20;
                    const textHeight = fontSize + 5;
    
                    let y = height - padding;
    
                    console.log("exportToPDF - selectedRows", selectedRows);
                    const dataToExport = selectedRows.length > 0 ? monthTasksData.filter(row => selectedRows.includes(row.key)) : [];
                    console.log("exportToPDF - dataToExport", dataToExport);
    
    
                    page.drawText('User Details', {
                        x: padding,
                        y: y,
                        size: 18,
                        font: await pdfDoc.embedFont('Helvetica-Bold'),
                        color: rgb(0, 0, 0),
                    });
    
                    y -= textHeight;
    
                    // Drawing table headers
                    let x = padding;
                    for (const heading of header) {
                        page.drawText(heading, {
                            x: x,
                            y: y,
                            size: fontSize,
                            font: await pdfDoc.embedFont('Helvetica-Bold'),
                            color: rgb(0, 0, 0),
                        });
                        x += 70; // Adjusted padding to match data padding
                    }
    
                    y -= textHeight;
    
                    for (const dateTask of dataToExport) {
                        x = padding; // Reset x coordinate to padding
                        const rowData: any[] = [
                            dateTask.task[0].userId,
                            dateTask.task[0].date, // Placeholder for Date
                            0, 0, 0, 0, // Initialize Meeting, Project, Training, Learning to 0
                            0, // Placeholder for totalHours
                            0, // Placeholder for extraHours
                        ];
    
                        for (const task of dateTask.task) {
                            if (task.task === 'Meeting') {
                                rowData[2] = parseFloat(task.totalHours || '0');
                            } else if (task.task === 'Project') {
                                rowData[3] = parseFloat(task.totalHours || '0');
                            } else if (task.task === 'Training') {
                                rowData[5] = parseFloat(task.totalHours || '0');
                            } else if (task.task === 'Learning') {
                                rowData[4] = parseFloat(task.totalHours || '0');
                            }
                        }
    
                       // Calculate totalHours and extraHours
                        const totalHours = rowData.slice(2, 6).reduce((acc, val) => acc + (typeof val === 'string' ? parseFloat(val) : val), 0);
                        const extraHours = totalHours > 9 ? totalHours - 9 : 0;
    
                        rowData[6] = totalHours; // Index 6 for totalHours
                        rowData[7] = extraHours; // Index 7 for extraHours
    
                        for (const cell of rowData) {
                            page.drawText(cell.toString(), {
                                x: x,
                                y: y,
                                size: fontSize,
                                font: await pdfDoc.embedFont('Helvetica'),
                                color: rgb(0, 0, 0),
                            });
                            x += 70; // Increment x coordinate for the next cell
                        }
                        y -= textHeight; // Decrement y coordinate for the next row
                    }
    
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.pdf`);
                });
            });
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    };
    

    const handleExportOptionForPDF = (key: string) => {
        if (key === 'all' || selectedRows.length === 0) {
            // // Notify if no rows are selected
            // if (selectedRows.length === 0) {
            //     message.warning('Please select rows to export.');
            //     return;
            // }
            // Proceed with export
            exportCharts();
        } else {
            exportCharts();
        }
    };

    const exportMenuForPDF = (
        <Menu onClick={(e) => handleExportOptionForPDF(e.key as string)}>
          <Menu.Item key="selectedData">Export</Menu.Item>
          <Menu.Item key="all">Export All</Menu.Item>
        </Menu>
      );

      // Function to convert date to "Month Year" format
        function formatDateToMonthYear(dateString: any) {
            const [year, month] = dateString.split('-');
            const date = new Date(year, month - 1); // Months are zero-based in JavaScript
            const monthName = date.toLocaleString('default', { month: 'long' });
            return `${monthName} ${year}`;
        }
    
        // const exportToExcel = () => {
        //     try {
        //         console.log("exportToExcel - selectedRows", selectedRows);
        //         const dataToExport = selectedRows.length > 0 ? monthTasksData.filter(row => selectedRows.includes(row.key)) : [];
        //         console.log("exportToExcel - dataToExport", dataToExport);
        //         let date = '';
        //         const header = ['UserId', 'Date', 'Meeting', 'Project', 'Learning', 'Training', 'TotalHours', 'ExtraHours'];
                
        //         const data = dataToExport.map(row => {
        //             const rowData:any[] = [];
        //             rowData.push(row.task[0].userId); // Add userId
        //             rowData.push(row.task[0].date); // Add Date
        //             date = row.task[0].date;
        //             // Initialize task data to 0 if missing
        //             const taskData: { [key: string]: number } = {
        //                 'Meeting': 0,
        //                 'Project': 0,
        //                 'Learning': 0,
        //                 'Training': 0
        //             };
        
        //             // Populate task data with actual values if available
        //             row.task.forEach(task => {
        //                 taskData[task.task] = parseFloat(task.totalHours || '0');
        //             });
        
        //             // Push task data into rowData
        //             rowData.push(taskData['Meeting']);
        //             rowData.push(taskData['Project']);
        //             rowData.push(taskData['Learning']);
        //             rowData.push(taskData['Training']);
        
        //             // Calculate totalHours and extraHours
        //             const totalHours = rowData.slice(2, 6).reduce((acc, val) => acc + val, 0);
        //             const extraHours = totalHours > 9 ? totalHours - 9 : 0;
        
        //             rowData.push(totalHours);
        //             rowData.push(extraHours);
        
        //             return rowData;
        //         });
        
        //         // Create a workbook and add a worksheet
        //         const workbook = new ExcelJS.Workbook();
        //         const worksheet = workbook.addWorksheet('Sheet1');
        
        //         worksheet.views = [{
        //             showGridLines: false
        //         }];
                
        //         // Determine the length of the header array
        //         const headerLength = header.length;
        
        //         // Add Timesheet row with background color, bold, and 24px font size
        //         const timesheetRow = worksheet.addRow(['TimeSheet']);
        //         timesheetRow.font = { bold: true, size: 24, color: { argb: 'FFFFFF' } };
        //         timesheetRow.fill = {
        //             type: 'pattern',
        //             pattern: 'solid',
        //             fgColor: { argb: '0B4266' } // Blue color
        //         };
        
        //        // Add Name and Month rows with specified values
        //         const nameRow = worksheet.addRow([]);
        //         nameRow.getCell(1).value = 'Name:';
        //         nameRow.getCell(1).font = { bold: true }; // Making "Name:" bold
        //         nameRow.getCell(2).value = 'Sasi Kumar';
        
        //         const monthRow = worksheet.addRow([]);
        //         monthRow.getCell(1).value = 'Month:';
        //         monthRow.getCell(1).font = { bold: true }; // Making "Month:" bold
        //         monthRow.getCell(2).value = formatDateToMonthYear(date); // Dynamically convert date to "Month Year" format
                    
        //         // Add empty rows
        //         for (let i = 0; i < 4; i++) {
        //             worksheet.addRow([]);
        //         }
        //         // Add a row with horizontal gridline (6th row)
        //         const gridlineRow = worksheet.addRow(Array(headerLength).fill('')); // Add empty content for each column
        //         gridlineRow.eachCell(cell => {
        //             cell.border = {
        //                 bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
        //             };
        //         });
        
        //         // Add empty row after the gridline row
        //         worksheet.addRow([]);
                    
        //         // Add header row with styles starting from 8th row
        //         const headerRow = worksheet.addRow(header);
        //         headerRow.font = { bold: true, color: { argb: 'FFFFFF' } }; // Make the text bold and white
        
        //         // Set background color for header cells
        //         headerRow.eachCell(cell => {
        //             cell.fill = {
        //                 type: 'pattern',
        //                 pattern: 'solid',
        //                 fgColor: { argb: '0B4266' } // Blue color
        //             };
        //         });
        
        //         // Add data rows
        //         data.forEach(rowData => {
        //             const row = worksheet.addRow(rowData);
        //             // Set border and text alignment for data rows
        //             row.eachCell(cell => {
        //                 cell.border = {
        //                     top: { style: 'thin' },
        //                     left: { style: 'thin' },
        //                     bottom: { style: 'thin' },
        //                     right: { style: 'thin' }
        //                 };
        //                 cell.alignment = { horizontal: 'left' }; // Align text to the left
        //             });
        //         });
        
        //         // Add pie chart
        //         const chartContainer1 = document.getElementById('pie-chart-container'); // Get pie chart container element
        //         const chartContainer2 = document.getElementById('line-chart-container'); // Get line chart container element
        //         if (!chartContainer1 || !chartContainer2) return;
        
        //         // Add pie chart
        //         const pieChartPromise = html2canvas(chartContainer1).then(canvas1 => {
        //             const imgData1 = canvas1.toDataURL('image/png'); // Convert canvas to image data
        //             const imgId1 = workbook.addImage({
        //                 base64: imgData1,
        //                 extension: 'png',
        //             });
        //             worksheet.addImage(imgId1,{
        //                 tl: { col: 1, row: 0 } as ExcelJS.Anchor,
        //                 br: { col: 3, row: 0 } as ExcelJS.Anchor,
        //                 editAs: 'absolute'
        //             });
        //         });

        //         // Add line chart
        //         const lineChartPromise = html2canvas(chartContainer2).then(canvas2 => {
        //             const imgData2 = canvas2.toDataURL('image/png'); // Convert canvas to image data
        //             const imgId2 = workbook.addImage({
        //                 base64: imgData2,
        //                 extension: 'png',
        //             });
        //             worksheet.addImage(imgId2, {
        //                 tl: { col: 1, row: 0 } as ExcelJS.Anchor,
        //                 br: { col: 3, row: 0 } as ExcelJS.Anchor,
        //                 editAs: 'oneCell', // Specify the editAs property to indicate how the image should be anchored
        //             });
        //         });
        
        //         // Set column widths based on header length
        //         worksheet.columns.forEach((column, index) => {
        //             if (index < headerLength) {
        //                 column.width = 24; // Adjust width as needed
        //             } else {
        //                 column.hidden = true; // Hide columns beyond the header length
        //             }
        //         });
        
        //         // Add a row with horizontal gridline (6th row)
        //         const gridlineRowEnd = worksheet.addRow(Array(worksheet.columns.length).fill('')); // Add empty content for each column
        //         gridlineRowEnd.eachCell(cell => {
        //             cell.border = {
        //                 bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
        //             };
        //         });
        
        //         worksheet.addRow([]);
        //         worksheet.addRow([]);
        //         worksheet.addRow([]);
        //         // Insert a gridline above "Approved By"
        //         const approveGridline = worksheet.addRow(['']); // Add empty content for each column
        //         approveGridline.eachCell(cell => {
        //             cell.border = {
        //                 bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
        //             };
        //         });
        //         const approveRow = worksheet.addRow([]);
        //         approveRow.getCell(1).value = 'Approved By';
        //         approveRow.getCell(1).font = { bold: true }; 
        //         const approveName = worksheet.addRow([]);
        //         approveName.getCell(1).value = 'Name: Srinivasan M';
        //         approveName.getCell(1).font = { bold: true }; 
        //         worksheet.addRow([]);
        
        //         // Add a row with horizontal gridline (6th row)
        //         const gridlineRowEndBy = worksheet.addRow(Array(worksheet.columns.length).fill('')); // Add empty content for each column
        //         gridlineRowEndBy.eachCell(cell => {
        //             cell.border = {
        //                 bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
        //             };
        //         });
        //         // Generate Excel file
        //         // Wait for both promises to resolve
        //         Promise.all([pieChartPromise, lineChartPromise]).then(() => {
        //             // Once both charts are added, generate Excel file
        //             workbook.xlsx.writeBuffer().then(buffer => {
        //                 const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        //                 saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
        //             });
        //         });
                        
        
        //     } catch (error) {
        //         console.error('Error exporting to Excel:', error);
        //     }
        // };
        
    
        const exportToExcel = async () => {
            try {
                let imgId1: number;
                let imgId2: number;
                console.log("exportToExcel - selectedRows", selectedRows);
                const dataToExport = selectedRows.length > 0 ? monthTasksData.filter(row => selectedRows.includes(row.key)) : [];
                console.log("exportToExcel - dataToExport", dataToExport);
                let date = '';
                let userId = '';
                const header = ['Date', 'Work Location', 'Task', 'Title', 'Start Time', 'End Time', 'Shift Hours', 'Description', 'Reporting To'];
                
                const data = dataToExport.map((row: DateTask) => {
                    date = row.task[0].date;
                    userId = row.task[0].userId;
                    return row.task.map((task: Task) => {
                        return [
                            task.date || '',
                            task.workLocation || '',
                            task.task || '',
                            task.title || '',
                            task.startTime || '',
                            task.endTime || '',
                            task.totalHours || '',
                            task.description || '',
                            task.reportingTo || ''
                        ];
                    });
                });
                // Flatten the array
                const flattenedData = data.flat();            
        
                // Create a workbook and add a worksheet
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet1');
        
                worksheet.views = [{
                    showGridLines: false
                }];
        
                // Determine the length of the header array
                const headerLength = header.length;
        
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
                nameRow.getCell(2).value = 'Sasi Kumar';
                const userIdRow = worksheet.addRow([]);
                userIdRow.getCell(1).value = 'UserID:';
                userIdRow.getCell(1).font = { bold: true }; // Making "Name:" bold
                userIdRow.getCell(2).value = userId;
        
                const monthRow = worksheet.addRow([]);
                monthRow.getCell(1).value = 'Month:';
                monthRow.getCell(1).font = { bold: true }; // Making "Month:" bold
                monthRow.getCell(2).value = formatDateToMonthYear(date); // Dynamically convert date to "Month Year" format
                    
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

                // Add both images to the same row
                worksheet.addImage(pieChartImageId, {
                    tl: { col: 1, row: currentRow } as ExcelJS.Anchor, // Top-left cell
                    br: { col: 4, row: currentRow + 13 }as ExcelJS.Anchor, // Bottom-right cell
                });

                worksheet.addImage(lineChartImageId, {
                    tl: { col: 5, row: currentRow } as ExcelJS.Anchor, // Top-left cell
                    br: { col: 8, row: currentRow + 13 } as ExcelJS.Anchor, // Bottom-right cell
                });
                // Add a row with horizontal gridline (6th row)
                const gridlineRow = worksheet.addRow(Array(headerLength).fill('')); // Add empty content for each column
                gridlineRow.eachCell(cell => {
                    cell.border = {
                        bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                    };
                });
        
                // Add empty row after the gridline row
                worksheet.addRow([]);
                    
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
        
                // Add data rows
                flattenedData.forEach(rowData => {
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
                worksheet.columns.forEach((column, index) => {
                    if (index < headerLength) {
                        column.width = 23; // Adjust width as needed
                    } else {
                        column.hidden = true; // Hide columns beyond the header length
                    }
                });
        
                // Add a row with horizontal gridline (6th row)
                const gridlineRowEnd = worksheet.addRow(Array(worksheet.columns.length).fill('')); // Add empty content for each column
                gridlineRowEnd.eachCell(cell => {
                    cell.border = {
                        bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                    };
                });
        
                worksheet.addRow([]);
                worksheet.addRow([]);
                

                worksheet.addRow([]);
                // Insert a gridline above "Approved By"
                const approveGridline = worksheet.addRow(['']); // Add empty content for each column
                approveGridline.eachCell(cell => {
                    cell.border = {
                        bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                    };
                });
                const approveRow = worksheet.addRow([]);
                approveRow.getCell(1).value = 'Approved By';
                approveRow.getCell(1).font = { bold: true }; 
                const approveName = worksheet.addRow([]);
                approveName.getCell(1).value = 'Name: Srinivasan M';
                approveName.getCell(1).font = { bold: true }; 
                worksheet.addRow([]);
        
                // Add a row with horizontal gridline (6th row)
                const gridlineRowEndBy = worksheet.addRow(Array(worksheet.columns.length).fill('')); // Add empty content for each column
                gridlineRowEndBy.eachCell(cell => {
                    cell.border = {
                        bottom: { style: 'thin' } // Add a thin bottom border to create a horizontal gridline
                    };
                });
        
                
        
                // Generate Excel file
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
                saveAs(blob, `user_details_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
        
            } catch (error) {
                console.error('Error exporting to Excel:', error);
            }
        };
        
    const handleExportOption = (key: string) => {
        if (key === 'all' || selectedRows.length === 0) {
          // Notify if no rows are selected
          if (selectedRows.length === 0) {
            message.warning('Please select rows to export.');
            return;
          }
          // Proceed with export
        //   exportToExcel(selectedRows, monthTasksData);
            exportToExcel();
        } else {
          exportToExcel();
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
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Get the specific month key

                    const date = record.task.length > 0 ? record.task[0].date : '';
                    return date;
                },
            },
            {
                title: 'Project',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let projectTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Project') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            projectTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {projectTotalHours}H
                        </div>
                    );
                },
            },
            {
                title: 'Meeting',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let meetingTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Meeting') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            meetingTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {meetingTotalHours}H
                        </div>
                    );
                },
            },            
            {
                title: 'Training',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let trainingTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Training') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            trainingTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {trainingTotalHours}H
                        </div>
                    );
                },
            },
            {
                title: 'Learning',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed: 'left',
                render: (_, record: DateTask) => {
                    // Initialize total hours for the 'Learning' task
                    let learningTotalHours = 0;
            
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        // Check if the current task is a 'Learning' task
                        if (task.task === 'Learning') {
                            // Add the total hours of the 'Learning' task to the accumulated total
                            learningTotalHours += parseFloat(task.totalHours || '0');
                        }
                    });
            
                    return (
                        <div>
                            {learningTotalHours}H
                        </div>
                    );
                },
            },            
            {
                title: 'Shift Hours',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize variables to store task hours and total hours
                    let totalHours = 0;
                    const taskHours: { [key: string]: number } = {};
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        const totalHoursForTask = parseFloat(task.totalHours || '0');
                        totalHours += totalHoursForTask; // Accumulate total hours
                        taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
                    });

                    // Calculate extra hours if total hours exceed 9
                    const extraHours = totalHours > 9 ? totalHours - 9 : 0;

                    // Filter and render only the total hours for the 'Project' tasks
                    return (
                        <div>
                            {totalHours.toFixed(2)}H
                        </div>
                    );
                },
            },
            {
                title: 'Extra Hours',
                dataIndex: 'tasks',
                key: 'tasks',
                width: '15%',
                fixed:'left',
                render: (_, record: DateTask) => {
                    // Initialize variables to store task hours and total hours
                    let totalHours = 0;
                    const taskHours: { [key: string]: number } = {};
                    // Iterate over each task in the record
                    record.task.forEach(task => {
                        const totalHoursForTask = parseFloat(task.totalHours || '0');
                        totalHours += totalHoursForTask; // Accumulate total hours
                        taskHours[task?.task] = (taskHours[task?.task] || 0) + totalHoursForTask; // Add task hours
                    });

                    // Calculate extra hours if total hours exceed 9
                    const extraHours = totalHours > 9 ? totalHours - 9 : 0;

                    // Filter and render only the total hours for the 'Project' tasks
                    return (
                        <div>
                            {extraHours.toFixed(2)}H
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
        //   sorter: (a: Task, b: Task) => {
        //     return a.task.localeCompare(b.task);
        //   },
          dataIndex: 'task',
          key: 'task',
          fixed: 'left',
        },
        {
            title: 'Title',
            // sorter: (a: Task, b: Task) => {
            //   return a.title.localeCompare(b.title);
            // },
            dataIndex: 'title',
            key: 'title',
            fixed: 'left',
          },
        {
          title: 'Start Time',
        //   sorter: (a: Task, b: Task) => {
        //     return a.startTime.localeCompare(b.startTime);
        //   },
          dataIndex: 'startTime',
          key: 'startTime',
          fixed: 'left',
        },
        {
          title: 'End Time',
        //   sorter: (a: Task, b: Task) => {
        //     return a.endTime.localeCompare(b.endTime);
        //   },
          dataIndex: 'endTime',
          key: 'endTime',
          fixed: 'left',
        },
        {
          title: 'Total Hours',
        //   sorter: (a: Task, b: Task) => {
        //     return a.totalHours.localeCompare(b.totalHours);
        //   },
          dataIndex: 'totalHours',
          key: 'totalHours',
          fixed: 'left',
        },
        {
          title: 'Description',
        //   sorter: (a: Task, b: Task) => {
        //     return a.description.localeCompare(b.description);
        //   },
          dataIndex: 'description',
          key: 'description',
          fixed: 'left',
        },
    ];

    // JSX for modal content
    const modalContent = clickedRecord && (
        <Table
            className='addtask-table'
            columns={innerColumn as ColumnsType<Task>}
            dataSource={clickedRecord.task}
            pagination={false}
        />
    );

    return (
        <div id="dashboardLayout" className='flex gap-5'>
            <>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{display:'flex', alignItems:'flex-start', margin:'10px 20px'}}>
                            <div>
                                <Space className="flex gap-5">
                                    <Avatar icon={<UserOutlined />} size={65} />
                                    <div>
                                    <div>
                                        <strong style={{fontSize:'20px'}}>Sasi Kumar</strong>
                                    </div>
                                    {/* Displaying the userId */}
                                    <div style={{textAlign:'left', fontSize:'16px'}}>{userId}</div>
                                    </div>
                                </Space>
                            </div>

                        </div>
                        <div style={{marginRight:'20px', marginTop:'25px'}}>
                            <Dropdown overlay={exportMenuForPDF} placement="bottomLeft">
                                <Button
                                type="primary"
                                style={{ marginLeft: "8px", height: "40px", width:'102px', background:'#0B4266', color:'white'}}
                                >
                                Export PDF
                                </Button>
                            </Dropdown>
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
                    
                    <div  style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 20px', alignItems: 'center' }}>
                        <div id='pie-chart-container' style={{ 
                            transition: 'box-shadow .3s',
                            background: 'white',
                            boxShadow: '0 0 4px rgba(33,33,33,.2)',  
                            borderRadius: '5px', 
                            padding: '46px', 
                            width: '48%', 
                            height: '350px', 
                            boxSizing: 'border-box',
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            border: '1px solid white' // Set border to white
                        }}>
                            
                            {/* <Chart
                                options={{
                                    ...chartOptions,
                                    chart: {
                                        ...chartOptions.chart,
                                        background: 'white' // Set background color to white
                                    }
                                }}
                                series={chartSeries}
                                type="pie"
                                width="380"
                            /> */}
                            <PieChart width={400} height={400} style={{background: 'white'}}>
                                <Pie
                                    dataKey="value"
                                    isAnimationActive={false}
                                    data={chartData}
                                    cx={200}
                                    cy={200}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    label
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                {/* <Legend /> */}
                            </PieChart>
                        </div>
                        <div style={{ 
                            transition: 'box-shadow .3s', 
                            background: 'white',
                            boxShadow: '0 0 4px rgba(33,33,33,.2)',  
                            borderRadius: '5px', 
                            padding: '20px', 
                            width: '48%', 
                            boxSizing: 'border-box',
                            overflowX: 'auto' // Enable horizontal scrolling if needed
                        }}>
                            <div id='line-chart-container'>
                                <LineChart 
                                    width={700} 
                                    height={300} 
                                    data={chartDatas} 
                                    margin={{ top: 50, right: 30, left: 20, bottom: 70 }} // Adjust margin bottom to allow more space for x-axis labels
                                    style={{ background: 'white' }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="date" 
                                        angle={-90} // Rotate the labels vertically
                                        textAnchor="end" // Anchor the text at the end of the tick
                                        tick={{ fontSize: '8px' }} // Optionally, adjust font size for better readability
                                    />

                                    <YAxis 
                                        label={{ 
                                            value: 'Percentage of Extra Hours Worked', 
                                            angle: -90, 
                                            position: 'insideMiddle', 
                                            style: { fontSize: 12, paddingRight: '5px' } // Reduce font size for better readability
                                        }} 
                                    />

                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
                                </LineChart>
                            </div>
                        </div>

                    </div>

                    <div style={{fontWeight:'bold', color:'#0B4266',fontSize:'20px',textAlign:'center', margin:'10px 20px'}}>{formattedMonth}</div>
                    <ConfigProvider theme={config}>
                        <Table
                            rowSelection={{
                                type: 'checkbox',
                                selectedRowKeys: selectedRows,
                                onChange: handleRowSelection
                            }}
                            onRow={(record: DateTask) => ({
                                onClick: () => handleRowClick(record),
                                // onMouseEnter: () => handleRowHover(record),
                                // onMouseLeave: handleRowLeave,
                            })}
                            columns={column} 
                            className='table-striped-rows approvalrequests-table'
                            dataSource={monthTasksData}
                            pagination={false}
                        />   
                        <Modal
                           title={clickedRecord && clickedRecord.task.length > 0 ? dayjs(clickedRecord.task[0].date).format('MMMM DD, YYYY') : ""}
                            visible={modalVisible}
                            onCancel={() => setModalVisible(false)}
                            footer={null}
                        >
                            {modalContent}
                        </Modal>

                    </ConfigProvider>
                    <div style={{display:'flex', justifyContent:'flex-end', margin:"10px 20px"}}>   
                        <Button style={{height:'200%' ,width: '100px', backgroundColor: 'red', color: 'white', marginRight:'10px' }} onClick={handleReject}>
                        Reject
                        </Button>
                        <Button style={{height:'200%', width:'100px', backgroundColor:'green', color:'white'}} onClick={handleApprove}>Approve</Button>
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
                
            </>
        </div>

    )
}

export default MonthTasks