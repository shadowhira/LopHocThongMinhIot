import { TouchableOpacity, View, Image, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { SearchResult } from "../types";

interface ResultCardProps {
  item: SearchResult;
  onPress?: () => void;
}

const ResultCard = ({ item, onPress }: ResultCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        <View style={styles.activeUsersBadge}>
          <Text style={styles.activeUsersText}>• {item.activeUsers}+</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={10} color="#f59e0b" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.membersContainer}>
          <Text style={styles.membersText}>{item.members} members</Text>
          {item.isNew && (
            <Text style={styles.newText}>• Mới</Text>
          )}
        </View>
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 186,
    height: 268,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    // Shadow cho iOS
    shadowColor: '#000', // Màu đen đậm hơn
    shadowOffset: { width: 0, height: 4 }, // Tăng độ dịch chuyển bóng
    shadowOpacity: 0.3, // Tăng độ mờ để thấy rõ hơn
    shadowRadius: 8, // Tăng bán kính bóng
    // Shadow cho Android
    elevation: 6, // Tăng elevation để bóng rõ hơn
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: 186,
    height: 100,
  },
  activeUsersBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  activeUsersText: {
    color: 'white',
    fontSize: 12,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -28,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  contentContainer: {
    paddingTop: 40,
    paddingHorizontal: 12,
    paddingBottom: 12,
    height: 168,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7', // amber-100
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#D97706', // amber-600
    fontSize: 12,
    marginLeft: 2,
  },
  membersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  membersText: {
    fontSize: 12,
    color: '#64748B', // slate-500
  },
  newText: {
    fontSize: 12,
    color: '#94A3B8', // slate-400
    marginLeft: 4,
  },
  description: {
    fontSize: 12,
    color: '#64748B', // slate-500
    lineHeight: 16,
  },
});

export default ResultCard;