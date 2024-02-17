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

import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./Layout";
import dayjs from "dayjs";
import { notification } from "antd";
function Calendar() {
  const navigate = useNavigate();

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
      navigate(`/addtask?date=${formattedDate}`);
    }
  };

  return (
    <div>
      <DashboardLayout>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"90vh"}
        dateClick={handleDateClick}
        
      />
      </DashboardLayout>
    </div>
  );
}

export default Calendar;
