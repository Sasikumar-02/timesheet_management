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


import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Calendar as BigCalendar, Views, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./Layout";
import dayjs from "dayjs";
import { notification } from "antd";
import { checkDomainOfScale } from "recharts/types/util/ChartUtils";

function Calendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const storedMonth = localStorage.getItem("selectedMonth");
    const storedYear = localStorage.getItem("selectedYear");
    console.log("useeffect", storedMonth, storedYear);
    if (storedMonth && storedYear) {
      const monthYearString = `${storedMonth} ${storedYear}`;
      const selectedDate = dayjs(monthYearString, "MMMM YYYY").toDate(); // Parse string to Date object
      console.log("selectedDate-useeffect", selectedDate);
      console.log("useeffect", selectedDate);
      setSelectedDate(selectedDate);
    } 
  }, []);


  console.log("selectedDate", selectedDate);

  const handleDateClick = (arg: DateClickArg) => {
    const clickedDate = dayjs(arg.date);

    if (clickedDate.isAfter(dayjs(), "day")) {
      notification.warning({
        message: "Date Restriction",
        description: "Restricted to open future dates.",
      });
    } else {
      const formattedDate = clickedDate.format("YYYY-MM-DD");
      navigate(`/addtask?date=${formattedDate}`);
    }
  };
  console.log("initialDate:", selectedDate);
  // Format selectedDate as (Jan 1, 1970 UTC)
  const formattedInitialDate = selectedDate?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  console.log("formattedInitialDate",formattedInitialDate);
  return (
    <div>
      <DashboardLayout>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={"dayGridMonth"}
          initialDate={formattedInitialDate}
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
