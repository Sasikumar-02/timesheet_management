import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../Api/Api-Service";
import DashboardLayout from "../Dashboard/Layout";
import dayjs from "dayjs";
import { notification } from "antd";

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

  useEffect(() => {
    fetchCalendarView(month, year);
  }, [month, year]);

  const fetchCalendarView = async (month: any, year: any) => {
    try {
      const response = await api.get("/api/v1/timeSheet/task-calendar-view", {
        params: {
          month,
          year,
        },
      });

      const calendarData = response.data.response.data;

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
      navigate(`/employee/addtask?date=${formattedDate}`, {
        state: { formattedDate },
      });
    }
  };

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

  return (
    <div>
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

        </div>
      </>
    </div>
  );
};

export default Calendar;
