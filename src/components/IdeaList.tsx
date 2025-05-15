'use client';

import { useState, useEffect, useCallback } from 'react';
import SearchBar from './SearchBar';
import IdeaPreview from './IdeaPreview';
import { Idea } from '../types/idea';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { firestore } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { addLike, removeLike, hasLiked } from '../utils/likes';

interface IdeaListProps {
  initialIdeas: Idea[];
}

export default function IdeaList({ initialIdeas }: IdeaListProps) {
  // Initialize state with processed timestamps
  const [ideas, setIdeas] = useState<Idea[]>(() => 
    initialIdeas.map(idea => ({
      ...idea,
      // Ensure timestamp is consistently formatted
      timestamp: idea.timestamp || new Date().toISOString()
    }))
  );
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>(ideas);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [likedIdeas, setLikedIdeas] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const handleSearch = useCallback((term: string) => {
    const filtered = ideas.filter(idea => 
      idea.headline.toLowerCase().includes(term.toLowerCase()) || 
      idea.description.toLowerCase().includes(term.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredIdeas(filtered);
  }, [ideas]);

  useEffect(() => {
    const ideasQuery = query(
      collection(firestore, 'ideas'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(ideasQuery, (snapshot) => {
      const updatedIdeas = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamp to ISO string
          timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as Idea[];
      
      setIdeas(updatedIdeas);
      handleSearch('');
    }, (error) => {
      console.error('Error fetching ideas:', error);
    });

    return () => unsubscribe();
  }, [handleSearch]);

  useEffect(() => {
    if (user) {
      // Check liked status for all visible ideas
      filteredIdeas.forEach(async (idea) => {
        const isLiked = await hasLiked(user.uid, idea.id);
        if (isLiked) {
          setLikedIdeas(prev => new Set([...prev, idea.id]));
        }
      });
    }
  }, [user, filteredIdeas]);

  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdea(idea);
    setShowComments(false);
  };

  const handleCommentClick = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    setSelectedIdea(idea);
    setShowComments(true);
  };

  const handleCloseModal = () => {
    setSelectedIdea(null);
    setShowComments(false);
  };

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
              </div>
              <span className="text-gray-400">
                {formatDate(idea.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedIdea && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <IdeaPreview idea={selectedIdea} commentsOpen={showComments} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 