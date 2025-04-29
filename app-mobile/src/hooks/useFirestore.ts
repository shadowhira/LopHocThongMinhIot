import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  QueryConstraint,
  DocumentData,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useNetwork } from "../features/auth/context/NetworkContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useFirestoreCollection(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  dependencies: any[] = []
) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useNetwork();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Try to get cached data first
        const cacheKey = `@firestore_${collectionName}_${JSON.stringify(queryConstraints)}`;
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          setData(JSON.parse(cachedData));
        }

        // If online, fetch fresh data
        if (isConnected) {
          const q = query(collection(db, collectionName), ...queryConstraints);
          const querySnapshot = await getDocs(q);
          const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setData(documents);
          
          // Update cache
          await AsyncStorage.setItem(cacheKey, JSON.stringify(documents));
        }
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, isConnected, ...dependencies]);

  return { data, loading, error };
}

export function useFirestoreDocument(
  collectionName: string,
  documentId: string | undefined,
  dependencies: any[] = []
) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useNetwork();

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      try {
        // Try to get cached data first
        const cacheKey = `@firestore_${collectionName}_${documentId}`;
        const cachedData = await AsyncStorage.getItem(cacheKey);
        
        if (cachedData) {
          setData(JSON.parse(cachedData));
        }

        // If online, fetch fresh data
        if (isConnected) {
          const docRef = doc(db, collectionName, documentId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const document = {
              id: docSnap.id,
              ...docSnap.data()
            };
            
            setData(document);
            
            // Update cache
            await AsyncStorage.setItem(cacheKey, JSON.stringify(document));
          } else {
            setData(null);
          }
        }
      } catch (err) {
        console.error(`Error fetching ${collectionName}/${documentId}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, documentId, isConnected, ...dependencies]);

  return { data, loading, error };
}

export function useFirestoreRealtime(
  collectionName: string,
  queryConstraints: QueryConstraint[] = [],
  dependencies: any[] = []
) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isConnected } = useNetwork();

  useEffect(() => {
    if (!isConnected) {
      // If offline, try to get cached data
      const getCachedData = async () => {
        try {
          const cacheKey = `@firestore_realtime_${collectionName}_${JSON.stringify(queryConstraints)}`;
          const cachedData = await AsyncStorage.getItem(cacheKey);
          
          if (cachedData) {
            setData(JSON.parse(cachedData));
          }
          setLoading(false);
        } catch (err) {
          console.error(`Error getting cached data for ${collectionName}:`, err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      };
      
      getCachedData();
      return;
    }

    // If online, set up realtime listener
    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setData(documents);
        setLoading(false);
        
        // Update cache
        const updateCache = async () => {
          const cacheKey = `@firestore_realtime_${collectionName}_${JSON.stringify(queryConstraints)}`;
          await AsyncStorage.setItem(cacheKey, JSON.stringify(documents));
        };
        
        updateCache();
      },
      (err) => {
        console.error(`Error in realtime listener for ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [collectionName, isConnected, ...dependencies]);

  return { data, loading, error };
}
