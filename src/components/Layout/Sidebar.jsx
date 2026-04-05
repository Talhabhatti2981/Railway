import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {}
  let menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/schedule', label: 'Schedule', icon: '🚆' },
    { path: '/complaints', label: 'Complaints', icon: '📝' },
  ];
  // Show Book Ticket and Track Train only for non-admin users
  if (!user || user.role !== 'admin') {
    menuItems = [
      { path: '/', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/book-ticket', label: 'Book Ticket', icon: '🎫' },
      { path: '/schedule', label: 'Schedule', icon: '🚆' },
      { path: '/track-train', label: 'Track Train', icon: '📍' },
      { path: '/my-tickets', label: 'My Tickets', icon: '📋' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
    ];
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="hidden lg:flex flex-col w-64 bg-white shadow-xl min-h-screen p-4 sm:p-6 sticky top-16"
    >
      <div className="space-y-2">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-md font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm'
              }`}
            >
              <span className="text-lg sm:text-xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
};

export default Sidebar;


