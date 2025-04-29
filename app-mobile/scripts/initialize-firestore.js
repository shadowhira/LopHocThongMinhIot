const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json'); // Thay đổi đường dẫn tới file service account của bạn

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeFirestore() {
  try {
    // 1. Tạo collection categories
    await initializeCategories();
    
    // 2. Tạo collection interests
    await initializeInterests();
    
    // 3. Tạo sample data cho các collections khác
    await initializeSampleData();
    
    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
}

async function initializeCategories() {
  const categories = [
    { name: "Professional", order: 1 },
    { name: "Entertainment", order: 2 },
    { name: "Social Cause", order: 3 },
    { name: "Education", order: 4 },
  ];
  
  const batch = db.batch();
  
  categories.forEach(category => {
    const docRef = db.collection('categories').doc();
    batch.set(docRef, {
      ...category,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log('Categories initialized');
}

async function initializeInterests() {
  const interests = [
    { name: "Tech", categoryName: "Professional" },
    { name: "Artificial Intelligence", categoryName: "Professional" },
    { name: "UX Design", categoryName: "Professional" },
    { name: "Travel", categoryName: "Entertainment" },
    { name: "Music", categoryName: "Entertainment" },
    { name: "Movies", categoryName: "Entertainment" },
    { name: "Environment", categoryName: "Social Cause" },
    { name: "Human Rights", categoryName: "Social Cause" },
    { name: "Science", categoryName: "Education" },
    { name: "History", categoryName: "Education" },
    { name: "Languages", categoryName: "Education" },
  ];
  
  const batch = db.batch();
  
  interests.forEach(interest => {
    const docRef = db.collection('interests').doc();
    batch.set(docRef, {
      ...interest,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  
  await batch.commit();
  console.log('Interests initialized');
}

async function initializeSampleData() {
  // Tạo users mẫu
  const users = [
    {
      id: 'user001',
      email: 'anaya.mehra@example.com',
      displayName: 'Anaya Mehra',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
      pronouns: 'She/Her',
      headline: 'Strategic Marketing Professional | Brand Enthusiast | Driving Success through Creativity & Analytics',
      about: 'Passionate and results-driven Strategic Marketing Professional with a keen eye for brand development and a penchant for blending creativity with data-driven insights.',
      location: 'Mumbai, India',
      workTitle: 'Marketing Manager',
      workCompany: 'Pixar',
      interests: [],
      interestsSelected: true,
      fcmTokens: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'user002',
      email: 'arvind.mishra@example.com',
      displayName: 'Arvind Mishra',
      photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
      pronouns: 'He/His',
      headline: 'Software Engineer | AI Enthusiast | Transforming Ideas into Reality',
      about: 'Experienced software engineer with a passion for AI and machine learning technologies.',
      location: 'Bangalore, India',
      workTitle: 'Senior Developer',
      workCompany: 'TechCorp',
      interests: [],
      interestsSelected: true,
      fcmTokens: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'user003',
      email: 'angela.joshi@example.com',
      displayName: 'Angela Joshi',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      pronouns: 'She/Her',
      headline: 'Strategic Marketing Professional | Brand Enthusiast',
      about: 'Marketing professional with expertise in brand development and digital marketing strategies.',
      location: 'Delhi, India',
      workTitle: 'Brand Manager',
      workCompany: 'GlobalBrands',
      interests: [],
      interestsSelected: true,
      fcmTokens: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo spaces mẫu
  const spaces = [
    {
      id: 'space001',
      name: '1% Club',
      description: 'A community for the top 1% professionals sharing knowledge and experiences.',
      image: 'https://example.com/spaces/1percent.jpg',
      coverImage: 'https://example.com/spaces/covers/1percent.jpg',
      memberCount: 859,
      rating: 4.8,
      activeUsers: 25,
      categories: ['Professional', 'Education'],
      isNew: true,
      visibility: {
        public: true,
        connections: true,
        private: false
      },
      createdBy: 'user001',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'space002',
      name: 'Fitness Folks',
      description: 'A community dedicated to fitness enthusiasts and health-conscious individuals.',
      image: 'https://example.com/spaces/fitness.jpg',
      coverImage: 'https://example.com/spaces/covers/fitness.jpg',
      memberCount: 1243,
      rating: 4.9,
      activeUsers: 42,
      categories: ['Health', 'Lifestyle'],
      isNew: false,
      visibility: {
        public: true,
        connections: true,
        private: false
      },
      createdBy: 'user002',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'space003',
      name: 'Wanderlust',
      description: 'For travel enthusiasts sharing their adventures and travel tips.',
      image: 'https://example.com/spaces/travel.jpg',
      coverImage: 'https://example.com/spaces/covers/travel.jpg',
      memberCount: 3567,
      rating: 4.7,
      activeUsers: 120,
      categories: ['Travel', 'Entertainment'],
      isNew: false,
      visibility: {
        public: true,
        connections: false,
        private: false
      },
      createdBy: 'user003',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo posts mẫu
  const posts = [
    {
      id: 'post001',
      authorId: 'user001',
      spaceId: 'space001',
      title: 'The Future of Marketing in 2023',
      content: 'In this post, I explore the emerging trends in marketing for 2023 and how businesses can adapt...',
      imageUrl: 'https://example.com/posts/marketing-trends.jpg',
      likes: 45,
      comments: 12,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'post002',
      authorId: 'user002',
      spaceId: 'space002',
      title: '5 Essential Exercises for Core Strength',
      content: 'Building core strength is crucial for overall fitness. Here are 5 exercises that can help...',
      imageUrl: 'https://example.com/posts/core-exercises.jpg',
      likes: 78,
      comments: 23,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'post003',
      authorId: 'user003',
      spaceId: 'space003',
      title: 'Hidden Gems in Southeast Asia',
      content: 'Discover these lesser-known destinations in Southeast Asia that offer authentic experiences...',
      imageUrl: 'https://example.com/posts/southeast-asia.jpg',
      likes: 92,
      comments: 31,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo events mẫu
  const events = [
    {
      id: 'event001',
      title: 'Marketing Masterclass',
      description: 'Join us for an intensive masterclass on digital marketing strategies for 2023.',
      spaceId: 'space001',
      imageUrl: 'https://example.com/events/marketing-masterclass.jpg',
      date: admin.firestore.Timestamp.fromDate(new Date(2023, 11, 15)), // December 15, 2023
      startTime: '10:00 AM',
      endTime: '1:00 PM',
      location: 'Mumbai Business Center',
      isLive: false,
      isHighlighted: true,
      createdBy: 'user001',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'event002',
      title: 'Fitness Challenge Kickoff',
      description: 'Start your fitness journey with our 30-day challenge. All fitness levels welcome!',
      spaceId: 'space002',
      imageUrl: 'https://example.com/events/fitness-challenge.jpg',
      date: admin.firestore.Timestamp.fromDate(new Date(2023, 11, 20)), // December 20, 2023
      startTime: '7:00 AM',
      endTime: '9:00 AM',
      location: 'Central Park, Delhi',
      isLive: false,
      isHighlighted: true,
      createdBy: 'user002',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'event003',
      title: 'Travel Photography Workshop',
      description: 'Learn how to capture stunning travel photos with professional photographer Jane Smith.',
      spaceId: 'space003',
      imageUrl: 'https://example.com/events/photography-workshop.jpg',
      date: admin.firestore.Timestamp.fromDate(new Date(2023, 11, 25)), // December 25, 2023
      startTime: '2:00 PM',
      endTime: '5:00 PM',
      location: 'Art Gallery, Bangalore',
      isLive: false,
      isHighlighted: false,
      createdBy: 'user003',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo connections mẫu
  const connections = [
    {
      id: 'connection001',
      requesterId: 'user001',
      recipientId: 'user002',
      status: 'accepted',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'connection002',
      requesterId: 'user001',
      recipientId: 'user003',
      status: 'accepted',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'connection003',
      requesterId: 'user002',
      recipientId: 'user003',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo chats mẫu
  const chats = [
    {
      id: 'chat001',
      participants: ['user001', 'user002'],
      lastMessage: {
        content: 'Looking forward to the marketing event!',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        senderId: 'user002',
        isRead: false
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'chat002',
      participants: ['user001', 'user003'],
      lastMessage: {
        content: 'Thanks for the travel recommendations!',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        senderId: 'user001',
        isRead: true
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Tạo notifications mẫu
  const notifications = [
    {
      id: 'notification001',
      userId: 'user001',
      type: 'connection',
      title: 'New Connection',
      content: 'Arvind Mishra accepted your connection request',
      read: false,
      sender: {
        id: 'user002',
        name: 'Arvind Mishra',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
      },
      relatedId: 'connection001',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'notification002',
      userId: 'user001',
      type: 'event',
      title: 'Upcoming Event',
      content: 'Marketing Masterclass starts in 2 days',
      read: false,
      relatedId: 'event001',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'notification003',
      userId: 'user002',
      type: 'post',
      title: 'New Post in Fitness Folks',
      content: 'Angela Joshi shared a new post: "Nutrition Tips for Active Lifestyles"',
      read: true,
      sender: {
        id: 'user003',
        name: 'Angela Joshi',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      },
      relatedId: 'post003',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    }
  ];
  
  // Lưu users
  for (const user of users) {
    const { id, ...userData } = user;
    await db.collection('users').doc(id).set(userData);
  }
  console.log('Sample users created');
  
  // Lưu spaces
  for (const space of spaces) {
    const { id, ...spaceData } = space;
    await db.collection('spaces').doc(id).set(spaceData);
    
    // Thêm creator làm admin của space
    await db.collection('spaces').doc(id).collection('members').doc(spaceData.createdBy).set({
      userId: spaceData.createdBy,
      role: 'admin',
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    });
    
    // Thêm các thành viên khác
    const otherUsers = users.filter(user => user.id !== spaceData.createdBy);
    for (const user of otherUsers) {
      await db.collection('spaces').doc(id).collection('members').doc(user.id).set({
        userId: user.id,
        role: 'member',
        joinedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
    }
  }
  console.log('Sample spaces and members created');
  
  // Lưu posts
  for (const post of posts) {
    const { id, ...postData } = post;
    await db.collection('posts').doc(id).set(postData);
    
    // Thêm comments cho post
    await db.collection('posts').doc(id).collection('comments').add({
      authorId: users.find(user => user.id !== postData.authorId).id,
      content: 'Great post! Thanks for sharing this valuable information.',
      likes: 3,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('posts').doc(id).collection('comments').add({
      authorId: users.find(user => user.id !== postData.authorId && user.id !== users.find(u => u.id !== postData.authorId).id).id,
      content: 'I found this very helpful. Looking forward to more content like this!',
      likes: 2,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log('Sample posts and comments created');
  
  // Lưu events
  for (const event of events) {
    const { id, ...eventData } = event;
    await db.collection('events').doc(id).set(eventData);
  }
  console.log('Sample events created');
  
  // Lưu connections
  for (const connection of connections) {
    const { id, ...connectionData } = connection;
    await db.collection('connections').doc(id).set(connectionData);
  }
  console.log('Sample connections created');
  
  // Lưu chats
  for (const chat of chats) {
    const { id, ...chatData } = chat;
    await db.collection('chats').doc(id).set(chatData);
    
    // Thêm messages cho chat
    await db.collection('chats').doc(id).collection('messages').add({
      senderId: chatData.participants[0],
      content: 'Hi there! How are you doing?',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: true
    });
    
    await db.collection('chats').doc(id).collection('messages').add({
      senderId: chatData.participants[1],
      content: 'I\'m doing great! Thanks for asking.',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: true
    });
    
    await db.collection('chats').doc(id).collection('messages').add({
      senderId: chatData.participants[0],
      content: chatData.lastMessage.content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: chatData.lastMessage.isRead
    });
  }
  console.log('Sample chats and messages created');
  
  // Lưu notifications
  for (const notification of notifications) {
    const { id, ...notificationData } = notification;
    await db.collection('notifications').doc(id).set(notificationData);
  }
  console.log('Sample notifications created');
  
  // Tạo searchHistory mẫu
  await db.collection('searchHistory').add({
    userId: 'user001',
    term: 'marketing strategies',
    count: 3,
    tab: 'spaces',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  
  await db.collection('searchHistory').add({
    userId: 'user002',
    term: 'fitness tips',
    count: 5,
    tab: 'posts',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  
  await db.collection('searchHistory').add({
    userId: 'user003',
    term: 'travel destinations',
    count: 2,
    tab: 'spaces',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('Sample search history created');
}

// Chạy hàm khởi tạo
initializeFirestore();
