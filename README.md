# Railway Management System

A complete Railway Management System built with **MERN Stack** (MongoDB, Express, React, Node.js). Features a fully animated, modern UI with full backend integration.

## 🚀 Features

### 🎟 Ticket Booking Module
- Search trains by route, date, and class
- Book tickets with automatic seat assignment
- Generate PNR-style ticket slips
- All bookings stored in MongoDB

### 🚆 Train Schedule
- Add, edit, and delete trains
- View complete train schedules
- Filter trains by name, number, or route
- Manage train stops and timings
- Store schedules in MongoDB

### 📍 Live Train Tracking (Simulation Mode)
- Animated train progress on route map
- Real-time position updates (simulated)
- Visual route display with stations
- Progress bar showing journey completion
- Smooth animations

### 🪑 Seat Availability
- Visual seat map organized by coaches
- Show booked vs available seats
- Real-time seat status updates
- Color-coded seat indicators
- Seat data stored in MongoDB

### 🧾 Complaints System
- File complaints with categories
- Track complaint status (Pending/Resolved)
- Filter complaints by status
- Manage complaint resolution
- All complaints stored in MongoDB

### 🤖 AI-Powered Chatbot
- Railway-focused AI assistant using OpenAI GPT
- Secure backend-only API key integration
- Persistent chat history stored in MongoDB
- Modern chat UI with typing indicators
- Auto-scroll and mobile responsive design
- Railway-specific knowledge and responses

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
railway-management-system/
├── server/                 # Backend
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/            # Mongoose models
│   │   ├── Train.js
│   │   ├── Booking.js
│   │   ├── Seat.js
│   │   ├── Complaint.js
│   │   └── Tracking.js
│   ├── routes/            # API routes
│   │   ├── trainRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── seatRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── trackingRoutes.js
│   ├── server.js         # Express server
│   ├── seed.js           # Database seeder
│   └── package.json
├── src/                   # Frontend
│   ├── components/
│   │   └── Layout/
│   ├── pages/
│   ├── utils/
│   │   ├── api.js        # API utility functions
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB (if installed locally)
mongod
```

**Option B: MongoDB Atlas**
- Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string

### 3. Configure Environment

**Backend** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/railway_management
NODE_ENV=development
```

**Frontend** (`src/utils/api.js`):
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Or create `.env` in root:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database (Optional)

```bash
cd server
node seed.js
cd ..
```

This creates 3 sample trains:
- Rajdhani Express (12345) - Delhi → Mumbai
- Shatabdi Express (67890) - Mumbai → Delhi
- Duronto Express (11111) - Kolkata → Chennai

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 6. Access the Application

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

## 📡 API Endpoints

### Trains
- `GET /api/trains` - Get all trains
- `GET /api/trains/:trainNumber` - Get train by number
- `GET /api/trains/search/route?from=X&to=Y` - Search trains
- `POST /api/trains` - Create train
- `PUT /api/trains/:trainNumber` - Update train
- `DELETE /api/trains/:trainNumber` - Delete train

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/pnr/:pnr` - Get booking by PNR
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/cancel/:pnr` - Cancel booking

### Seats
- `GET /api/seats/:trainNumber/:date` - Get seat availability
- `POST /api/seats/book` - Book seat
- `POST /api/seats/free` - Free seat

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints?status=Pending` - Filter by status
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint

### Tracking
- `GET /api/tracking/:trainNumber` - Get tracking data
- `PUT /api/tracking/:trainNumber/position` - Update position

## 🎯 Usage Examples

### Book a Ticket
1. Navigate to "Book Ticket"
2. Search: From: "Delhi", To: "Mumbai", Date: (future date)
3. Select a train
4. Fill passenger details
5. Confirm booking to get PNR

### Manage Schedule
1. Go to "Schedule"
2. Click "Add Train" to create new train
3. Fill train details, stops, and classes
4. Use search to filter trains

### Track a Train
1. Navigate to "Track Train"
2. Enter train number: "12345"
3. Watch animated train move along route
4. Position updates every 2 seconds

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `server/.env`
- Verify network access for MongoDB Atlas

### CORS Errors
- Backend has CORS enabled
- Ensure backend is running on port 5000
- Check API URL in frontend

### Port Conflicts
- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will auto-select next available port

## 📝 Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
npm run dev  # Vite dev server with HMR
```

### Build for Production
```bash
# Frontend
npm run build

# Backend
cd server
npm start
```

## 📚 Documentation

- [Backend Setup Guide](./BACKEND_SETUP.md)
- [Data Structure Reference](./DATA_STRUCTURE.md)
- [Quick Start Guide](./QUICK_START.md)

## 🔐 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/railwayDB
OPENAI_API_KEY=sk-your-real-key
```

### Frontend (`.env` or `src/utils/api.js`)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 Features Highlights

- ✨ Fully animated UI with Framer Motion
- 🎨 Modern, professional design
- 📱 Responsive layout
- 🚀 Fast performance with Vite
- 💾 MongoDB persistence
- 🎯 Intuitive user experience
- 🔄 Real-time updates
- 📊 Complete CRUD operations

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
