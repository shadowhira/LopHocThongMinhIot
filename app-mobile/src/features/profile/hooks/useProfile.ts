import { useState, useEffect } from 'react';
import { userService } from '../../../services/firebase/userService';
import { User } from '../../../types/user';
import { useAuth } from '../../auth/hooks/useAuth';

export function useProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();


  // Lấy thông tin profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await userService.getUserById(user.id);
        setProfile(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Cập nhật thông tin profile
  const updateProfile = async (data: Partial<User>) => {
    if (!user) return false;

    try {
      setUpdating(true);
      await userService.updateUser(user.id, data);

      // Cập nhật state
      setProfile(prev => prev ? { ...prev, ...data } : null);

      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setUpdating(false);
    }
  };



  return {
    profile,
    loading,
    error,
    updating,
    updateProfile,

  };
}
