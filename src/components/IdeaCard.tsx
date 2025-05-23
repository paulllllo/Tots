import Image from 'next/image';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { Idea } from '../types/idea';

interface CommentUserProfile {
  name: string;
  username: string;
  profilePictureUrl: string;
}

interface IdeaCardProps {
  idea: Idea;
  userProfile: CommentUserProfile | undefined;
  liked: boolean;
  onLike: (e: React.MouseEvent, idea: Idea) => void;
  onComment: (e: React.MouseEvent, idea: Idea) => void;
  onClick: (idea: Idea) => void;
  calculateEngagement: (idea: Idea) => number;
}

const defaultAvatar = 'https://api.dicebear.com/9.x/avataaars-neutral/svg?radius=0';

export default function IdeaCard({
  idea,
  userProfile,
  liked,
  onLike,
  onComment,
  onClick,
  calculateEngagement,
}: IdeaCardProps) {
  return (
    <div className="card-gradient-border p-[1px] cursor-pointer" onClick={() => onClick(idea)}>
      <div className="card-content flex flex-col h-full rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 text-white">
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
            <p className="text-sm text-gray-300">{new Date(idea.timestamp).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric'
            })}</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{idea.headline}</h2>
        <p className="text-gray-200 mb-4 line-clamp-3 flex-grow">{idea.description}</p>
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
              className={`flex items-center space-x-1 transition-colors cursor-pointer ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
              onClick={e => { e.stopPropagation(); onLike(e, idea); }}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" />
              <span>{idea.likes || 0}</span>
            </button>
            <button
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer"
              onClick={e => { e.stopPropagation(); onComment(e, idea); }}
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
      </div>
    </div>
  );
} 