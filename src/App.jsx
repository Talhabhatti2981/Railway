import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import BookTicket from './pages/BookTicket';
import Schedule from './pages/Schedule';
import TrackTrain from './pages/TrackTrain';
import SeatAvailability from './pages/SeatAvailability';
import Complaints from './pages/Complaints';
import { initializeSampleData } from './utils/localStorage';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/book-ticket" element={<BookTicket />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/track-train" element={<TrackTrain />} />
          <Route path="/seat-availability" element={<SeatAvailability />} />
          <Route path="/complaints" element={<Complaints />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

