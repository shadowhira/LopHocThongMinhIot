
import AsyncStorage from "@react-native-async-storage/async-storage"
import { firestoreService } from "./databaseService"
import { databaseInitService } from "./databaseInitService"

export interface Category {
  id: string
  name: string
  order: number
  createdAt?: any
}

export interface Interest {
  id: string
  name: string
  categoryName: string
  createdAt?: any
}

export const interestService = {
  async getInterestCategories(): Promise<Category[]> {
    try {
      // Try to get from cache first
      const cachedCategories = await AsyncStorage.getItem("@interestCategories")
      if (cachedCategories) {
        return JSON.parse(cachedCategories)
      }

      // If not in cache, fetch from Firestore
      const categoriesData = await firestoreService.getAllCategories()

      // Explicitly cast to Category[] to ensure TypeScript recognizes the type
      const categories = categoriesData as Category[]

      // Sort by order
      const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0))

      // Cache the result
      await AsyncStorage.setItem("@interestCategories", JSON.stringify(sortedCategories))

      return sortedCategories
    } catch (error) {
      console.error("Error fetching interest categories:", error)
      return []
    }
  },

  async getInterests(): Promise<Interest[]> {
    try {
      // Try to get from cache first
      const cachedInterests = await AsyncStorage.getItem("@interests")
      if (cachedInterests) {
        return JSON.parse(cachedInterests)
      }

      // If not in cache, fetch from Firestore
      const interests = await firestoreService.getAllInterests()

      // Cache the result
      await AsyncStorage.setItem("@interests", JSON.stringify(interests))

      return interests
    } catch (error) {
      console.error("Error fetching interests:", error)
      return []
    }
  },

  async getInterestsByCategory(): Promise<Record<string, Interest[]>> {
    try {
      const [categories, interests] = await Promise.all([this.getInterestCategories(), this.getInterests()])

      // Group interests by category
      const interestsByCategory: Record<string, Interest[]> = {}

      categories.forEach((category) => {
        interestsByCategory[category.name] = interests.filter((interest) => interest.categoryName === category.name)
      })

      return interestsByCategory
    } catch (error) {
      console.error("Error fetching interests by category:", error)
      return {}
    }
  },

  async saveUserInterests(userId: string, selectedInterests: string[]): Promise<void> {
    try {
      await firestoreService.saveUserInterests(userId, selectedInterests)

      // Also update local cache
      const userProfileData = {
        interests: selectedInterests,
        interestsSelected: true,
        updatedAt: new Date().toISOString(),
      }

      await AsyncStorage.setItem(`@userProfile_${userId}`, JSON.stringify(userProfileData))
    } catch (error) {
      console.error("Error saving user interests:", error)
      throw error
    }
  },

  async initializeInterestData(): Promise<void> {
    try {
      await databaseInitService.createInitialData()

      // Clear cache to ensure fresh data
      await AsyncStorage.removeItem("@interestCategories")
      await AsyncStorage.removeItem("@interests")
    } catch (error) {
      console.error("Error initializing interest data:", error)
    }
  },
}

