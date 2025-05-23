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
  clicks: string[];
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
}

export interface User {
  name: string
  username: string
  email: string
  profession: string
  profilePictureUrl: string
}