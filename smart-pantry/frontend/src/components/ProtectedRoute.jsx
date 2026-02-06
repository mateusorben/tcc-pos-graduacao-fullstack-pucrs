import { Navigate } from 'react-router-dom';
import NotificationManager from '../components/NotificationManager';

export const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <NotificationManager />
      {children}
    </>
  );
};