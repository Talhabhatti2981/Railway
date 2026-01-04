import React from "react";
import { motion } from "framer-motion";

const Loader = () => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 100 }}
      transition={{ repeat: Infinity, repeatType: "reverse", duration: 2, ease: "easeInOut" }}
      className="flex items-end mb-4"
    >
      {/* Tracks */}
      <div className="h-2 w-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full mr-2 relative">
        <div className="absolute left-2 top-1 w-2 h-2 bg-gray-500 rounded-full" />
        <div className="absolute left-8 top-1 w-2 h-2 bg-gray-500 rounded-full" />
        <div className="absolute left-16 top-1 w-2 h-2 bg-gray-500 rounded-full" />
        <div className="absolute left-24 top-1 w-2 h-2 bg-gray-500 rounded-full" />
      </div>
      {/* Train */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        className="relative"
      >
        <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="12" width="40" height="12" rx="6" fill="#60A5FA" />
          <rect x="10" y="8" width="28" height="8" rx="4" fill="#1E293B" />
          <circle cx="14" cy="26" r="4" fill="#FBBF24" />
          <circle cx="34" cy="26" r="4" fill="#FBBF24" />
        </svg>
        {/* Smoke */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0.7, 0, 0.7], y: [-10, -30, -10] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute left-8 -top-6"
        >
          <div className="w-6 h-6 bg-gray-300 rounded-full opacity-60 blur-sm" />
        </motion.div>
      </motion.div>
    </motion.div>
    <div className="mt-6 text-lg font-semibold tracking-wide animate-pulse">Preparing Your Journey…</div>
  </div>
);

export default Loader;
