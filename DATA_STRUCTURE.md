# Data Structure Reference

This document describes the data structures used in the Railway Management System.

## Train Schedule

```json
{
  "trainNumber": "12345",
  "trainName": "Rajdhani Express",
  "from": "Delhi",
  "to": "Mumbai",
  "departureTime": "08:00",
  "arrivalTime": "20:00",
  "stops": [
    {
      "station": "Agra",
      "time": "10:00"
    },
    {
      "station": "Jaipur",
      "time": "12:30"
    }
  ],
  "classes": [
    "AC First",
    "AC Second",
    "AC Third",
    "Sleeper"
  ]
}
```

## Booking

```json
{
  "pnr": "PNRABC123",
  "trainNumber": "12345",
  "trainName": "Rajdhani Express",
  "from": "Delhi",
  "to": "Mumbai",
  "date": "2024-01-15",
  "class": "AC First",
  "seat": "A-5",
  "passenger": {
    "name": "John Doe",
    "age": "30",
    "gender": "Male",
    "phone": "1234567890",
    "email": "john@example.com"
  },
  "bookingDate": "2024-01-10T10:00:00.000Z",
  "status": "Confirmed"
}
```

## Seat Data

```json
{
  "12345_2024-01-15": {
    "booked": ["A-1", "A-2", "B-5"],
    "available": ["A-3", "A-4", "B-1", "B-2", ...]
  }
}
```

**Key Format**: `{trainNumber}_{date}`

## Complaint

```json
{
  "id": "1704873600000",
  "category": "Service Quality",
  "name": "John Doe",
  "trainNumber": "12345",
  "description": "The train was delayed by 2 hours without proper announcement.",
  "status": "Pending",
  "date": "2024-01-10T10:00:00.000Z"
}
```

**Categories**:
- Service Quality
- Cleanliness
- Food & Beverage
- Staff Behavior
- Delay Issues
- Seat Problems
- Other

**Status**: `Pending` | `Resolved`

## Tracking Data

```json
{
  "12345": {
    "trainNumber": "12345",
    "currentPosition": 45,
    "route": [
      {
        "station": "Delhi",
        "distance": 0,
        "time": "08:00"
      },
      {
        "station": "Agra",
        "distance": 25,
        "time": "10:00"
      },
      {
        "station": "Mumbai",
        "distance": 100,
        "time": "20:00"
      }
    ],
    "lastUpdated": "2024-01-15T12:00:00.000Z"
  }
}
```

**Position**: 0-100 (percentage of journey completed)

## LocalStorage Keys

- `railway_trains` - All train schedules
- `railway_bookings` - All bookings
- `railway_seats` - Seat availability data
- `railway_complaints` - All complaints
- `railway_tracking` - Live tracking data

## Example API Responses (For Phase 2 - Supabase)

### GET /api/trains
```json
{
  "trains": [
    {
      "id": "uuid",
      "trainNumber": "12345",
      "trainName": "Rajdhani Express",
      ...
    }
  ]
}
```

### POST /api/bookings
```json
{
  "pnr": "PNRABC123",
  "trainNumber": "12345",
  ...
}
```

### GET /api/tracking/:trainNumber
```json
{
  "trainNumber": "12345",
  "currentPosition": 45,
  "route": [...],
  "lastUpdated": "2024-01-15T12:00:00.000Z"
}
```

