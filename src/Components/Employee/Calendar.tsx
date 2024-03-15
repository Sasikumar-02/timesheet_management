import React, {useState, useEffect  } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
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
    // Fetch events from an API or any other source
    // Here, I'm assuming you have an array of events with dates and colors
    let fetchedEvents: Event[] = [];

    // Get pendingTasks from localStorage
    const pendingTasksString = localStorage.getItem("pendingTask");
    if (pendingTasksString) {
        const pendingTasks: string[] = JSON.parse(pendingTasksString);
        // Iterate over pendingTasks and create a "Submitted" event for each date
        pendingTasks.forEach((pendingDate) => {
            fetchedEvents.push({
                title: "Submitted",
                start: pendingDate,
                color: "orange",
            });
        });
    }

    const rejectedKeysString = localStorage.getItem("rejectedKeys");
    if (rejectedKeysString) {
        const rejectedKeysData: RejectedKeys = JSON.parse(rejectedKeysString);

        // Check if the userId matches the storedKeysString
        if (rejectedKeysData.hasOwnProperty(userId)) {
            // Iterate over each RecentRejected object for the specific userId
            rejectedKeysData[userId].forEach((rejectedKey) => {
                const { date, comment } = rejectedKey;

                fetchedEvents.push({
                    title: `Rejected - ${comment}`,
                    start: date,
                    color: "red",
                });
            });
        }
    }

    const selectedKeysString = localStorage.getItem("selectedKeys");
        if (selectedKeysString) {
            const selectedKeys: SelectedKeys = JSON.parse(selectedKeysString);

            // Check if the user ID exists in selectedKeys
            if (selectedKeys.hasOwnProperty(userId)) {
                const userSelectedKeys: string[] = selectedKeys[userId];
                userSelectedKeys.forEach((selectedDate) => {
                    fetchedEvents.push({
                        title: "Approved",
                        start: selectedDate,
                        color: "green",
                    });
                });
            }
        }

    setEvents(fetchedEvents);
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
