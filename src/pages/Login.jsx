
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { Mail, Lock, User, Eye, EyeOff, Train } from 'lucide-react';

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      navigate('/');
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-96 -right-96 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-96 -left-96 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header with Icon */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/50 mb-6">
            <Train className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">RAILWAY</h1>
          <p className="text-blue-300 font-semibold text-sm tracking-widest uppercase mb-2">Pakistan Railways</p>
          <p className="text-gray-400 text-sm">Book your journey with ease</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/50 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 animate-slide-up">
          {/* Tab Switcher */}
          <div className="flex gap-3 bg-gray-100/50 rounded-xl p-2 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
                !isSignup
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-800 hover:text-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all duration-300 ${
                isSignup
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50'
                  : 'text-gray-800 hover:text-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignup && (
              <div className="relative group animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-100/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 outline-none transition-all hover:border-blue-500/50"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div className="relative group animate-fade-in" style={{ animationDelay: isSignup ? '0.3s' : '0.2s' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 outline-none transition-all hover:border-blue-500/50"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group animate-fade-in" style={{ animationDelay: isSignup ? '0.4s' : '0.3s' }}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-100/50 border border-blue-500/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 outline-none transition-all hover:border-blue-500/50"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-400/70 hover:text-blue-400 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm font-medium animate-shake" style={{ animationDelay: isSignup ? '0.5s' : '0.4s' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center mt-6 animate-fade-in"
              style={{ animationDelay: isSignup ? '0.6s' : '0.5s' }}
            >
              {loading && <Spinner />}
              {loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6 text-gray-800 text-sm animate-fade-in" style={{ animationDelay: isSignup ? '0.7s' : '0.6s' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-800 hover:text-blue-300 font-semibold transition-colors"
            >
              {isSignup ? 'Sign In' : 'Register'}
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8 text-gray-800 text-xs">
          <p>🔒 Secure • ✅ Trusted • 🚄 Fast</p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;