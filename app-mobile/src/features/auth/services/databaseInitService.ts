import {
  categoriesCollection,
  db,
  interestsCollection,
} from "@/config/firebase";
import { categories, interests } from "@/features/discover/data/mockData";
import { getDocs, doc, writeBatch, serverTimestamp } from "firebase/firestore";

/**
 * Service for initializing and managing database collections
 */
export const databaseInitService = {
  /**
   * Creates initial data for categories and interests if they don't exist
   */
  async createInitialData() {
    const batch = writeBatch(db);

    // Check if categories already exist
    const categoriesSnapshot = await getDocs(categoriesCollection);
    if (categoriesSnapshot.empty) {
      console.log("Creating initial categories...");
      categories.forEach((category) => {
        const categoryRef = doc(categoriesCollection);
        batch.set(categoryRef, {
          ...category,
          createdAt: serverTimestamp(),
        });
      });
    }

    // Check if interests already exist
    const interestsSnapshot = await getDocs(interestsCollection);
    if (interestsSnapshot.empty) {
      console.log("Creating initial interests...");
      interests.forEach((interest) => {
        const interestRef = doc(interestsCollection);
        batch.set(interestRef, {
          ...interest,
          createdAt: serverTimestamp(),
        });
      });
    }

    await batch.commit();
    console.log("Initial data created successfully");
  },

  /**
   * Checks if the database has been initialized with required collections
   */
  async isDatabaseInitialized() {
    try {
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const interestsSnapshot = await getDocs(interestsCollection);

      return !categoriesSnapshot.empty && !interestsSnapshot.empty;
    } catch (error) {
      console.error("Error checking database initialization:", error);
      return false;
    }
  },

  /**
   * Validates that all required collections exist and have data
   */
  async validateDatabase() {
    try {
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const interestsSnapshot = await getDocs(interestsCollection);

      const issues = [];

      if (categoriesSnapshot.empty) {
        issues.push("Categories collection is empty");
      }

      if (interestsSnapshot.empty) {
        issues.push("Interests collection is empty");
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    } catch (error) {
      console.error("Error validating database:", error);
      return {
        isValid: false,
        issues: ["Error validating database: " + error],
      };
    }
  },
};
