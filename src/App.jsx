import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { Suspense, lazy, useEffect } from 'react';
import Loader from './components/Loader';
import { initializeSampleData } from './utils/localStorage';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const BookTicket = lazy(() => import('./pages/BookTicket'));
const Schedule = lazy(() => import('./pages/Schedule'));
const TrackTrain = lazy(() => import('./pages/TrackTrain'));
const SeatAvailability = lazy(() => import('./pages/SeatAvailability'));
const Complaints = lazy(() => import('./pages/Complaints'));
const Profile = lazy(() => import('./pages/Profile'));
const MyTickets = lazy(() => import('./pages/MyTickets'));

function App() {
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <Router>
      <Suspense fallback={<Loader />}> 
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/book-ticket" element={<ProtectedRoute><BookTicket /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
            <Route path="/track-train" element={<ProtectedRoute><TrackTrain /></ProtectedRoute>} />
            <Route path="/seat-availability" element={<ProtectedRoute><SeatAvailability /></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;

