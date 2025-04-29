import type React from "react";
import { View, Text, Image, TouchableOpacity, Modal, TextInput, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";

/**
 * Interface cho thông tin người dùng trong bài đăng
 */
interface User {
  name?: string;
  avatar?: any;
  tagline?: string;
  timeAgo?: string;
}

/**
 * Interface cho bình luận
 */
interface Comment {
  id: string;
  user: User;
  text: string;
  timeAgo: string;
  likes?: number;
  isLiked?: boolean;
}

/**
 * Interface cho props của component PostCard
 */
interface PostProps {
  post: {
    id: String;
    user?: User;
    community?: string;
    title?: string;
    content?: string;
    image?: any;
    likes: number;
    comments: number;
    isLiked?: boolean;
    isDisliked?: boolean;
    commentList?: Comment[];
  };
  onLike?: (postId: String) => void;
  onDislike?: (postId: String) => void;
  onComment?: (postId: String) => void;
  onShare?: (postId: String) => void;
  onCommunityPress?: (community: string) => void;
  onUserPress?: (userId: string) => void;
  onPostPress?: (postId: String) => void;
  onAddComment?: (postId: String, text: string) => void;
  currentUser?: User;
}

const PostCard: React.FC<PostProps> = ({
  post,
  onLike,
  onDislike,
  onComment,
  onShare,
  onCommunityPress,
  onUserPress,
  onPostPress,
  onAddComment,
  currentUser
}) => {
  // State để theo dõi trạng thái mở rộng của nội dung
  const [isExpanded, setIsExpanded] = useState(false);
  // State để lưu số dòng của nội dung
  const [textLines, setTextLines] = useState(0);
  // State để theo dõi trạng thái thích/không thích
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isDisliked, setIsDisliked] = useState(post.isDisliked || false);
  // State để theo dõi số lượt thích (có thể thay đổi khi người dùng thích/bỏ thích)
  const [likesCount, setLikesCount] = useState(post.likes);

  // State cho modal bình luận
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [focusInput, setFocusInput] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.commentList || []);
  const inputRef = useRef<TextInput>(null);

  // Kiểm tra nội dung có đủ dài để cần nút "Xem thêm" không
  const shouldShowExpandButton = textLines > 3;

  // Xử lý sự kiện khi người dùng nhấn nút Thích
  const handleLike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prevCount => newLikedState ? prevCount + 1 : prevCount - 1);

    if (onLike) {
      onLike(post.id);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn nút Không thích
  const handleDislike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prevCount => prevCount - 1);
    }

    setIsDisliked(!isDisliked);

    if (onDislike) {
      onDislike(post.id);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn nút Bình luận
  const handleComment = () => {
    setShowComments(true);
    setFocusInput(true);

    // Focus vào input sau khi modal hiển thị
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);

    if (onComment) {
      onComment(post.id);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn vào số bình luận
  const handleShowComments = () => {
    setShowComments(true);
    setFocusInput(false);
  };

  // Xử lý sự kiện khi người dùng gửi bình luận
  const handleSubmitComment = () => {
    if (commentText.trim() === '' || !currentUser) return;

    // Tạo bình luận mới
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      text: commentText,
      timeAgo: 'Vừa xong',
      likes: 0,
      isLiked: false,
    };

    // Cập nhật danh sách bình luận
    setComments([...comments, newComment]);

    // Gọi callback nếu có
    if (onAddComment) {
      onAddComment(post.id, commentText);
    }

    // Xóa nội dung input
    setCommentText('');
  };

  // Xử lý sự kiện khi người dùng thích một bình luận
  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map(comment => {
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
  };

  // Xử lý sự kiện khi người dùng nhấn nút Chia sẻ
  const handleShare = () => {
    if (onShare) {
      onShare(post.id);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn vào community
  const handleCommunityPress = () => {
    if (onCommunityPress && post.community) {
      onCommunityPress(post.community);
    }
  };

  // Xử lý sự kiện khi người dùng nhấn vào thông tin người dùng
  const handleUserPress = () => {
    if (onUserPress && post.user) {
      onUserPress(post.user.name || '');
    }
  };

  // Xử lý sự kiện khi người dùng nhấn vào bài đăng
  const handlePostPress = () => {
    if (onPostPress) {
      onPostPress(post.id);
    }
  };

  // Reset trạng thái khi post thay đổi
  useEffect(() => {
    setIsExpanded(false);
    setIsLiked(post.isLiked || false);
    setIsDisliked(post.isDisliked || false);
    setLikesCount(post.likes);
    setComments(post.commentList || []);
  }, [post.id, post.isLiked, post.isDisliked, post.likes, post.commentList]);

  // Focus vào input khi cần
  useEffect(() => {
    if (showComments && focusInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [showComments, focusInput]);

  return (
    <View className="bg-white rounded-2xl mx-4 my-2 overflow-hidden shadow-sm">
      {post.user && (
        <View className="p-4">
          {/* Hiển thị community nếu có */}
          {post.community && (
            <TouchableOpacity className="mb-3" onPress={handleCommunityPress}>
              <Text className="text-lg font-semibold">{post.community}</Text>
            </TouchableOpacity>
          )}

          {/* Thông tin người dùng */}
          <TouchableOpacity className="flex-row mb-3" onPress={handleUserPress}>
            <Image
              source={post.user.avatar}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View className="justify-center">
              <Text className="text-base font-semibold mb-0.5">
                {post.user.name}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-sm text-gray-600">
                  {post.user.tagline}
                </Text>
                <Text className="text-sm text-gray-600 mx-1">·</Text>
                <Text className="text-sm text-gray-600">
                  {post.user.timeAgo}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Tiêu đề bài đăng */}
          {post.title && (
            <TouchableOpacity onPress={handlePostPress}>
              <Text className="text-lg font-semibold mb-2">{post.title}</Text>
            </TouchableOpacity>
          )}

          {/* Nội dung bài đăng */}
          {post.content && (
            <View>
              {isExpanded ? (
                // Khi đã mở rộng, hiển thị toàn bộ nội dung mà không giới hạn số dòng
                <>
                  <TouchableOpacity onPress={() => setIsExpanded(false)} activeOpacity={0.8}>
                    <Text className="text-sm leading-5 text-gray-800 mb-1">
                      {post.content}
                    </Text>
                  </TouchableOpacity>
                  {shouldShowExpandButton && (
                    <TouchableOpacity onPress={() => setIsExpanded(false)}>
                      <Text className="text-sm text-blue-500">Thu gọn</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                // Khi chưa mở rộng, giới hạn 3 dòng
                <>
                  <TouchableOpacity
                    onPress={() => shouldShowExpandButton && setIsExpanded(true)}
                    activeOpacity={shouldShowExpandButton ? 0.8 : 1}
                  >
                    <Text
                      className="text-sm leading-5 text-gray-800 mb-1"
                      numberOfLines={3}
                      ellipsizeMode="tail"
                      onTextLayout={(e) =>
                        setTextLines(e.nativeEvent.lines.length)
                      }
                    >
                      {post.content}
                    </Text>
                  </TouchableOpacity>

                  {shouldShowExpandButton && (
                    <TouchableOpacity onPress={() => setIsExpanded(true)}>
                      <Text className="text-sm text-blue-500">Xem thêm</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* Hình ảnh bài đăng */}
      {post.image && (
        <Image source={post.image} className="w-full h-[300px]" />
      )}

      {/* Số lượt thích và bình luận */}
      <View className="flex-row justify-between px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-5 h-5 rounded-full bg-blue-400 justify-center items-center mr-1.5">
            <Feather name="thumbs-up" size={14} color="#fff" />
          </View>
          <Text className="text-sm text-gray-600">{likesCount} lượt thích</Text>
        </View>
        <TouchableOpacity onPress={handleShowComments}>
          <Text className="text-sm text-gray-600">{post.comments} bình luận</Text>
        </TouchableOpacity>
      </View>

      {/* Các nút tương tác */}
      <View className="flex-row justify-between px-4 py-3">
        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleLike}
        >
          <Feather
            name="thumbs-up"
            size={20}
            color={isLiked ? "#3b82f6" : "#666"}
          />
          <Text
            className={`ml-1.5 text-sm ${isLiked ? "text-blue-500" : "text-gray-600"}`}
          >
            Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleDislike}
        >
          <Feather
            name="thumbs-down"
            size={20}
            color={isDisliked ? "#ef4444" : "#666"}
          />
          <Text
            className={`ml-1.5 text-sm ${isDisliked ? "text-red-500" : "text-gray-600"}`}
          >
            Không thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleComment}
        >
          <Feather name="message-circle" size={20} color={"#666"} />
          <Text className="ml-1.5 text-sm text-gray-600">Bình luận</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center"
          onPress={handleShare}
        >
          <Feather name="send" size={20} color={"#666"} />
          <Text className="ml-1.5 text-sm text-gray-600">Chia sẻ</Text>
        </TouchableOpacity>
      </View>

      {/* Modal hiển thị bình luận */}
      <Modal
        visible={showComments}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowComments(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 bg-black bg-opacity-50">
            <View className="flex-1 mt-20 bg-white rounded-t-3xl">
              {/* Header */}
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => setShowComments(false)} className="mr-4">
                    <Feather name="arrow-left" size={24} color="#000" />
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold">Bình luận</Text>
                  <Text className="text-gray-500 ml-2">({comments.length})</Text>
                </View>
              </View>

              {/* Danh sách bình luận */}
              <FlatList
                data={comments}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 80 }}
                renderItem={({ item }) => (
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
                            {item.user.tagline && (
                              <Text className="text-gray-600 text-xs ml-2">{item.user.tagline}</Text>
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
                              Thích
                            </Text>
                            {(item.likes || 0) > 0 && (
                              <Text className="text-xs text-gray-500 ml-1">{item.likes}</Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Text className="text-xs text-gray-500">Trả lời</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View className="p-4 items-center justify-center">
                    <Text className="text-gray-500">Chưa có bình luận nào</Text>
                  </View>
                }
              />

              {/* Input bình luận */}
              {currentUser && (
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
                        placeholder="Viết bình luận..."
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
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default PostCard;
