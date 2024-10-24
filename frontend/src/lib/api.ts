
import { Novel, Chapter, User, Category } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  let token;

  if (typeof window !== 'undefined') {
    // نحن في بيئة المتصفح
    token = localStorage.getItem('token');
  }
  // لا نحتاج إلى التعامل مع الكوكيز هنا لأن هذا سيتم التعامل معه في مكونات الخادم

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await fetchAPI('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', data.token);
  return data;
}

export async function register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await fetchAPI('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem('token', data.token);
  return data;
}

export async function logout(): Promise<void> {
  await fetchAPI('/auth/logout', { method: 'POST' });
  localStorage.removeItem('token');
}

export async function updateProfile(formData: FormData): Promise<User> {
  const response = await fetch(`${API_URL}/auth/update-profile`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Profile update failed');
  }

  return response.json();
}

export async function getUser(): Promise<{ user: User }> {
  return fetchAPI('/auth/user');
}

// Novels
export async function fetchNovels(): Promise<Novel[]> {
  try {
    const response = await fetch(`${API_URL}/novels`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched novels:', data); // أضف هذا السطر للتحقق
    return data;
  } catch (error) {
    console.error('Error fetching novels:', error);
    return [];
  }
}

export async function getNovelBySlug(slug: string): Promise<Novel | null> {
  try {
    const response = await fetch(`${API_URL}/novels/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch novel');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching novel:', error);
    return null;
  }
}

export async function createNovel(novelData: Partial<Novel>): Promise<Novel> {
  return fetchAPI('/novels', {
    method: 'POST',
    body: JSON.stringify(novelData),
  });
}

export async function updateNovel(slug: string, novelData: Partial<Novel>): Promise<Novel> {
  return fetchAPI(`/novels/${slug}`, {
    method: 'PATCH',
    body: JSON.stringify(novelData),
  });
}

export async function deleteNovel(slug: string): Promise<void> {
  await fetchAPI(`/novels/${slug}`, { method: 'DELETE' });
}

// Chapters
export async function getChaptersByNovelId(novelId: string, token?: string): Promise<Chapter[]> {
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetchAPI(`/chapters/${novelId}`, { headers });
}

export async function getChapterById(novelId: string, chapterNumber: number): Promise<Chapter | null> {
  try {
    const response = await fetch(`${API_URL}/chapters/${novelId}/${chapterNumber}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapter');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return null;
  }
}

export async function createChapter(novelId: string, chapterData: Partial<Chapter>): Promise<Chapter> {
  return fetchAPI(`/chapters/${novelId}`, {
    method: 'POST',
    body: JSON.stringify(chapterData),
  });
}

export async function updateChapter(chapterId: string, chapterData: Partial<Chapter>): Promise<Chapter> {
  return fetchAPI(`/chapters/${chapterId}`, {
    method: 'PATCH',
    body: JSON.stringify(chapterData),
  });
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await fetchAPI(`/chapters/${chapterId}`, { method: 'DELETE' });
}

export async function fetchUnreadNotifications(): Promise<Notification[]> {
  const response = await fetch(`${API_URL}/notifications/unread`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch unread notifications');
  }
  return response.json();
}

export async function markNotificationsAsRead(): Promise<void> {
  const response = await fetch(`${API_URL}/notifications/mark-as-read`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to mark notifications as read');
  }
}

// Categories
export async function fetchCategories(): Promise<Category[]> {
  return fetchAPI('/categories');
}

export async function createCategory(name: string): Promise<Category> {
  return fetchAPI('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  return fetchAPI(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
}

// Favorites
export async function addToFavorites(novelId: string): Promise<void> {
  await fetchAPI(`/favorites/${novelId}`, { method: 'POST' });
}

export async function removeFromFavorites(novelId: string): Promise<void> {
  await fetchAPI(`/favorites/${novelId}`, { method: 'DELETE' });
}

export async function getFavorites(): Promise<Novel[]> {
  return fetchAPI('/favorites');
}

// Search
export async function searchNovels(query: string): Promise<Novel[]> {
  return fetchAPI(`/novels/search?q=${encodeURIComponent(query)}`);
}

// Reports
export async function submitReport(reportData: { content: string; chapterId: string; novelId: string }): Promise<void> {
  await fetchAPI('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  });
}

// Admin functions (if needed)
export async function adminLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  const data = await fetchAPI('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('adminToken', data.token);
  return data;
}

export async function fetchAdminProfile(): Promise<User> {
  return fetchAPI('/admin/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    }
  });
}

// Function to handle file uploads (e.g., novel covers or user avatars)
export async function uploadFile(file: File, type: 'cover' | 'avatar'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'File upload failed');
  }

  const data = await response.json();
  return data.url;
}

// Function to fetch novel statistics
export async function fetchNovelStats(novelId: string): Promise<{ views: number; favorites: number }> {
  return fetchAPI(`/novels/${novelId}/stats`);
}

// Function to fetch user reading history
export async function fetchReadingHistory(): Promise<{ novel: Novel; lastReadChapter: number }[]> {
  return fetchAPI('/user/reading-history');
}

// Function to update user reading progress
export async function updateReadingProgress(novelId: string, chapterNumber: number): Promise<void> {
  await fetchAPI('/user/reading-progress', {
    method: 'POST',
    body: JSON.stringify({ novelId, chapterNumber }),
  });
}
