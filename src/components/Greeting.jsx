import { useEffect, useRef, useState } from 'react';
import greetings from '../data/greetings.json';
import { getUserName, USER_NAME_CHANGE_EVENT } from '../services/userSettings';
import './Greeting.css';

function getTimeOfDay(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function getGreeting(timeOfDay) {
  const options = greetings[timeOfDay];
  return options[Math.floor(Math.random() * options.length)];
}

function Greeting() {
  const [name, setName] = useState(getUserName);
  const [greeting, setGreeting] = useState(() => getGreeting(getTimeOfDay(new Date())));
  const timeOfDayRef = useRef(getTimeOfDay(new Date()));
  const greetingParts = greeting.split('{name}');

  useEffect(() => {
    const updateName = () => setName(getUserName());
    const updateTimeOfDay = () => {
      const nextTimeOfDay = getTimeOfDay(new Date());
      if (nextTimeOfDay === timeOfDayRef.current) return;
      timeOfDayRef.current = nextTimeOfDay;
      setGreeting(getGreeting(nextTimeOfDay));
    };
    const interval = window.setInterval(updateTimeOfDay, 60_000);

    window.addEventListener(USER_NAME_CHANGE_EVENT, updateName);
    window.addEventListener('storage', updateName);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(USER_NAME_CHANGE_EVENT, updateName);
      window.removeEventListener('storage', updateName);
    };
  }, []);

  return (
    <h2 className="greeting-text">
      {greetingParts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}
          {index < greetingParts.length - 1 && (
            <span className="user-name">{name}</span>
          )}
        </span>
      ))}
    </h2>
  );
}

export default Greeting;
