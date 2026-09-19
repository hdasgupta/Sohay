export const WEEKDAYS = [0,1,2,3,4,5,6];

export function parseTimeToMinutes(value) {
  const [hour, minute] = String(value).split(':').map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function generateThirtyMinuteSlots(startTime, endTime) {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots = [];
  for (let cursor = start; cursor + 30 <= end; cursor += 30) {
    slots.push(minutesToTime(cursor));
  }
  return slots;
}

export function calculateAge(dob, onDate = new Date()) {
  const birth = new Date(`${dob}T00:00:00`);
  let age = onDate.getFullYear() - birth.getFullYear();
  const month = onDate.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && onDate.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

export function currentDateInIndia(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function isFutureDate(date) { return String(date).slice(0,10) >= currentDateInIndia(); }
