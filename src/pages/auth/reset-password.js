import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, verifyResetToken } from '../../redux/actions/authActions';
import { clearResetPasswordState, clearTokenVerificationState } from '../../redux/slices/authSlice';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, Loader, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = router.query;
  
  const { 
    resetPasswordLoading, 
    resetPasswordSuccess, 
    resetPasswordError,
    tokenVerificationLoading,
    tokenValid,
    tokenVerificationError
  } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear states when component mounts
    dispatch(clearResetPasswordState());
    dispatch(clearTokenVerificationState());
  }, [dispatch]);

  useEffect(() => {
    // Verify token when component mounts and token is available
    if (token) {
      dispatch(verifyResetToken(token));
    }
  }, [token, dispatch]);

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;
    
    try {
      await dispatch(resetPassword({ token, newPassword })).unwrap();
    } catch (err) {
      console.error('Reset password failed:', err);
    }
  };

  const handleBackToLogin = () => {
    dispatch(clearResetPasswordState());
    router.push('/auth/login');
  };

  // Loading state while verifying token
  if (tokenVerificationLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (tokenVerificationError || !tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">CHANRE VEENA</h1>
            <p className="text-gray-600 text-sm">Rheumatology & Immunology Center</p>
          </div>

          {/* Error Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Invalid Reset Link</h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition-all duration-150 hover:scale-[1.02] text-center"
              >
                Request New Reset Link
              </Link>
              
              <Link
                href="/auth/login"
                className="block w-full text-blue-600 py-2.5 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (resetPasswordSuccess) {
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
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Password Reset Successful</h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            
            <button
              onClick={handleBackToLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition-all duration-150 hover:scale-[1.02]"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600 mb-2">CHANRE VEENA</h1>
          <p className="text-gray-600 text-sm">Rheumatology & Immunology Center</p>
        </div>

        {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Reset Password</h2>
            <p className="text-gray-500 text-sm mt-1">
              Please enter your new password
            </p>
          </div>

          {(resetPasswordError || validationError) && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{resetPasswordError || validationError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetPasswordLoading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg transform transition-all duration-150 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              {resetPasswordLoading && <Loader className="animate-spin -ml-1 h-5 w-5" />}
              <span>{resetPasswordLoading ? 'Resetting...' : 'Reset Password'}</span>
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Link 
              href="/auth/login" 
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition duration-150 ease-in-out"
            >
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

export default ResetPassword;