import { LocationItem, DailyHours } from '@/types';

/**
 * Calculates distance in kilometers between two geographic coordinates using the Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Formats a 24-hour time string ("05:00", "22:30") to 12-hour format ("5:00 AM", "10:30 PM")
 */
export function formatTimeString(timeStr: string): string {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Determines current open/close status from location hours
 */
export function getLocationHoursStatus(location: LocationItem): {
  isOpen: boolean;
  statusText: string;
  is24Hours: boolean;
} {
  // Check for 24/7 access
  const has24HoursAmenity = location.amenities?.some((a) =>
    a.toLowerCase().includes('24/7')
  );
  const has24HoursString = location.hours?.toLowerCase().includes('24/7');

  if (has24HoursAmenity || has24HoursString) {
    return {
      isOpen: true,
      statusText: 'Open 24/7',
      is24Hours: true,
    };
  }

  // Get current day name in Manila time
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[now.getDay()];

  const todayHours: DailyHours | undefined = location.daily_hours?.find(
    (dh) => dh.day.toLowerCase() === currentDay.toLowerCase()
  );

  if (todayHours) {
    if (todayHours.is24Hours) {
      return { isOpen: true, statusText: 'Open 24/7', is24Hours: true };
    }

    const openParts = todayHours.open.split(':').map((p) => parseInt(p, 10));
    const closeParts = todayHours.close.split(':').map((p) => parseInt(p, 10));

    if (openParts.length === 2 && closeParts.length === 2) {
      const openMinutes = openParts[0] * 60 + openParts[1];
      const closeMinutes = closeParts[0] * 60 + closeParts[1];
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
        return {
          isOpen: true,
          statusText: `Open now · Closes at ${formatTimeString(todayHours.close)}`,
          is24Hours: false,
        };
      } else {
        return {
          isOpen: false,
          statusText: `Closed · Opens at ${formatTimeString(todayHours.open)}`,
          is24Hours: false,
        };
      }
    }
  }

  // Fallback heuristic based on hours string
  const currentHour = now.getHours();
  const isOpen = currentHour >= 5 && currentHour < 23;
  return {
    isOpen,
    statusText: isOpen ? 'Open now · Closes at 11:00 PM' : 'Closed · Opens at 5:00 AM',
    is24Hours: false,
  };
}

