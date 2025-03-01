// VideoUpload.tsx
'use client';

import React, { useState } from 'react';
import { storage, db } from '@/lib/firebase'; // Import your Firebase config
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, XCircle } from 'lucide-react'; // For loading spinner and error icon

const VideoUpload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);  // Track successful upload
  const [isUploading, setIsUploading] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Size check (300MB in bytes)
    if (file.size > 300 * 1024 * 1024) {
      setError('Video file size exceeds 300MB.');
      setVideoFile(null); // Clear the file input
      return;
    }

    setError(null); // Clear previous errors
    setVideoFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title || title.length > 50) {
      setError('Title is required and must be less than 50 characters.');
      return;
    }
    if (!description || description.length > 150) {
      setError('Description is required and must be less than 150 characters.');
      return;
    }
    if (!videoFile) {
      setError('Please select a video file.');
      return;
    }

    setError(null); // Clear any previous error
    setIsUploading(true);
    setSuccess(false);
    setUploadProgress(0);

    // 1. Upload video to Firebase Storage
    const storageRef = ref(storage, `videos/${Date.now()}-${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setError('Video upload failed. Please try again.');
        setIsUploading(false);
        setUploadProgress(null)
      },
      async () => {
        // 2. Get download URL
        try {
            const videoURL = await getDownloadURL(uploadTask.snapshot.ref);

            // 3. Store data in Firestore
            await addDoc(collection(db, 'videos'), {
              title,
              description,
              videoURL,
              timestamp: serverTimestamp(), // Add a timestamp
            });
            setSuccess(true);
            setTitle('');
            setDescription('');
            setVideoFile(null);

        } catch(dbError) {
            console.error("Firestore error:", dbError);
            setError('Failed to save video details. Please try again.');
            setSuccess(false);

        } finally {

            setIsUploading(false);
            setUploadProgress(null);
        }
      }
    );
  };

  return (
    <div className="max-w-md mx-auto w-full p-6 bg-[#0A192F] text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Video</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
             <XCircle className="fill-current h-6 w-6 text-red-500" role="button" />
          </span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Video uploaded and saved successfully!</span>
         </div>
      )}

        {isUploading && (
            <div className="mb-4">
              <progress value={uploadProgress || 0} max="100" className="w-full h-2"></progress>
              <div className='flex items-center gap-4'>
                    <p className="text-sm text-gray-600">Uploading... {uploadProgress?.toFixed(0)}%</p>
                    <Loader2 className='animate-spin' size={20}/>
              </div>
            </div>
          )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-white text-sm font-bold mb-2">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full bg-[#0A192F] py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Video Title (max 50 characters)"
            maxLength={50} // Enforce maxlength in the input
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-white text-sm font-bold mb-2">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline h-24" // Added h-24 for height
            placeholder="Video Description (max 150 characters)"
            maxLength={150}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="video" className="block text-white text-sm font-bold mb-2">Video File (max 300MB):</label>
          <input
            type="file"
            id="video"
            accept="video/*" // Accept only video files
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
          />
           {videoFile && <p className="text-sm text-gray-300">Selected File: {videoFile.name}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;