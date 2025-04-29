import {
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { categoriesCollection, db, interestsCollection, usersCollection } from "@/config/firebase"

// Database service functions
export const firestoreService = {
  // User operations
  async createUser(userId: string, userData: any) {
    return setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  },

  async updateUser(userId: string, userData: any) {
    return updateDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp(),
    })
  },

  async getUserById(userId: string) {
    const docRef = doc(db, "users", userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : null
  },

  async getUserByEmail(email: string) {
    const q = query(usersCollection, where("email", "==", email))
    const querySnapshot = await getDocs(q)
    return !querySnapshot.empty ? querySnapshot.docs[0].data() : null
  },

  // Interest operations
  async getAllInterests() {
    const snapshot = await getDocs(interestsCollection)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      categoryName: doc.data().categoryName,
      ...doc.data(),
    }))
  },

  async getInterestsByCategory(categoryId: string) {
    const q = query(interestsCollection, where("categoryId", "==", categoryId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  },

  // Category operations
  async getAllCategories() {
    const snapshot = await getDocs(categoriesCollection)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || "",
        order: data.order || 0,
        createdAt: data.createdAt,
      }
    })
  },

  // User interests operations
  async saveUserInterests(userId: string, interests: string[]) {
    return updateDoc(doc(db, "users", userId), {
      interests,
      interestsSelected: true,
      updatedAt: serverTimestamp(),
    })
  },
}