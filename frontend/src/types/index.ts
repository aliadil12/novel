
export interface Novel {
  _id: string;
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  categories: string[];
  completionStatus: 'مكتملة' | 'جارية';
  totalChapters: number;
  publishedChapters: number;
  views: number;
  supporters: string[];
  section: string;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  _id: string;
  id: string;
  novelId: string;
  number: number;
  title: string;
  content: string;
  views: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  publishDate: string;
  isPublished: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Message {
  _id: string;
  user: User;
  text: string;
  replyTo?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  messageId: string;
  read: boolean;
  createdAt: string;
}
