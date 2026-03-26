// ICS file utilities for calendar import/export

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  rrule?: string; // Recurrence rule
  allDay?: boolean;
}

// Generate unique ID
const generateUID = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@devtools`;
};

// Format date for ICS
const formatICSDate = (date: Date, allDay: boolean = false): string => {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

// Escape special characters in ICS
const escapeICS = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

// Fold long lines (ICS spec: max 75 chars per line)
const foldLine = (line: string): string => {
  const maxLength = 75;
  if (line.length <= maxLength) return line;
  
  let result = '';
  let currentLine = line;
  
  while (currentLine.length > maxLength) {
    result += currentLine.slice(0, maxLength) + '\r\n ';
    currentLine = currentLine.slice(maxLength);
  }
  result += currentLine;
  
  return result;
};

// Generate ICS content from events
export const generateICS = (events: CalendarEvent[], calendarName: string = 'DevTools Calendar'): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DevTools//Calendar//FR',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id || generateUID()}`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    
    if (event.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.start, true)}`);
      lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.end, true)}`);
    } else {
      lines.push(`DTSTART:${formatICSDate(event.start)}`);
      lines.push(`DTEND:${formatICSDate(event.end)}`);
    }
    
    lines.push(`SUMMARY:${escapeICS(event.title)}`);
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }
    
    if (event.location) {
      lines.push(`LOCATION:${escapeICS(event.location)}`);
    }
    
    if (event.rrule) {
      lines.push(`RRULE:${event.rrule}`);
    }
    
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  
  return lines.map(foldLine).join('\r\n');
};

// Parse ICS content to events
export const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const lines = icsContent.replace(/\r\n /g, '').split(/\r?\n/);
  
  let currentEvent: Partial<CalendarEvent> | null = null;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = { id: generateUID() };
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.title && currentEvent.start) {
        if (!currentEvent.end) {
          currentEvent.end = new Date(currentEvent.start);
          currentEvent.end.setHours(currentEvent.end.getHours() + 1);
        }
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const keyPart = line.slice(0, colonIndex);
      const value = line.slice(colonIndex + 1);
      const key = keyPart.split(';')[0];
      
      switch (key) {
        case 'UID':
          currentEvent.id = value;
          break;
        case 'SUMMARY':
          currentEvent.title = value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'DESCRIPTION':
          currentEvent.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'LOCATION':
          currentEvent.location = value.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';');
          break;
        case 'DTSTART':
          currentEvent.start = parseICSDate(value, keyPart.includes('VALUE=DATE'));
          currentEvent.allDay = keyPart.includes('VALUE=DATE');
          break;
        case 'DTEND':
          currentEvent.end = parseICSDate(value, keyPart.includes('VALUE=DATE'));
          break;
        case 'RRULE':
          currentEvent.rrule = value;
          break;
      }
    }
  }
  
  return events;
};

// Parse ICS date format
const parseICSDate = (dateStr: string, allDay: boolean = false): Date => {
  if (allDay) {
    const year = parseInt(dateStr.slice(0, 4));
    const month = parseInt(dateStr.slice(4, 6)) - 1;
    const day = parseInt(dateStr.slice(6, 8));
    return new Date(year, month, day);
  }
  
  // Format: 20231225T120000Z or 20231225T120000
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  const hour = parseInt(dateStr.slice(9, 11)) || 0;
  const minute = parseInt(dateStr.slice(11, 13)) || 0;
  const second = parseInt(dateStr.slice(13, 15)) || 0;
  
  if (dateStr.endsWith('Z')) {
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  
  return new Date(year, month, day, hour, minute, second);
};

// Download ICS file
export const downloadICS = (events: CalendarEvent[], filename: string = 'calendar.ics'): void => {
  const content = generateICS(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Generate RRULE string
export const generateRRule = (options: {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: string[]; // MO, TU, WE, TH, FR, SA, SU
  byMonth?: number[];
  byMonthDay?: number[];
}): string => {
  const parts: string[] = [`FREQ=${options.freq}`];
  
  if (options.interval && options.interval > 1) {
    parts.push(`INTERVAL=${options.interval}`);
  }
  
  if (options.count) {
    parts.push(`COUNT=${options.count}`);
  } else if (options.until) {
    parts.push(`UNTIL=${formatICSDate(options.until)}`);
  }
  
  if (options.byDay && options.byDay.length > 0) {
    parts.push(`BYDAY=${options.byDay.join(',')}`);
  }
  
  if (options.byMonth && options.byMonth.length > 0) {
    parts.push(`BYMONTH=${options.byMonth.join(',')}`);
  }
  
  if (options.byMonthDay && options.byMonthDay.length > 0) {
    parts.push(`BYMONTHDAY=${options.byMonthDay.join(',')}`);
  }
  
  return parts.join(';');
};

// Parse RRULE string
export const parseRRule = (rrule: string): {
  freq: string;
  interval: number;
  count?: number;
  until?: Date;
  byDay?: string[];
  byMonth?: number[];
  byMonthDay?: number[];
} => {
  const result: any = { freq: 'DAILY', interval: 1 };
  
  const parts = rrule.split(';');
  parts.forEach(part => {
    const [key, value] = part.split('=');
    switch (key) {
      case 'FREQ':
        result.freq = value;
        break;
      case 'INTERVAL':
        result.interval = parseInt(value);
        break;
      case 'COUNT':
        result.count = parseInt(value);
        break;
      case 'UNTIL':
        result.until = parseICSDate(value);
        break;
      case 'BYDAY':
        result.byDay = value.split(',');
        break;
      case 'BYMONTH':
        result.byMonth = value.split(',').map(Number);
        break;
      case 'BYMONTHDAY':
        result.byMonthDay = value.split(',').map(Number);
        break;
    }
  });
  
  return result;
};

// Get occurrences of a recurring event
export const getRecurrenceOccurrences = (
  event: CalendarEvent,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences: number = 100
): Date[] => {
  if (!event.rrule) return [event.start];
  
  const occurrences: Date[] = [];
  const rule = parseRRule(event.rrule);
  let current = new Date(event.start);
  let count = 0;
  
  while (current <= rangeEnd && count < maxOccurrences) {
    if (current >= rangeStart) {
      occurrences.push(new Date(current));
    }
    
    if (rule.count && occurrences.length >= rule.count) break;
    if (rule.until && current >= rule.until) break;
    
    // Advance to next occurrence
    switch (rule.freq) {
      case 'DAILY':
        current.setDate(current.getDate() + rule.interval);
        break;
      case 'WEEKLY':
        current.setDate(current.getDate() + 7 * rule.interval);
        break;
      case 'MONTHLY':
        current.setMonth(current.getMonth() + rule.interval);
        break;
      case 'YEARLY':
        current.setFullYear(current.getFullYear() + rule.interval);
        break;
    }
    
    count++;
  }
  
  return occurrences;
};
