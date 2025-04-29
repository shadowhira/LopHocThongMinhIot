import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Profile: undefined;
  ViewProfile: undefined;
  EditProfile: undefined;
  OtherUserProfile: { userId?: string };
  DetailOtherUserProfile: { userId?: string };
  ChatDetail: { conversationId: string };
  Login: undefined;
  Signup: undefined;
  Settings: undefined;
  Splash: undefined;
  SplashLoading: undefined;
  Home: undefined;
  InterestSelection: undefined;
  Main: { screen?: string; params?: any };
  SearchHistory: { activeTab?: string };
  SearchHome: { activeTab?: string };
  SearchResults: {
    searchTerm: string;
    fromCategory?: boolean;
    activeTab?: string;
    selectedLocation?: boolean;
    location?: string;
    appliedFilters?: Record<string, string>;
    showFilteredResults?: boolean;
  };
  SearchFilter: {
    searchTerm?: string;
    activeTab?: string;
    selectedLocation?: boolean;
    location?: string;
    activeCategory?: string;
    selectedFilters?: Record<string, string>;
  };
  ChatStack: { screen?: string; params?: any };
  SpaceProfile: { spaceId?: string };
  AboutScreen: undefined;
  SpaceSettings: { spaceId?: string; spaceName?: string };
  Test: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
