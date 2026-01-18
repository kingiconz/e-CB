import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return handleLogout;
};