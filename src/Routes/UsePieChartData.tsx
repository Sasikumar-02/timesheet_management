import React,{useState, useEffect} from "react";
import { Task } from "../Components/Employee/AddTask";
const usePieChartData = () => {
    const [pieChartData, setPieChartData] = useState<{ [key: string]: number }>({});
    const [approvalRequestsData, setApprovalRequestsData] = useState<Task[]>([]);
    const [selectedKeys, setSelectedKeys]=useState<string[]>([]);
    const [selectedMonth, setSelectedMonth]= useState<string>('');
    const [selectedMYear, setSelectedYear]= useState<string>('');
  
    useEffect(() => {
      // Retrieve approvalRequestsData from local storage
      const storedData = localStorage.getItem('approvalRequestsData');
      if (storedData) {
        setApprovalRequestsData(JSON.parse(storedData));
      }
    }, []); // Fetch data only once on component mount
  
    return { pieChartData, setPieChartData, approvalRequestsData, setApprovalRequestsData, selectedKeys, setSelectedKeys, selectedMonth, setSelectedMonth, selectedMYear, setSelectedYear };
  };
  
  export default usePieChartData;