'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../utils/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseConfig';
import Image from 'next/image';

interface Idea {
  id: string;
  headline: string;
  description: string;
  tags: string[];
  authorId: string;
  authorProfilePictureUrl: string;
  timestamp: string;
}

interface User {
  name: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  profession: string;
  createdAt?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [profession, setProfession] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        console.log('currentUser', currentUser)
        const userRef = doc(firestore, 'users', currentUser?.uid || '');
        const userDoc = await getDoc(userRef);
        console.log('userDoc', userDoc)
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          console.log('userData Exists', userData)
          setUser({
            name: userData.name || '',
            username: userData.username || '',
            email: userData.email || '',
            profilePictureUrl: userData.profilePictureUrl || '',
            profession: userData.profession || ''
          });
          setName(userData.name || '');
          setUsername(userData.username || '');
          setProfession(userData.profession || '');

          const ideasQuery = query(collection(firestore, 'ideas'), where('authorId', '==', currentUser?.uid || ''));
          const querySnapshot = await getDocs(ideasQuery);
          const ideasList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            headline: doc.data().headline,
            description: doc.data().description,
            tags: doc.data().tags,
            authorId: doc.data().authorId,
            authorProfilePictureUrl: doc.data().authorProfilePictureUrl,
            timestamp: doc.data().timestamp,
          }));
          setIdeas(ideasList);
        } 
      } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const currentUser = auth.currentUser;
    if (currentUser && user) {
      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        await updateDoc(userRef, {
          name,
          username,
          profession,
        });
        setUser({
          ...user,
          name,
          username,
          profession,
          email: user.email,
          profilePictureUrl: user.profilePictureUrl
        });
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!user) {
    return <div>Loading Profile Page...</div>;
  }

  const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars-neutral/svg?radius=0'

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <div className="mt-4">
        <Image
          src={user.profilePictureUrl || defaultAvatar}
          alt="Profile"
          width={80}
          height={80}
          className="rounded-full"
        />
        {isEditing ? (
          <div className="mt-2">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-2 text-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-2 text-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
              <input
                id="profession"
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Enter your profession"
                className="w-full p-2 text-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mt-2">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <button onClick={handleEdit} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Edit Profile</button>
          </div>
        )}
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Posted Ideas</h3>
        <div className="mt-2">
          {ideas.map(idea => (
            <div key={idea.id} className="border p-4 rounded shadow mb-4">
              <h4 className="text-lg font-bold">{idea.headline}</h4>
              <p className="mt-2">{idea.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {idea.tags.map(tag => (
                  <span key={tag} className="bg-gray-200 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 