// components/HomeSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import {
  XCircle,
  CheckCircle,
  Loader2,
  Youtube,
  Instagram,
  Facebook,
  Music,
  Phone,
  Mail, // Icons for phone and email
} from 'lucide-react';

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
  phoneNumber: string; // Add phone number
  email: string;     // Add email
}

// Initial state (empty strings) for the form
const initialState: HomeData = {
  latestSongTitle: '',
  latestSongDescription: '',
  recordLabel: '',
  socialLinks: {
    youtubeMusic: '',
    spotify: '',
    appleMusic: '',
    instagram: '',
    youtube: '',
    facebook: '',
    tiktok: '',
  },
  phoneNumber: '', // Initialize phone number
  email: '',       // Initialize email
};

const HomeSettings: React.FC = () => {
  const [formData, setFormData] = useState<HomeData>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'home', 'settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setFormData(docSnap.data() as HomeData);
        } else {
          console.log('No home data found.  Creating initial data.');
          await setDoc(docRef, initialState);
          setFormData(initialState);
        }
      } catch (error: any) {
        console.error('Error fetching home data:', error);
        setError('Failed to load home settings. ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const socialLinkKey = name.split('.')[1] as keyof HomeData['socialLinks'];
      setFormData((prevData) => ({
        ...prevData,
        socialLinks: {
          ...prevData.socialLinks,
          [socialLinkKey]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setError(null);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation (with specific error messages)
    if (formData.latestSongTitle.length > 20) {
      setError('Latest Song Title must be 20 characters or less.');
      return;
    }
    if (formData.latestSongDescription.length > 60) {
      setError('Latest Song Description must be 60 characters or less.');
      return;
    }
    if (formData.recordLabel.length > 30) {
        setError('Record Label must be 30 characters or less')
        return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'home', 'settings'); // Use the same fixed document ID

      // Create a new object for updating Firestore
      const updateData: { [key: string]: any } = {
        latestSongTitle: formData.latestSongTitle,
        latestSongDescription: formData.latestSongDescription,
        recordLabel: formData.recordLabel,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        'socialLinks.youtubeMusic': formData.socialLinks.youtubeMusic,
        'socialLinks.spotify': formData.socialLinks.spotify,
        'socialLinks.appleMusic': formData.socialLinks.appleMusic,
        'socialLinks.instagram': formData.socialLinks.instagram,
        'socialLinks.youtube': formData.socialLinks.youtube,
        'socialLinks.facebook': formData.socialLinks.facebook,
        'socialLinks.tiktok': formData.socialLinks.tiktok,
      };

      await updateDoc(docRef, updateData); // Update using the new object
      setSuccess(true);

    } catch (error: any) {
      console.error('Error updating home data:', error);
      setError('Failed to update home settings. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-6 bg-[#0A192F] text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Homepage Settings</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <XCircle className="fill-current h-6 w-6 text-red-500" role="button"/>
          </span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Homepage settings updated.</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccess(false)}>
            <CheckCircle className="fill-current h-6 w-6 text-green-500" role="button"/>
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
            <Loader2 className='animate-spin' size={30}/>
        </div>
      ) : (
      <form onSubmit={handleSubmit}>
        {/* Latest Song */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Latest Song</h3>
          <div className="mb-4">
            <label htmlFor="latestSongTitle" className="block text-sm font-medium text-gray-300">Title (max 20 characters):</label>
            <input
              type="text"
              id="latestSongTitle"
              name="latestSongTitle"
              value={formData.latestSongTitle}
              onChange={handleChange}
              maxLength={20}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="latestSongDescription" className="block text-sm font-medium text-gray-300">Description (max 60 characters):</label>
            <textarea
              id="latestSongDescription"
              name="latestSongDescription"
              value={formData.latestSongDescription}
              onChange={handleChange}
              maxLength={60}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
            />
          </div>
        </div>

        {/* Record Label */}
        <div className="mb-6">
          <label htmlFor="recordLabel" className="block text-sm font-medium text-gray-300">Record Label (max 30 characters):</label>
          <input
            type="text"
            id="recordLabel"
            name="recordLabel"
            value={formData.recordLabel}
            onChange={handleChange}
            maxLength={30}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
          />
        </div>

        {/* Social Media Links */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* YouTube Music */}
            <div>
                <label htmlFor="youtubeMusic" className="block text-sm font-medium text-gray-300  items-center">
                <Youtube className="mr-2" size={20} /> YouTube Music
                </label>
                <input
                type="url"
                id="youtubeMusic"
                name="socialLinks.youtubeMusic"
                value={formData.socialLinks.youtubeMusic}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                />
             </div>

            {/* Spotify */}
            <div>
                <label htmlFor="spotify" className="block text-sm font-medium text-gray-300  items-center">
                {/* Replace with a Spotify icon if you have one */}
                <Music className="mr-2" size={20} /> Spotify
                </label>
                <input
                type="url"
                id="spotify"
                name="socialLinks.spotify"
                value={formData.socialLinks.spotify}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                />
            </div>

            {/* Apple Music */}
            <div>
                <label htmlFor="appleMusic" className="block text-sm font-medium text-gray-300 items-center">
                {/* Replace with an Apple Music icon if you have one */}
                <Music className="mr-2" size={20} /> Apple Music
                </label>
                <input
                type="url"
                id="appleMusic"
                name="socialLinks.appleMusic"
                value={formData.socialLinks.appleMusic}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
                />
            </div>
            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-300  items-center">
                <Instagram className="mr-2" size={20} /> Instagram
              </label>
              <input
                type="url"
                id="instagram"
                name="socialLinks.instagram"
                value={formData.socialLinks.instagram}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>

            {/* YouTube */}
            <div>
              <label htmlFor="youtube" className="block text-sm font-medium text-gray-300 items-center">
                <Youtube className="mr-2" size={20} /> YouTube
              </label>
              <input
                type="url"
                id="youtube"
                name="socialLinks.youtube"
                value={formData.socialLinks.youtube}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>

            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-300  items-center">
                <Facebook className="mr-2" size={20} /> Facebook
              </label>
              <input
                type="url"
                id="facebook"
                name="socialLinks.facebook"
                value={formData.socialLinks.facebook}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>

            {/* TikTok */}
            <div>
              <label htmlFor="tiktok" className="block text-sm font-medium text-gray-300  items-center">
                {/* Replace with a TikTok icon if you have one */}
                <Music className="mr-2" size={20} /> TikTok
              </label>
              <input
                type="url"
                id="tiktok"
                name="socialLinks.tiktok"
                value={formData.socialLinks.tiktok}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>
          </div>
        </div>
        <hr className="mb-6 border-t border-gray-600" />
        {/* Phone Number and Email */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300  items-center">
                <Phone className="mr-2" size={20} /> Phone Number
              </label>
              <input
                type="tel"  // Use type="tel" for phone numbers
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300  items-center">
                <Mail className="mr-2" size={20} /> Email Address
              </label>
              <input
                type="email" // Use type="email" for email addresses
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-white"
              />
            </div>
          </div>
        </div>
        

        <button
          type="submit"
          className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Settings'}
        </button>
      </form>
      )}
    </div>
  );
};

export default HomeSettings;