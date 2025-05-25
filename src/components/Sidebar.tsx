'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Heart, User, LogOut, Menu, Plus } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleOpenModal = () => {/* TODO: Implement modal open logic if needed */};

  return (
    <>
      {/* Hamburger menu container for mobile */}
      <div className="md:hidden fixed top-0 left-0 z-50 p-4 bg-[#06202A]">
        <button
          className="text-white bg-transparent"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={32} />
        </button>
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#06202A] shadow-lg z-50 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo and Title */}
        <div className="flex items-center gap-3 px-6 py-8">
          <Image src="/logo.png" alt="Tots Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-white">Tots</span>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <ul>
            <li>
              <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#18394a] transition-colors">
                <Home size={20} />
                <span>Home</span>
              </Link>
            </li>
            {user && (
              <>
                <li>
                  <Link href="/liked" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#18394a] transition-colors">
                    <Heart size={20} />
                    <span>Liked Ideas</span>
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-[#18394a] transition-colors">
                    <User size={20} />
                    <span>Profile</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        {/* Post Button */}
        {user && (
          <button
            onClick={handleOpenModal}
            className="mx-4 mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-lg w-[calc(100%-2rem)] font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 transition-opacity shadow-lg"
          >
            <Plus size={20} />
            Post
          </button>
        )}
        {/* Auth Buttons */}
        <div className="px-4 pb-6">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-white hover:bg-[#18394a] transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          ) : (
            <Link href="/signup" className="flex items-center gap-2 w-full px-4 py-3 rounded-lg text-white hover:bg-[#18394a] transition-colors">
              <User size={20} />
              Sign In
            </Link>
          )}
        </div>
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 text-white bg-transparent"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          &times;
        </button>
      </aside>
      {/* Padding for main content on desktop */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  );
} 