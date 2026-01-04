import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Train, Menu, LogOut, LogIn } from 'lucide-react';
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
    navigate('/login');
  };

  // const navItems = [
  //   { path: '/', label: 'Dashboard', icon: '🏠' },
  //   { path: '/book-ticket', label: 'Book Ticket', icon: '🎫' },
  //   { path: '/schedule', label: 'Schedule', icon: '🚆' },
  //   { path: '/track-train', label: 'Track Train', icon: '📍' },
  //   { path: '/seat-availability', label: 'Seats', icon: '🪑' },
  //   { path: '/complaints', label: 'Complaints', icon: '📝' },
  // ];

  if (!isAuthenticated) {
    return null; // Hide navbar if not authenticated
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Train className="h-8 w-8" />
            <span className="text-xl font-bold">Railway System</span>
          </Link>

          {/* <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white text-primary-600 font-semibold'
                    : 'hover:bg-primary-500'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div> */}

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <span className="text-sm">
                Welcome, {user.name} ({user.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 rounded-lg hover:bg-primary-500 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg mb-1 ${
                  location.pathname === item.path
                    ? 'bg-white text-primary-600 font-semibold'
                    : 'hover:bg-primary-500'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-2 text-sm border-t border-primary-500 mt-2 pt-2">
              {user && (
                <div className="mb-2">
                  Welcome, {user.name} ({user.role})
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-primary-500 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;


