// API layer — local browser storage by default (no Vercel serverless / no DB quota).

import {
  localAuthAPI,
  localUserAPI,
  localTrainAPI,
  localBookingAPI,
  localSeatAPI,
  localComplaintAPI,
  localTrackingAPI,
} from './localApi';

const USE_LOCAL =
  import.meta.env.VITE_USE_LOCAL_API !== 'false' || import.meta.env.PROD;

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const remoteApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      response.ok
        ? 'Invalid server response'
        : text.slice(0, 120) || 'API request failed'
    );
  }

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const userAPI = USE_LOCAL
  ? localUserAPI
  : {
      getMe: () => remoteApiCall('/auth/me'),
      getAll: () => remoteApiCall('/auth/users'),
      updateRole: (userId, role) =>
        remoteApiCall(`/auth/users/${userId}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role }),
        }),
    };

export const authAPI = USE_LOCAL
  ? {
      signup: localAuthAPI.signup,
      login: localAuthAPI.login,
      updateProfile: localAuthAPI.updateProfile,
    }
  : {
      signup: (userData) =>
        remoteApiCall('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(userData),
        }),
      login: (userData) =>
        remoteApiCall('/auth/login', {
          method: 'POST',
          body: JSON.stringify(userData),
        }),
    };

export const trainAPI = USE_LOCAL
  ? localTrainAPI
  : {
      getAll: () => remoteApiCall('/trains'),
      getByNumber: (trainNumber) => remoteApiCall(`/trains/${trainNumber}`),
      searchByRoute: (from, to) =>
        remoteApiCall(`/trains/search/route?from=${from}&to=${to}`),
      create: (trainData) =>
        remoteApiCall('/trains', {
          method: 'POST',
          body: JSON.stringify(trainData),
        }),
      update: (trainNumber, trainData) =>
        remoteApiCall(`/trains/${trainNumber}`, {
          method: 'PUT',
          body: JSON.stringify(trainData),
        }),
      delete: (trainNumber) =>
        remoteApiCall(`/trains/${trainNumber}`, { method: 'DELETE' }),
    };

export const bookingAPI = USE_LOCAL ? localBookingAPI : {
  getAll: () => remoteApiCall('/bookings'),
  getMy: () => remoteApiCall('/bookings/my'),
  getById: (id) => remoteApiCall(`/bookings/${id}`),
  getByPNR: (pnr) => remoteApiCall(`/bookings/pnr/${pnr}`),
  getByTrain: (trainNumber, date) =>
    remoteApiCall(`/bookings/train/${trainNumber}/${date}`),
  getAvailableSeats: (trainNumber, date, classType) =>
    remoteApiCall(
      `/bookings/seats/${trainNumber}/${date}/${classType}`
    ),
  create: (bookingData) =>
    remoteApiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),
  cancel: (pnr) =>
    remoteApiCall(`/bookings/cancel/${pnr}`, { method: 'PUT' }),
};

export const seatAPI = USE_LOCAL
  ? localSeatAPI
  : {
      getSeats: (trainNumber, date, classType) =>
        remoteApiCall(
          `/seats?trainNumber=${encodeURIComponent(trainNumber)}&date=${encodeURIComponent(date)}&class=${encodeURIComponent(classType)}`
        ),
      bookSeat: (trainNumber, date, classType, seatNumber) =>
        remoteApiCall('/seats/book', {
          method: 'POST',
          body: JSON.stringify({
            trainNumber,
            date,
            class: classType,
            seatNumber,
          }),
        }),
      freeSeat: (trainNumber, date, classType, seatNumber) =>
        remoteApiCall('/seats/free', {
          method: 'POST',
          body: JSON.stringify({
            trainNumber,
            date,
            class: classType,
            seatNumber,
          }),
        }),
    };

export const complaintAPI = USE_LOCAL
  ? localComplaintAPI
  : {
      getAll: (status) => {
        const endpoint = status
          ? `/complaints?status=${status}`
          : '/complaints';
        return remoteApiCall(endpoint);
      },
      getMy: () => remoteApiCall('/complaints/my'),
      getById: (id) => remoteApiCall(`/complaints/${id}`),
      create: (complaintData) =>
        remoteApiCall('/complaints', {
          method: 'POST',
          body: JSON.stringify(complaintData),
        }),
      update: (id, complaintData) =>
        remoteApiCall(`/complaints/${id}`, {
          method: 'PUT',
          body: JSON.stringify(complaintData),
        }),
      delete: (id) =>
        remoteApiCall(`/complaints/${id}`, { method: 'DELETE' }),
    };

export const trackingAPI = USE_LOCAL
  ? localTrackingAPI
  : {
      getTracking: (trainNumber) => remoteApiCall(`/tracking/${trainNumber}`),
      updatePosition: (trainNumber, position) =>
        remoteApiCall(`/tracking/${trainNumber}/position`, {
          method: 'PUT',
          body: JSON.stringify({ position }),
        }),
      initialize: (trainNumber) =>
        remoteApiCall(`/tracking/${trainNumber}/initialize`, {
          method: 'POST',
        }),
    };
