import { useState, useEffect } from 'react';
import { spaceService } from '../../../services/firebase/spaceService';
import { Space } from '../../../types/space';
import { useAuth } from '../../auth/hooks/useAuth';

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();


  // Lấy tất cả spaces
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        const spacesData = await spaceService.getAllSpaces();
        setSpaces(spacesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching spaces:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  // Tạo space mới
  const createSpace = async (spaceData: Partial<Space>, imageUri?: string, coverImageUri?: string) => {
    if (!user) return null;

    try {
      setCreating(true);

      // Tạo space
      const newSpace = await spaceService.createSpace(spaceData, user.id);

      // Upload ảnh nếu có
      if (imageUri) {
        await spaceService.uploadSpaceImage(newSpace.id, imageUri, true);
      }

      if (coverImageUri) {
        await spaceService.uploadSpaceImage(newSpace.id, coverImageUri, false);
      }

      // Cập nhật state
      setSpaces(prev => [...prev, newSpace]);

      return newSpace;
    } catch (err) {
      console.error('Error creating space:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setCreating(false);
    }
  };

  // Lấy spaces theo danh mục
  const getSpacesByCategory = async (category: string) => {
    try {
      setLoading(true);
      const spacesData = await spaceService.getSpacesByCategory(category);
      return spacesData;
    } catch (err) {
      console.error('Error fetching spaces by category:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Lấy spaces mới
  const getNewSpaces = async () => {
    try {
      setLoading(true);
      const spacesData = await spaceService.getNewSpaces();
      return spacesData;
    } catch (err) {
      console.error('Error fetching new spaces:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    spaces,
    loading,
    error,
    creating,
    createSpace,
    getSpacesByCategory,
    getNewSpaces
  };
}
