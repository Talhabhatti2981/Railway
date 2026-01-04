// LocalStorage utility functions for Railway Management System

const STORAGE_KEYS = {
  TRAINS: 'railway_trains',
  BOOKINGS: 'railway_bookings',
  SEATS: 'railway_seats',
  COMPLAINTS: 'railway_complaints',
  TRACKING: 'railway_tracking',
};

// Train Schedule Storage
export const trainStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINS);
    return data ? JSON.parse(data) : [];
  },
  save: (trains) => {
    localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trains));
  },
  add: (train) => {
    const trains = trainStorage.getAll();
    trains.push(train);
    trainStorage.save(trains);
    return train;
  },
  update: (trainNumber, updatedTrain) => {
    const trains = trainStorage.getAll();
    const index = trains.findIndex(t => t.trainNumber === trainNumber);
    if (index !== -1) {
      trains[index] = { ...trains[index], ...updatedTrain };
      trainStorage.save(trains);
      return trains[index];
    }
    return null;
  },
  delete: (trainNumber) => {
    const trains = trainStorage.getAll();
    const filtered = trains.filter(t => t.trainNumber !== trainNumber);
    trainStorage.save(filtered);
    return filtered;
  },
  findByRoute: (from, to) => {
    const trains = trainStorage.getAll();
    return trains.filter(train => 
      train.from.toLowerCase() === from.toLowerCase() && 
      train.to.toLowerCase() === to.toLowerCase()
    );
  },
};

// Booking Storage
export const bookingStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  },
  save: (bookings) => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },
  add: (booking) => {
    const bookings = bookingStorage.getAll();
    bookings.push(booking);
    bookingStorage.save(bookings);
    return booking;
  },
  findByPNR: (pnr) => {
    const bookings = bookingStorage.getAll();
    return bookings.find(b => b.pnr === pnr);
  },
  findByTrain: (trainNumber, date) => {
    const bookings = bookingStorage.getAll();
    return bookings.filter(b => 
      b.trainNumber === trainNumber && 
      b.date === date
    );
  },
};

// Seat Storage
export const seatStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SEATS);
    return data ? JSON.parse(data) : {};
  },
  save: (seats) => {
    localStorage.setItem(STORAGE_KEYS.SEATS, JSON.stringify(seats));
  },
  getSeats: (trainNumber, date) => {
    const seats = seatStorage.getAll();
    const key = `${trainNumber}_${date}`;
    return seats[key] || null;
  },
  setSeats: (trainNumber, date, seatData) => {
    const seats = seatStorage.getAll();
    const key = `${trainNumber}_${date}`;
    seats[key] = seatData;
    seatStorage.save(seats);
  },
  bookSeat: (trainNumber, date, seatNumber) => {
    const seats = seatStorage.getAll();
    const key = `${trainNumber}_${date}`;
    
    // Initialize if doesn't exist
    if (!seats[key]) {
      const coachList = ['A', 'B', 'C', 'D'];
      const seatsPerCoach = 15;
      const available = [];
      
      coachList.forEach(coach => {
        for (let i = 1; i <= seatsPerCoach; i++) {
          available.push(`${coach}-${i}`);
        }
      });
      
      seats[key] = { booked: [], available };
    }
    
    // Only book if not already booked
    if (!seats[key].booked.includes(seatNumber)) {
      seats[key].booked.push(seatNumber);
      // Remove from available array
      seats[key].available = seats[key].available.filter(seat => seat !== seatNumber);
      seatStorage.save(seats);
    }
  },
};

// Complaint Storage
export const complaintStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    return data ? JSON.parse(data) : [];
  },
  save: (complaints) => {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  },
  add: (complaint) => {
    const complaints = complaintStorage.getAll();
    complaints.push(complaint);
    complaintStorage.save(complaints);
    return complaint;
  },
  update: (id, updates) => {
    const complaints = complaintStorage.getAll();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], ...updates };
      complaintStorage.save(complaints);
      return complaints[index];
    }
    return null;
  },
};

// Tracking Storage
export const trackingStorage = {
  getAll: () => {
    const data = localStorage.getItem(STORAGE_KEYS.TRACKING);
    return data ? JSON.parse(data) : {};
  },
  save: (tracking) => {
    localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(tracking));
  },
  getTrain: (trainNumber) => {
    const tracking = trackingStorage.getAll();
    return tracking[trainNumber] || null;
  },
  setTrain: (trainNumber, data) => {
    const tracking = trackingStorage.getAll();
    tracking[trainNumber] = data;
    trackingStorage.save(tracking);
  },
  updatePosition: (trainNumber, position) => {
    const tracking = trackingStorage.getAll();
    if (tracking[trainNumber]) {
      tracking[trainNumber].currentPosition = position;
      tracking[trainNumber].lastUpdated = new Date().toISOString();
      trackingStorage.save(tracking);
    }
  },
};

// Initialize with sample data if empty
export const initializeSampleData = () => {
  const trains = trainStorage.getAll();
  if (trains.length === 0) {
    const sampleTrains = [
      {
        trainNumber: '12345',
        trainName: 'Rajdhani Express',
        from: 'Delhi',
        to: 'Mumbai',
        departureTime: '08:00',
        arrivalTime: '20:00',
        stops: [
          { station: 'Agra', time: '10:00' },
          { station: 'Jaipur', time: '12:30' },
          { station: 'Ahmedabad', time: '16:00' },
        ],
        classes: ['AC First', 'AC Second', 'AC Third', 'Sleeper'],
      },
      {
        trainNumber: '67890',
        trainName: 'Shatabdi Express',
        from: 'Mumbai',
        to: 'Delhi',
        departureTime: '06:00',
        arrivalTime: '18:00',
        stops: [
          { station: 'Pune', time: '08:30' },
          { station: 'Nashik', time: '11:00' },
        ],
        classes: ['AC Chair Car', 'Executive'],
      },
      {
        trainNumber: '11111',
        trainName: 'Duronto Express',
        from: 'Kolkata',
        to: 'Chennai',
        departureTime: '10:00',
        arrivalTime: '22:00',
        stops: [
          { station: 'Bhubaneswar', time: '14:00' },
          { station: 'Vijayawada', time: '18:00' },
        ],
        classes: ['AC First', 'AC Second', 'Sleeper'],
      },
    ];
    trainStorage.save(sampleTrains);
  }
};

