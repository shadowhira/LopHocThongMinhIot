import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);

  const uploadFile = async (path: string, file: Blob | Uint8Array | ArrayBuffer): Promise<string> => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      setDownloadURL(null);

      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const url = await getDownloadURL(snapshot.ref);
      
      setDownloadURL(url);
      setProgress(100);
      
      return url;
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const uploadFromUri = async (path: string, uri: string): Promise<string> => {
    try {
      // Fetch the image
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload the blob
      return await uploadFile(path, blob);
    } catch (err) {
      console.error('Error uploading from URI:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return {
    uploadFile,
    uploadFromUri,
    uploading,
    progress,
    error,
    downloadURL
  };
}
