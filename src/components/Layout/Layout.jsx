import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatWidget from '../ChatWidget';
import { userAPI } from '../../utils/api';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || isAuthPage) return;
    userAPI.getMe().catch(() => {});
  }, [location.pathname, isAuthPage]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isAuthPage && <Navbar />}
      <div className={`flex ${!isAuthPage ? 'pt-16' : ''}`}>
        {!isAuthPage && <Sidebar />}
        <main className={`flex-1 w-full ${!isAuthPage ? 'lg:ml-56' : ''}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
      {!isAuthPage && <ChatWidget />}
    </div>
  );
};

export default Layout;


