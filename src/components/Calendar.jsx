import { useState, useEffect } from 'react';
import './Calendar.css';

function Calendar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatted date values
  const day = time.toLocaleDateString(undefined, { weekday: 'long' });
  const dateMonth = time.toLocaleDateString(undefined, { day: 'numeric', month: 'long' });
  const timeString = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <div className="datetime-section">
      <div className="datetime-day">{day}</div>
      <div className="datetime-date">{dateMonth}</div>
      <div className="datetime-time">{timeString}</div>
    </div>
  );
}

export default Calendar;
