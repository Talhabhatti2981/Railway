# Railway Management System

A complete Railway Management System built with React, Vite, Tailwind CSS, and Framer Motion. This is Phase 1 using LocalStorage for data persistence.

## Features

### 🎟 Ticket Booking Module
- Search trains by route, date, and class
- Book tickets with automatic seat assignment
- Generate PNR-style ticket slips
- All bookings stored in LocalStorage

### 🚆 Train Schedule
- Add, edit, and delete trains
- View complete train schedules
- Filter trains by name, number, or route
- Manage train stops and timings
- Store schedules in LocalStorage

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
- Seat data stored in LocalStorage

### 🧾 Complaints System
- File complaints with categories
- Track complaint status (Pending/Resolved)
- Filter complaints by status
- Manage complaint resolution
- All complaints stored in LocalStorage

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Lucide React** - Icons
- **LocalStorage** - Data persistence (Phase 1)

## Project Structure

```
railway-management-system/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       └── Layout.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── BookTicket.jsx
│   │   ├── Schedule.jsx
│   │   ├── TrackTrain.jsx
│   │   ├── SeatAvailability.jsx
│   │   └── Complaints.jsx
│   ├── utils/
│   │   ├── localStorage.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Booking a Ticket
1. Navigate to "Book Ticket"
2. Enter source, destination, date, and class
3. Click "Search Trains"
4. Select a train and fill passenger details
5. Confirm booking to receive PNR

### Managing Schedule
1. Go to "Schedule"
2. Click "Add Train" to create new train
3. Fill in train details, stops, and classes
4. Use search to filter trains
5. Edit or delete trains as needed

### Tracking a Train
1. Navigate to "Track Train"
2. Enter train number
3. View live position on animated route map
4. See current and next stations

### Checking Seat Availability
1. Go to "Seat Availability"
2. Enter train number and date
3. View visual seat map
4. See available and booked seats by coach

### Filing Complaints
1. Navigate to "Complaints"
2. Click "File Complaint"
3. Fill in complaint details
4. Track status and manage resolution

## LocalStorage Data Structure

### Trains
```javascript
{
  trainNumber: "12345",
  trainName: "Rajdhani Express",
  from: "Delhi",
  to: "Mumbai",
  departureTime: "08:00",
  arrivalTime: "20:00",
  stops: [
    { station: "Agra", time: "10:00" }
  ],
  classes: ["AC First", "AC Second"]
}
```

### Bookings
```javascript
{
  pnr: "PNR123456",
  trainNumber: "12345",
  trainName: "Rajdhani Express",
  from: "Delhi",
  to: "Mumbai",
  date: "2024-01-15",
  class: "AC First",
  seat: "A-5",
  passenger: {
    name: "John Doe",
    age: "30",
    gender: "Male",
    phone: "1234567890"
  },
  status: "Confirmed"
}
```

### Complaints
```javascript
{
  id: "1234567890",
  category: "Service Quality",
  name: "John Doe",
  trainNumber: "12345",
  description: "Complaint details...",
  status: "Pending",
  date: "2024-01-15T10:00:00.000Z"
}
```

## Sample Data

The system initializes with sample train data on first load:
- Rajdhani Express (Delhi → Mumbai)
- Shatabdi Express (Mumbai → Delhi)
- Duronto Express (Kolkata → Chennai)

## Features Highlights

- ✨ Fully animated UI with Framer Motion
- 🎨 Modern, professional design
- 📱 Responsive layout
- 🚀 Fast performance with Vite
- 💾 LocalStorage persistence
- 🎯 Intuitive user experience

## Phase 2 - Supabase Integration

Phase 2 will include:
- Supabase database integration
- Supabase Auth for user management
- Supabase Realtime for live train tracking
- Backend API with Node/Express
- Migration from LocalStorage to Supabase

## Development

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## License

MIT License

