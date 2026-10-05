import mongoose from 'mongoose';

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true },
    trainName: { type: String, required: true },
    from: String,
    to: String,
    departureTime: String,
    arrivalTime: String,
    stops: [{ station: String, time: String }],
    classes: [mongoose.Schema.Types.Mixed],
  },
  { timestamps: true }
);

export default mongoose.models.Train || mongoose.model('Train', trainSchema);
