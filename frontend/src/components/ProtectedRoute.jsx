import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { voter } = useAuth();
  if (!voter) return <Navigate to="/login" replace />;
  return children;
}