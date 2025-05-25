'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../utils/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateIdeaModal({ isOpen, onClose }: CreateIdeaModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create an idea');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const ideaData = {
        headline: formData.headline,
        description: formData.description,
        tags: tagsArray,
        authorId: user.uid,
        timestamp: serverTimestamp(),
        likes: 0,
        comments: 0,
        clicks: []
      };

      await addDoc(collection(firestore, 'ideas'), ideaData);

      // Reset form and close modal
      setFormData({
        headline: '',
        description: '',
        tags: '',
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create idea');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-[#101c24] p-6 rounded-lg shadow-md w-full max-w-md text-white" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4">New Tot</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="headline">Headline</label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full p-2 text-white bg-[#18394a] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 text-white bg-[#18394a] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]"
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full p-2 text-white bg-[#18394a] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-700 cursor-pointer rounded hover:bg-gray-600 text-white"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 