import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from './firebaseConfig';

export const signup = async (email: string, password: string, name: string, username: string, profession: string, profilePicture: File) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Upload profile picture to Firebase Storage
    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, profilePicture);

    // Get download URL after upload
    const downloadURL = await new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progress function
          console.log(snapshot.bytesTransferred, snapshot.totalBytes);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

    // Store user data in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      name,
      username,
      email,
      profession,
      profilePictureUrl: downloadURL,
    });

    return user;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 