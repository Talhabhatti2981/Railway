# Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/railway_management
   NODE_ENV=development
   ```

   For MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/railway_management
   ```

## Database Setup

### Option 1: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```
3. Use the default connection string: `mongodb://localhost:27017/railway_management`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Update `.env` file with your connection string

## Seed Database (Optional)

To populate the database with sample trains:

```bash
node seed.js
```

This will create 3 sample trains:
- Rajdhani Express (12345)
- Shatabdi Express (67890)
- Duronto Express (11111)

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Trains
- `GET /api/trains` - Get all trains
- `GET /api/trains/:trainNumber` - Get train by number
- `GET /api/trains/search/route?from=X&to=Y` - Search trains by route
- `POST /api/trains` - Create new train
- `PUT /api/trains/:trainNumber` - Update train
- `DELETE /api/trains/:trainNumber` - Delete train

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/pnr/:pnr` - Get booking by PNR
- `GET /api/bookings/train/:trainNumber/:date` - Get bookings for train/date
- `POST /api/bookings` - Create booking (auto-assigns seat)
- `PUT /api/bookings/cancel/:pnr` - Cancel booking

### Seats
- `GET /api/seats/:trainNumber/:date` - Get seat availability
- `POST /api/seats/book` - Book specific seat
- `POST /api/seats/free` - Free a seat

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints?status=Pending` - Filter by status
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Tracking
- `GET /api/tracking/:trainNumber` - Get tracking data
- `PUT /api/tracking/:trainNumber/position` - Update train position
- `POST /api/tracking/:trainNumber/initialize` - Initialize tracking

## Frontend Configuration

Update the frontend `.env` file (or `vite.config.js`) to point to your backend:

```env
VITE_API_URL=http://localhost:5000/api
```

Or update `src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for MongoDB Atlas

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### CORS Errors
- Backend has CORS enabled for all origins
- If issues persist, check `server.js` CORS configuration

## Testing

Test the API using:
- Postman
- curl
- Browser (for GET requests)
- Frontend application

Example:
```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/trains
```


