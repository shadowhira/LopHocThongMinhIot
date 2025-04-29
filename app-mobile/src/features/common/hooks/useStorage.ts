import { useState, useEffect } from 'react';
import { storage, auth } from '../../../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Upload a file to Firebase Storage
   * @param uri Local file URI
   * @param path Storage path
   * @param contentType Optional content type
   * @returns Download URL
   */
  const uploadFile = async (uri: string, path: string, contentType?: string): Promise<string> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.error('User is not authenticated');
        Alert.alert('Authentication Error', 'You must be logged in to upload files');
        throw new Error('User is not authenticated');
      }
      console.log('Starting upload process for:', uri, 'to path:', path);
      setUploading(true);
      setProgress(0);
      setError(null);

      // Validate URI
      if (!uri) {
        throw new Error('Invalid URI: URI is empty or undefined');
      }

      // Clean URI - remove any query parameters
      const cleanUri = uri.split('?')[0];
      console.log('Cleaned URI:', cleanUri);

      // Get file info
      console.log('Getting file info...');
      const fileInfo = await FileSystem.getInfoAsync(cleanUri);
      console.log('File info:', fileInfo);

      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${cleanUri}`);
      }

      // Determine content type based on file extension
      let detectedContentType = contentType;
      if (!detectedContentType) {
        const extension = cleanUri.split('.').pop()?.toLowerCase();
        if (extension === 'jpg' || extension === 'jpeg') {
          detectedContentType = 'image/jpeg';
        } else if (extension === 'png') {
          detectedContentType = 'image/png';
        } else if (extension === 'gif') {
          detectedContentType = 'image/gif';
        } else {
          detectedContentType = 'application/octet-stream';
        }
      }
      console.log('Content type:', detectedContentType);

      // Read file as blob
      console.log('Converting file to blob...');
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          console.log('XHR loaded successfully');
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          console.error('XHR error:', e);
          reject(new Error('Failed to convert file to blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', cleanUri, true);
        xhr.send(null);
      });

      console.log('Blob created, size:', blob.size);

      // Create a unique filename with timestamp to avoid cache issues
      const timestamp = new Date().getTime();
      const uniquePath = path.includes('?')
        ? path
        : `${path}?t=${timestamp}`;

      console.log('Creating storage reference at path:', uniquePath);
      const storageRef = ref(storage, uniquePath);

      // Upload file
      console.log('Starting upload task...');
      const uploadTask = uploadBytesResumable(storageRef, blob, {
        contentType: detectedContentType,
      });

      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload progress: ${progress.toFixed(2)}%`);
            setProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setError(error);

            // Close the blob to avoid memory leaks
            if (blob instanceof Blob) {
              try {
                // @ts-ignore - TypeScript doesn't recognize close method on Blob
                if (typeof blob.close === 'function') {
                  blob.close();
                  console.log('Blob closed after error');
                }
              } catch (closeError) {
                console.warn('Error closing blob:', closeError);
              }
            }

            reject(error);
          },
          async () => {
            // Upload completed successfully
            console.log('Upload completed successfully');
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL:', downloadURL);

              // Close the blob to avoid memory leaks
              if (blob instanceof Blob) {
                try {
                  // @ts-ignore - TypeScript doesn't recognize close method on Blob
                  if (typeof blob.close === 'function') {
                    blob.close();
                    console.log('Blob closed after successful upload');
                  }
                } catch (closeError) {
                  console.warn('Error closing blob:', closeError);
                }
              }

              resolve(downloadURL);
            } catch (urlError) {
              console.error('Error getting download URL:', urlError);

              // Close the blob to avoid memory leaks
              if (blob instanceof Blob) {
                try {
                  // @ts-ignore - TypeScript doesn't recognize close method on Blob
                  if (typeof blob.close === 'function') {
                    blob.close();
                    console.log('Blob closed after URL error');
                  }
                } catch (closeError) {
                  console.warn('Error closing blob:', closeError);
                }
              }

              reject(urlError);
            }
          }
        );
      });
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err instanceof Error ? err : new Error(String(err)));

      // Note: We can't close the blob here because it might not be in scope
      // The blob is handled in the Promise callbacks

      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
    error
  };
}
