'use client';

import { useState, useEffect } from 'react';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  attendees: number;
  color: 'blue' | 'teal' | 'orange';
}

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());
  
  // Sample meetings data
  const meetings: Meeting[] = [
    {
      id: '1',
      title: 'Meeting with Harry',
      startTime: '12:00',
      endTime: '13:00',
      date: new Date(),
      attendees: 12,
      color: 'teal'
    },
    {
      id: '2',
      title: 'Meeting with Salah',
      startTime: '10:00',
      endTime: '11:30',
      date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
      attendees: 3,
      color: 'blue'
    },
    {
      id: '3',
      title: 'Meeting with Mbappe',
      startTime: '14:00',
      endTime: '15:00',
      date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
      attendees: 3,
      color: 'orange'
    }
  ];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const nextMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    
    const days = daysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month) || 7; // Convert Sunday (0) to 7 for European calendar format
    
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < firstDay; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= days; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  // Check if a date is today
  const isToday = (day: number) => {
    return currentDate.getDate() === day && 
           currentDate.getMonth() === displayDate.getMonth() && 
           currentDate.getFullYear() === displayDate.getFullYear();
  };

  // Get day's meetings
  const getDayMeetings = (day: number) => {
    const date = new Date(displayDate.getFullYear(), displayDate.getMonth(), day);
    return meetings.filter(meeting => {
      const meetingDate = new Meeting(meeting.date);
      return meetingDate.getDate() === date.getDate() && 
             meetingDate.getMonth() === date.getMonth() && 
             meetingDate.getFullYear() === date.getFullYear();
    });
  };

  // Format date like "Sat, Jan 20"
  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = days[date.getDay()];
    const month = monthNames[date.getMonth()].substring(0, 3);
    return `${day}, ${month} ${date.getDate()}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 h-fit">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button 
              onClick={previousMonth}
              className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Mon</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tue</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Wed</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Thu</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fri</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sat</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Sun</div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 text-center">
          {generateCalendarDays().map((day, index) => (
            <div key={index} className="text-sm py-2 relative">
              {day ? (
                <div className={`
                  w-8 h-8 flex items-center justify-center mx-auto 
                  ${isToday(day) ? 'bg-primary text-white rounded-full' : ''}
                `}>
                  {day}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <div className="text-sm font-medium">Today</div>
        
        {meetings.filter(meeting => 
          meeting.date.getDate() === currentDate.getDate() && 
          meeting.date.getMonth() === currentDate.getMonth() && 
          meeting.date.getFullYear() === currentDate.getFullYear()
        ).map(meeting => (
          <div key={meeting.id} className="flex items-start">
            <div className={`w-1 bg-${meeting.color}-500 self-stretch mr-3 rounded-full`}></div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{meeting.title}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meeting.startTime} - {meeting.endTime} PM</p>
            </div>
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-orange-400 ring-2 ring-white dark:ring-gray-800"></div>
              <div className="w-6 h-6 rounded-full bg-blue-400 ring-2 ring-white dark:ring-gray-800"></div>
              <div className="w-6 h-6 rounded-full bg-gray-600 ring-2 ring-white dark:ring-gray-800"></div>
              {meeting.attendees > 3 && (
                <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300">+{meeting.attendees - 3}</div>
              )}
            </div>
          </div>
        ))}
        
        {meetings.some(meeting => 
          meeting.date.getDate() !== currentDate.getDate() && 
          meeting.date.getMonth() === currentDate.getMonth()
        ) && (
          <>
            <div className="text-sm font-medium mt-5">
              {formatDate(meetings.find(meeting => 
                meeting.date.getDate() !== currentDate.getDate()
              )?.date || new Date())}
            </div>
            
            {meetings.filter(meeting => 
              meeting.date.getDate() !== currentDate.getDate() &&
              meeting.date.getMonth() === currentDate.getMonth()
            ).map(meeting => (
              <div key={meeting.id} className="flex items-start">
                <div className={`w-1 bg-${meeting.color}-500 self-stretch mr-3 rounded-full`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{meeting.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{meeting.startTime} - {meeting.endTime} PM</p>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-pink-400 ring-2 ring-white dark:ring-gray-800"></div>
                  <div className="w-6 h-6 rounded-full bg-blue-400 ring-2 ring-white dark:ring-gray-800"></div>
                  <div className="w-6 h-6 rounded-full bg-amber-400 ring-2 ring-white dark:ring-gray-800"></div>
                  {meeting.attendees > 3 && (
                    <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-white dark:ring-gray-800 flex items-center justify-center text-[10px] text-gray-600 dark:text-gray-300">+{meeting.attendees - 3}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
