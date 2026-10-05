import mongoose from 'mongoose';

const seatMapSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    booked: [String],
    available: [String],
  },
  { timestamps: true }
);

export default mongoose.models.SeatMap || mongoose.model('SeatMap', seatMapSchema);
