'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import CreateIdeaModal from './CreateIdeaModal';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Tots
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/liked" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Liked Ideas
                </Link>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleOpenModal}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  New Idea
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      <CreateIdeaModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </header>
  );
} 