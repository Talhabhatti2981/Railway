import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    pnr: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    trainNumber: String,
    trainName: String,
    from: String,
    to: String,
    date: String,
    class: String,
    seat: String,
    passenger: {
      name: String,
      age: String,
      gender: String,
      phone: String,
      email: String,
    },
    bookingDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Confirmed' },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
