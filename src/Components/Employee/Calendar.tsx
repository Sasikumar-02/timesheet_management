import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../Api/Api-Service";
import { Table } from "antd/lib";
import DashboardLayout from "../Dashboard/Layout";
import dayjs from "dayjs";
import { notification } from "antd";
import { ColumnsType } from "antd/es/table";
import {Modal} from "antd";
interface Event {
  title: string;
  start: string;
  color: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const { month, year } = location.state;
  const [uniqueRequestId, setUniqueRequestId]= useState('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [clickedRecord, setClickedRecord] = useState<any>();
  const [modalVisible, setModalVisible] = useState(false);
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
    const newMonth = dayjs(arg.view.currentStart).format("MMMM");
    const newYear = dayjs(arg.view.currentStart).format("YYYY");
    fetchCalendarView(newMonth, newYear);
  };

  const clickedDateFromLocalStorage = localStorage.getItem("clickedDate");
  const currentDate = clickedDateFromLocalStorage
    ? clickedDateFromLocalStorage
    : dayjs().startOf("year").format("YYYY-MM-DD");

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
    const minutes = Math.round((decimalHours - hours) * 60);
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


    const columns: ColumnsType<any> = [
      {
        title: 'Sl. No',
        width: '132px',
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
    ]

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
