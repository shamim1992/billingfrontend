// pages/404.js
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, ArrowLeft, Users, Receipt, Calendar, HelpCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import { useSelector } from 'react-redux';

const Custom404 = () => {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const quickLinks = [
    { name: 'Dashboard', icon: Home, path: `/dashboard/${user?.role?.toLowerCase()}`, color: 'bg-blue-500 hover:bg-blue-600' },
    { name: 'Patients', icon: Users, path: '/patients', color: 'bg-green-500 hover:bg-green-600' },
    { name: 'Billing', icon: Receipt, path: '/billing', color: 'bg-purple-500 hover:bg-purple-600' },
    { name: 'Products', icon: Calendar, path: '/products', color: 'bg-orange-500 hover:bg-orange-600' },
  ];

  // Show loading or nothing while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          {/* 404 Number with Animation */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-gray-200 select-none animate-pulse">
              404
            </h1>
            <div className="relative -mt-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center shadow-lg">
                <HelpCircle className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-gray-600 text-lg mb-2">
              The page you're looking for seems to have wandered off to another dimension.
            </p>
            <p className="text-gray-500">
              Don't worry, it happens to the best of us. Let's get you back on track!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
              
              {/* <Link href={`/dashboard/${user?.role?.toLowerCase()}`}>
                <span className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </span>
              </Link> */}
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Or visit one of these popular pages:
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.name} href={link.path}>
                    <span className="group flex flex-col items-center p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all cursor-pointer">
                      <div className={`w-12 h-12 ${link.color} rounded-lg flex items-center justify-center mb-3 transition-colors group-hover:scale-110 transform duration-200`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                        {link.name}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Still having trouble?</strong> Contact our support team or check if the URL is correct.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404;