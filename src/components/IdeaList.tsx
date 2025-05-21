'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import IdeaPreview from './IdeaPreview';
import { Idea } from '../types/idea';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { addLike, removeLike, hasLiked } from '../utils/likes';
import Image from 'next/image';

interface IdeaListProps {
  initialIdeas: Idea[];
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
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string; profilePictureUrl: string }>>({});

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
      const profiles: Record<string, { name: string; profilePictureUrl: string }> = {};
      
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
                profilePictureUrl: userData.profilePictureUrl || defaultAvatar
              };
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Set default profile for failed fetches
          profiles[idea.authorId] = {
            name: 'Anonymous',
            profilePictureUrl: defaultAvatar
          };
        }
      }
      
      setUserProfiles(prev => ({ ...prev, ...profiles }));
    };

    fetchUserProfiles();
  }, [ideas]);

  // Update engagement when idea is clicked
  const handleIdeaClick = async (idea: Idea) => {
    setSelectedIdea(idea);
    setShowComments(false);
    
    try {
      const ideaRef = doc(firestore, 'ideas', idea.id);
      await updateDoc(ideaRef, {
        engagement: (idea.engagement || 0) + 1
      });
    } catch (error) {
      console.error('Error updating engagement:', error);
    }
  };

  // Update engagement when comment is clicked
  const handleCommentClick = async (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    setSelectedIdea(idea);
    setShowComments(true);
    
    try {
      const ideaRef = doc(firestore, 'ideas', idea.id);
      await updateDoc(ideaRef, {
        engagement: (idea.engagement || 0) + 1
      });
    } catch (error) {
      console.error('Error updating engagement:', error);
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
        const ideaRef = doc(firestore, 'ideas', idea.id);
        await updateDoc(ideaRef, {
          engagement: (idea.engagement || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Helper function for consistent date formatting
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      // Use a specific date format to ensure consistency
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map(idea => (
          <div 
            key={idea.id} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 cursor-pointer"
            onClick={() => handleIdeaClick(idea)}
          >
            <div className="flex items-center mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={userProfiles[idea.authorId]?.profilePictureUrl || defaultAvatar}
                  alt={userProfiles[idea.authorId]?.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-900">{userProfiles[idea.authorId]?.name || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">{formatDate(idea.timestamp)}</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{idea.headline}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{idea.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map(tag => (
                <span
                  key={tag} 
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <button 
                  className={`flex items-center space-x-1 transition-colors cursor-pointer ${
                    likedIdeas.has(idea.id) ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                  onClick={(e) => handleLike(e, idea)}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill={likedIdeas.has(idea.id) ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                  <span>{idea.likes || 0}</span>
                </button>
                <button 
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={(e) => handleCommentClick(e, idea)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{idea.comments || 0}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{idea.engagement || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedIdea && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" 
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
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