// Dummy Detection History dataset — frontend-only, larger sample spanning
// several dates so search/status/date filters and pagination all have
// something real to work against. Shape mirrors the future API response.

const DEFECT_TYPES = ['Hole', 'Stain', 'Knot', 'Broken Thread'];

const pad = (n) => String(n).padStart(2, '0');

const formatDate = (d) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const formatTime = (d) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

const buildRecord = (index, daysAgo, hour, minute, overrides = {}) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);

  const isDefect = index % 3 === 0;
  const isProcessing = index % 11 === 0 && index !== 0;

  const defectType = isDefect
    ? DEFECT_TYPES[index % DEFECT_TYPES.length]
    : null;

  const record = {
    inspectionId: `00${index + 1}`.slice(-3),
    dateObj: date,
    date: formatDate(date),
    time: formatTime(date),
    fabricStatus: isDefect ? 'Defect Found' : 'Normal Fabric',
    defectType: defectType || '—',
    confidence: isDefect
      ? Number((90 + ((index * 7) % 9)).toFixed(1))
      : Number((96 + ((index * 3) % 4)).toFixed(1)),
    esp32Action: isDefect ? 'Servo Activated' : 'No Action',
    status: isProcessing ? 'Processing' : isDefect ? 'Defect' : 'Normal',
    ...overrides,
  };

  return record;
};

export const historyRecords = Array.from({ length: 32 }, (_, i) => {
  // Spread records across today, this week, this month, and older
  const daysAgo =
    i < 5 ? 0 : i < 12 ? Math.floor((i - 5) / 2) + 1 : i < 22 ? i - 5 : i + 15;

  const hour = 8 + (i % 10);
  const minute = (i * 13) % 60;

  return buildRecord(i, daysAgo, hour, minute);
}).sort((a, b) => b.dateObj - a.dateObj);