import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../redux/actions/authActions';
import { clearForgotPasswordState } from '../../redux/slices/authSlice';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Loader, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const { 
    forgotPasswordLoading, 
    forgotPasswordSuccess, 
    forgotPasswordError 
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear state when component mounts
    dispatch(clearForgotPasswordState());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    try {
      await dispatch(forgotPassword(email.trim())).unwrap();
    } catch (err) {
      console.error('Forgot password failed:', err);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearForgotPasswordState());
    router.push('/auth/login');
  };

  if (forgotPasswordSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">CHANRE VEENA</h1>
            <p className="text-gray-600 text-sm">Rheumatology & Immunology Center</p>
          </div>

          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition-all duration-150 hover:scale-[1.02]"
              >
                Back to Login
              </button>
              
              <button
                onClick={() => {
                  dispatch(clearForgotPasswordState());
                  setEmail('');
                }}
                className="w-full text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">CHANRE VEENA</h1>
          <p className="text-gray-600 text-sm">Rheumatology & Immunology Center</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Forgot Password</h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {forgotPasswordError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{forgotPasswordError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={forgotPasswordLoading || !email.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {forgotPasswordLoading && <Loader className="animate-spin -ml-1 h-5 w-5" />}
              <span>{forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}</span>
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition duration-150 ease-in-out"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
           Copyright © {new Date().getFullYear()} Chanre Veena. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;