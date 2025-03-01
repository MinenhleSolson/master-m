// app/booking/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Send, Loader2, XCircle, CheckCircle } from 'lucide-react';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase'; // Import Firebase
import { doc, getDoc } from 'firebase/firestore';
import Header from '@/components/Header';

interface HomeData {
  latestSongTitle: string;
  latestSongDescription: string;
  recordLabel: string;
  socialLinks: {
    youtubeMusic: string;
    spotify: string;
    appleMusic: string;
    instagram: string;
    youtube: string;
    facebook: string;
    tiktok: string;
  };
  phoneNumber: string;
  email: string;
}

const BookingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [homeData, setHomeData] = useState<HomeData | null>(null); // State for fetched data
  const [pageLoading, setPageLoading] = useState(true); // Separate loading state for initial data fetch


  useEffect(() => {
    const fetchHomeData = async () => {
        setPageLoading(true);
        setError(null)
      try {
        const docRef = doc(db, 'home', 'settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setHomeData(docSnap.data() as HomeData);
        } else {
          setError('Contact information not found.'); // Specific error message
        }
      } catch (error: any) {
        console.error('Error fetching home data:', error);
        setError('Failed to load contact information: ' + error.message);
      } finally {
          setPageLoading(false);
      }
    };

    fetchHomeData();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!formData.name) {
      setError('Please enter your name.');
      setLoading(false);
      return;
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!formData.message) {
      setError('Please enter your message.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        const data = await response.json();
        setError(data.error || 'An unexpected error occurred.');
      }
    } catch (error: any) {
      setError('An unexpected error occurred: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

   if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

   if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
      </div>
    )
   }


  return (
    <div>
        <Header />
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Contact Information</h1>
            {homeData && (
              <>
                <p className="text-lg text-gray-600 mb-4">
                  Email: <a href={`mailto:${homeData.email}`} className="text-blue-500 hover:underline">{homeData.email}</a>
                </p>
                <p className="text-lg text-gray-600">
                  Phone: <a href={`tel:${homeData.phoneNumber}`} className="text-blue-500 hover:underline">{homeData.phoneNumber}</a>
                </p>
              </>
            )}
          </div>

          {/* Social Media Links */}
          <div className="bg-[#0A192F] py-6 px-8 rounded-lg flex items-center justify-center">
            {homeData && (
              <div className="flex space-x-8">
                <a href={homeData.socialLinks.instagram || '#'} aria-label="Instagram" className="hover:opacity-75 transition-opacity">
                  <img src='/assets/instagramWhite.svg' alt='Instagram' className='w-12 h-12' />
                </a>
                <a href={homeData.socialLinks.facebook || '#'} aria-label="Facebook" className="hover:opacity-75 transition-opacity">
                  <img src='/assets/facebookWhite.svg' alt='Facebook' className='w-12 h-12' />
                </a>
                <a href={homeData.socialLinks.tiktok || '#'} aria-label="TikTok" className="hover:opacity-75 transition-opacity">
                  <img src='/assets/tiktokWhite.svg' alt='TikTok' className='w-12 h-12' />
                </a>
              </div>
             )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-lg shadow-md mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Form</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                <XCircle className="fill-current h-6 w-6 text-red-500" role="button" />
              </span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your message has been sent.</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess(false)}>
                <CheckCircle className="fill-current h-6 w-6 text-green-500" role="button" />
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Your Name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone (optional):</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="+1 (234) 567-890"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">Message:</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                placeholder="Your Message"
              />
            </div>

            <button
              type="submit"
              className="bg-[#0A192F] hover:bg-[#152947] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className='animate-spin mr-2' size={20} /> Sending...
                </div>
              ) : (
                <>
                  <div className='flex'><Send className="mr-2 mt-1" size={16} /> Send Message</div>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
    </div>
  );
};

export default BookingPage;