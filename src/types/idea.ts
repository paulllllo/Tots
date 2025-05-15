// import { Timestamp } from 'firebase/firestore';

export interface Idea {
  id: string;
  headline: string;
  description: string;
  tags: string[];
  authorId: string;
  authorProfilePictureUrl?: string;
  timestamp: string;
  likes: number;
  comments: number;
} 

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}