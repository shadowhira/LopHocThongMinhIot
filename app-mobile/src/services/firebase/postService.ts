import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, postsCollection } from '../../config/firebase';
import { Post, Comment } from '../../types/post';

export const postService = {

  // Lấy tất cả posts
  async getAllPosts(limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        postsCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const postsSnapshot = await getDocs(q);

      return postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Error getting all posts:', error);
      throw error;
    }
  },

  // Lấy post theo ID
  async getPostById(postId: string): Promise<Post | null> {
    try {
      const docRef = doc(db, 'posts', postId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Post;
      }

      return null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      throw error;
    }
  },

  // Lấy posts theo space
  async getPostsBySpace(spaceId: string, limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        postsCollection,
        where('spaceId', '==', spaceId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const postsSnapshot = await getDocs(q);

      return postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Error getting posts by space:', error);
      throw error;
    }
  },

  // Lấy posts theo user
  async getPostsByUser(userId: string, limitCount: number = 20): Promise<Post[]> {
    try {
      const q = query(
        postsCollection,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const postsSnapshot = await getDocs(q);

      return postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
    } catch (error) {
      console.error('Error getting posts by user:', error);
      throw error;
    }
  },

  // Tạo post mới
  async createPost(postData: Partial<Post>, userId: string): Promise<Post> {
    try {
      const newPost = {
        ...postData,
        authorId: userId,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(postsCollection, newPost);

      return {
        id: docRef.id,
        ...newPost
      } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  // Cập nhật post
  async updatePost(postId: string, postData: Partial<Post>): Promise<boolean> {
    try {
      const postRef = doc(db, 'posts', postId);

      await updateDoc(postRef, {
        ...postData,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  // Xóa post
  async deletePost(postId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Upload ảnh cho post
  async uploadPostImage(postId: string, imageUri: string): Promise<string> {
    try {
      // Tạo reference đến vị trí lưu trữ
      const storageRef = ref(storage, `posts/${postId}/image.jpg`);

      // Fetch ảnh
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Upload lên Firebase Storage
      const snapshot = await uploadBytes(storageRef, blob);

      // Lấy URL download
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Cập nhật thông tin post với URL ảnh mới
      await this.updatePost(postId, { imageUrl: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw error;
    }
  },

  // Lấy comments của post
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const commentsSnapshot = await getDocs(
        query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'desc')
        )
      );

      return commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
    } catch (error) {
      console.error('Error getting post comments:', error);
      throw error;
    }
  },

  // Thêm comment vào post
  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    try {
      const commentData = {
        authorId: userId,
        content,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const commentRef = await addDoc(
        collection(db, 'posts', postId, 'comments'),
        commentData
      );

      // Cập nhật số lượng comments trong post
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const currentCount = postSnap.data().comments || 0;
        await updateDoc(postRef, {
          comments: currentCount + 1,
          updatedAt: serverTimestamp()
        });
      }

      return {
        id: commentRef.id,
        ...commentData
      } as Comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Xóa comment
  async deleteComment(postId: string, commentId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));

      // Cập nhật số lượng comments trong post
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const currentCount = postSnap.data().comments || 0;
        if (currentCount > 0) {
          await updateDoc(postRef, {
            comments: currentCount - 1,
            updatedAt: serverTimestamp()
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
};
