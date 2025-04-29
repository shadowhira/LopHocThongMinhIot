import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native';
import { useProfile } from '../../profile/hooks/useProfile';
import { useSpaces } from '../../spaces/hooks/useSpaces';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import { useAuth } from '../../auth/hooks/useAuth';
import { userService } from '../../../services/firebase/userService';
import { spaceService } from '../../../services/firebase/spaceService';
import { postService } from '../../../services/firebase/postService';
import { eventService } from '../../../services/firebase/eventService';
import { notificationService } from '../../../services/firebase/notificationService';
import { connectionService } from '../../../services/firebase/connectionService';
import { interestService } from '../../../services/firebase/interestService';
import { chatService } from '../../../services/firebase/chatService';
import { User } from '../../../types/user';
import { Space } from '../../../types/space';
import { Post } from '../../../types/post';
import { Event } from '../../../types/event';
import { Notification, NotificationType } from '../../../types/notification';
import { Connection } from '../../../types/connection';
import { Interest, Category } from '../../../types/interest';
import { Chat, Message } from '../../../types/chat';

const TestScreen = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { spaces, loading: spacesLoading } = useSpaces();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();

  const [testUsers, setTestUsers] = useState<User[]>([]);
  const [testSpaces, setTestSpaces] = useState<Space[]>([]);
  const [testPosts, setTestPosts] = useState<Post[]>([]);
  const [testEvents, setTestEvents] = useState<Event[]>([]);
  const [testConnections, setTestConnections] = useState<Connection[]>([]);
  const [testInterests, setTestInterests] = useState<Interest[]>([]);
  const [testCategories, setTestCategories] = useState<Category[]>([]);
  const [testChats, setTestChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  // Lấy dữ liệu test
  const fetchTestData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra xem user đã đăng nhập chưa
      if (!user) {
        setError('User not logged in. Please log in to test Firebase services.');
        return;
      }

      // Lấy danh sách users
      try {
        const users = await userService.getSuggestedUsers(user.id, 3);
        setTestUsers(users);
      } catch (userErr) {
        console.error('Error fetching users:', userErr);
      }

      // Lấy danh sách spaces
      try {
        const spaces = await spaceService.getAllSpaces(3);
        setTestSpaces(spaces);

        // Lấy danh sách posts
        if (spaces.length > 0) {
          try {
            const posts = await postService.getPostsBySpace(spaces[0].id, 3);
            setTestPosts(posts);
          } catch (postErr) {
            console.error('Error fetching posts:', postErr);
          }
        }
      } catch (spaceErr) {
        console.error('Error fetching spaces:', spaceErr);
      }

      // Lấy danh sách events
      try {
        const events = await eventService.getUpcomingEvents(3);
        setTestEvents(events);
      } catch (eventErr) {
        console.error('Error fetching events:', eventErr);
      }

    } catch (err) {
      console.error('Error fetching test data:', err);
      setError('Error fetching test data: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật profile
  const handleUpdateProfile = async () => {
    if (!displayName || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Kiểm tra xem user có tồn tại trong Firestore không
      try {
        const existingUser = await userService.getUserById(user.id);

        if (!existingUser) {
          // Nếu user không tồn tại, tạo mới
          await userService.updateUser(user.id, {
            email: user.email,
            displayName,
            photoURL: user.photoURL || null,
            interests: [],
            interestsSelected: false
          });

          alert('User profile created successfully!');
          setDisplayName('');
          return;
        }

        // Nếu user tồn tại, cập nhật
        const success = await updateProfile({ displayName });

        if (success) {
          alert('Profile updated successfully!');
          setDisplayName('');
        } else {
          setError('Failed to update profile');
        }
      } catch (userErr) {
        console.error('Error checking user existence:', userErr);
        setError('Error checking user: ' + (userErr instanceof Error ? userErr.message : String(userErr)));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchTestData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Services Test</Text>

      {/* Thông tin user hiện tại */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current User</Text>
        {profileLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : profile ? (
          <View>
            <Text>ID: {profile.id}</Text>
            <Text>Email: {profile.email}</Text>
            <Text>Name: {profile.displayName || 'N/A'}</Text>
            {profile.photoURL && (
              <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
            )}
          </View>
        ) : (
          <Text>No user logged in</Text>
        )}

        {/* Form cập nhật profile */}
        <View style={styles.form}>
          <Text style={styles.label}>Update Display Name:</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter new display name"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdateProfile}
            disabled={loading || !displayName}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách spaces */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spaces</Text>
        {spacesLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : spaces.length > 0 ? (
          spaces.slice(0, 3).map(space => (
            <View key={space.id} style={styles.item}>
              <Text style={styles.itemTitle}>{space.name}</Text>
              <Text>{space.description}</Text>
              <Text>Members: {space.memberCount}</Text>
            </View>
          ))
        ) : (
          <Text>No spaces found</Text>
        )}
      </View>

      {/* Danh sách notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications ({unreadCount} unread)</Text>
        {notificationsLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : notifications.length > 0 ? (
          notifications.slice(0, 3).map(notification => (
            <View key={notification.id} style={styles.item}>
              <Text style={styles.itemTitle}>{notification.title}</Text>
              <Text>{notification.content}</Text>
              <Text style={{ color: notification.read ? 'gray' : 'blue' }}>
                {notification.read ? 'Read' : 'Unread'}
              </Text>
            </View>
          ))
        ) : (
          <Text>No notifications found</Text>
        )}
      </View>

      {/* Danh sách test users */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Users</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : testUsers.length > 0 ? (
          testUsers.map(user => (
            <View key={user.id} style={styles.item}>
              <Text style={styles.itemTitle}>{user.displayName || 'No Name'}</Text>
              <Text>{user.email}</Text>
              {user.headline && <Text>{user.headline}</Text>}
            </View>
          ))
        ) : (
          <Text>No test users found</Text>
        )}
      </View>

      {/* Danh sách test posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Posts</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : testPosts.length > 0 ? (
          testPosts.map(post => (
            <View key={post.id} style={styles.item}>
              <Text style={styles.itemTitle}>{post.title}</Text>
              <Text>{post.content}</Text>
              <Text>Likes: {post.likes} | Comments: {post.comments}</Text>
            </View>
          ))
        ) : (
          <Text>No test posts found</Text>
        )}
      </View>

      {/* Danh sách test events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Events</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : testEvents.length > 0 ? (
          testEvents.map(event => (
            <View key={event.id} style={styles.item}>
              <Text style={styles.itemTitle}>{event.title}</Text>
              <Text>{event.description}</Text>
              <Text>Date: {event.date?.toDate?.().toLocaleDateString() || 'N/A'}</Text>
              <Text>Time: {event.startTime} - {event.endTime}</Text>
            </View>
          ))
        ) : (
          <Text>No test events found</Text>
        )}
      </View>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Nút refresh */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={fetchTestData}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Refresh Data</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho user */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={() => {
          if (user) {
            // Tạo user profile nếu chưa có
            userService.updateUser(user.id, {
              email: user.email,
              displayName: user.displayName || 'Test User',
              photoURL: user.photoURL || null,
              interests: [],
              interestsSelected: false,
              headline: 'Software Developer',
              about: 'I am a passionate developer who loves to code and learn new technologies.',
              location: 'Ho Chi Minh City, Vietnam',
              workTitle: 'Senior Developer',
              workCompany: 'Tech Company',
              createdAt: new Date(),
              updatedAt: new Date()
            }).then(() => {
              alert('Sample user data created!');
              fetchTestData();
            }).catch(err => {
              console.error('Error creating sample user data:', err);
              setError('Error creating sample data: ' + (err instanceof Error ? err.message : String(err)));
            });
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample User Data</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho space */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Tạo space mẫu
              const spaceData = {
                name: 'Test Space',
                description: 'This is a test space created for testing purposes.',
                memberCount: 1,
                rating: 4.5,
                activeUsers: 1,
                categories: ['Education', 'Technology'],
                isNew: true,
                visibility: {
                  public: true,
                  connections: false,
                  private: false
                },
                createdAt: new Date(),
                updatedAt: new Date()
              };

              const newSpace = await spaceService.createSpace(spaceData, user.id);

              alert(`Sample space created with ID: ${newSpace.id}`);
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample space:', err);
              setError('Error creating sample space: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Space</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho post */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Lấy space đầu tiên hoặc tạo mới nếu không có
              let spaces = await spaceService.getAllSpaces(1);
              let spaceId;

              if (spaces.length === 0) {
                // Tạo space mẫu nếu không có space nào
                const spaceData = {
                  name: 'Test Space for Posts',
                  description: 'This is a test space created for post testing.',
                  memberCount: 1,
                  rating: 4.5,
                  activeUsers: 1,
                  categories: ['Education', 'Technology'],
                  isNew: true,
                  visibility: {
                    public: true,
                    connections: false,
                    private: false
                  },
                  createdAt: new Date(),
                  updatedAt: new Date()
                };

                const newSpace = await spaceService.createSpace(spaceData, user.id);
                spaceId = newSpace.id;
              } else {
                spaceId = spaces[0].id;
              }

              // Tạo post mẫu
              const postData = {
                title: 'Test Post',
                content: 'This is a test post created for testing purposes. It contains some sample content to demonstrate how posts work in the application.',
                spaceId: spaceId,
                authorId: user.id,
                likes: 0,
                comments: 0,
                createdAt: new Date(),
                updatedAt: new Date()
              };

              const newPost = await postService.createPost(postData, user.id);

              alert(`Sample post created with ID: ${newPost.id}`);
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample post:', err);
              setError('Error creating sample post: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Post</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho notification */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Tạo các loại thông báo khác nhau
              const notificationTypes: Array<{
                type: string;
                title: string;
                content: string;
                read: boolean;
              }> = [
                {
                  type: 'message',
                  title: 'New Message',
                  content: 'You have received a new message from Test User.',
                  read: false
                },
                {
                  type: 'connection',
                  title: 'Connection Request',
                  content: 'Test User wants to connect with you.',
                  read: false
                },
                {
                  type: 'event',
                  title: 'Upcoming Event',
                  content: 'Don\'t forget about the upcoming event: Tech Meetup.',
                  read: false
                }
              ];

              // Tạo các thông báo
              for (const notif of notificationTypes) {
                await notificationService.createNotification({
                  userId: user.id,
                  type: notif.type as any,
                  title: notif.title,
                  content: notif.content,
                  read: notif.read,
                  sender: {
                    id: 'test-user-id',
                    name: 'Test User',
                    avatar: ''
                  },
                  relatedId: 'test-related-id',
                  timestamp: new Date()
                });
              }

              alert('Sample notifications created!');
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample notifications:', err);
              setError('Error creating sample notifications: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Notifications</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho event */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Lấy space đầu tiên hoặc tạo mới nếu không có
              let spaces = await spaceService.getAllSpaces(1);
              let spaceId;

              if (spaces.length === 0) {
                // Tạo space mẫu nếu không có space nào
                const spaceData = {
                  name: 'Test Space for Events',
                  description: 'This is a test space created for event testing.',
                  memberCount: 1,
                  rating: 4.5,
                  activeUsers: 1,
                  categories: ['Education', 'Technology'],
                  isNew: true,
                  visibility: {
                    public: true,
                    connections: false,
                    private: false
                  },
                  createdAt: new Date(),
                  updatedAt: new Date()
                };

                const newSpace = await spaceService.createSpace(spaceData, user.id);
                spaceId = newSpace.id;
              } else {
                spaceId = spaces[0].id;
              }

              // Tạo các events mẫu
              const eventTypes = [
                {
                  title: 'Tech Meetup',
                  description: 'Join us for a tech meetup where we will discuss the latest technologies and trends.',
                  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  startTime: '18:00',
                  endTime: '20:00',
                  location: 'Online',
                  isLive: false,
                  isHighlighted: true
                },
                {
                  title: 'Coding Workshop',
                  description: 'Learn how to code in this hands-on workshop for beginners.',
                  date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                  startTime: '10:00',
                  endTime: '16:00',
                  location: 'Tech Hub, Ho Chi Minh City',
                  isLive: false,
                  isHighlighted: false
                },
                {
                  title: 'Live Q&A Session',
                  description: 'Join our live Q&A session with industry experts.',
                  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                  startTime: '19:00',
                  endTime: '20:30',
                  location: 'Online',
                  isLive: true,
                  isHighlighted: true
                }
              ];

              // Tạo các events
              for (const eventData of eventTypes) {
                await eventService.createEvent({
                  ...eventData,
                  spaceId
                }, user.id);
              }

              alert('Sample events created!');
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample events:', err);
              setError('Error creating sample events: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Events</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho connections */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Tạo một số users mẫu nếu chưa có
              const testUserEmails = [
                'test1@example.com',
                'test2@example.com',
                'test3@example.com'
              ];

              const userIds = [];

              // Tạo các users mẫu
              for (let i = 0; i < testUserEmails.length; i++) {
                const email = testUserEmails[i];
                const displayName = `Test User ${i + 1}`;

                // Kiểm tra xem user đã tồn tại chưa
                let testUser = await userService.getUserByEmail(email);

                if (!testUser) {
                  // Tạo user mới
                  await userService.updateUser(`test-user-${i + 1}`, {
                    email,
                    displayName,
                    photoURL: null,
                    interests: [],
                    interestsSelected: false,
                    headline: `Test User ${i + 1} Headline`,
                    about: `This is a test user ${i + 1} for testing connections.`,
                    location: 'Test Location',
                    workTitle: 'Test Title',
                    workCompany: 'Test Company',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });

                  userIds.push(`test-user-${i + 1}`);
                } else {
                  userIds.push(testUser.id);
                }
              }

              // Tạo các connections
              if (userIds.length > 0) {
                // Connection 1: User gửi yêu cầu kết nối đến test user 1
                await connectionService.sendConnectionRequest(user.id, userIds[0]);

                // Connection 2: Test user 2 gửi yêu cầu kết nối đến user
                await connectionService.sendConnectionRequest(userIds[1], user.id);

                // Connection 3: User và test user 3 đã kết nối
                const connection = await connectionService.sendConnectionRequest(userIds[2], user.id);
                if (connection && connection.id) {
                  await connectionService.acceptConnectionRequest(connection.id);
                }
              }

              alert('Sample connections created!');
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample connections:', err);
              setError('Error creating sample connections: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Connections</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho interests */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Lấy danh sách categories và interests
              const categories = await interestService.getCategories();
              const interests = await interestService.getInterests();

              // Hiển thị thông tin
              setTestCategories(categories);
              setTestInterests(interests);

              // Chọn ngẫu nhiên 5 interests cho user
              if (interests.length > 0) {
                // Mảng để lưu interests đã chọn
                const interestCount = Math.min(5, interests.length);

                // Lấy ngẫu nhiên 5 interests
                const shuffled = [...interests].sort(() => 0.5 - Math.random());
                const selectedInterests = shuffled.slice(0, interestCount);

                // Lấy IDs của interests đã chọn
                const interestIds = selectedInterests.map(interest => interest.id);

                // Lưu interests của user
                await interestService.saveUserInterests(user.id, interestIds);

                alert(`Sample interests saved! Selected ${interestCount} interests for your profile.`);
              } else {
                setError('No interests found in the database.');
              }

              fetchTestData();
            } catch (err) {
              console.error('Error setting up interests:', err);
              setError('Error setting up interests: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Setup Interests</Text>
      </TouchableOpacity>

      {/* Nút tạo dữ liệu mẫu cho chats */}
      <TouchableOpacity
        style={styles.createSampleButton}
        onPress={async () => {
          if (user) {
            try {
              setLoading(true);
              setError(null);

              // Tạo một số users mẫu nếu chưa có
              const testUserEmails = [
                'chat1@example.com',
                'chat2@example.com'
              ];

              const userIds = [];

              // Tạo các users mẫu
              for (let i = 0; i < testUserEmails.length; i++) {
                const email = testUserEmails[i];
                const displayName = `Chat User ${i + 1}`;

                // Kiểm tra xem user đã tồn tại chưa
                let testUser = await userService.getUserByEmail(email);

                if (!testUser) {
                  // Tạo user mới
                  await userService.updateUser(`chat-user-${i + 1}`, {
                    email,
                    displayName,
                    photoURL: null,
                    interests: [],
                    interestsSelected: false,
                    headline: `Chat User ${i + 1} Headline`,
                    about: `This is a chat user ${i + 1} for testing chats.`,
                    location: 'Test Location',
                    workTitle: 'Test Title',
                    workCompany: 'Test Company',
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });

                  userIds.push(`chat-user-${i + 1}`);
                } else {
                  userIds.push(testUser.id);
                }
              }

              // Tạo các chats
              if (userIds.length > 0) {
                // Chat 1: User và chat user 1
                const chat1 = await chatService.getOrCreateChat(user.id, userIds[0]);

                // Gửi một số tin nhắn trong chat 1
                await chatService.sendMessage(chat1.id, user.id, 'Hello! This is a test message from me.');
                await chatService.sendMessage(chat1.id, userIds[0], 'Hi there! This is a response from Chat User 1.');
                await chatService.sendMessage(chat1.id, user.id, 'How are you doing today?');

                // Chat 2: User và chat user 2
                const chat2 = await chatService.getOrCreateChat(user.id, userIds[1]);

                // Gửi một số tin nhắn trong chat 2
                await chatService.sendMessage(chat2.id, userIds[1], 'Hey! I wanted to reach out about the project.');
                await chatService.sendMessage(chat2.id, user.id, 'Sure, what do you need help with?');
                await chatService.sendMessage(chat2.id, userIds[1], 'I was wondering if you could review my code.');
              }

              // Lấy danh sách chats của user
              const userChats = await chatService.getUserChats(user.id);
              setTestChats(userChats);

              alert('Sample chats created!');
              fetchTestData();
            } catch (err) {
              console.error('Error creating sample chats:', err);
              setError('Error creating sample chats: ' + (err instanceof Error ? err.message : String(err)));
            } finally {
              setLoading(false);
            }
          } else {
            setError('User not logged in. Please log in to create sample data.');
          }
        }}
        disabled={loading || !user}
      >
        <Text style={styles.buttonText}>Create Sample Chats</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: 8,
  },
  form: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  createSampleButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 32,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: '#d32f2f',
  },
});

export default TestScreen;
