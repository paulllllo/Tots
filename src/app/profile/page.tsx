'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../utils/firebaseConfig';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseConfig';
import Image from 'next/image';
import IdeaCard from '../../components/IdeaCard';
import { Idea as IdeaType } from '../../types/idea';

interface Idea extends IdeaType {
  authorProfilePictureUrl: string;
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
        const userRef = doc(firestore, 'users', currentUser?.uid || '');
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
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
            authorProfilePictureUrl: doc.data().authorProfilePictureUrl || '',
            timestamp: doc.data().timestamp,
            likes: doc.data().likes ?? 0,
            comments: doc.data().comments ?? 0,
            clicks: doc.data().clicks ?? [],
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

  const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars-neutral/svg?radius=0';

  // Dummy userProfile for IdeaCard (since all ideas are by this user)
  const userProfile = {
    name: user.name,
    username: user.username,
    profilePictureUrl: user.profilePictureUrl || defaultAvatar,
  };

  // Dummy liked state and handlers for profile page
  const liked = false;
  const handleLike = () => {};
  const handleComment = () => {};
  const handleCardClick = () => {};
  const calculateEngagement = (idea: Idea) => (idea.likes || 0) + (idea.comments || 0) + (idea.clicks?.length || 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">User Profile</h1>
      <div className="max-w-xl mx-auto mb-8">
        <div className="card-gradient-border p-[1px]">
          <div className="card-content rounded-xl p-6 flex flex-col items-center">
            <Image
              src={user.profilePictureUrl || defaultAvatar}
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mb-2"
            />
            {isEditing ? (
              <div className="mt-2 w-full">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-2 text-white bg-[#101c24] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-white mb-1">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full p-2 text-white bg-[#101c24] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="profession" className="block text-sm font-medium text-white mb-1">Profession</label>
                  <input
                    id="profession"
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Enter your profession"
                    className="w-full p-2 text-white bg-[#101c24] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7]"
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
              <div className="text-center">
                <h2 className="text-xl mt-2 text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <button onClick={handleEdit} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Edit Profile</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Posted Ideas</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              userProfile={userProfile}
              liked={liked}
              onLike={handleLike}
              onComment={handleComment}
              onClick={handleCardClick}
              calculateEngagement={calculateEngagement}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 