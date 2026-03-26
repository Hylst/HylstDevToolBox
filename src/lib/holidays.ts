// Public holidays database by country
export interface Holiday {
  date: string; // MM-DD format for fixed dates, or function for movable
  name: string;
  movable?: boolean;
}

export interface CountryHolidays {
  code: string;
  name: string;
  holidays: Holiday[];
}

// Easter calculation (Meeus/Jones/Butcher algorithm)
export const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

// Get movable holidays based on Easter
export const getMovableHolidays = (year: number, countryCode: string): { date: Date; name: string }[] => {
  const easter = getEasterDate(year);
  const holidays: { date: Date; name: string }[] = [];

  const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  if (countryCode === 'FR') {
    holidays.push({ date: addDays(easter, 1), name: "Lundi de Pâques" });
    holidays.push({ date: addDays(easter, 39), name: "Ascension" });
    holidays.push({ date: addDays(easter, 50), name: "Lundi de Pentecôte" });
  } else if (countryCode === 'US') {
    // US doesn't have Easter-based federal holidays
  } else if (countryCode === 'DE') {
    holidays.push({ date: addDays(easter, -2), name: "Karfreitag" });
    holidays.push({ date: addDays(easter, 1), name: "Ostermontag" });
    holidays.push({ date: addDays(easter, 39), name: "Christi Himmelfahrt" });
    holidays.push({ date: addDays(easter, 50), name: "Pfingstmontag" });
  } else if (countryCode === 'CH') {
    holidays.push({ date: addDays(easter, -2), name: "Vendredi Saint" });
    holidays.push({ date: addDays(easter, 1), name: "Lundi de Pâques" });
    holidays.push({ date: addDays(easter, 39), name: "Ascension" });
    holidays.push({ date: addDays(easter, 50), name: "Lundi de Pentecôte" });
  } else if (countryCode === 'CA') {
    holidays.push({ date: addDays(easter, -2), name: "Vendredi Saint" });
    holidays.push({ date: addDays(easter, 1), name: "Lundi de Pâques" });
  } else if (countryCode === 'UK') {
    holidays.push({ date: addDays(easter, -2), name: "Good Friday" });
    holidays.push({ date: addDays(easter, 1), name: "Easter Monday" });
  }

  return holidays;
};

// Fixed holidays by country
export const countriesHolidays: CountryHolidays[] = [
  {
    code: 'FR',
    name: 'France',
    holidays: [
      { date: '01-01', name: "Jour de l'An" },
      { date: '05-01', name: "Fête du Travail" },
      { date: '05-08', name: "Victoire 1945" },
      { date: '07-14', name: "Fête Nationale" },
      { date: '08-15', name: "Assomption" },
      { date: '11-01', name: "Toussaint" },
      { date: '11-11', name: "Armistice" },
      { date: '12-25', name: "Noël" },
    ]
  },
  {
    code: 'US',
    name: 'États-Unis',
    holidays: [
      { date: '01-01', name: "New Year's Day" },
      { date: '07-04', name: "Independence Day" },
      { date: '11-11', name: "Veterans Day" },
      { date: '12-25', name: "Christmas Day" },
      // Note: MLK Day, Presidents Day, Memorial Day, Labor Day, Thanksgiving are movable
    ]
  },
  {
    code: 'DE',
    name: 'Allemagne',
    holidays: [
      { date: '01-01', name: "Neujahr" },
      { date: '05-01', name: "Tag der Arbeit" },
      { date: '10-03', name: "Tag der Deutschen Einheit" },
      { date: '12-25', name: "1. Weihnachtstag" },
      { date: '12-26', name: "2. Weihnachtstag" },
    ]
  },
  {
    code: 'CH',
    name: 'Suisse',
    holidays: [
      { date: '01-01', name: "Nouvel An" },
      { date: '08-01', name: "Fête nationale" },
      { date: '12-25', name: "Noël" },
    ]
  },
  {
    code: 'CA',
    name: 'Canada',
    holidays: [
      { date: '01-01', name: "Jour de l'An" },
      { date: '07-01', name: "Fête du Canada" },
      { date: '12-25', name: "Noël" },
      { date: '12-26', name: "Lendemain de Noël" },
    ]
  },
  {
    code: 'UK',
    name: 'Royaume-Uni',
    holidays: [
      { date: '01-01', name: "New Year's Day" },
      { date: '12-25', name: "Christmas Day" },
      { date: '12-26', name: "Boxing Day" },
    ]
  },
  {
    code: 'BE',
    name: 'Belgique',
    holidays: [
      { date: '01-01', name: "Jour de l'An" },
      { date: '05-01', name: "Fête du Travail" },
      { date: '07-21', name: "Fête nationale" },
      { date: '08-15', name: "Assomption" },
      { date: '11-01', name: "Toussaint" },
      { date: '11-11', name: "Armistice" },
      { date: '12-25', name: "Noël" },
    ]
  },
  {
    code: 'ES',
    name: 'Espagne',
    holidays: [
      { date: '01-01', name: "Año Nuevo" },
      { date: '01-06', name: "Epifanía" },
      { date: '05-01', name: "Fiesta del Trabajo" },
      { date: '08-15', name: "Asunción" },
      { date: '10-12', name: "Fiesta Nacional" },
      { date: '11-01', name: "Todos los Santos" },
      { date: '12-06', name: "Día de la Constitución" },
      { date: '12-08', name: "Inmaculada Concepción" },
      { date: '12-25', name: "Navidad" },
    ]
  },
  {
    code: 'IT',
    name: 'Italie',
    holidays: [
      { date: '01-01', name: "Capodanno" },
      { date: '01-06', name: "Epifania" },
      { date: '04-25', name: "Festa della Liberazione" },
      { date: '05-01', name: "Festa del Lavoro" },
      { date: '06-02', name: "Festa della Repubblica" },
      { date: '08-15', name: "Ferragosto" },
      { date: '11-01', name: "Ognissanti" },
      { date: '12-08', name: "Immacolata Concezione" },
      { date: '12-25', name: "Natale" },
      { date: '12-26', name: "Santo Stefano" },
    ]
  },
];

// Get all holidays for a specific year and country
export const getHolidaysForYear = (year: number, countryCode: string): { date: Date; name: string }[] => {
  const country = countriesHolidays.find(c => c.code === countryCode);
  if (!country) return [];

  const holidays: { date: Date; name: string }[] = [];

  // Add fixed holidays
  country.holidays.forEach(h => {
    const [month, day] = h.date.split('-').map(Number);
    holidays.push({
      date: new Date(year, month - 1, day),
      name: h.name
    });
  });

  // Add movable holidays
  const movable = getMovableHolidays(year, countryCode);
  holidays.push(...movable);

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Check if a date is a holiday
export const isHoliday = (date: Date, countryCode: string): { isHoliday: boolean; name?: string } => {
  const year = date.getFullYear();
  const holidays = getHolidaysForYear(year, countryCode);
  
  const found = holidays.find(h => 
    h.date.getFullYear() === date.getFullYear() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getDate() === date.getDate()
  );

  return found ? { isHoliday: true, name: found.name } : { isHoliday: false };
};

// Check if a date is a weekend
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Check if a date is a business day
export const isBusinessDay = (date: Date, countryCode: string): boolean => {
  return !isWeekend(date) && !isHoliday(date, countryCode).isHoliday;
};

// Count business days between two dates
export const countBusinessDays = (
  startDate: Date, 
  endDate: Date, 
  countryCode: string,
  excludeWeekends: boolean = true,
  excludeHolidays: boolean = true
): number => {
  let count = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const isWeekendDay = isWeekend(current);
    const holidayInfo = isHoliday(current, countryCode);

    let shouldCount = true;
    if (excludeWeekends && isWeekendDay) shouldCount = false;
    if (excludeHolidays && holidayInfo.isHoliday) shouldCount = false;

    if (shouldCount) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Add business days to a date
export const addBusinessDays = (
  startDate: Date, 
  days: number, 
  countryCode: string
): Date => {
  const result = new Date(startDate);
  let addedDays = 0;
  const direction = days >= 0 ? 1 : -1;
  const targetDays = Math.abs(days);

  while (addedDays < targetDays) {
    result.setDate(result.getDate() + direction);
    if (isBusinessDay(result, countryCode)) {
      addedDays++;
    }
  }

  return result;
};
