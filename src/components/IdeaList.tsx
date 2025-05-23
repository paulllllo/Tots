'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import IdeaPreview from './IdeaPreview';
import { Idea } from '../types/idea';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { addLike, removeLike, hasLiked } from '../utils/likes';
import { calculateTrendingScore } from '@/utils/utils';
import IdeaCard from './IdeaCard';

interface IdeaListProps {
  initialIdeas: Idea[];
}

interface CommentUserProfile {
  name: string;
  username: string;
  profilePictureUrl: string;
}

const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars-neutral/svg?radius=0';

export default function IdeaList({ initialIdeas }: IdeaListProps) {
  const [ideas, setIdeas] = useState<Idea[]>(() => 
    initialIdeas.map(idea => ({
      ...idea,
      timestamp: idea.timestamp || new Date().toISOString()
    }))
  );
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>(ideas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [likedIdeas, setLikedIdeas] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const [userProfiles, setUserProfiles] = useState<Record<string, CommentUserProfile>>({});
  const [trendingIdeas, setTrendingIdeas] = useState<Idea[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    const filtered = ideas.filter(idea => 
      idea.headline.toLowerCase().includes(term.toLowerCase()) || 
      idea.description.toLowerCase().includes(term.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredIdeas(filtered);
  }, [ideas]);

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearch]);

  // Handle search input changes
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Fetch ideas from Firestore
  useEffect(() => {
    const ideasQuery = query(
      collection(firestore, 'ideas'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      const updatedIdeas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Idea[];
      console.log('IdeasStructure', updatedIdeas)
      
      setIdeas(updatedIdeas);
    }, (error) => {
      console.error('Error fetching ideas:', error);
    });

    return () => unsubscribe();
  }, []); // Only run once on mount

  // Check liked status for visible ideas
  useEffect(() => {
    if (user) {
      filteredIdeas.forEach(async (idea) => {
        const isLiked = await hasLiked(user.uid, idea.id);
        if (isLiked) {
          setLikedIdeas(prev => new Set([...prev, idea.id]));
        }
      });
    }
  }, [user, filteredIdeas]);

  // Fetch user profiles for ideas
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const profiles: Record<string, CommentUserProfile> = {};
      
      for (const idea of ideas) {
        console.log('userData in fetchProfiles', idea.authorId)
        if (!idea.authorId || userProfiles[idea.authorId]) continue;
        
        try {
          const userDoc = await getDoc(doc(firestore, 'users', idea.authorId));
          if (userDoc?.exists()) {
            const userData = userDoc.data();
            if (userData) {
              profiles[idea.authorId] = {
                name: userData.username || 'Anonymous',
                username: userData.username || 'Anonymous',
                profilePictureUrl: userData.profilePictureUrl || defaultAvatar
              };
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set default profile for failed fetches
          profiles[idea.authorId] = {
            name: 'Anonymous',
            username: 'Anonymous',
            profilePictureUrl: defaultAvatar
          };
        }
      }
      
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    };

    fetchUserProfiles();
  }, [ideas]);

  // Update trending ideas whenever ideas change
  useEffect(() => {
    const sortedIdeas = [...ideas].sort((a, b) => {
      const scoreA = calculateTrendingScore(a);
      const scoreB = calculateTrendingScore(b);
      return scoreB - scoreA;
    });
    
    setTrendingIdeas(sortedIdeas.slice(0, 10));
  }, [ideas]);

  // Update clicks when idea is clicked
  const handleIdeaClick = async (idea: Idea) => {
    if (!user) return;
    
    setSelectedIdea(idea);
    setShowComments(false);
    
    try {
      const ideaRef = doc(firestore, 'ideas', idea.id);
      await updateDoc(ideaRef, {
        clicks: arrayUnion(user.uid),
        // Remove engagement field if it exists
        engagement: null
      });
    } catch (error) {
      console.error('Error updating clicks:', error);
    }
  };

  // Update clicks when comment is clicked
  const handleCommentClick = async (e: React.MouseEvent, idea: Idea) => {
    if (!user) return;
    
    e.stopPropagation();
    setSelectedIdea(idea);
    setShowComments(true);
    
    try {
      const ideaRef = doc(firestore, 'ideas', idea.id);
      await updateDoc(ideaRef, {
        clicks: arrayUnion(user.uid),
        // Remove engagement field if it exists
        engagement: null
      });
    } catch (error) {
      console.error('Error updating clicks:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedIdea(null);
    setShowComments(false);
  };

  // Update engagement when like is clicked
  const handleLike = async (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const isCurrentlyLiked = likedIdeas.has(idea.id);
      if (isCurrentlyLiked) {
        await removeLike(user.uid, idea.id);
        setLikedIdeas(prev => {
          const newSet = new Set(prev);
          newSet.delete(idea.id);
          return newSet;
        });
      } else {
        await addLike(user.uid, idea.id);
        setLikedIdeas(prev => new Set([...prev, idea.id]));
        
        // Update engagement when liking
        // const ideaRef = doc(firestore, 'ideas', idea.id);
        // await updateDoc(ideaRef, {
        //   engagement: (idea.engagement || 0) + 1
        // });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Calculate engagement for an idea
  const calculateEngagement = (idea: Idea) => {
    return (idea.likes || 0) + (idea.comments || 0) + (idea.clicks?.length || 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} darkMode />
      </div>

      {/* Trending Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Trending</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trendingIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              userProfile={userProfiles[idea.authorId]}
              liked={likedIdeas.has(idea.id)}
              onLike={handleLike}
              onComment={handleCommentClick}
              onClick={handleIdeaClick}
              calculateEngagement={calculateEngagement}
            />
          ))}
        </div>
      </div>

      {/* All Ideas Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">All Ideas</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              userProfile={userProfiles[idea.authorId]}
              liked={likedIdeas.has(idea.id)}
              onLike={handleLike}
              onComment={handleCommentClick}
              onClick={handleIdeaClick}
              calculateEngagement={calculateEngagement}
            />
          ))}
        </div>
      </div>

      {selectedIdea && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" 
          onClick={handleCloseModal}
        >
          <div 
            className="bg-transparent rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-2">
              <IdeaPreview 
                idea={selectedIdea} 
                commentsOpen={showComments} 
                userProfile={userProfiles[selectedIdea.authorId]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 