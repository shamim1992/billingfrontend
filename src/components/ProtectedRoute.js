import React from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector((state) => state.auth);
  const router = useRouter();

  React.useEffect(() => {
    const tokenInStorage = localStorage.getItem('token');
    
  
    if (!isAuthenticated || !tokenInStorage) {
        router.push('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated) {
    return null; 
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
