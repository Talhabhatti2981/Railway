# Quick Start Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:5173`

## First Time Setup

The system automatically initializes with sample data on first load:
- 3 sample trains (Rajdhani, Shatabdi, Duronto)
- All data stored in browser LocalStorage

## Testing the Features

### 1. Book a Ticket
- Go to "Book Ticket" page
- Search: From: "Delhi", To: "Mumbai", Date: (any future date)
- Select a train and fill passenger details
- Confirm booking to get PNR

### 2. View Schedule
- Go to "Schedule" page
- See all available trains
- Click "Add Train" to add new trains
- Use search to filter trains

### 3. Track a Train
- Go to "Track Train" page
- Enter train number: "12345"
- Watch the animated train move along the route
- Position updates every 2 seconds

### 4. Check Seat Availability
- Go to "Seat Availability" page
- Enter train number: "12345" and a date
- View the visual seat map
- See available (green) and booked (red) seats

### 5. File a Complaint
- Go to "Complaints" page
- Click "File Complaint"
- Fill in the form
- Track status (Pending/Resolved)

## Sample Train Numbers

- `12345` - Rajdhani Express (Delhi → Mumbai)
- `67890` - Shatabdi Express (Mumbai → Delhi)
- `11111` - Duronto Express (Kolkata → Chennai)

## Troubleshooting

### Port Already in Use
If port 5173 is busy, Vite will automatically use the next available port.

### LocalStorage Issues
- Clear browser cache if data seems corrupted
- Check browser console for errors
- Ensure LocalStorage is enabled in browser

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Hot Reload**: Changes reflect immediately in browser
2. **Console Logs**: Check browser console for debugging
3. **LocalStorage**: Use browser DevTools → Application → Local Storage to view data
4. **Responsive**: Test on different screen sizes (mobile, tablet, desktop)

## Next Steps

After testing Phase 1 (LocalStorage), you can proceed to Phase 2:
- Set up Supabase project
- Create database tables
- Migrate LocalStorage functions to API calls
- Add authentication
- Enable real-time tracking


