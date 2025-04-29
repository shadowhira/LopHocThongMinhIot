import { Notification } from "../types"

// Dữ liệu mẫu
export const MOCK_NOTIFICATIONS: Notification[] = [
    {
      id: "1",
      type: "article",
      title: "New in UX Rescue! An interesting article on the impact of Color in UX Design.",
      content: "Engage and share your insights.",
      timestamp: Date.now() - 1000 * 60, // 1 phút trước
      read: false,
      icon: "https://randomuser.me/api/portraits/men/32.jpg",
      color: "#e53e3e",
    },
    {
      id: "2",
      type: "event",
      title: "Yoga & Meditation Workshop is happening tomorrow at 6 PM.",
      content: "Set your intentions and join us for a peaceful session.",
      timestamp: Date.now() - 1000 * 60 * 30, // 30 phút trước
      read: false,
      icon: "https://randomuser.me/api/portraits/women/68.jpg",
      color: "#805ad5",
    },
    {
      id: "3",
      type: "event",
      title: "Film Buff Exclusive! Join the virtual movie night this Friday.",
      content: "Grab your popcorn, share your favorite films, and enjoy the show!",
      timestamp: Date.now() - 1000 * 60 * 48, // 48 phút trước
      read: true,
      icon: "https://randomuser.me/api/portraits/men/43.jpg",
      color: "#dd6b20",
    },
    {
      id: "4",
      type: "challenge",
      title: "7-day plank challenge! - Join the challenge and motivate each other",
      content: "towards a healthier you.",
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 giờ trước
      read: true,
      icon: "https://randomuser.me/api/portraits/women/44.jpg",
      color: "#38a169",
    },
    {
      id: "5",
      type: "challenge",
      title: "Tech Geeks Challenge! Code sprint this weekend.",
      content: "Test your coding skills, collaborate, and level up. Are you up for the challenge?",
      timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5 giờ trước
      read: false,
      icon: "https://randomuser.me/api/portraits/men/45.jpg",
      color: "#3182ce",
    },
    {
      id: "6",
      type: "message",
      title: "Neeti messaged: Hey Sarah! Welcome to Bangalore!",
      content: "If you need any local tips or want to grab a coffee, feel free to chat. 😊",
      timestamp: Date.now() - 1000 * 60 * 60 * 7, // 7 giờ trước
      read: true,
      sender: {
        id: "user123",
        name: "Neeti",
        avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      },
    },
    {
      id: "7",
      type: "event",
      title: 'The virtual travel talk "Hidden Gems of Bangalore" is happening this Friday.',
      content: "Lock the date in your calendar.",
      timestamp: Date.now() - 1000 * 60 * 60 * 10, // 10 giờ trước
      read: false,
      icon: "https://randomuser.me/api/portraits/men/46.jpg",
      color: "#dd6b20",
    },
    {
      id: "8",
      type: "community",
      title: "Eco-warriors: Sharan shared a quick guide to sustainable living.",
      content: "Check it out and join the conversation.",
      timestamp: Date.now() - 1000 * 60 * 60 * 15, // 15 giờ trước
      read: true,
      icon: "https://randomuser.me/api/portraits/women/47.jpg",
      color: "#38a169",
    },
    {
      id: "9",
      type: "message",
      title: "Akash messaged: \"Hey there! I saw you're a tech geek.",
      content: "I'm working on a cool project—let's chat tech over a virtual coffee?\" Sure!",
      timestamp: Date.now() - 1000 * 60 * 60 * 17, // 17 giờ trước
      read: false,
      sender: {
        id: "user456",
        name: "Akash",
        avatar: "https://randomuser.me/api/portraits/men/48.jpg",
      },
    },
    {
      id: "10",
      type: "reminder",
      title: "Mindful Monday Meditation is tomorrow at 7 AM.",
      content: "Start your week with calmness and positive vibes. Join us!",
      timestamp: Date.now() - 1000 * 60 * 60 * 20, // 20 giờ trước
      read: true,
      icon: "https://randomuser.me/api/portraits/women/49.jpg",
      color: "#ecc94b",
    },
    {
      id: "11",
      type: "challenge",
      title: "Tech Geeks: Coding Challenge this weekend!",
      content: "Sharpen your coding skills and compete with the community. Ready to take on the challenge?",
      timestamp: Date.now() - 1000 * 60 * 60 * 23, // 23 giờ trước
      read: false,
      icon: "https://randomuser.me/api/portraits/men/50.jpg",
      color: "#3182ce",
    },
    {
      id: "12",
      type: "reminder",
      title: "Tech Geeks: Don't miss the Tech Talk on Artificial Intelligence this Wednesday.",
      content: "Set reminder!",
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 24 giờ trước
      read: true,
      icon: "https://randomuser.me/api/portraits/women/51.jpg",
      color: "#ecc94b",
    },
    {
      id: "13",
      type: "article",
      title: "Don't miss out! UX Rescue is hosting a live Q&A session with industry experts.",
      content: "Join now and enhance your UX knowledge.",
      timestamp: Date.now() - 1000 * 60 * 60 * 26, // 26 giờ trước
      read: false,
      icon: "https://randomuser.me/api/portraits/men/52.jpg",
      color: "#e53e3e",
    },
    {
      id: "14",
      type: "community",
      title: "Tech Geeks Alert! Dive deep into the world of technology.",
      content: "Join discussions, hackathons, and connect with tech enthusiasts.",
      timestamp: Date.now() - 1000 * 60 * 60 * 27, // 27 giờ trước
      read: true,
      icon: "https://randomuser.me/api/portraits/women/53.jpg",
      color: "#3182ce",
    },
  ]