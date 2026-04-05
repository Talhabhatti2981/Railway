import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Train, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/book-ticket', label: 'Book Ticket', icon: '🎫' },
    { path: '/my-tickets', label: 'My Tickets', icon: '📋' },
    { path: '/schedule', label: 'Schedule', icon: '🚆' },
    { path: '/track-train', label: 'Track Train', icon: '📍' },
    { path: '/complaints', label: 'Complaints', icon: '📝' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <Train className="h-8 w-8" />
              <span className="text-lg md:text-xl font-bold hidden sm:inline">Railway</span>
            </Link>

            {/* Desktop Auth - Removed Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="px-2 py-1 bg-blue-500 rounded-full text-xs font-bold">
                    {user.role}
                  </span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg hover:bg-blue-500 transition-all duration-200 font-medium text-sm"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {!mobileMenuOpen && (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white shadow-2xl z-40 lg:hidden overflow-y-auto"
          >
            {/* Close Button in Sidebar */}
            <div className="flex justify-end p-4 border-b border-blue-600">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            <div className="px-4 py-2 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                      location.pathname === item.path
                        ? 'bg-white text-blue-700 shadow-md scale-105'
                        : 'hover:bg-blue-600 text-white'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile User Info & Logout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
              className="px-4 py-6 border-t border-blue-600 mt-4"
            >
              {user && (
                <div className="mb-4 pb-4 border-b border-blue-600">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{user.name}</p>
                      <p className="text-xs text-blue-200 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-bold space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;


