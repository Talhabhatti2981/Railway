import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { trainAPI, seatAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

/** ✅ Railway standard class order */
const CLASS_ORDER = [
  'AC First',
  'AC Second',
  'AC Third',
  'Sleeper',
  'AC Chair Car',
];

const SeatAvailability = () => {
  const navigate = useNavigate();

  const [trainNumber, setTrainNumber] = useState('');
  const [date, setDate] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [seatData, setSeatData] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [booking, setBooking] = useState({ loading: false, error: '', success: '' });
  const [seatError, setSeatError] = useState('');

  useEffect(() => {
    if (selectedTrain && date && selectedClass) {
      loadSeatData();
    }

    if (selectedTrain && !selectedClass) {
      setSeatError('Please select a class to view seat numbers.');
    } else {
      setSeatError('');
    }
  }, [selectedTrain, date, selectedClass]);

  const loadSeatData = async () => {
    try {
      if (!selectedTrain || !date || !selectedClass) return;

      const seats = await seatAPI.getSeats(
        selectedTrain.trainNumber,
        date,
        selectedClass
      );

      setSeatData(seats);

      /** Group seats by coach */
      const coachMap = {};
      [...seats.available, ...seats.booked].forEach(seat => {
        const [coach, seatNum] = seat.split('-');
        if (!coachMap[coach]) coachMap[coach] = [];
        coachMap[coach].push({
          number: seatNum,
          full: seat,
          booked: seats.booked.includes(seat),
        });
      });

      const coachList = Object.keys(coachMap)
        .sort()
        .map(coach => ({
          name: coach,
          seats: coachMap[coach].sort(
            (a, b) => parseInt(a.number) - parseInt(b.number)
          ),
        }));

      setCoaches(coachList);
    } catch (error) {
      setSeatError('Error loading seat data');
    }
  };

  const handleSearch = async () => {
    if (!trainNumber || !date) {
      alert('Please enter train number and date');
      return;
    }

    try {
      const train = await trainAPI.getByNumber(trainNumber);
      if (!train) {
        alert('Train not found');
        return;
      }

      setSelectedTrain(train);
      setSelectedClass('');
      setSeatData(null);
      setSelectedSeat(null);
    } catch (error) {
      alert('Error searching train');
    }
  };

  const handleSeatClick = (coachName, seat) => {
    if (seat.booked) return;
    setSelectedSeat(`${coachName}-${seat.number}`);
    setBooking({ loading: false, error: '', success: '' });
  };

  const handleBookSeat = () => {
    if (!selectedSeat) return;

    navigate(
      `/book-ticket?trainNumber=${encodeURIComponent(
        selectedTrain.trainNumber
      )}&date=${encodeURIComponent(date)}&class=${encodeURIComponent(
        selectedClass
      )}&seat=${encodeURIComponent(selectedSeat)}`
    );
  };

  const availableCount = seatData?.available.length || 0;
  const bookedCount = seatData?.booked.length || 0;
  const totalCount = availableCount + bookedCount;

  return (
    <div className="space-y-6 transition-colors duration-300 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Seat Availability</h1>
        <p className="text-gray-600 dark:text-gray-300">Check railway seat availability</p>
      </motion.div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 grid md:grid-cols-3 gap-4">
        <input
          value={trainNumber}
          onChange={e => setTrainNumber(e.target.value)}
          placeholder="Train Number"
          className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:text-gray-100"
        />
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split('T')[0]}
          onChange={e => setDate(e.target.value)}
          className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 dark:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
        >
          <Search size={18} /> Check
        </button>
      </div>

      {/* Class Selector */}
      {selectedTrain && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 flex gap-4 items-center">
          <span className="font-semibold dark:text-gray-100">Class:</span>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="">Select Class</option>
            {CLASS_ORDER.filter(cls =>
              selectedTrain.classes?.some(c =>
                typeof c === 'string' ? c === cls : c.name === cls
              )
            ).map(cls => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error */}
      {seatError && (
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 p-4 rounded text-center">
          {seatError}
        </div>
      )}

      {/* Seat Map */}
      {seatData && !seatError && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Stat title="Available" count={availableCount} color="green" />
            <Stat title="Booked" count={bookedCount} color="red" />
            <Stat title="Total" count={totalCount} color="blue" />
          </div>

          {/* Coaches */}
          {coaches.map(coach => (
            <div
              key={coach.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <h3 className="font-bold mb-4 dark:text-gray-100">Coach {coach.name}</h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {coach.seats.map(seat => {
                  const key = `${coach.name}-${seat.number}`;
                  const isSelected = selectedSeat === key;

                  return (
                    <div
                      key={key}
                      onClick={() => handleSeatClick(coach.name, seat)}
                      className={`p-3 rounded text-center font-semibold cursor-pointer ${
                        seat.booked
                          ? 'bg-red-500 text-white cursor-not-allowed'
                          : isSelected
                          ? 'bg-yellow-400 dark:bg-yellow-600'
                          : 'bg-green-500 text-white dark:bg-green-700'
                      }`}
                    >
                      {seat.number}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Book */}
          {selectedSeat && (
            <div className="text-center">
              <p className="font-semibold mb-2 dark:text-gray-100">
                Selected Seat: {selectedSeat}
              </p>
              <button
                onClick={handleBookSeat}
                className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Book Seat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Stat = ({ title, count, color }) => (
  <div className={`bg-${color}-50 dark:bg-${color}-900 p-4 rounded-lg`}>
    <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
    <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{count}</p>
  </div>
);

export default SeatAvailability;
