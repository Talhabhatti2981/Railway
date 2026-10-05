import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true },
    currentPosition: { type: Number, default: 0 },
    route: [
      {
        station: String,
        distance: Number,
        time: String,
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Tracking || mongoose.model('Tracking', trackingSchema);
