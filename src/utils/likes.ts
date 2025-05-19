import { firestore } from './firebaseConfig';
import { doc, setDoc, deleteDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export const addLike = async (userId: string, ideaId: string) => {
  const likeRef = doc(firestore, 'likes', `${userId}_${ideaId}`);
  await setDoc(likeRef, { 
    userId,
    ideaId,
    timestamp: serverTimestamp() 
  });

  // Update like count on the idea
  const ideaRef = doc(firestore, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    likes: increment(1)
  });
};

export const removeLike = async (userId: string, ideaId: string) => {
  const likeRef = doc(firestore, 'likes', `${userId}_${ideaId}`);
  await deleteDoc(likeRef);

  // Update like count on the idea
  const ideaRef = doc(firestore, 'ideas', ideaId);
  await updateDoc(ideaRef, {
    likes: increment(-1)
  });
};

export const hasLiked = async (userId: string, ideaId: string) => {
  const likeRef = doc(firestore, 'likes', `${userId}_${ideaId}`);
  const likeDoc = await getDoc(likeRef);
  return likeDoc.exists();
}; 