// Helper functions
import { seatStorage } from './localStorage.js';

export const generatePNR = () => {
  return 'PNR' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const generateSeatNumber = (coach, seat) => {
  return `${coach}-${seat}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  return time;
};

export const calculateDuration = (departure, arrival) => {
  const [depHour, depMin] = departure.split(':').map(Number);
  const [arrHour, arrMin] = arrival.split(':').map(Number);
  
  let totalMinutes = (arrHour * 60 + arrMin) - (depHour * 60 + depMin);
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h ${minutes}m`;
};

export const getAvailableSeats = (trainNumber, date, totalSeats = 60) => {
  const seatData = seatStorage.getSeats(trainNumber, date);
  if (!seatData) {
    // Initialize seats
    const coaches = ['A', 'B', 'C', 'D'];
    const seatsPerCoach = totalSeats / coaches.length;
    const available = [];
    
    coaches.forEach(coach => {
      for (let i = 1; i <= seatsPerCoach; i++) {
        available.push(`${coach}-${i}`);
      }
    });
    
    seatStorage.setSeats(trainNumber, date, {
      booked: [],
      available,
    });
    
    return { booked: [], available };
  }
  
  return seatData;
};

