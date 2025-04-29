import { ChatConversation } from "../types";

// Dữ liệu mẫu cho danh sách cuộc trò chuyện
export const chatConversations: ChatConversation[] = [
  {
    id: "1",
    participants: [
      {
        id: "user1",
        name: "Alex Turner",
        avatar: { uri: "https://randomuser.me/api/portraits/men/32.jpg" },
      },
    ],
    lastMessage: {
      content: "Great! I'll see you then. 👋",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "currentUser",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "2",
    participants: [
      {
        id: "user2",
        name: "Emma Watson",
        avatar: { uri: "https://randomuser.me/api/portraits/women/24.jpg" },
      },
    ],
    lastMessage: {
      content: "Of course! It's a HIIT class on Thursday at 6pm. Are you joining?",
      timestamp: new Date("2023-04-10T21:30:00"),
      senderId: "user2",
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: "3",
    participants: [
      {
        id: "user3",
        name: "Rahul Vivek",
        avatar: { uri: "https://randomuser.me/api/portraits/men/36.jpg" },
      },
    ],
    lastMessage: {
      content: "Nice choice! I'm more into classical music these days. What about you?",
      timestamp: new Date("2023-04-10T21:35:00"),
      senderId: "user3",
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: "4",
    participants: [
      {
        id: "user4",
        name: "Priya Wankhede",
        avatar: { uri: "https://randomuser.me/api/portraits/women/67.jpg" },
      },
    ],
    lastMessage: {
      content: "Awesome! See you on Sunday. Don't forget to bring your notes!",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "user4",
      isRead: false,
    },
    unreadCount: 1,
  },
  {
    id: "5",
    participants: [
      {
        id: "user5",
        name: "Akshay Khanna",
        avatar: { uri: "https://randomuser.me/api/portraits/men/45.jpg" },
      },
    ],
    lastMessage: {
      content: "Definitely! Count me in. Let me know the details.",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "currentUser",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "6",
    participants: [
      {
        id: "user6",
        name: "Maya Sharma",
        avatar: { uri: "https://randomuser.me/api/portraits/women/63.jpg" },
      },
    ],
    lastMessage: {
      content: "Wonderful! See you on Wednesday for the study group.",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "user6",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "7",
    participants: [
      {
        id: "user7",
        name: "Chris Dickens",
        avatar: { uri: "https://randomuser.me/api/portraits/men/29.jpg" },
      },
    ],
    lastMessage: {
      content: "Nice! I'm diving into UX research for my new project. Would love your input!",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "user7",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "8",
    participants: [
      {
        id: "user8",
        name: "Ananya Pandey",
        avatar: { uri: "https://randomuser.me/api/portraits/women/33.jpg" },
      },
    ],
    lastMessage: {
      content: "Awesome! If you have any questions about the assignment, just ask.",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "currentUser",
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: "9",
    participants: [
      {
        id: "user9",
        name: "Olivia Gomez",
        avatar: { uri: "https://randomuser.me/api/portraits/women/44.jpg" },
      },
    ],
    lastMessage: {
      content: "I'll check my schedule and let you know about the workshop.",
      timestamp: new Date("2023-04-10T21:10:00"),
      senderId: "user9",
      isRead: true,
    },
    unreadCount: 0,
  },
];
