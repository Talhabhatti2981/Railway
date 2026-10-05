import {
  trainStorage,
  bookingStorage,
  seatStorage,
  complaintStorage,
  trackingStorage,
} from './localStorage';
import {
  authStorage,
  createSessionToken,
  parseSessionToken,
  ensureDefaultUsers,
} from './authStorage';
import { generatePNR, getAvailableSeats } from './helpers';

const delay = (ms = 0) => new Promise((r) => setTimeout(r, ms));

const getCurrentUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const session = parseSessionToken(token);
  if (!session?.id) return null;
  const user = authStorage.findById(session.id);
  return user ? authStorage.toPublicUser(user) : null;
};

const normalizeTrainClasses = (train) => ({
  ...train,
  classes: (train.classes || []).map((c) =>
    typeof c === 'string' ? c : c?.name || String(c)
  ),
});

const buildTrackingRoute = (train) => {
  const stops = train.stops || [];
  const route = [
    {
      station: train.from,
      distance: 0,
      time: train.departureTime || '08:00',
    },
  ];
  stops.forEach((stop, i) => {
    route.push({
      station: stop.station,
      distance: Math.min(95, 15 + i * 20),
      time: stop.time,
    });
  });
  route.push({
    station: train.to,
    distance: 100,
    time: train.arrivalTime || '20:00',
  });
  return route;
};

let seeded = false;
const ensureReady = async () => {
  if (!seeded) {
    await ensureDefaultUsers();
    seeded = true;
  }
};

export const localAuthAPI = {
  signup: async (userData) => {
    await ensureReady();
    await delay(80);
    const user = await authStorage.createUser(userData);
    const publicUser = authStorage.toPublicUser(user);
    return { token: createSessionToken(user), user: publicUser };
  },
  login: async ({ email, password }) => {
    await ensureReady();
    await delay(80);
    const user = authStorage.findByEmail(email);
    if (!user || !(await authStorage.verifyPassword(user, password))) {
      throw new Error('Invalid email or password');
    }
    const publicUser = authStorage.toPublicUser(user);
    return { token: createSessionToken(user), user: publicUser };
  },
  updateProfile: async ({ id, name, password }) => {
    await ensureReady();
    const updated = await authStorage.updateUser(id, { name, password });
    const publicUser = authStorage.toPublicUser(updated);
    localStorage.setItem('user', JSON.stringify(publicUser));
    localStorage.setItem('token', createSessionToken(updated));
    return publicUser;
  },
};

export const localUserAPI = {
  getMe: async () => {
    await ensureReady();
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    return user;
  },
};

export const localTrainAPI = {
  getAll: async () => {
    await delay(40);
    return trainStorage.getAll().map(normalizeTrainClasses);
  },
  getByNumber: async (trainNumber) => {
    await delay(40);
    const train = trainStorage
      .getAll()
      .find((t) => String(t.trainNumber) === String(trainNumber));
    return train ? normalizeTrainClasses(train) : null;
  },
  searchByRoute: async (from, to) => {
    await delay(40);
    return trainStorage.findByRoute(from, to).map(normalizeTrainClasses);
  },
  create: async (trainData) => {
    await delay(40);
    const train = normalizeTrainClasses(trainData);
    trainStorage.add(train);
    return train;
  },
  update: async (trainNumber, trainData) => {
    await delay(40);
    const updated = trainStorage.update(trainNumber, normalizeTrainClasses(trainData));
    if (!updated) throw new Error('Train not found');
    return updated;
  },
  delete: async (trainNumber) => {
    await delay(40);
    trainStorage.delete(trainNumber);
    return { success: true };
  },
};

export const localBookingAPI = {
  getAll: async () => {
    await delay(40);
    return bookingStorage.getAll();
  },
  getMy: async () => {
    await delay(40);
    const user = getCurrentUser();
    if (!user) return [];
    return bookingStorage
      .getAll()
      .filter(
        (b) =>
          b.userId === user.id ||
          b.passenger?.email?.toLowerCase() === user.email.toLowerCase()
      );
  },
  getById: async (id) => {
    await delay(40);
    const booking = bookingStorage
      .getAll()
      .find((b) => b._id === id || b.id === id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },
  getByPNR: async (pnr) => {
    await delay(40);
    const booking = bookingStorage.findByPNR(pnr);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },
  create: async (bookingData) => {
    await delay(80);
    const user = getCurrentUser();
    const seats = getAvailableSeats(bookingData.trainNumber, bookingData.date);
    if (bookingData.seat && !seats.available.includes(bookingData.seat)) {
      throw new Error('Seat no longer available');
    }
    if (bookingData.seat) {
      seatStorage.bookSeat(
        bookingData.trainNumber,
        bookingData.date,
        bookingData.seat
      );
    }
    const booking = {
      ...bookingData,
      _id: `bk_${Date.now()}`,
      pnr: generatePNR(),
      userId: user?.id,
      bookingDate: new Date().toISOString(),
      status: bookingData.status || 'Confirmed',
    };
    bookingStorage.add(booking);
    return booking;
  },
  cancel: async (pnr) => {
    await delay(40);
    const bookings = bookingStorage.getAll();
    const index = bookings.findIndex((b) => b.pnr === pnr);
    if (index === -1) throw new Error('Booking not found');
    bookings[index].status = 'Cancelled';
    bookingStorage.save(bookings);
    return bookings[index];
  },
};

export const localSeatAPI = {
  getSeats: async (trainNumber, date) => {
    await delay(40);
    return getAvailableSeats(trainNumber, date);
  },
  bookSeat: async (trainNumber, date, _classType, seatNumber) => {
    await delay(40);
    seatStorage.bookSeat(trainNumber, date, seatNumber);
    return getAvailableSeats(trainNumber, date);
  },
  freeSeat: async (trainNumber, date, _classType, seatNumber) => {
    await delay(40);
    const seats = seatStorage.getSeats(trainNumber, date);
    if (seats) {
      seats.booked = seats.booked.filter((s) => s !== seatNumber);
      if (!seats.available.includes(seatNumber)) {
        seats.available.push(seatNumber);
      }
      seatStorage.setSeats(trainNumber, date, seats);
    }
    return getAvailableSeats(trainNumber, date);
  },
};

export const localComplaintAPI = {
  getAll: async (status) => {
    await delay(40);
    let list = complaintStorage.getAll();
    if (status) list = list.filter((c) => c.status === status);
    return list;
  },
  getMy: async () => {
    await delay(40);
    const user = getCurrentUser();
    if (!user) return [];
    return complaintStorage
      .getAll()
      .filter((c) => c.userId === user.id || c.name === user.name);
  },
  getById: async (id) => {
    await delay(40);
    const c = complaintStorage.getAll().find((x) => x.id === id);
    if (!c) throw new Error('Complaint not found');
    return c;
  },
  create: async (complaintData) => {
    await delay(40);
    const user = getCurrentUser();
    const complaint = {
      ...complaintData,
      id: String(Date.now()),
      status: 'Pending',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userId: user?.id,
    };
    complaintStorage.add(complaint);
    return complaint;
  },
  update: async (id, complaintData) => {
    await delay(40);
    const updated = complaintStorage.update(id, complaintData);
    if (!updated) throw new Error('Complaint not found');
    return updated;
  },
  delete: async (id) => {
    await delay(40);
    const list = complaintStorage.getAll().filter((c) => c.id !== id);
    complaintStorage.save(list);
    return { success: true };
  },
};

export const localTrackingAPI = {
  getTracking: async (trainNumber) => {
    await delay(40);
    const data = trackingStorage.getTrain(trainNumber);
    if (!data) throw new Error('Tracking not found');
    return data;
  },
  updatePosition: async (trainNumber, position) => {
    trackingStorage.updatePosition(trainNumber, position);
    return trackingStorage.getTrain(trainNumber);
  },
  initialize: async (trainNumber) => {
    await delay(40);
    const train = trainStorage
      .getAll()
      .find((t) => String(t.trainNumber) === String(trainNumber));
    if (!train) throw new Error('Train not found');
    const data = {
      trainNumber,
      currentPosition: 0,
      route: buildTrackingRoute(train),
      lastUpdated: new Date().toISOString(),
    };
    trackingStorage.setTrain(trainNumber, data);
    return data;
  },
};
