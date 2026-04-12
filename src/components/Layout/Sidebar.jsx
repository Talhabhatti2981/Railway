import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Train } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileSidebarOpen(false);
    navigate('/login');
  };

  let menuItems = [];

  // Admin menu
  if (user && user.role === 'admin') {
    menuItems = [
      { path: '/', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/schedule', label: 'Schedule', icon: '🚆' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
    ];
  } else {
    // Client menu
    menuItems = [
      { path: '/', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/book-ticket', label: 'Book Ticket', icon: '🎫' },
      { path: '/my-tickets', label: 'My Tickets', icon: '🎟️' },
      { path: '/schedule', label: 'Schedule', icon: '🚆' },
      { path: '/track-train', label: 'Track Train', icon: '📍' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
    ];
  }

  return (
    <>
      {/* Desktop Sidebar - Always Visible on Large Screens */}
      <motion.aside
        initial={{ x: -224 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-16 w-56 bg-white shadow-lg h-[calc(100vh-64px)] p-4 border-r border-gray-200 z-30"
      >
        <div className="space-y-1 flex-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>


      </motion.aside>

      {/* Mobile Hamburger Button - Top Left on Mobile */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="lg:hidden fixed top-4 left-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50 flex items-center justify-center hover:bg-blue-700 transition-colors duration-200"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Toggle sidebar"
        title="Open menu"
      >
        <motion.div
          animate={{ rotate: mobileSidebarOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {mobileSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </motion.div>
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - Slide from Left */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed left-0 top-0 w-72 h-screen bg-white shadow-2xl z-40 p-6 overflow-y-auto border-r border-gray-200 flex flex-col"
          >
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-lg">
                  <Train size={20} />
                </div>
                <span>Railway</span>
              </h1>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-700" />
              </motion.button>
            </div>

            {/* User Info */}
            {user && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border-2 border-blue-100">
                <p className="text-gray-600 text-xs font-semibold">LOGGED IN AS</p>
                <p className="text-gray-900 font-bold mt-1">{user.name}</p>
                <p className="text-blue-600 text-xs font-semibold capitalize mt-1">{user.role}</p>
              </div>
            )}

            {/* Menu Items */}
            <div className="space-y-2 flex-1">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      location.pathname === item.path
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile Logout Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center gap-2 mt-auto"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;


