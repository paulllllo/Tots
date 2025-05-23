'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Idea, Comment } from '../types/idea';
import { addLike, removeLike, hasLiked } from '../utils/likes';
import { addComment, getComments } from '../utils/comments';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../utils/firebaseConfig';
import { Heart, MessageCircle, Eye } from 'lucide-react';

interface IdeaPreviewProps {
  idea: Idea;
  commentsOpen?: boolean;
  userProfile?: {
    name: string;
    username: string;
    profilePictureUrl?: string;
  };
}

const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars-neutral/svg?radius=0';

export default function IdeaPreview({ idea, commentsOpen = false, userProfile }: IdeaPreviewProps) {
  const [showComments, setShowComments] = useState(commentsOpen);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [commentUserProfiles, setCommentUserProfiles] = useState<Record<string, { name: string; profilePictureUrl: string }>>({});
  
  const router = useRouter();

  useEffect(() => {
    setShowComments(commentsOpen);
  }, [commentsOpen]);

  // Update liked state when user is loggedIn
  useEffect(() => {
    if (user) {
      hasLiked(user.uid, idea.id).then(setIsLiked);
    }
  }, [user, idea.id]);

  useEffect(() => {
    if (showComments) {
      // Fetch comments when comments section is opened
      getComments(idea.id).then(setComments);
    }
  }, [showComments, idea.id]);

  // Fetch user profiles for comments
  useEffect(() => {
    const fetchCommentUserProfiles = async () => {
      const profiles: Record<string, { name: string; profilePictureUrl: string }> = {};

      for (const comment of comments) {
        if (!comment.userId || commentUserProfiles[comment.userId]) continue;

        try {
          const userDoc = await getDoc(doc(firestore, 'users', comment.userId));
          if (userDoc?.exists()) {
            const userData = userDoc.data();
            if (userData) {
              profiles[comment.userId] = {
                name: userData.username || 'Anonymous',
                profilePictureUrl: userData.profilePictureUrl || defaultAvatar
              };
            }
          }
        } catch (error) {
          console.error('Error fetching comment user profile:', error);
          // Set default profile for failed fetches
          profiles[comment.userId] = {
            name: 'Anonymous',
            profilePictureUrl: defaultAvatar
          };
        }
      }

      setCommentUserProfiles(prev => ({ ...prev, ...profiles }));
    };

    if (showComments) {
      fetchCommentUserProfiles();
    }
  }, [comments, showComments]);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await removeLike(user.uid, idea.id);
        // setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        await addLike(user.uid, idea.id);
        // setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login')
      return
    };

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const newCommentData = await addComment(user.uid, idea.id, newComment.trim());
      setComments(prev => [...prev, newCommentData]);
      // setCommentCount(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
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

  // Calculate engagement for an idea
  const calculateEngagement = (idea: Idea) => {
    return (idea.likes || 0) + (idea.comments || 0) + (idea.clicks?.length || 0);
  };

  // Update clicks when idea is viewed
  useEffect(() => {
    const updateClicks = async () => {
      if (!user) return;
      
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

    updateClicks();
  }, [idea.id, user]);

  return (
    <div className="card-gradient-border p-[1px]">
      <div className="card-content h-full rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-white">
        <div className="flex items-center mb-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
            <Image
              src={userProfile?.profilePictureUrl || defaultAvatar}
              alt={userProfile?.name || 'User'}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-white">{userProfile?.name || 'Anonymous'}</p>
            <p className="text-sm text-gray-300">{formatDate(idea.timestamp)}</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{idea.headline}</h2>
        <p className="text-gray-200 mb-4">{idea.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {idea.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#18394a] text-[#4DE3F7] rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 cursor-pointer transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" />
              <span>{idea.likes || 0}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center cursor-pointer space-x-1 hover:text-blue-600 transition-colors"
            >
              <MessageCircle size={20} />
              <span>{idea.comments || 0}</span>
            </button>
            <div className="flex items-center space-x-1 text-gray-400">
              <Eye size={20} />
              <span>{calculateEngagement(idea)}</span>
            </div>
          </div>
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
                className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSubmitting ? 'Submitting...' : 'Comment'}
              </button>
            </form>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                      <Image
                        src={commentUserProfiles[comment.userId]?.profilePictureUrl || defaultAvatar}
                        alt={commentUserProfiles[comment.userId]?.name || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-medium text-gray-900">{commentUserProfiles[comment.userId]?.name || 'Anonymous'}</p>
                  </div>
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
    </div>
  );
} 