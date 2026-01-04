import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  let user = null;
  try {
    // user = JSON.parse(localStorage.getItem('user'));
    // TODO: Get user from context or API instead of localStorage
  } catch {}
  let menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/schedule', label: 'Schedule', icon: '🚆' },
    { path: '/complaints', label: 'Complaints', icon: '📝' },
  ];
  if (!user || user.role !== 'admin') {
    menuItems = [
      { path: '/', label: 'Dashboard', icon: '🏠' },
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/book-ticket', label: 'Book Ticket', icon: '🎫' },
      { path: '/schedule', label: 'Schedule', icon: '🚆' },
      { path: '/track-train', label: 'Track Train', icon: '📍' },
      { path: '/complaints', label: 'Complaints', icon: '📝' },
    ];
  }

  return (
    <motion.aside
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="hidden lg:block w-64 bg-white shadow-lg min-h-screen p-6"
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
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
};

export default Sidebar;


