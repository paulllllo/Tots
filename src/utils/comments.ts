import { firestore } from './firebaseConfig';
import { doc, collection, addDoc, query, where, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { Comment } from '../types/idea';

export const addComment = async (userId: string, ideaId: string, content: string): Promise<Comment> => {
  const commentsRef = collection(firestore, 'comments');
  const commentDoc = await addDoc(commentsRef, {
    userId,
    ideaId,
    content,
    timestamp: serverTimestamp()
  });

  // Update comment count on the idea
  const ideaRef = doc(firestore, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    comments: increment(1)
  });

  return {
    id: commentDoc.id,
    userId,
    content,
    timestamp: new Date().toISOString()
  };
};

export const getComments = async (ideaId: string): Promise<Comment[]> => {
  const commentsRef = collection(firestore, 'comments');
  const q = query(commentsRef, where('ideaId', '==', ideaId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    userId: doc.data().userId,
    content: doc.data().content,
    timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
  }));
}; 