'use client';

import { ChangeEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  darkMode?: boolean;
}

export default function SearchBar({ onSearch, darkMode }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleSearch  = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchTerm(e.target.value)
    // console.log('Searched term')
    onSearch(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e)}
          placeholder="Search ideas..."
          className={`w-full px-4 py-3 pl-12 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            darkMode
              ? 'text-white bg-[#101c24] border border-[#4DE3F7] placeholder-gray-400 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]'
              : 'text-gray-900 bg-white border border-gray-200 focus:ring-blue-500 focus:border-transparent'
          }`}
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className={`w-5 h-5 ${darkMode ? 'text-[#4DE3F7]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className={`absolute inset-y-0 right-0 px-4 text-sm font-medium rounded-r-lg focus:outline-none ${
            darkMode
              ? 'text-[#4DE3F7] hover:text-white bg-[#18394a]'
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
} 