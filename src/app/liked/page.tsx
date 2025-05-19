'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../utils/firebaseConfig';
import { collection, query, where, getDocs, FieldPath } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseConfig';

interface Idea {
  id: string;
  headline: string;
  description: string;
  tags: string[];
  authorId: string;
  authorProfilePictureUrl: string;
  timestamp: string;
}

export default function LikedIdeas() {
  const [likedIdeas, setLikedIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    const fetchLikedIdeas = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const likesQuery = query(collection(firestore, 'likes'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(likesQuery);
        const likedIdeaIds = querySnapshot.docs.map(doc => doc.data().ideaId);
        console.log('likedIdeas', likedIdeaIds)

        const collectionRef = collection(firestore, 'ideas')

        const ideasQuery = query(collectionRef, where(new FieldPath('__name__'), 'in', likedIdeaIds));
        console.log('ideaQuery', ideasQuery)
        const ideasSnapshot = await getDocs(ideasQuery);
        console.log('ideaSnapshot', ideasSnapshot.docs)
        const ideasList = ideasSnapshot.docs.map(doc => ({
          id: doc.id,
          headline: doc.data().headline,
          description: doc.data().description,
          tags: doc.data().tags,
          authorId: doc.data().authorId,
          authorProfilePictureUrl: doc.data().authorProfilePictureUrl,
          timestamp: doc.data().timestamp,
        }));
        console.log('ideaList', ideasList)
        setLikedIdeas(ideasList);
      }
    };
    fetchLikedIdeas();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Liked Ideas</h1>
      <div className="mt-4">
        {likedIdeas.map(idea => (
          <div key={idea.id} className="border p-4 rounded shadow mb-4">
            <h2 className="text-xl font-bold">{idea.headline}</h2>
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
  );
} 