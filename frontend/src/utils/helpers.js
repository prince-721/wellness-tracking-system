export const formatDate = (date = new Date()) => new Date(date).toISOString().split('T')[0];
export const today = () => formatDate();

export const formatDisplayDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatShortDay = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0,1);
};

export const formatLongDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
};

export const getBMIColor = (category) => {
  switch (category) {
    case 'Underweight': return '#38BDF8';
    case 'Normal':      return '#4CAF82';
    case 'Overweight':  return '#F4A324';
    case 'Obese':       return '#EF4444';
    default:            return '#9CA3AF';
  }
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF82';
  if (score >= 60) return '#F4A324';
  return '#EF4444';
};

export const truncate = (str, n = 20) => str?.length > n ? str.slice(0, n) + '…' : str || '';

export const getCalorieColor = (pct) => {
  if (pct < 80)  return '#38BDF8';
  if (pct < 100) return '#4CAF82';
  if (pct < 120) return '#F4A324';
  return '#EF4444';
};

export const formatWater = (ml) => ml >= 1000 ? `${(ml/1000).toFixed(1)}L` : `${ml}ml`;
export const formatMinutes = (mins) => {
  if (!mins) return '0m';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins/60), m = mins%60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};
