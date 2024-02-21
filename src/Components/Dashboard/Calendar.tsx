// import moment from "moment";
// import Calendar from "./TempCalendar";

// const events = [
//   {
//     start: moment("2023-03-18T10:00:00").toDate(),
//     end: moment("2023-03-18T11:00:00").toDate(),
//     title: "MRI Registration",
//     data: {
//       type: "Reg",
//     },
//   },
//   {
//     start: moment("2023-03-18T14:00:00").toDate(),
//     end: moment("2023-03-18T15:30:00").toDate(),
//     title: "ENT Appointment",
//     data: {
//       type: "App",
//     },
//   },
// ];

// const components = {
//   event: (props: any) => {
//     const eventType = props?.event?.data?.type;
//     switch (eventType) {
//       case "Reg":
//         return (
//           <div style={{ background: "yellow", color: "white", height: "100%" }}>
//             {props.title}
//           </div>
//         );
//       case "App":
//         return (
//           <div
//             style={{ background: "lightgreen", color: "white", height: "100%" }}
//           >
//             {props.title}
//           </div>
//         );
//       default:
//         return null;
//     }
//   },
// };

// export default function ControlCalendar() {
//   return <Calendar events={events} components={components} />;
// }

// import React from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";
// import timeGridPlugin from "@fullcalendar/timegrid";
// import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
// import { useNavigate } from "react-router-dom";
// import DashboardLayout from "./Layout";
// import dayjs from "dayjs";
// import { notification } from "antd";
// const Calendar=() =>{
//   const navigate = useNavigate();

//   const handleDateClick = (arg: DateClickArg) => {
//     // arg.date is the clicked date
//     const clickedDate = dayjs(arg.date);
  
//     // Check if the clicked date is in the future
//     if (clickedDate.isAfter(dayjs(), 'day')) {
//       // Display a notification if the date is in the future
//       notification.warning({
//         message: 'Date Restriction',
//         description: 'Restricted to open future dates.',
//       });
//     } else {
//       // Format the date to the desired format (you may need to adjust the format)
//       const formattedDate = clickedDate.format('YYYY-MM-DD');
  
//       // Navigate to the /addtask route with the date as a query parameter
//       navigate(`/addtask?date=${formattedDate}`, {state: {formattedDate}});
//     }
//   };

//   return (
//     <div>
//       <DashboardLayout>
//       <FullCalendar
//         plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
//         initialView={"dayGridMonth"}
//         headerToolbar={{
//           start: "today prev,next",
//           center: "title",
//           end: "dayGridMonth,timeGridWeek,timeGridDay",
//         }}
//         height={"90vh"}
//         dateClick={handleDateClick}
        
//       />
//       </DashboardLayout>
//     </div>
//   );
// }

// export default Calendar;

import React, {useState, useEffect  } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./Layout";
import dayjs from "dayjs";
import { notification } from "antd";
interface Event {
  title: string;
  start: string;
  color: string;
}
const Calendar = () => {
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

    // Get rejectedKeys from localStorage
    const rejectedKeysString = localStorage.getItem("rejectedKeys");
    if (rejectedKeysString) {
        const rejectedKeys: string[] = JSON.parse(rejectedKeysString);
        // Iterate over rejectedKeys and create a "Rejected" event for each date
        rejectedKeys.forEach((rejectedDate) => {
            fetchedEvents.push({
                title: "Rejected",
                start: rejectedDate,
                color: "red",
            });
        });
    }

    // Get selectedKeys from localStorage
    const selectedKeysString = localStorage.getItem("selectedKeys");
    if (selectedKeysString) {
        const selectedKeys: string[] = JSON.parse(selectedKeysString);
        // Iterate over selectedKeys and create an "Approved" event for each date
        selectedKeys.forEach((selectedDate) => {
            fetchedEvents.push({
                title: "Approved",
                start: selectedDate,
                color: "green",
            });
        });
    }

    setEvents(fetchedEvents);
}, []);

  
  

  const handleDateClick = (arg: DateClickArg) => {
    // arg.date is the clicked date
    const clickedDate = dayjs(arg.date);
  
    // Check if the clicked date is in the future
    if (clickedDate.isAfter(dayjs(), 'day')) {
      // Display a notification if the date is in the future
      notification.warning({
        message: 'Date Restriction',
        description: 'Restricted to open future dates.',
      });
    } else {
      // Format the date to the desired format (you may need to adjust the format)
      const formattedDate = clickedDate.format('YYYY-MM-DD');
  
      // Navigate to the /addtask route with the date as a query parameter
      navigate(`/addtask?date=${formattedDate}`, { state: { formattedDate } });
    }
  };
  // Get the clickedDate from localStorage
  const clickedDateFromLocalStorage = localStorage.getItem('clickedDate');
  // Use clickedDate from localStorage if available, otherwise use the current year
  const currentDate = clickedDateFromLocalStorage ? clickedDateFromLocalStorage : dayjs().startOf('year').format('YYYY-MM-DD');
  return (
    <div>
      <DashboardLayout>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={"dayGridMonth"}
          initialDate={currentDate} // Set the initial date to January of the current year
          headerToolbar={{
            start: "today prev,next",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height={"90vh"}
          dateClick={handleDateClick}
          events={events}
        />
      </DashboardLayout>
    </div>
  );
}

export default Calendar;
