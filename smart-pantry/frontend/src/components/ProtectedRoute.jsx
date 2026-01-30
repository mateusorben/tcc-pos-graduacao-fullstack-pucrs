import { Navigate } from 'react-router-dom';
import NotificationManager from '../components/NotificationManager';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NotificationManager />
      {children}
    </>
  );
};