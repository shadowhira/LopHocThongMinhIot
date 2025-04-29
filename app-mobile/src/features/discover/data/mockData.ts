import { SearchResult } from "../types";

// Create interest categories
export const categories = [
  { name: "Professional", order: 1 },
  { name: "Entertainment", order: 2 },
  { name: "Social Cause", order: 3 },
  { name: "Education", order: 4 },
];

export const interests = [
  {
    id: 1,
    name: "Fitness",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1571019613912-85b7770f95b5?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 2,
    name: "Gaming",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1593642634367-d91a135587b5?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 3,
    name: "Brand",
    categoryName: "Professional",
    image:
      "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 4,
    name: "Entertainment",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 5,
    name: "Technology",
    categoryName: "Professional",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 6,
    name: "Finance",
    categoryName: "Professional",
    image:
      "https://images.unsplash.com/photo-1542223616-1b33a5d0a305?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 7,
    name: "Culture",
    categoryName: "Social Cause",
    image:
      "https://th.bing.com/th/id/OIP.o15Ti-wQtSAihtSdJnAMYQHaEo?rs=1&pid=ImgDetMain",
  },
  {
    id: 8,
    name: "Food",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1543353071-873f17a7a088?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 9,
    name: "Travel",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1529257414771-b1169868c6cf?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 10,
    name: "Business",
    categoryName: "Professional",
    image:
      "https://images.unsplash.com/photo-1523297735071-6e27b80d8074?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 11,
    name: "Music",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 12,
    name: "Photography",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1547041062-6b460c73146d?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 13,
    name: "Art",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1511689660979-8e8280f1a923?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 14,
    name: "Fashion",
    categoryName: "Entertainment",
    image:
      "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 15,
    name: "Sports",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1599058917213-ec42b7482fa2?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 16,
    name: "Education",
    categoryName: "Education",
    image:
      "https://static.vecteezy.com/system/resources/previews/011/844/757/original/back-to-school-background-with-doodle-light-bulb-and-rocket-pencil-launching-to-space-online-learning-and-web-page-template-digital-education-concept-free-vector.jpg",
  },
  {
    id: 17,
    name: "Health",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1607746865125-29e43ef1d84b?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 18,
    name: "Nature",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 19,
    name: "DIY",
    categoryName: "Social Cause",
    image:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2d376b?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
  {
    id: 20,
    name: "Science",
    categoryName: "Education",
    image:
      "https://images.unsplash.com/photo-1507631396569-4152fcf4bca8?crop=entropy&cs=tinysrgb&w=100&h=100&fit=crop",
  },
];

export const categoriesLocation = [
  {
    id: 1,
    name: "Hanoi",
    image:
      "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: 2,
    name: "HCM",
    image:
      "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: 3,
    name: "Hue",
    image:
      "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
  {
    id: 4,
    name: "Can Tho",
    image:
      "https://wellavn.com/wp-content/uploads/2024/11/anh-gai-xinh-2k4-1.jpg",
  },
];

export const mockResults: SearchResult[] = [
  {
    id: "1",
    title: "Cult.Fit",
    image:
      "https://th.bing.com/th/id/OIP.m9VoFifxz_jpcofMmQMbMgHaEo?rs=1&pid=ImgDetMain",
    category: "Fitness",
    members: 618,
    isNew: true,
    description:
      "Elevate Your Fitness Goal with Cult.Fit | A Space Committed to Fitness, Health, and Personal Growth.",
    rating: 4.8,
    activeUsers: 1200,
  },
  {
    id: "2",
    title: "1% Club",
    image:
      "https://th.bing.com/th/id/OIP.m9VoFifxz_jpcofMmQMbMgHaEo?rs=1&pid=ImgDetMain",
    category: "Finance",
    members: 496,
    isNew: true,
    description:
      "Empowering Financial Futures | Join the 1% Club for Expert Personal Finance Insights.",
    isPromoted: true,
    rating: 4.7,
    activeUsers: 980,
  },
  {
    id: "3",
    title: "UX Vault",
    image:
      "https://th.bing.com/th/id/OIP.m9VoFifxz_jpcofMmQMbMgHaEo?rs=1&pid=ImgDetMain",
    category: "Design",
    members: 512,
    isNew: false,
    description:
      "Community for UX designers with expert advice and practical resources.",
    rating: 4.6,
    activeUsers: 750,
  },
  {
    id: "4",
    title: "Epicure",
    image:
      "https://th.bing.com/th/id/OIP.m9VoFifxz_jpcofMmQMbMgHaEo?rs=1&pid=ImgDetMain",
    category: "Food",
    members: 329,
    isNew: true,
    description:
      "Community centered around seeking and sharing culinary experiences.",
    isPromoted: true,
    rating: 4.5,
    activeUsers: 400,
  },
];

// Sample location data
export const locationSuggestions = [
  { id: "1", name: "Ha Noi, Viet Nam" },
  { id: "2", name: "Delhi, India" },
  { id: "3", name: "Bengaluru, India" },
  { id: "4", name: "Pune, India" },
  { id: "5", name: "Chennai, India" },
  { id: "6", name: "Kolkata, India" },
  { id: "7", name: "Hyderabad, India" },
  { id: "8", name: "Ahmedabad, India" },
];

// Sample trending data
export const trendingItems = [
  {
    id: "1",
    title: "CultFit",
    subtitle: "Fitness • 618 reviews",
    description:
      "Elevate Your Fitness Goal with Cult.Fit in India - A Space Committed to Fitness, Health, and Personal Growth.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=200&width=200",
    rating: 4.8,
  },
  {
    id: "2",
    title: "1% Club",
    subtitle: "Finance • 496 reviews",
    description:
      "Engineering Financial Futures - Join the 1% Club for Expert Personal Finance Insights.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=200&width=200",
    rating: 4.9,
  },
];

// Sample recommended data
export const recommendedItems = [
  {
    id: "1",
    title: "UX Vault",
    subtitle: "Design • 512 reviews",
    description:
      "Discovering special community for UX designers with expert advice and practical tips.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=200&width=200",
    rating: 4.7,
  },
  {
    id: "2",
    title: "1% Club",
    subtitle: "Finance • 496 reviews",
    description:
      "A community centered around personal finance offering help for all age groups.",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/placeholder-ob7miW3mUreePYfXdVwkpFWHthzoR5.svg?height=200&width=200",
    rating: 4.9,
  },
];

// Map filter IDs to display names
export const filterDisplayNames: Record<string, Record<string, string>> = {
  interest: {
    all: "All",
    brand: "Brand",
    learning: "Learning",
    networking: "Networking",
    social: "Social",
    topRated: "Top Rated",
    design: "Design",
    membership: "Membership",
    professional: "Professional",
    talent: "Talent",
  },
  location: {
    all: "All",
    argentina: "Argentina",
    china: "China",
    france: "France",
    germany: "Germany",
    india: "India",
    italy: "Italy",
    singapore: "Singapore",
    southKorea: "South Korea",
    thailand: "Thailand",
    unitedKingdom: "United Kingdom",
  },
  // Add other categories as needed
};

// Filter categories and options
export const filterCategories = [
  {
    id: "interest",
    name: "Interest",
    options: [
      { id: "all", label: "All" },
      { id: "brand", label: "Brand" },
      { id: "learning", label: "Learning" },
      { id: "networking", label: "Networking" },
      { id: "social", label: "Social" },
      { id: "topRated", label: "Top Rated" },
      { id: "design", label: "Design" },
      { id: "membership", label: "Membership" },
      { id: "professional", label: "Professional" },
      { id: "talent", label: "Talent" },
    ],
  },
  {
    id: "location",
    name: "Location",
    options: [
      { id: "all", label: "All" },
      { id: "argentina", label: "Argentina" },
      { id: "china", label: "China" },
      { id: "france", label: "France" },
      { id: "germany", label: "Germany" },
      { id: "india", label: "India" },
      { id: "italy", label: "Italy" },
      { id: "singapore", label: "Singapore" },
      { id: "southKorea", label: "South Korea" },
      { id: "thailand", label: "Thailand" },
      { id: "unitedKingdom", label: "United Kingdom" },
    ],
  },
  {
    id: "language",
    name: "Language",
    options: [
      { id: "all", label: "All" },
      { id: "english", label: "English" },
      { id: "french", label: "French" },
      { id: "german", label: "German" },
      { id: "spanish", label: "Spanish" },
      { id: "mandarin", label: "Mandarin Chinese" },
      { id: "japanese", label: "Japanese" },
      // Removed duplicate "spanish" entry
      { id: "italian", label: "Italian" }, // Added a different language instead
    ],
  },
  {
    id: "type",
    name: "Type",
    options: [
      { id: "all", label: "All" },
      { id: "post", label: "Post" },
      { id: "thread", label: "Thread" },
      { id: "under500", label: "Under 500" },
      { id: "under1000", label: "Under 1000" },
      { id: "fullAccess", label: "Full Access" },
    ],
  },
  {
    id: "size",
    name: "Size",
    options: [
      { id: "all", label: "All" },
      { id: "small", label: "Small" },
      { id: "medium", label: "Medium" },
      { id: "large", label: "Large" },
    ],
  },
  {
    id: "paidUnpaid",
    name: "Paid/Unpaid",
    options: [
      { id: "all", label: "All" },
      { id: "paid", label: "Paid" },
      { id: "unpaid", label: "Unpaid" },
    ],
  },
];
