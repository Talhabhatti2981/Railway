// User API
export const userAPI = {
  getMe: () => apiCall('/auth/me'),
};
// API utility functions for Railway Management System

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  login: (userData) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Train API
export const trainAPI = {
  getAll: () => apiCall('/trains'),
  getByNumber: (trainNumber) => apiCall(`/trains/${trainNumber}`),
  searchByRoute: (from, to) => apiCall(`/trains/search/route?from=${from}&to=${to}`),
  create: (trainData) => apiCall('/trains', {
    method: 'POST',
    body: JSON.stringify(trainData),
  }),
  update: (trainNumber, trainData) => apiCall(`/trains/${trainNumber}`, {
    method: 'PUT',
    body: JSON.stringify(trainData),
  }),
  delete: (trainNumber) => apiCall(`/trains/${trainNumber}`, {
    method: 'DELETE',
  }),
};

// Booking API
export const bookingAPI = {
  getAll: () => apiCall('/bookings'),
  getMy: () => apiCall('/bookings/my'),
  getById: (id) => apiCall(`/bookings/${id}`),
  getByPNR: (pnr) => apiCall(`/bookings/pnr/${pnr}`),
  getByTrain: (trainNumber, date) => apiCall(`/bookings/train/${trainNumber}/${date}`),
  getAvailableSeats: (trainNumber, date, classType) => apiCall(`/bookings/seats/${trainNumber}/${date}/${classType}`),
  create: (bookingData) => apiCall('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  cancel: (pnr) => apiCall(`/bookings/cancel/${pnr}`, {
    method: 'PUT',
  }),
};

// Seat API
export const seatAPI = {
  getSeats: (trainNumber, date, classType) => apiCall(`/seats?trainNumber=${encodeURIComponent(trainNumber)}&date=${encodeURIComponent(date)}&class=${encodeURIComponent(classType)}`),
  bookSeat: (trainNumber, date, classType, seatNumber) => apiCall('/seats/book', {
    method: 'POST',
    body: JSON.stringify({ trainNumber, date, class: classType, seatNumber }),
  }),
  freeSeat: (trainNumber, date, classType, seatNumber) => apiCall('/seats/free', {
    method: 'POST',
    body: JSON.stringify({ trainNumber, date, class: classType, seatNumber }),
  }),
};

// Complaint API
export const complaintAPI = {
  getAll: (status) => {
    const endpoint = status ? `/complaints?status=${status}` : '/complaints';
    return apiCall(endpoint);
  },
  getMy: () => apiCall('/complaints/my'),
  getById: (id) => apiCall(`/complaints/${id}`),
  create: (complaintData) => apiCall('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  }),
  update: (id, complaintData) => apiCall(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(complaintData),
  }),
  delete: (id) => apiCall(`/complaints/${id}`, {
    method: 'DELETE',
  }),
};

// Tracking API
export const trackingAPI = {
  getTracking: (trainNumber) => apiCall(`/tracking/${trainNumber}`),
  updatePosition: (trainNumber, position) => apiCall(`/tracking/${trainNumber}/position`, {
    method: 'PUT',
    body: JSON.stringify({ position }),
  }),
  initialize: (trainNumber) => apiCall(`/tracking/${trainNumber}/initialize`, {
    method: 'POST',
  }),
};


