import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Interface cho thông tin người dùng trong bình luận
interface CommentUser {
  id: string;
  name: string;
  avatar: any;
  title?: string;
}

// Interface cho một bình luận
interface Comment {
  id: string;
  user: CommentUser;
  text: string;
  timeAgo: string;
  likes?: number;
  isLiked?: boolean;
}

// Interface cho props của component CommentSection
interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment?: (postId: string, text: string) => void;
  onLikeComment?: (commentId: string) => void;
  onClose?: () => void;
  currentUser: CommentUser;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
  onAddComment,
  onLikeComment,
  onClose,
  currentUser,
}) => {
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Theo dõi sự kiện hiển thị/ẩn bàn phím
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Xử lý khi người dùng gửi bình luận
  const handleSubmitComment = () => {
    if (commentText.trim() === '') return;

    // Tạo bình luận mới
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      text: commentText,
      timeAgo: 'Just now',
      likes: 0,
      isLiked: false,
    };

    // Cập nhật danh sách bình luận cục bộ
    setLocalComments([...localComments, newComment]);
    
    // Gọi callback nếu có
    if (onAddComment) {
      onAddComment(postId, commentText);
    }
    
    // Xóa nội dung input
    setCommentText('');
  };

  // Xử lý khi người dùng thích một bình luận
  const handleLikeComment = (commentId: string) => {
    setLocalComments(
      localComments.map(comment => {
        if (comment.id === commentId) {
          const newIsLiked = !comment.isLiked;
          return {
            ...comment,
            isLiked: newIsLiked,
            likes: (comment.likes || 0) + (newIsLiked ? 1 : -1),
          };
        }
        return comment;
      })
    );

    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  // Xử lý khi người dùng nhấn nút bình luận
  const focusCommentInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Render một bình luận
  const renderComment = ({ item }: { item: Comment }) => (
    <View className="p-4 border-b border-gray-100">
      <View className="flex-row">
        <Image
          source={item.user.avatar}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View className="flex-1">
          <View className="bg-gray-100 rounded-2xl p-3">
            <View className="flex-row items-center mb-1">
              <Text className="font-semibold text-base">{item.user.name}</Text>
              {item.user.title && (
                <Text className="text-gray-600 text-xs ml-2">{item.user.title}</Text>
              )}
            </View>
            <Text className="text-gray-800">{item.text}</Text>
          </View>
          
          <View className="flex-row items-center mt-1 ml-2">
            <Text className="text-gray-500 text-xs mr-4">{item.timeAgo}</Text>
            <TouchableOpacity 
              className="flex-row items-center mr-4"
              onPress={() => handleLikeComment(item.id)}
            >
              <Text 
                className={`text-xs ${item.isLiked ? 'text-blue-500' : 'text-gray-500'}`}
              >
                Like
              </Text>
              {(item.likes || 0) > 0 && (
                <Text className="text-xs text-gray-500 ml-1">{item.likes}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={focusCommentInput}>
              <Text className="text-xs text-gray-500">Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity className="ml-2 p-1">
          <Feather name="more-vertical" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Comments</Text>
            <Text className="text-gray-500 ml-2">({localComments.length})</Text>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity className="mr-4">
              <Feather name="search" size={22} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Feather name="filter" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sort options */}
        <View className="flex-row justify-between items-center px-4 py-2 bg-gray-50">
          <Text className="text-gray-500">Sort by:</Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="font-medium mr-1">Most relevant</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Comments list */}
        <FlatList
          data={localComments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* Comment input */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-2">
          <View className="flex-row items-center">
            <Image
              source={currentUser.avatar}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <TextInput
                ref={inputRef}
                className="flex-1"
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity className="ml-2" onPress={handleSubmitComment}>
                <Feather 
                  name="send" 
                  size={20} 
                  color={commentText.trim() ? "#3b82f6" : "#9ca3af"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentSection;
