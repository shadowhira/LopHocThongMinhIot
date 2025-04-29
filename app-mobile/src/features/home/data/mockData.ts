export const communities = [
  {
    id: "1",
    name: "IT PTIT",
    image: require("src/public/assets/communities/1.png"),
  },
  {
    id: "2",
    name: "Green Earth",
    image: require("src/public/assets/communities/2.png"),
  },
  {
    id: "3",
    name: "Beyond the box",
    image: require("src/public/assets/communities/3.png"),
  },
  {
    id: "4",
    name: "Film Buffs",
    image: require("src/public/assets/communities/4.png"),
  },
  {
    id: "5",
    name: "Fitness",
    image: require("src/public/assets/communities/5.png"),
  },
];

export const recommendedCommunities = [
  {
    id: "1",
    name: "1% Club",
    image: require("src/public/assets/communities/1.png"),
    members: 859,
    rating: 4.8,
    activeUsers: 25,
    description: "Cộng đồng chia sẻ kiến thức tài chính và đầu tư thông minh",
    isNew: true,
  },
  {
    id: "2",
    name: "UX Book Club",
    image: require("src/public/assets/communities/2.png"),
    members: 1243,
    rating: 4.9,
    activeUsers: 42,
    description: "Thảo luận về thiết kế UX/UI và chia sẻ kinh nghiệm thực tế",
    isNew: true,
  },
  {
    id: "3",
    name: "Coding Vietnam",
    image: require("src/public/assets/communities/3.png"),
    members: 3567,
    rating: 4.7,
    activeUsers: 120,
    description:
      "Cộng đồng lập trình viên Việt Nam chia sẻ kiến thức và cơ hội việc làm",
    isNew: false,
  },
  {
    id: "4",
    name: "Digital Nomads",
    image: require("src/public/assets/communities/4.png"),
    members: 1876,
    rating: 4.6,
    activeUsers: 65,
    description:
      "Kết nối những người làm việc từ xa và chia sẻ kinh nghiệm du lịch kết hợp làm việc",
    isNew: false,
  },
];

export const liveRooms = [
  {
    id: "1",
    title: "React Native Workshop",
    host: {
      name: "Nguyễn Văn Huân",
      image: "https://i.pravatar.cc/150?img=1",
      description: "React Native Developer",
    },
    listeners: 120,
    avatars: [
      "https://i.pravatar.cc/150?img=2",
      "https://i.pravatar.cc/150?img=3",
    ],
  },
  {
    id: "2",
    title: "Học tiếng Anh giao tiếp",
    host: {
      name: "Nguyễn Thị Hương",
      image: "https://i.pravatar.cc/150?img=4",
      description: "English Teacher",
    },
    listeners: 80,
    avatars: [
      "https://i.pravatar.cc/150?img=5",
      "https://i.pravatar.cc/150?img=6",
    ],
  },
];

export const events = [
  {
    id: "1",
    title: "React Native Workshop",
    community: "IT PTIT",
    Image: require("src/public/assets/events/1.png"),
    date: "Today, 2:00 PM",
    location: "Học viện Công nghệ Bưu chính Viễn thông - PTIT - hội trường A2",
  },
  {
    id: "2",
    title: "Vượt vùng an toàn, vươn ra thế giới",
    community: "Beyond the box",
    Image: require("src/public/assets/events/2.png"),
    date: "Tomorrow, 10:00 AM",
    location:
      "Học viện Công nghệ Bưu chính Viễn thông - PTIT - cơ sở Ngọc Trục",
  },
];

// Người dùng hiện tại
export const currentUser = {
  id: "999",
  name: "Nguyễn Văn Huân",
  avatar: require("src/public/assets/avatars/huan.jpg"),
  tagline: "React Native Developer",
};

export const posts = [
  {
    id: "1",
    user: {
      name: "Nguyễn Văn Huân",
      avatar: require("src/public/assets/avatars/huan.jpg"),
      tagline: "React Native Developer",
      timeAgo: "30 min",
    },
    community: "IT PTIT",
    title: "Làm thế nào để tạo một ứng dụng React Native?",

    content: `Muốn làm app mobile bằng React Native? Dưới đây là các bước cơ bản để bắt đầu:

  Cài Node.js và Expo CLI (hoặc React Native CLI nếu muốn tùy biến sâu).
  👉 npm install -g expo-cli

  Tạo app mới:
  👉 expo init MyApp
  👉 cd MyApp && npm start

  Xây dựng giao diện bằng JSX + StyleSheet hoặc thư viện UI (Tailwind, NativeBase,...)

  Thêm điều hướng với React Navigation:
  👉 npm install @react-navigation/native

  Test app ngay trên điện thoại bằng app Expo Go 📱

  Build & xuất bản:
  👉 npx expo build:android hoặc dùng EAS Build

  💡 Tips: Bắt đầu bằng các app đơn giản như to-do list, calculator, hoặc weather app để làm quen.

  👉 Nếu bạn muốn mình chia sẻ source code mẫu hoặc hướng dẫn chi tiết hơn, comment nhé!

  #ReactNative #MobileDevelopment #LearnToCode #LậpTrìnhMobile #DevLife`,
    image: { uri: "https://designshack.net/wp-content/uploads/taskla-react-native-app.jpg" },
    likes: 10,
    comments: 2,
    commentList: [
      {
        id: "1",
        user: {
          id: "101",
          name: "Mukta Prasad",
          avatar: { uri: "https://randomuser.me/api/portraits/women/65.jpg" },
          tagline: "UX Designer",
        },
        text: "Cảm ơn bạn đã chia sẻ! Mình đang muốn học React Native, bài viết này rất hữu ích.",
        timeAgo: "15m",
        likes: 3,
        isLiked: false,
      },
      {
        id: "2",
        user: {
          id: "102",
          name: "Samuel Harbour",
          avatar: { uri: "https://randomuser.me/api/portraits/men/42.jpg" },
          tagline: "Mobile Developer",
        },
        text: "Bạn có thể chia sẻ thêm về cách sử dụng Redux trong React Native không?",
        timeAgo: "26m",
        likes: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: "2",
    user: {
      name: "Anna Taylor Joy",
      avatar: {
        uri: "https://i.pinimg.com/736x/13/7d/c6/137dc61d39138fad2f6c5ce37bf62ab1.jpg",
      },
      tagline: "English Teacher",
      timeAgo: "1 hour",
    },
    content: `Có lúc mọi thứ sụp đổ. Không còn rõ mình đang làm gì, vì sao phải cố gắng, hay nên đi đâu tiếp theo. Cảm giác như bị rơi xuống một nơi không đáy – lạnh lẽo, mệt mỏi và trống rỗng.
Nhưng một khi đã ở đáy vực, thì dù bước theo hướng nào cũng là đang đi lên. Không cần đúng đường, chỉ cần tiến lên. Một hành động nhỏ thôi cũng đủ để bắt đầu thay đổi.
Đứng dậy. Hít một hơi thật sâu. Làm một việc đơn giản mà mình có thể kiểm soát. Từng chút một, sự ổn định sẽ quay lại. Sự sống động cũng sẽ quay lại.
Không ai mạnh mẽ suốt cả quãng đường. Nhưng chỉ cần không buông tay, thì vẫn còn cơ hội để leo lên.`,
    image: {
      uri: "https://i.pinimg.com/736x/5e/83/b0/5e83b0988992ff10c7194b7a2fda2717.jpg",
    },
    likes: 10,
    comments: 2,
  },

  {
    id: "3",
    user: {
      name: "Justin Bieber",
      avatar: {
        uri: "https://th.bing.com/th/id/OIP.oqgw87xY_hWjk4cs-BHb9AHaFj?w=267&h=200&c=7&r=0&o=5&dpr=2&pid=1.7",
      },
      tagline: "Fullstack Developer",
      timeAgo: "1 hour",
    },
    community: "IT PTIT",
    content: `Thinkin of renting a van and going radio station to radio station like the good ol days Ryan Good, DJ Tay James, Pattie Mallette LOVE YOU GUYS`,
    image: {
      uri: "https://scontent.fhan14-1.fna.fbcdn.net/v/t39.30808-6/470569636_1168287631320203_327799918509668356_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeGVh2g65UIhzRMjygJp9tMVEppxcDTxk7gSmnFwNPGTuDoMXsnGaFT5DMnagXB_yLfNuJW6CZW6xBK0605gUuC6&_nc_ohc=9-c2-IsTFSIQ7kNvwHBN6Go&_nc_oc=Adn-8Lo093bsGoh6RaNpaTADcL4NlKpnrhZ9_Dr6bQcm7F0WA7_E7Mq3bJB_lzUKXce-ANOynT8ZrYdYBW0WCxwN&_nc_zt=23&_nc_ht=scontent.fhan14-1.fna&_nc_gid=vMGYcGMdAICot76amUfAsQ&oh=00_AfGS_4ACAgUUC_Lg-rag0px0Y98LaNtuMz_VbMrIMQjp6w&oe=6803B5F6",
    },
    likes: 20,
    comments: 5,
  },
];
