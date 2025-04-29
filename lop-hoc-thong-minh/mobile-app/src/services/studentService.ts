import { ref, get, set, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../config/firebase';
import { Student } from '../types';

// Lấy danh sách sinh viên
export const getStudents = async (): Promise<Student[]> => {
  try {
    const studentsRef = ref(db, 'students');
    const snapshot = await get(studentsRef);
    
    if (snapshot.exists()) {
      const studentsData = snapshot.val();
      
      // Chuyển đổi từ object sang array
      return Object.keys(studentsData).map(key => ({
        id: key,
        rfidId: key,
        ...studentsData[key]
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting students:', error);
    throw error;
  }
};

// Lấy thông tin sinh viên theo ID
export const getStudentById = async (id: string): Promise<Student | null> => {
  try {
    const studentRef = ref(db, `students/${id}`);
    const snapshot = await get(studentRef);
    
    if (snapshot.exists()) {
      return {
        id,
        rfidId: id,
        ...snapshot.val()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student by ID:', error);
    throw error;
  }
};

// Lấy sinh viên theo mã sinh viên
export const getStudentByStudentId = async (studentId: string): Promise<Student | null> => {
  try {
    const studentsRef = ref(db, 'students');
    const studentQuery = query(studentsRef, orderByChild('studentId'), equalTo(studentId));
    const snapshot = await get(studentQuery);
    
    if (snapshot.exists()) {
      const studentsData = snapshot.val();
      const key = Object.keys(studentsData)[0];
      
      return {
        id: key,
        rfidId: key,
        ...studentsData[key]
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student by student ID:', error);
    throw error;
  }
};

// Thêm sinh viên mới
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  try {
    const { rfidId, ...studentData } = student;
    const studentRef = ref(db, `students/${rfidId}`);
    await set(studentRef, studentData);
    
    return {
      id: rfidId,
      ...student
    };
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

// Cập nhật thông tin sinh viên
export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<void> => {
  try {
    const studentRef = ref(db, `students/${id}`);
    await update(studentRef, studentData);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

// Xóa sinh viên
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    const studentRef = ref(db, `students/${id}`);
    await remove(studentRef);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};
