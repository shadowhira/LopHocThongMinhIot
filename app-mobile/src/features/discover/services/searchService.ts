import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  writeBatch,
} from "firebase/firestore"
import { SearchHistoryItem } from "../types"
import { db, isFirestoreNetworkEnabled } from "@/config/firebase"


const SEARCH_HISTORY_KEY = "@search_history"
const MAX_HISTORY_ITEMS = 5 // Giảm xuống còn 5 mục lịch sử tìm kiếm

export const searchService = {
  /**
   * Lấy lịch sử tìm kiếm từ Firestore
   * Nếu offline, sẽ lấy từ AsyncStorage
   * Thêm tham số tab để lọc lịch sử tìm kiếm theo tab
   */
  async getSearchHistory(userId: string, tab = "Interest"): Promise<SearchHistoryItem[]> {
    try {
      // Kiểm tra kết nối
      if (!isFirestoreNetworkEnabled()) {
        console.log("Offline: Lấy lịch sử tìm kiếm từ AsyncStorage")
        return this.getLocalSearchHistory(userId, tab)
      }

      // Lấy lịch sử từ Firestore với điều kiện lọc theo tab
      const searchHistoryRef = collection(db, "searchHistory")
      const q = query(
        searchHistoryRef,
        where("userId", "==", userId),
        where("tab", "==", tab), // Thêm điều kiện lọc theo tab
        orderBy("timestamp", "desc"),
        limit(MAX_HISTORY_ITEMS),
      )

      try {
        const querySnapshot = await getDocs(q)
        const searchHistory: SearchHistoryItem[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          searchHistory.push({
            id: doc.id,
            term: data.term,
            count: data.count,
            timestamp: data.timestamp?.toMillis() || Date.now(),
            userId: data.userId,
            tab: data.tab || "Interest", // Mặc định là "Interest" nếu không có
          })
        })

        // Lưu vào cache local - luôn cập nhật cache với dữ liệu mới nhất từ Firestore
        await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(searchHistory))

        return searchHistory
      } catch (error: any) {
        // Nếu lỗi liên quan đến index, thử sử dụng cách khác
        if (error.message && error.message.includes("index")) {
          console.log("Lỗi index, sử dụng phương pháp thay thế")
          // Lấy tất cả lịch sử tìm kiếm của người dùng mà không sắp xếp
          const searchHistoryRef = collection(db, "searchHistory")
          const basicQuery = query(
            searchHistoryRef,
            where("userId", "==", userId),
            where("tab", "==", tab), // Vẫn lọc theo tab
          )

          const querySnapshot = await getDocs(basicQuery)
          let searchHistory: SearchHistoryItem[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            searchHistory.push({
              id: doc.id,
              term: data.term,
              count: data.count,
              timestamp: data.timestamp?.toMillis() || Date.now(),
              userId: data.userId,
              tab: data.tab || "Interest", // Mặc định là "Interest" nếu không có
            })
          })

          // Sắp xếp thủ công theo timestamp
          searchHistory.sort((a, b) => b.timestamp - a.timestamp)

          // Giới hạn số lượng kết quả
          searchHistory = searchHistory.slice(0, MAX_HISTORY_ITEMS)

          // Lưu vào cache
          await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(searchHistory))

          return searchHistory
        }

        // Nếu là lỗi khác, ném lại lỗi
        throw error
      }
    } catch (error) {
      console.error("Error getting search history from Firestore:", error)

      // Fallback to local storage if Firestore fails
      return this.getLocalSearchHistory(userId, tab)
    }
  },

  /**
   * Lấy lịch sử tìm kiếm từ AsyncStorage
   * Thêm tham số tab để lọc lịch sử tìm kiếm theo tab
   */
  async getLocalSearchHistory(userId: string, tab = "Interest"): Promise<SearchHistoryItem[]> {
    try {
      const historyJson = await AsyncStorage.getItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`)
      if (historyJson) {
        return JSON.parse(historyJson)
      }
      return []
    } catch (error) {
      console.error("Error getting local search history:", error)
      return []
    }
  },

  /**
   * Thêm một từ khóa tìm kiếm vào lịch sử
   * Lưu vào Firestore nếu online, nếu không thì lưu vào AsyncStorage
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async addSearchTerm(term: string, userId: string, tab = "Interest"): Promise<void> {
    if (!term.trim() || !userId) return

    try {
      // Kiểm tra kết nối
      if (!isFirestoreNetworkEnabled()) {
        console.log("Offline: Lưu lịch sử tìm kiếm vào queue để đồng bộ sau")
        // Lưu vào local storage trước khi thêm vào queue
        await this.addSearchTermLocal(term, userId, tab)
        await this.addToSyncQueue(term, userId, tab)
        return
      }

      // Kiểm tra xem term đã tồn tại chưa (cùng tab)
      const searchHistoryRef = collection(db, "searchHistory")
      const q = query(
        searchHistoryRef,
        where("userId", "==", userId),
        where("term", "==", term),
        where("tab", "==", tab), // Thêm điều kiện lọc theo tab
      )

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        // Nếu đã tồn tại, cập nhật count và timestamp
        const docRef = doc(db, "searchHistory", querySnapshot.docs[0].id)
        const currentData = querySnapshot.docs[0].data()

        await updateDoc(docRef, {
          count: (currentData.count || 0) + 1,
          timestamp: serverTimestamp(),
        })
      } else {
        // Nếu chưa tồn tại, thêm mới
        await addDoc(collection(db, "searchHistory"), {
          term,
          count: 1,
          timestamp: serverTimestamp(),
          userId,
          tab, // Thêm trường tab
        })
      }

      // Tải lại dữ liệu từ Firestore để cập nhật AsyncStorage
      // Thay vì gọi getSearchHistory, chúng ta sẽ cập nhật trực tiếp AsyncStorage
      // để tránh tăng count 2 lần
      const history = await this.getLocalSearchHistory(userId, tab)
      const existingIndex = history.findIndex((item) => item.term.toLowerCase() === term.toLowerCase())

      if (existingIndex >= 0) {
        // Nếu đã tồn tại, cập nhật timestamp mà không tăng count
        history[existingIndex].timestamp = Date.now()
      } else {
        // Nếu chưa tồn tại, thêm mới
        history.unshift({
          term,
          count: 1,
          timestamp: Date.now(),
          userId,
          tab, // Thêm trường tab
        })
      }

      // Sắp xếp theo timestamp (mới nhất lên đầu)
      history.sort((a, b) => b.timestamp - a.timestamp)

      // Giới hạn số lượng mục lịch sử
      const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS)

      // Lưu lại vào AsyncStorage
      await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error("Error adding search term to Firestore:", error)
      // Nếu có lỗi với Firestore, lưu vào local storage
      await this.addSearchTermLocal(term, userId, tab)
    }
  },

  /**
   * Thêm từ khóa tìm kiếm vào AsyncStorage
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async addSearchTermLocal(term: string, userId: string, tab = "Interest"): Promise<void> {
    try {
      // Lấy lịch sử hiện tại
      const history = await this.getLocalSearchHistory(userId, tab)

      // Tìm kiếm term trong lịch sử
      const existingIndex = history.findIndex((item) => item.term.toLowerCase() === term.toLowerCase())

      if (existingIndex >= 0) {
        // Nếu đã tồn tại, tăng count và cập nhật timestamp
        history[existingIndex].count += 1
        history[existingIndex].timestamp = Date.now()
      } else {
        // Nếu chưa tồn tại, thêm mới
        history.unshift({
          term,
          count: 1,
          timestamp: Date.now(),
          userId,
          tab, // Thêm trường tab
        })
      }

      // Sắp xếp theo timestamp (mới nhất lên đầu)
      history.sort((a, b) => b.timestamp - a.timestamp)

      // Giới hạn số lượng mục lịch sử
      const limitedHistory = history.slice(0, MAX_HISTORY_ITEMS)

      // Lưu lại vào AsyncStorage
      await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(limitedHistory))
    } catch (error) {
      console.error("Error adding search term to local storage:", error)
    }
  },

  /**
   * Thêm vào hàng đợi đồng bộ để xử lý khi online
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async addToSyncQueue(term: string, userId: string, tab = "Interest"): Promise<void> {
    try {
      const syncQueueKey = `@searchSyncQueue_${userId}`
      const queueJson = await AsyncStorage.getItem(syncQueueKey)
      const queue = queueJson ? JSON.parse(queueJson) : []

      queue.push({
        term,
        timestamp: Date.now(),
        action: "add",
        tab, // Thêm trường tab
      })

      await AsyncStorage.setItem(syncQueueKey, JSON.stringify(queue))
    } catch (error) {
      console.error("Error adding to sync queue:", error)
    }
  },

  /**
   * Đồng bộ hàng đợi khi online
   */
  async syncQueuedSearches(userId: string): Promise<void> {
    if (!isFirestoreNetworkEnabled() || !userId) return

    try {
      const syncQueueKey = `@searchSyncQueue_${userId}`
      const queueJson = await AsyncStorage.getItem(syncQueueKey)

      if (!queueJson) return

      const queue = JSON.parse(queueJson)
      if (queue.length === 0) return

      console.log(`Đồng bộ ${queue.length} lịch sử tìm kiếm`)

      // Tạo một bản sao của hàng đợi để xử lý
      const queueToProcess = [...queue]

      // Xóa hàng đợi trước để tránh xử lý trùng lặp nếu có lỗi
      await AsyncStorage.removeItem(syncQueueKey)

      for (const item of queueToProcess) {
        try {
          if (item.action === "add") {
            // Xử lý trực tiếp với Firestore thay vì gọi lại addSearchTerm
            const searchHistoryRef = collection(db, "searchHistory")
            const q = query(
              searchHistoryRef,
              where("userId", "==", userId),
              where("term", "==", item.term),
              where("tab", "==", item.tab || "Interest"), // Thêm điều kiện lọc theo tab
            )
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              const docRef = doc(db, "searchHistory", querySnapshot.docs[0].id)
              const currentData = querySnapshot.docs[0].data()
              await updateDoc(docRef, {
                count: (currentData.count || 0) + 1,
                timestamp: serverTimestamp(),
              })
            } else {
              await addDoc(collection(db, "searchHistory"), {
                term: item.term,
                count: 1,
                timestamp: serverTimestamp(),
                userId,
                tab: item.tab || "Interest", // Thêm trường tab
              })
            }
          } else if (item.action === "remove") {
            const searchHistoryRef = collection(db, "searchHistory")
            const q = query(
              searchHistoryRef,
              where("userId", "==", userId),
              where("term", "==", item.term),
              where("tab", "==", item.tab || "Interest"), // Thêm điều kiện lọc theo tab
            )
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
              const docRef = doc(db, "searchHistory", querySnapshot.docs[0].id)
              await deleteDoc(docRef)
            }
          } else if (item.action === "clear") {
            const searchHistoryRef = collection(db, "searchHistory")
            const q = query(
              searchHistoryRef,
              where("userId", "==", userId),
              where("tab", "==", item.tab || "Interest"), // Thêm điều kiện lọc theo tab
            )
            const querySnapshot = await getDocs(q)

            // Sử dụng writeBatch thay vì db.batch()
            const batch = writeBatch(db)
            querySnapshot.forEach((document) => {
              batch.delete(doc(db, "searchHistory", document.id))
            })

            await batch.commit()
          }
        } catch (error) {
          console.error(`Lỗi khi đồng bộ hóa hành động ${item.action}:`, error)
          // Nếu có lỗi với một mục, thêm lại vào hàng đợi
          const currentQueueJson = await AsyncStorage.getItem(syncQueueKey)
          const currentQueue = currentQueueJson ? JSON.parse(currentQueueJson) : []
          currentQueue.push(item)
          await AsyncStorage.setItem(syncQueueKey, JSON.stringify(currentQueue))
        }
      }
    } catch (error) {
      console.error("Error syncing queued searches:", error)
    }
  },

  /**
   * Xóa một từ khóa tìm kiếm khỏi lịch sử
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async removeSearchTerm(term: string, userId: string, tab = "Interest"): Promise<void> {
    try {
      // Xóa từ local storage trước
      await this.removeSearchTermLocal(term, userId, tab)

      // Kiểm tra kết nối
      if (!isFirestoreNetworkEnabled()) {
        console.log("Offline: Thêm lệnh xóa vào queue để đồng bộ sau")
        await this.addToRemoveQueue(term, userId, tab)
        return
      }

      // Xóa từ Firestore
      const searchHistoryRef = collection(db, "searchHistory")
      const q = query(
        searchHistoryRef,
        where("userId", "==", userId),
        where("term", "==", term),
        where("tab", "==", tab), // Thêm điều kiện lọc theo tab
      )

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docRef = doc(db, "searchHistory", querySnapshot.docs[0].id)
        await deleteDoc(docRef)
      }
    } catch (error) {
      console.error("Error removing search term:", error)
    }
  },

  /**
   * Xóa từ khóa tìm kiếm khỏi AsyncStorage
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async removeSearchTermLocal(term: string, userId: string, tab = "Interest"): Promise<void> {
    try {
      const history = await this.getLocalSearchHistory(userId, tab)
      const filteredHistory = history.filter((item) => item.term.toLowerCase() !== term.toLowerCase())
      await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(filteredHistory))
    } catch (error) {
      console.error("Error removing search term from local storage:", error)
    }
  },

  /**
   * Thêm lệnh xóa vào hàng đợi
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async addToRemoveQueue(term: string, userId: string, tab = "Interest"): Promise<void> {
    try {
      const syncQueueKey = `@searchSyncQueue_${userId}`
      const queueJson = await AsyncStorage.getItem(syncQueueKey)
      const queue = queueJson ? JSON.parse(queueJson) : []

      queue.push({
        term,
        timestamp: Date.now(),
        action: "remove",
        tab, // Thêm trường tab
      })

      await AsyncStorage.setItem(syncQueueKey, JSON.stringify(queue))
    } catch (error) {
      console.error("Error adding remove action to sync queue:", error)
    }
  },

  /**
   * Xóa toàn bộ lịch sử tìm kiếm
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async clearSearchHistory(userId: string, tab = "Interest"): Promise<void> {
    try {
      // Xóa từ local storage trước
      await AsyncStorage.removeItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`)

      // Kiểm tra kết nối
      if (!isFirestoreNetworkEnabled()) {
        console.log("Offline: Thêm lệnh xóa tất cả vào queue để đồng bộ sau")
        await this.addToClearQueue(userId, tab)
        return
      }

      // Xóa từ Firestore
      const searchHistoryRef = collection(db, "searchHistory")
      const q = query(
        searchHistoryRef,
        where("userId", "==", userId),
        where("tab", "==", tab), // Thêm điều kiện lọc theo tab
      )
      const querySnapshot = await getDocs(q)

      // Sử dụng writeBatch thay vì db.batch()
      const batch = writeBatch(db)
      querySnapshot.forEach((document) => {
        batch.delete(doc(db, "searchHistory", document.id))
      })

      await batch.commit()
    } catch (error) {
      console.error("Error clearing search history:", error)
    }
  },

  /**
   * Thêm lệnh xóa tất cả vào hàng đợi
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async addToClearQueue(userId: string, tab = "Interest"): Promise<void> {
    try {
      const syncQueueKey = `@searchSyncQueue_${userId}`
      const queueJson = await AsyncStorage.getItem(syncQueueKey)
      const queue = queueJson ? JSON.parse(queueJson) : []

      queue.push({
        timestamp: Date.now(),
        action: "clear",
        tab, // Thêm trường tab
      })

      await AsyncStorage.setItem(syncQueueKey, JSON.stringify(queue))
    } catch (error) {
      console.error("Error adding clear action to sync queue:", error)
    }
  },

  /**
   * Lấy các từ khóa tìm kiếm phổ biến (top N theo count)
   * Thêm tham số tab để phân biệt lịch sử tìm kiếm
   */
  async getTopSearches(userId: string, tab = "Interest", limit = 5): Promise<SearchHistoryItem[]> {
    try {
      const history = await this.getSearchHistory(userId, tab)
      return history.slice(0, limit)
    } catch (error) {
      console.error("Error getting top searches:", error)
      return []
    }
  },

  // Thêm phương thức mới để đảm bảo đồng bộ hóa đầy đủ
  async forceSync(userId: string, tab = "Interest"): Promise<void> {
    if (!isFirestoreNetworkEnabled() || !userId) return

    try {
      console.log(`Đang đồng bộ hóa lịch sử tìm kiếm cho tab ${tab}...`)

      // Đồng bộ hàng đợi trước
      await this.syncQueuedSearches(userId)

      try {
        // Sau đó tải lại dữ liệu từ Firestore để đảm bảo dữ liệu cục bộ được cập nhật
        const searchHistoryRef = collection(db, "searchHistory")
        const q = query(
          searchHistoryRef,
          where("userId", "==", userId),
          where("tab", "==", tab), // Thêm điều kiện lọc theo tab
          orderBy("timestamp", "desc"),
          limit(MAX_HISTORY_ITEMS),
        )

        const querySnapshot = await getDocs(q)
        const searchHistory: SearchHistoryItem[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          searchHistory.push({
            id: doc.id,
            term: data.term,
            count: data.count,
            timestamp: data.timestamp?.toMillis() || Date.now(),
            userId: data.userId,
            tab: data.tab || "Interest", // Mặc định là "Interest" nếu không có
          })
        })

        // Cập nhật cache cục bộ với dữ liệu mới nhất
        await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(searchHistory))
        console.log(`Đồng bộ hóa hoàn tất cho tab ${tab}`)
      } catch (error: any) {
        // Nếu lỗi liên quan đến index, thử sử dụng cách khác
        if (error.message && error.message.includes("index")) {
          console.log("Lỗi index trong forceSync, sử dụng phương pháp thay thế")
          // Lấy tất cả lịch sử tìm kiếm của người dùng mà không sắp xếp
          const searchHistoryRef = collection(db, "searchHistory")
          const basicQuery = query(
            searchHistoryRef,
            where("userId", "==", userId),
            where("tab", "==", tab), // Vẫn lọc theo tab
          )

          const querySnapshot = await getDocs(basicQuery)
          let searchHistory: SearchHistoryItem[] = []

          querySnapshot.forEach((doc) => {
            const data = doc.data()
            searchHistory.push({
              id: doc.id,
              term: data.term,
              count: data.count,
              timestamp: data.timestamp?.toMillis() || Date.now(),
              userId: data.userId,
              tab: data.tab || "Interest", // Mặc định là "Interest" nếu không có
            })
          })

          // Sắp xếp thủ công theo timestamp
          searchHistory.sort((a, b) => b.timestamp - a.timestamp)

          // Giới hạn số lượng kết quả
          searchHistory = searchHistory.slice(0, MAX_HISTORY_ITEMS)

          // Lưu vào cache
          await AsyncStorage.setItem(`${SEARCH_HISTORY_KEY}_${userId}_${tab}`, JSON.stringify(searchHistory))
          console.log(`Đồng bộ hóa hoàn tất cho tab ${tab} (phương pháp thay thế)`)
          return
        }

        throw error
      }
    } catch (error) {
      console.error(`Lỗi khi đồng bộ hóa lịch sử tìm kiếm cho tab ${tab}:`, error)
    }
  },
}
