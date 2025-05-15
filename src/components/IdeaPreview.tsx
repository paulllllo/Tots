'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Idea, Comment } from '../types/idea';
import { addLike, removeLike, hasLiked } from '../utils/likes';
import { addComment, getComments } from '../utils/comments';

interface IdeaPreviewProps {
  idea: Idea;
  commentsOpen?: boolean;
}

export default function IdeaPreview({ idea, commentsOpen = false }: IdeaPreviewProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(idea.likes);
  const [commentCount, setCommentCount] = useState(idea.comments);
  const [showComments, setShowComments] = useState(commentsOpen);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setShowComments(commentsOpen);
  }, [commentsOpen]);

  useEffect(() => {
    if (user) {
      // Check if the current user has liked this idea
      hasLiked(user.uid, idea.id).then(setIsLiked);
    }
  }, [user, idea.id]);

  useEffect(() => {
    if (showComments) {
      // Fetch comments when comments section is opened
      getComments(idea.id).then(setComments);
    }
  }, [showComments, idea.id]);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await removeLike(user.uid, idea.id);
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await addLike(user.uid, idea.id);
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      const newCommentData = await addComment(user.uid, idea.id, newComment.trim());
      setComments(prev => [...prev, newCommentData]);
      setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Add formatDate helper function
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      // Check if the date is valid
      if (!timestamp || isNaN(date.getTime())) {
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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{idea.headline}</h2>
      <p className="text-gray-600 mb-4">{idea.description}</p>
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
            onClick={handleLike}
            className={`flex items-center space-x-1 transition-colors ${
              isLiked ? 'text-red-500' : 'hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likeCount}</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{commentCount}</span>
          </button>
        </div>
        <span className="text-gray-400">
          {formatDate(idea.timestamp)}
        </span>
      </div>

      {showComments && (
        <div className="mt-6 space-y-4">
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Comment
            </button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900">{comment.content}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(comment.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 