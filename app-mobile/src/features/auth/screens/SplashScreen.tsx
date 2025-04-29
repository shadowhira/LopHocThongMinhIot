import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/types";
import { SafeAreaView } from "react-native-safe-area-context";

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Splash"
>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate("SplashLoading");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundIconsContainer}>
        {/* Small social media icons scattered in the background */}
        {[...Array(20)].map((_, index) => (
          <Text
            key={index}
            style={[
              styles.backgroundIcon,
              {
                top: Math.random() * 500,
                left: Math.random() * 350,
                opacity: 0.2 + Math.random() * 0.3,
                transform: [{ rotate: `${Math.random() * 360}deg` }],
              },
            ]}
          >
            {["♥", "♦", "●", "■", "★", "◆", "○", "□", "♠", "♣"][Math.floor(Math.random() * 10)]}
          </Text>
        ))}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>EduSocial</Text>
        <Text style={styles.subtitle}>
          Khám phá và tham gia các nhóm dễ dàng phù hợp với nhu cầu của bạn một cách hoàn hảo!
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.footerBackground} />
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedText}>Bắt đầu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#BFDBFE', // blue-200
    position: 'relative',
  },
  backgroundIconsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundIcon: {
    position: 'absolute',
    color: '#3B82F6', // blue-500
    fontSize: 16, // text-base
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40, // px-10
    marginBottom: 96, // mb-24
  },
  title: {
    fontSize: 48, // text-5xl
    color: '#3B82F6', // blue-500
    fontWeight: '600', // font-semibold
    fontStyle: 'italic',
    marginBottom: 20, // mb-5
  },
  subtitle: {
    fontSize: 16, // text-base
    color: '#1E3A8A', // blue-800
    textAlign: 'center',
    lineHeight: 24, // leading-6
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 208, // h-52
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40, // pb-10
  },
  footerBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 160, // h-40
    backgroundColor: 'white',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100, // rounded-t-[100px]
  },
  getStartedButton: {
    backgroundColor: '#3B82F6', // blue-500
    paddingVertical: 12, // py-3
    paddingHorizontal: 32, // px-8
    borderRadius: 9999, // rounded-full
    zIndex: 10,
    marginBottom: 20, // mb-5
  },
  getStartedText: {
    color: 'white',
    fontSize: 16, // text-base
    fontWeight: '600', // font-semibold
  },
});

export default SplashScreen;