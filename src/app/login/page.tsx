'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/');
    } catch (err) {
      console.log('error', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[#101c24] rounded-lg shadow-md text-white">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-300 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 text-white bg-[#18394a] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 text-white bg-[#18394a] border border-[#4DE3F7] rounded focus:outline-none focus:ring-2 focus:ring-[#4DE3F7] focus:border-[#4DE3F7]"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Login redirect link */}
      <p className="mt-4 text-center text-gray-300">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#4DE3F7] hover:text-white">
          Sign up here
        </Link>
      </p> 
    </div>
  );
} 