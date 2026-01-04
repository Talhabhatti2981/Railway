
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import railImage from '../img/railway.png'; // Replace with a high-res train image for best effect

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = isSignup ? await authAPI.signup(formData) : await authAPI.login(formData);
      // localStorage.setItem('token', response.token);
      // localStorage.setItem('user', JSON.stringify(response.user));
      // TODO: Store token/user in context or via secure cookie
      navigate('/');
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-black p-0 m-0">
      {/* Left: Train Image & Accent */}
      <div className="hidden md:flex md:w-1/2 relative items-stretch p-0 m-0 min-h-screen">
        <img src={railImage} alt="Train" className="object-cover w-full h-full min-h-screen absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-orange-900/60 z-10" />
        <div className="absolute left-0 top-0 h-full w-2 bg-orange-500 rounded-r-3xl shadow-2xl z-20" />
        <div className="absolute z-30 left-0 top-0 h-full w-full flex flex-col justify-center pl-20 pr-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-4">
            Your City, Your Metro
          </h1>
          <h2 className="text-2xl font-semibold text-orange-300 mb-8 drop-shadow">Fast. Reliable. Affordable.</h2>
          <div className="flex flex-col gap-2 text-lg text-gray-200 font-medium">
            <span>Plan your journey with ease.</span>
            <span>Book tickets, check schedules, and more.</span>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-slate-900 to-black min-h-screen">
        <div className="w-full max-w-md mx-auto bg-black/70 border border-orange-400/20 shadow-2xl rounded-3xl p-10 backdrop-blur-xl relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 h-32 w-2 bg-orange-500 rounded-r-2xl shadow-lg hidden md:block" />
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {isSignup ? 'Create Account' : 'Book Ticket.'}
            </h2>
            <p className="text-orange-400 font-semibold mt-1 text-xs tracking-widest uppercase">
              Pakistan Railways
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><UserIcon /></div>
                <input name="name" type="text" required value={formData.name} onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 bg-zinc-800/80 border border-orange-400/30 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 outline-none transition-all"
                  placeholder="Full Name" />
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><MailIcon /></div>
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-zinc-800/80 border border-orange-400/30 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 outline-none transition-all"
                placeholder="Email Address" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><LockIcon /></div>
              <input name="password" type="password" required value={formData.password} onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-zinc-800/80 border border-orange-400/30 rounded-xl focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400 outline-none transition-all"
                placeholder="Password" />
            </div>
            {error && <p className="text-red-400 text-xs text-center font-bold bg-black/30 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center py-4 bg-orange-500 text-white rounded-xl font-black shadow-xl hover:bg-orange-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50">
              {loading && <Spinner />}
              {loading ? 'Please Wait...' : (isSignup ? 'REGISTER' : 'SEARCH')}
            </button>
            <div className="text-center pt-4">
              <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-sm font-bold text-orange-300 hover:text-orange-200 underline underline-offset-4">
                {isSignup ? 'Already a member? Login' : "New traveler? Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;