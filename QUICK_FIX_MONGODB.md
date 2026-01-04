# Quick Fix: MongoDB Connection Error

## The Problem
```
Error: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

This means MongoDB is **not running** on your computer.

## ✅ EASIEST SOLUTION: Use MongoDB Atlas (Cloud - 2 minutes)

**No installation needed!**

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (free account)
3. **Create a FREE cluster** (click "Build a Database" → "FREE")
4. **Create Database User:**
   - Go to "Database Access" → "Add New Database User"
   - Username: `railwayuser` (or any name)
   - Password: Create a strong password (save it!)
   - Click "Add User"
5. **Allow Network Access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
6. **Get Connection String:**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
7. **Update `.env` file in `server` folder:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/railway_management?retryWrites=true&w=majority
   ```
   **Replace `username` and `password` with your database user credentials!**

8. **Restart server:**
   ```bash
   cd server
   npm start
   ```

You should see: `✅ MongoDB Connected: ...`

---

## Alternative: Install MongoDB Locally

### Windows:

1. **Download:** https://www.mongodb.com/try/download/community
2. **Install** (choose "Complete" installation)
3. **MongoDB should start automatically**
4. **If not, start it:**
   - Press `Win + R`
   - Type `services.msc`
   - Find "MongoDB" service
   - Right-click → Start

5. **Restart your server:**
   ```bash
   cd server
   npm start
   ```

---

## Test Your Connection

After setting up MongoDB (Atlas or local), test it:

```bash
cd server
npm start
```

**Success looks like:**
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📊 Database: railway_management
Server is running on port 5000
```

**If you still see errors, check:**
- MongoDB Atlas: Is your IP whitelisted?
- Local MongoDB: Is the service running?
- Connection string: Are username/password correct?

---

## Seed Sample Data

Once connected, add sample trains:

```bash
cd server
node seed.js
```

This creates 3 sample trains you can use for testing!


