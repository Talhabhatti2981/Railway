import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/dbConnect.js';
import { signToken, toPublicUser, authMiddleware, requireAdmin } from '../lib/auth.js';
import { ensureSeedData } from '../lib/seed.js';
import { getOrCreateSeats, bookSeat as bookSeatMap } from '../lib/seats.js';
import User from '../lib/models/User.js';
import Train from '../lib/models/Train.js';
import Booking from '../lib/models/Booking.js';
import Complaint from '../lib/models/Complaint.js';
import Tracking from '../lib/models/Tracking.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

function generatePNR() {
  return `PNR${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
}

function buildTrackingRoute(train) {
  const stops = train.stops || [];
  const route = [
    { station: train.from, distance: 0, time: train.departureTime || '08:00' },
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
}

function normalizeTrain(train) {
  if (!train) return null;
  const obj = train.toObject ? train.toObject() : { ...train };
  obj.classes = (obj.classes || []).map((c) =>
    typeof c === 'string' ? c : c?.name || String(c)
  );
  return obj;
}

async function withDb(req, res, next) {
  try {
    await connectDB();
    await ensureSeedData();
    next();
  } catch (err) {
    console.error('DB connect failed:', err?.message || err);
    res.status(503).json({
      message: 'Database unavailable. Check MONGODB_URI and Atlas Network Access (0.0.0.0/0).',
    });
  }
}

const api = express.Router();
api.use(withDb);

// ——— Auth ———
api.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email: String(email).toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
      role: 'user',
    });
    const token = signToken(user);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('signup:', err);
    res.status(500).json({ message: err.message || 'Signup failed' });
  }
});

api.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+password'
    );
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error('login:', err);
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

api.get('/auth/me', authMiddleware, async (req, res) => {
  res.json(toPublicUser(req.user));
});

api.patch('/auth/update', authMiddleware, async (req, res) => {
  try {
    const { name, password } = req.body || {};
    if (name) req.user.name = name;
    if (password) req.user.password = await bcrypt.hash(password, 10);
    await req.user.save();
    res.json(toPublicUser(req.user));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Update failed' });
  }
});

api.get('/auth/users', authMiddleware, requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map(toPublicUser));
});

api.patch('/auth/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = role;
    await user.save();
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message || 'Role update failed' });
  }
});

// ——— Trains ———
api.get('/trains', async (_req, res) => {
  const trains = await Train.find().sort({ trainNumber: 1 });
  res.json(trains.map(normalizeTrain));
});

api.get('/trains/search/route', async (req, res) => {
  const from = String(req.query.from || '').trim();
  const to = String(req.query.to || '').trim();
  const trains = await Train.find({
    from: new RegExp(from, 'i'),
    to: new RegExp(to, 'i'),
  });
  res.json(trains.map(normalizeTrain));
});

api.get('/trains/:trainNumber', async (req, res) => {
  const train = await Train.findOne({ trainNumber: req.params.trainNumber });
  if (!train) return res.status(404).json({ message: 'Train not found' });
  res.json(normalizeTrain(train));
});

api.post('/trains', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const train = await Train.create(req.body);
    res.status(201).json(normalizeTrain(train));
  } catch (err) {
    res.status(400).json({ message: err.message || 'Create failed' });
  }
});

api.put('/trains/:trainNumber', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const train = await Train.findOneAndUpdate(
      { trainNumber: req.params.trainNumber },
      req.body,
      { new: true, runValidators: true }
    );
    if (!train) return res.status(404).json({ message: 'Train not found' });
    res.json(normalizeTrain(train));
  } catch (err) {
    res.status(400).json({ message: err.message || 'Update failed' });
  }
});

api.delete('/trains/:trainNumber', authMiddleware, requireAdmin, async (req, res) => {
  const deleted = await Train.findOneAndDelete({ trainNumber: req.params.trainNumber });
  if (!deleted) return res.status(404).json({ message: 'Train not found' });
  res.json({ success: true });
});

// ——— Bookings ———
api.get('/bookings', authMiddleware, requireAdmin, async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
});

api.get('/bookings/my', authMiddleware, async (req, res) => {
  const bookings = await Booking.find({
    $or: [
      { userId: req.user._id },
      { 'passenger.email': req.user.email },
    ],
  }).sort({ createdAt: -1 });
  res.json(bookings);
});

api.get('/bookings/pnr/:pnr', async (req, res) => {
  const booking = await Booking.findOne({ pnr: req.params.pnr });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

api.get('/bookings/train/:trainNumber/:date', async (req, res) => {
  const bookings = await Booking.find({
    trainNumber: req.params.trainNumber,
    date: req.params.date,
    status: { $ne: 'Cancelled' },
  });
  res.json(bookings);
});

api.get('/bookings/seats/:trainNumber/:date/:classType', async (req, res) => {
  const seats = await getOrCreateSeats(req.params.trainNumber, req.params.date);
  res.json({ booked: seats.booked, available: seats.available });
});

api.get('/bookings/:id', async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  res.json(booking);
});

api.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const data = req.body || {};
    if (data.seat) {
      await bookSeatMap(data.trainNumber, data.date, data.seat);
    }
    const booking = await Booking.create({
      ...data,
      pnr: generatePNR(),
      userId: req.user._id,
      bookingDate: new Date(),
      status: data.status || 'Confirmed',
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Booking failed' });
  }
});

api.put('/bookings/cancel/:pnr', authMiddleware, async (req, res) => {
  const booking = await Booking.findOne({ pnr: req.params.pnr });
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = 'Cancelled';
  await booking.save();
  res.json(booking);
});

// ——— Seats ———
api.get('/seats', async (req, res) => {
  const { trainNumber, date } = req.query;
  if (!trainNumber || !date) {
    return res.status(400).json({ message: 'trainNumber and date required' });
  }
  const seats = await getOrCreateSeats(String(trainNumber), String(date));
  res.json({ booked: seats.booked, available: seats.available });
});

api.post('/seats/book', authMiddleware, async (req, res) => {
  try {
    const { trainNumber, date, seatNumber } = req.body || {};
    const seats = await bookSeatMap(trainNumber, date, seatNumber);
    res.json(seats);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Seat book failed' });
  }
});

api.post('/seats/free', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { trainNumber, date, seatNumber } = req.body || {};
    const { doc } = await getOrCreateSeats(trainNumber, date);
    doc.booked = doc.booked.filter((s) => s !== seatNumber);
    if (!doc.available.includes(seatNumber)) doc.available.push(seatNumber);
    await doc.save();
    res.json({ booked: doc.booked, available: doc.available });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Seat free failed' });
  }
});

// ——— Complaints ———
api.get('/complaints', authMiddleware, async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.user.role !== 'admin') filter.userId = req.user._id;
  const list = await Complaint.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

api.get('/complaints/my', authMiddleware, async (req, res) => {
  const list = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(list);
});

api.get('/complaints/:id', authMiddleware, async (req, res) => {
  const c = await Complaint.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  res.json(c);
});

api.post('/complaints', authMiddleware, async (req, res) => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      userId: req.user._id,
      name: req.body?.name || req.user.name,
      status: 'Pending',
      date: new Date(),
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Create failed' });
  }
});

api.put('/complaints/:id', authMiddleware, async (req, res) => {
  const c = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  res.json(c);
});

api.delete('/complaints/:id', authMiddleware, requireAdmin, async (req, res) => {
  await Complaint.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ——— Tracking ———
api.get('/tracking/:trainNumber', async (req, res) => {
  let tracking = await Tracking.findOne({ trainNumber: req.params.trainNumber });
  if (!tracking) {
    const train = await Train.findOne({ trainNumber: req.params.trainNumber });
    if (!train) return res.status(404).json({ message: 'Tracking not found' });
    tracking = await Tracking.create({
      trainNumber: req.params.trainNumber,
      currentPosition: 0,
      route: buildTrackingRoute(train),
      lastUpdated: new Date(),
    });
  }
  res.json(tracking);
});

api.put('/tracking/:trainNumber/position', async (req, res) => {
  const tracking = await Tracking.findOneAndUpdate(
    { trainNumber: req.params.trainNumber },
    {
      currentPosition: req.body?.position ?? 0,
      lastUpdated: new Date(),
    },
    { new: true }
  );
  if (!tracking) return res.status(404).json({ message: 'Tracking not found' });
  res.json(tracking);
});

api.post('/tracking/:trainNumber/initialize', async (req, res) => {
  const train = await Train.findOne({ trainNumber: req.params.trainNumber });
  if (!train) return res.status(404).json({ message: 'Train not found' });
  const tracking = await Tracking.findOneAndUpdate(
    { trainNumber: req.params.trainNumber },
    {
      trainNumber: req.params.trainNumber,
      currentPosition: 0,
      route: buildTrackingRoute(train),
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );
  res.json(tracking);
});

api.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Mount under /api (Vercel rewrite keeps original path)
app.use('/api', api);
// Also accept bare paths for local/dev flexibility
app.use(api);

app.use((err, _req, res, _next) => {
  console.error('Unhandled:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

export default app;
