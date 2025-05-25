'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebaseConfig';
import IdeaCard from '../../components/IdeaCard';
import { useAuth } from '../../contexts/AuthContext';
import { addLike, removeLike } from '../../utils/likes';
import { Idea } from '../../types/idea';

interface CommentUserProfile {
  name: string;
  username: string;
  profilePictureUrl: string;
}

// Helper function to calculate engagement (copied from IdeaList)
const calculateEngagement = (idea: Idea) => {
  return (idea.likes || 0) + (idea.comments || 0) + (idea.clicks?.length || 0);
};

export default function LikedIdeas() {
  const [likedIdeas, setLikedIdeas] = useState<Idea[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, CommentUserProfile>>({});
  const [likedIdeaIdsSet, setLikedIdeaIdsSet] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Fetch liked idea IDs and idea data
  useEffect(() => {
    const fetchLikedIdeas = async () => {
      if (!user) return;

      try {
        // Fetch the IDs of ideas the current user has liked
        const likesQuery = query(collection(firestore, 'likes'), where('userId', '==', user.uid));
        const likesSnapshot = await getDocs(likesQuery);
        const likedIdeaIds = likesSnapshot.docs.map(doc => doc.data().ideaId);
        setLikedIdeaIdsSet(new Set(likedIdeaIds));

        if (likedIdeaIds.length === 0) {
          setLikedIdeas([]);
          return;
        }

        // Fetch the actual idea documents using the IDs
        // Firestore 'in' query is limited to 10 items
        const ideasList: Idea[] = [];
        const chunkSize = 10; // Maximum for 'in' query
        for (let i = 0; i < likedIdeaIds.length; i += chunkSize) {
          const chunk = likedIdeaIds.slice(i, i + chunkSize);
          const ideasQuery = query(collection(firestore, 'ideas'), where('__name__', 'in', chunk));
          const ideasSnapshot = await getDocs(ideasQuery);
          ideasSnapshot.docs.forEach(doc => {
            const data = doc.data();
            ideasList.push({
              id: doc.id,
              headline: data.headline,
              description: data.description,
              tags: data.tags,
              authorId: data.authorId,
              authorProfilePictureUrl: data.authorProfilePictureUrl || '',
              timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
              likes: data.likes || 0,
              comments: data.comments || 0,
              clicks: data.clicks || [],
            });
          });
        }
        setLikedIdeas(ideasList);

      } catch (error) {
        console.error('Error fetching liked ideas:', error);
      }
    };

    fetchLikedIdeas();
  }, [user]); // Rerun when user changes

  // Fetch user profiles for the authors of liked ideas
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profiles: Record<string, CommentUserProfile> = {};
      for (const idea of likedIdeas) {
        if (!idea.authorId || userProfiles[idea.authorId]) continue;
        try {
          const userDoc = await getDoc(doc(firestore, 'users', idea.authorId));
          if (userDoc?.exists()) {
            const userData = userDoc.data();
            if (userData) {
              profiles[idea.authorId] = {
                name: userData.username || 'Anonymous',
                username: userData.username || 'Anonymous',
                profilePictureUrl: userData.profilePictureUrl || ''
              };
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          profiles[idea.authorId] = { // Default profile on error
            name: 'Anonymous',
            username: 'Anonymous',
            profilePictureUrl: ''
          };
        }
      }
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    };

    if (likedIdeas.length > 0) {
      fetchUserProfiles();
    }
  }, [likedIdeas, userProfiles]); // Rerun when likedIdeas or userProfiles change

  // Dummy handlers for IdeaCard props (interaction may not be fully enabled here)
  const handleLike = async (e: React.MouseEvent, idea: Idea) => {
     e.stopPropagation();
     console.log(`Like clicked for idea: ${idea.id}`);
     // Implement like toggling if needed
     if (!user) return;
     try {
       const isCurrentlyLiked = likedIdeaIdsSet.has(idea.id);
       if (isCurrentlyLiked) {
         await removeLike(user.uid, idea.id);
         setLikedIdeaIdsSet(prev => {
           const newSet = new Set(prev);
           newSet.delete(idea.id);
           return newSet;
         });
       } else {
         await addLike(user.uid, idea.id);
         setLikedIdeaIdsSet(prev => new Set([...prev, idea.id]));
       }
     } catch (error) {
       console.error('Error toggling like:', error);
     }
   };

  const handleCommentClick = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    console.log(`Comment clicked for idea: ${idea.id}`);
    // Implement comment modal/page logic if needed
  };

  const handleCardClick = (idea: Idea) => {
    console.log(`Card clicked for idea: ${idea.id}`);
    // Implement navigation to idea details page if needed
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-6">Liked Ideas</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {likedIdeas.map(idea => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            userProfile={userProfiles[idea.authorId]}
            liked={likedIdeaIdsSet.has(idea.id)}
            onLike={handleLike}
            onComment={handleCommentClick}
            onClick={handleCardClick}
            calculateEngagement={calculateEngagement}
          />
        ))}
      </div>
      {/* Consider adding a message if no liked ideas */}
      {likedIdeas.length === 0 && (
        <div className="text-white text-center mt-8">
          You haven&apos;t liked any ideas yet.
        </div>
      )}
    </div>
  );
}
