import { useState, useEffect } from 'react';
import { spaceService } from '../../../services/firebase/spaceService';
import { postService } from '../../../services/firebase/postService';
import { eventService } from '../../../services/firebase/eventService';
import { Space, SpaceMember } from '../../../types/space';
import { Post } from '../../../types/post';
import { Event } from '../../../types/event';
import { useAuth } from '../../auth/hooks/useAuth';

export function useSpaceDetail(spaceId: string | undefined) {
  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();

  // Lấy thông tin space
  useEffect(() => {
    const fetchSpaceDetails = async () => {
      if (!spaceId) {
        setSpace(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Lấy thông tin space
        const spaceData = await spaceService.getSpaceById(spaceId);
        setSpace(spaceData);

        // Lấy danh sách thành viên
        const membersData = await spaceService.getSpaceMembers(spaceId);
        setMembers(membersData);

        // Lấy danh sách bài đăng
        const postsData = await postService.getPostsBySpace(spaceId);
        setPosts(postsData);

        // Lấy danh sách sự kiện
        const eventsData = await eventService.getEventsBySpace(spaceId);
        setEvents(eventsData);

        // Kiểm tra xem user hiện tại có phải là thành viên không
        if (user) {
          const userMember = membersData.find(member => member.userId === user.id);
          setIsMember(!!userMember);
          setIsAdmin(userMember?.role === 'admin');
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching space details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceDetails();
  }, [spaceId, user]);

  // Tham gia space
  const joinSpace = async () => {
    if (!spaceId || !user || isMember) return false;

    try {
      setJoining(true);
      await spaceService.addMemberToSpace(spaceId, user.id);
      setIsMember(true);

      // Cập nhật danh sách thành viên
      const membersData = await spaceService.getSpaceMembers(spaceId);
      setMembers(membersData);

      return true;
    } catch (err) {
      console.error('Error joining space:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setJoining(false);
    }
  };

  // Rời khỏi space
  const leaveSpace = async () => {
    if (!spaceId || !user || !isMember) return false;

    try {
      setJoining(true);

      // Tìm ID của member
      const userMember = members.find(member => member.userId === user.id);
      if (!userMember) return false;

      await spaceService.removeMemberFromSpace(spaceId, userMember.id);
      setIsMember(false);
      setIsAdmin(false);

      // Cập nhật danh sách thành viên
      const membersData = await spaceService.getSpaceMembers(spaceId);
      setMembers(membersData);

      return true;
    } catch (err) {
      console.error('Error leaving space:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setJoining(false);
    }
  };

  // Cập nhật space
  const updateSpace = async (data: Partial<Space>) => {
    if (!spaceId || !isAdmin) return false;

    try {
      await spaceService.updateSpace(spaceId, data);

      // Cập nhật state
      setSpace(prev => prev ? { ...prev, ...data } : null);

      return true;
    } catch (err) {
      console.error('Error updating space:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  return {
    space,
    members,
    posts,
    events,
    loading,
    error,
    isMember,
    isAdmin,
    joining,
    joinSpace,
    leaveSpace,
    updateSpace
  };
}
