import { useState, useEffect } from 'react';
import './Calendar.css';

function Calendar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Formatted date values
  const day = time.toLocaleDateString('en-US', { weekday: 'long' });
  const dateMonth = time.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  const timeString = time.toTimeString().split(' ')[0]; // hh:mm:ss

  return (
    <div className="datetime-section">
      <div className="datetime-day">{day}</div>
      <div className="datetime-date">{dateMonth}</div>
      <div className="datetime-time">{timeString}</div>
    </div>
  );
}

export default Calendar;
