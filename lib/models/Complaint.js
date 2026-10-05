import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: String,
    name: String,
    trainNumber: String,
    description: String,
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
