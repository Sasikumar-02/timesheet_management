import React, {useState, useEffect  } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import api from "../../Api/Api-Service";
import DashboardLayout from "../Dashboard/Layout";
import dayjs from "dayjs";
import { notification } from "antd";
import { RecentRejected , RejectedKeys, SelectedKeys} from "../Manager/MonthTasks";
import '../Styles/UserProfile.css';
interface Event {
  title: string;
  start: string;
  color: string;
}
const Calendar = () => {
  const userId = '1234';
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get(`/api/v1/timeSheet/fetch-tasks-by-employee`);
        const tasks = response.data.response.data; // Assuming response contains an array of tasks
        console.log("tasks", tasks);
  
        // Group tasks by date
        const groupedTasks = tasks.reduce((acc:any, task:any) => {
          const date = task.date;
          if (!acc[date]) {
            acc[date] = task;
          }
          return acc;
        }, {});
  
        const fetchedEvents: Event[] = Object.values(groupedTasks).map((task: any) => {
          let color = '';
          let title = '';
  
          switch (task.taskStatus) {
            case 'Approved':
              color = 'green';
              title = 'Approved';
              break;
            case 'Rejected':
              color = 'red';
              title = `Rejected - ${task.comment}`;
              break;
            default:
              color = 'orange';
              title = 'Pending';
              break;
          }
  
          return {
            title,
            start: task.date,
            color
          };
        });
  
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
  
    fetchTasks();
  }, []);
  

  

  const handleDateClick = (arg: DateClickArg) => {
    // arg.date is the clicked date
    const clickedDate = dayjs(arg.date);
    // Check if the clicked date is in the future month
    if (clickedDate.isAfter(dayjs(), 'month')) {
        // Display a notification if the date is in the future month
        notification.warning({
            message: 'Month Restriction',
            description: 'Cannot navigate to future months.',
        });
    } else if (clickedDate.isAfter(dayjs(), 'day')) {
        // Display a notification if the date is in the future day
        notification.warning({
            message: 'Date Restriction',
            description: 'Restricted to open future dates.',
        });
    } else {
        // Format the date to the desired format (you may need to adjust the format)
        const formattedDate = clickedDate.format('YYYY-MM-DD');

        // Navigate to the /addtask route with the date as a query parameter
        navigate(`/employee/addtask?date=${formattedDate}`, { state: { formattedDate } });
    }
  };

  const handleDatesSet = (arg: any) => {
    const currentMonth = dayjs(arg.start);
    const today = dayjs();
    if (currentMonth.isAfter(today, 'month')) {
        // If the displayed month is in the future, navigate back to the current month
        const calendarApi = arg.view.calendar;
        calendarApi.gotoDate(today.toDate());
    }
  };

  // Get the clickedDate from localStorage
  const clickedDateFromLocalStorage = localStorage.getItem('clickedDate');
  // Use clickedDate from localStorage if available, otherwise use the current year
  const currentDate = clickedDateFromLocalStorage ? clickedDateFromLocalStorage : dayjs().startOf('year').format('YYYY-MM-DD');
  return (
    <div>
      <>
      <div id="calendar-main" style={{width:'97%', margin:'30px 20px 20px 20px', fontFamily:'poppins', fontSize:'14px', cursor:'pointer'}}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={"dayGridMonth"}
          initialDate={currentDate} // Set the initial date to January of the current year
          headerToolbar={{
            start: "title",
            //center: " ", //,timeGridWeek,timeGridDay
            end: "prev,next",
          }}
          height={"80vh"}
          dateClick={handleDateClick}
          events={events}
          datesSet={handleDatesSet}
          eventClassNames="calendar"
        />
        </div>
      </>
    </div>
  );
}

export default Calendar;

