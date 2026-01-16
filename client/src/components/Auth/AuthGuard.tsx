import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../utils/api';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      if (!apiService.isAuthenticated()) {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (!apiService.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;