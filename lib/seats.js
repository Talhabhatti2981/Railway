import SeatMap from './models/SeatMap.js';

export function seatKey(trainNumber, date) {
  return `${trainNumber}_${date}`;
}

function buildDefaultSeats() {
  const coaches = ['A', 'B', 'C', 'D'];
  const seatsPerCoach = 15;
  const available = [];
  coaches.forEach((coach) => {
    for (let i = 1; i <= seatsPerCoach; i++) {
      available.push(`${coach}-${i}`);
    }
  });
  return { booked: [], available };
}

export async function getOrCreateSeats(trainNumber, date) {
  const key = seatKey(trainNumber, date);
  let doc = await SeatMap.findOne({ key });
  if (!doc) {
    const defaults = buildDefaultSeats();
    doc = await SeatMap.create({ key, ...defaults });
  }
  return { booked: doc.booked, available: doc.available, doc };
}

export async function bookSeat(trainNumber, date, seatNumber) {
  const { doc } = await getOrCreateSeats(trainNumber, date);
  if (doc.booked.includes(seatNumber)) {
    throw new Error('Seat already booked');
  }
  if (!doc.available.includes(seatNumber)) {
    throw new Error('Seat not available');
  }
  doc.booked.push(seatNumber);
  doc.available = doc.available.filter((s) => s !== seatNumber);
  await doc.save();
  return { booked: doc.booked, available: doc.available };
}
