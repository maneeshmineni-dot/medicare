/**
 * Smart Adherence Calendar Generator
 * Converts medication dosage regimens (1-0-1, daily, morning/night) into
 * standard iCalendar (.ics) format with recurring alarms and Google Calendar direct links.
 */

export const generateIcsCalendar = ({
  medicationName = 'Medication',
  dosageInstructions = '1 tablet',
  timing = 'After Food',
  daysDuration = 7,
  schedule = { morning: 1, afternoon: 0, night: 1 }
}) => {
  const now = new Date();
  const formatIcsDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const uid = `med-pv-${Date.now()}@pharmavision.ai`;
  const events = [];

  const slots = [
    { name: 'Morning Dose', count: schedule.morning, hour: 8, minute: 0 },
    { name: 'Afternoon Dose', count: schedule.afternoon, hour: 13, minute: 0 },
    { name: 'Night Dose', count: schedule.night, hour: 20, minute: 0 }
  ];

  slots.forEach((slot, idx) => {
    if (slot.count > 0) {
      const startDate = new Date();
      startDate.setHours(slot.hour, slot.minute, 0, 0);
      const endDate = new Date(startDate.getTime() + 15 * 60000); // 15 min duration

      const summary = `💊 Take ${medicationName} (${slot.name} - ${slot.count} Dose)`;
      const description = `Medication: ${medicationName}\\nDosage: ${dosageInstructions}\\nInstructions: ${timing}\\nAutomated Reminder via PharmaVision AI Adherence Engine.`;

      events.push(`BEGIN:VEVENT
UID:${uid}-${idx}
DTSTAMP:${formatIcsDate(now)}
DTSTART:${formatIcsDate(startDate)}
DTEND:${formatIcsDate(endDate)}
RRULE:FREQ=DAILY;COUNT=${daysDuration}
SUMMARY:${summary}
DESCRIPTION:${description}
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Reminder: Time to take your medication ${medicationName} (${timing})
END:VALARM
END:VEVENT`);
    }
  });

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PharmaVision AI//Smart Adherence Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PharmaVision AI - ${medicationName} Adherence
${events.join('\n')}
END:VCALENDAR`;

  return icsContent;
};

/**
 * Trigger browser download for the .ics calendar file
 */
export const downloadIcsFile = (icsContent, filename = 'medication_schedule.ics') => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

/**
 * Generate a direct Google Calendar web creation URL for the primary dose
 */
export const getGoogleCalendarUrl = ({
  medicationName = 'Medication',
  dosageInstructions = '1 tablet',
  timing = 'After Food'
}) => {
  const startDate = new Date();
  startDate.setHours(8, 0, 0, 0);
  const endDate = new Date(startDate.getTime() + 15 * 60000);

  const formatGoogleDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const title = encodeURIComponent(`💊 PharmaVision Reminder: Take ${medicationName}`);
  const details = encodeURIComponent(`Instructions: ${dosageInstructions} (${timing}). Stay consistent with your medication regimen!`);
  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const recur = encodeURIComponent('RRULE:FREQ=DAILY;COUNT=7');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&recur=${recur}`;
};
