import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg} from "@fullcalendar/interaction";
import { EventClickArg } from '@fullcalendar/core';
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import api from "../../Api/Api-Service";
import { Table } from "antd/lib";
import DashboardLayout from "../Dashboard/Layout";
import dayjs from "dayjs";
import { notification } from "antd";
import { ColumnsType } from "antd/es/table";
import {Modal} from "antd";
import { EditOutlined, DeleteOutlined,CloseCircleOutlined,LeftOutlined, RightOutlined } from '@ant-design/icons';
interface Event {
  title: string;
  start: string;
  color: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {confirm}= Modal;
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const { month, year, clickedDate } = location.state;
  const [uniqueRequestId, setUniqueRequestId]= useState('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [clickedRecord, setClickedRecord] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [selectedKeysToHide, setSelectedKeysToHide]=useState<string[]>([]);
  console.log("uniqueRequestId",uniqueRequestId);
  useEffect(() => {
    fetchCalendarView(month, year);
  }, [month, year]);

  const handleDateClick = (arg: DateClickArg) => {
    const clickedDate = dayjs(arg.date);

    if (clickedDate.isAfter(dayjs(), "month")) {
      notification.warning({
        message: "Month Restriction",
        description: "Cannot navigate to future months.",
      });
    } else if (clickedDate.isAfter(dayjs(), "day")) {
      notification.warning({
        message: "Date Restriction",
        description: "Restricted to open future dates.",
      });
    } else {
      const formattedDate = clickedDate.format("YYYY-MM-DD");
     // fetchDataByUniqueId(uniqueRequestId);
      // navigate(`/employee/addtask?date=${formattedDate}`, {
      //   state: { formattedDate },
      // });
      console.log("formattedDate",formattedDate);
      setFormattedDate(formattedDate);
      setModalVisible(true);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await api.get("/api/v1/timeSheet/task-calendar-view", {
                params: {
                    month,
                    year,
                },
            });

            const calendarData = response?.data?.response?.data;
            console.log("calendarData", calendarData);

            // Iterate through calendarData to find a match for formattedDate
            calendarData.forEach((task: any) => {
                const taskDate = dayjs(task.date).format("YYYY-MM-DD");
                if (formattedDate === taskDate) {
                    setUniqueRequestId(task.uniqueId);
                }
            });
        } catch (err) {
            throw err;
        }
    };

    fetchData();
}, [formattedDate]);



  const fetchCalendarView = async (month: any, year: any) => {
    try {
      const response = await api.get("/api/v1/timeSheet/task-calendar-view", {
        params: {
          month,
          year,
        },
      });

      const calendarData = response?.data?.response?.data;

      const events = calendarData?.map((task: any) => {
        let color = "";
        let title = "";

        switch (task.status) {
          case "Approved":
            color = "green";
            title = "Approved";
            break;
          case "Rejected":
            color = "red";
            title = `Rejected - ${task.comments}`;
            break;
          default:
            color = "orange";
            title = "Pending";
            break;
        }

        return {
          title,
          start: task.date, // Convert date string to Date object
          color,
        };
      });

      console.log("events", events);
      setEvents(events);
    } catch (err) {
      throw err;
    }
  };

  useEffect(()=>{
    fetchDataByUniqueId(uniqueRequestId)
  }, [uniqueRequestId])

  const handleDatesSet = (arg: any) => {
    const currentMonthDate = dayjs(arg.start);
    setCurrentMonth(currentMonthDate);
  };

  const handlePrevNextClick = (arg: any) => {
    setRefetch((prev)=>!prev);
    const newMonth = dayjs(arg.view.currentStart).format("MMMM");
    const newYear = dayjs(arg.view.currentStart).format("YYYY");
    fetchCalendarView(newMonth, newYear);
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch tasks from the API
        const response = await api.get('/api/v1/timeSheet/fetch-tasks-by-employee');
        console.log("response-fulldata", response?.data?.response?.data);
  
        // Find the first task with status "Approved" for each date
        const approvedDates = response.data.response.data.reduce((acc: string[], task: any) => {
          if (task.taskStatus === "Approved" && !acc.includes(task.date)) {
            acc.push(task.date);
          }
          return acc;
        }, []);
  
        // Update the state with the filtered tasks
        console.log("approvedDates", approvedDates);
        // Update selectedKeysToHide state with approved dates
        setSelectedKeysToHide(approvedDates);
      } catch (error) {
        // Handle errors
        console.error('Error fetching tasks:', error);
        // You can also show a notification or perform other error handling here
      }
    };
    // Call the fetchTasks function
    fetchTasks();
  }, [refetch]); // Empty dependency array to fetch tasks only once when the component mounts
  
  

  const currentDate = clickedDate
    ? clickedDate
    : dayjs().startOf("year").format("YYYY-MM-DD");
    console.log("clickedDateFromLocalStorage -1",currentDate);
    useEffect(()=>{
      fetchDataByUniqueId(uniqueRequestId);
    },[refetch])
    const fetchDataByUniqueId = async (uniqueRequestId: string) => {
      try {
          const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-uniqueId?uniqueId=${uniqueRequestId}`);
          console.log('Response data:', response.data);
          setClickedRecord(response?.data?.response?.data);
          // Process response data if needed
      } catch (error) {
          console.error('Error fetching data by unique ID:', error);
          // Handle error here
      }
  };

  const hoursDecimalToHoursMinutes = (decimalHours:any) => {
    // Split the decimal value into hours and minutes
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 100);
    console.log("hours minutes",hours, minutes);
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

  const handleEditTask = async (record: any) => {
    navigate('/employee/addtask', {state:{record}});
  };

  const handleDeleteTask = useCallback((task_id:any) => {
    // Display confirmation modal before deleting the task
    confirm({
      title: 'Delete Task',
      content: 'Are you sure you want to delete the task?',
      okText: 'Yes',
      okButtonProps: {
        style: {
          width: '80px', backgroundColor: '#0B4266', color: 'white'
        },
      },
      cancelText: 'No',
      cancelButtonProps: {
        style: {
          width: '80px', backgroundColor: '#0B4266', color: 'white'
        },
      },
      async onOk() {
        // Logic to delete the task if user confirms
        try {
          // Make DELETE request to delete the task
          await api.delete(`/api/v1/timeSheet/delete-task/${task_id}`);
          setRefetch((refetch)=>!refetch);
          // Optionally, perform any additional actions after deletion
          // For example, refetch the tasks or update the UI
        } catch (error) {
          // Handle errors
          console.error('Error deleting task:', error);
          // You can also show a notification or perform other error handling here
        }
      },
      onCancel() {
        // Logic if user cancels deletion
      },
    });
  }, []);


    const columns: ColumnsType<any> = [
      {
        title: 'Sl. No',
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
        //sorter: (a: Task, b: Task) => a.date.localeCompare(b.date),
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
      // {
      //   title: 'Status',
      //   //sorter: (a: Task, b: Task) => a.reportingTo.localeCompare(b.reportingTo),
      //   dataIndex: 'taskStatus',
      //   key: 'taskStatus',
      //   fixed: 'left',
      // }, 
      {
        title: 'Actions',
        dataIndex: 'actions',
        key: 'actions',
        render: (_, record, index) => {
          // const isExistingTask = taskList.some(task => task.task_id === record.task_id);
          const isDateSelected = selectedKeysToHide.includes(record.date);
          
          // Filter tasks by userId
          //const userTasks = taskList.filter(task => task.userId === record.userId);
          
          // Check if the user has tasks for the selected date
          //const hasUserTasksForDate = userTasks.some(task => task.date === record.date);
      
          return (
            <div>
              <EditOutlined
                onClick={() => handleEditTask(record)}
                style={{
                  marginRight: '8px',
                  cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
                  color: (isDateSelected ) ? 'grey' : 'blue', //|| !hasUserTasksForDate
                  fontSize: '20px',
                }}
                disabled={isDateSelected } //|| !hasUserTasksForDate
              />
              <DeleteOutlined
                onClick={() => handleDeleteTask(record?.timeSheetId)}
                style={{
                  cursor: (isDateSelected ) ? 'not-allowed' : 'pointer', //|| !hasUserTasksForDate
                  color: (isDateSelected ) ? 'grey' : 'red', //|| !hasUserTasksForDate
                  fontSize: '20px',
                }}
                disabled={isDateSelected } //|| !hasUserTasksForDate
              />
            </div>
          );
        },
      }
    ]

    const handleEventClick = (arg: EventClickArg) => {
      const clickedEvent = arg.event; // Extract the event from the click event
      console.log("clickedEvent", clickedEvent.start)
      const clickedDate = dayjs(clickedEvent.start); // Assuming the event has a start date
      
      // Similar logic to handleDateClick
      if (clickedDate.isAfter(dayjs(), "month")) {
          notification.warning({
              message: "Month Restriction",
              description: "Cannot navigate to future months.",
          });
      } else if (clickedDate.isAfter(dayjs(), "day")) {
          notification.warning({
              message: "Date Restriction",
              description: "Restricted to open future dates.",
          });
      } else {
          const formattedDate = clickedDate.format("YYYY-MM-DD");
          setFormattedDate(formattedDate);
          setModalVisible(true);
      }
  };
  

    const modalContent = clickedRecord && (
      <Table
          className='addtask-table'
          columns={columns as ColumnsType<any>}
          dataSource={clickedRecord}
          pagination={false}
      />
  );

  return (
    // <div>
    //    <div style={{display:'flex', flexDirection:'row', margin:'10px 20px'}}>
    //     <div style={{width:'100%', marginLeft:'20px', marginTop:'20px'}}>
    //     <FullCalendar
    //         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    //         initialView={"dayGridMonth"}
    //         initialDate={currentDate}
    //         headerToolbar={{
    //           start: "title",
    //           end: "prev,next",
    //         }}
    //         height={"80vh"}
            
    //         dateClick={handleDateClick}
    //         events={events}
    //         datesSet={handlePrevNextClick} // Assign handlePrevNextClick to datesSet
    //         eventClassNames="calendar"
    //       />
    //     </div>
    //     {/* <div style={{ width: '50%', border: '1px solid #E6E6E6', margin: '0px 20px', maxHeight: '400px', overflow: 'auto' }}>
    //       <h1 className='userprofile-main'>History</h1>
    //       <Table
    //           className='addtask-table'
    //           columns={columns as ColumnsType<any>}
    //           dataSource={clickedRecord}
    //           pagination={false}
    //       />
    //     </div> */}
    //     <div style={{width:'50%',border: '1px solid #E6E6E6', margin:'20px 20px 0px 20px'}}>
    //       <h1>Task Details</h1>
    //       <h2 style={{textAlign:'left', marginLeft:'20px'}}>Date:{formattedDate}</h2>
    //       <Table
    //         className='addtask-table'
    //         columns={columns as ColumnsType<any>}
    //         dataSource={clickedRecord}
    //         pagination={false}
    //       />
    //     </div>

    //   </div>
    // </div>
    <>
    <div
      id="calendar-main"
      style={{
        width: "97%",
        margin: "30px 20px 20px 20px",
        fontFamily: "poppins",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        initialDate={currentDate}
        headerToolbar={{
          start: "title",
          end: "prev,next",
        }}
        height={"80vh"}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        events={events}
        datesSet={handlePrevNextClick} // Assign handlePrevNextClick to datesSet
        eventClassNames="calendar"
      />
      <Modal
          title={clickedRecord && clickedRecord.tasks?.length > 0 ? dayjs(clickedRecord.tasks[0].date).format('MMMM DD, YYYY') : ""}
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
      >
          {modalContent}
      </Modal>

    </div>
    </> 

  );
};

export default Calendar;

{/* <>
<div
  id="calendar-main"
  style={{
    width: "97%",
    margin: "30px 20px 20px 20px",
    fontFamily: "poppins",
    fontSize: "14px",
    cursor: "pointer",
  }}
>
  <FullCalendar
    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
    initialView={"dayGridMonth"}
    initialDate={currentDate}
    headerToolbar={{
      start: "title",
      end: "prev,next",
    }}
    height={"80vh"}
    dateClick={handleDateClick}
    events={events}
    datesSet={handlePrevNextClick} // Assign handlePrevNextClick to datesSet
    eventClassNames="calendar"
  />

</div>
</>  */}
