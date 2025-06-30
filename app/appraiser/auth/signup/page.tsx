'use client'; // Required for hooks in App Router

import { useState } from 'react';
import axios from '@/lib/api/axios'; // adjust if you name it differently

export default function AppraiserSignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    company: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        companyName: formData.company,
      });

      console.log('Signup success:', response.data);
      // TODO: redirect or show success toast
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Image Panel */}
      <div
        className="md:w-1/3 bg-cover bg-center hidden md:block"
        style={{
          backgroundImage: "url('/images/logo.png')", // Adjust the path to your image
          minHeight: '100vh',
        }}
      />

      {/* Right Form Section */}
      <div className="w-full md:w-2/3 flex flex-col justify-center px-8 py-10 bg-white">
        <h2 className="text-xl font-semibold text-black mb-2">Sign Up as</h2>

        <div className="flex border border-gray-300 rounded-full w-max overflow-hidden mb-6">
          <button className="px-6 py-2 bg-blue-900 text-white rounded-full">Appraiser</button>
          <button className="px-6 py-2 text-gray-600">Lender</button>
        </div>

        <h1 className="text-2xl font-bold text-black mb-6">
          Create Your Appraiser Account
        </h1>

        <form className="space-y-4 w-full max-w-md" onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Type your username here"
            className={input}
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Type your email here"
            className={input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Type your password here"
            className={input}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="company"
            type="text"
            placeholder="Enter Your Company Name"
            className={input}
            value={formData.company}
            onChange={handleChange}
          />

          <div className="flex items-center text-sm gap-2 mt-2">
            <input type="checkbox" id="terms" className="h-4 w-4" required />
            <label className="text-black" htmlFor="terms">
              Terms of Use
            </label>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold mt-4"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-black text-center text-sm mt-6">
          Already Have An Account?{' '}
          <a href="#" className="text-blue-700 font-medium">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}

const input =
  'w-full px-4 py-3 border border-gray-300 rounded-full text-sm outline-none';
