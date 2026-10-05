import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Train from './models/Train.js';

export const ADMIN_EMAIL = 'admin@gmail.com';

export async function ensureSeedData() {
  const adminExists = await User.findOne({ email: ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: await bcrypt.hash('admin', 10),
      role: 'admin',
    });
  } else {
    adminExists.name = 'Admin';
    adminExists.role = 'admin';
    adminExists.password = await bcrypt.hash('admin', 10);
    await adminExists.save();
  }

  await User.updateMany(
    { email: { $ne: ADMIN_EMAIL }, role: 'admin' },
    { $set: { role: 'user' } }
  );

  const trainCount = await Train.countDocuments();
  if (trainCount === 0) {
    await Train.insertMany([
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
        stops: [{ station: 'Pune', time: '08:30' }],
        classes: ['AC Chair Car', 'Executive'],
      },
    ]);
  }
}
