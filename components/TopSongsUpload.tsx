// TopSongsUpload.tsx
'use client';

import React, { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, XCircle } from 'lucide-react';

const TopSongsUpload: React.FC = () => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArtworkFile(file);
      setError(null);
    }
  };

    const handleSongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             // Get duration
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.onloadedmetadata = () => {
                setDuration(audio.duration);
                URL.revokeObjectURL(audio.src); // Clean up the object URL
            };
            setSongFile(file);
            setError(null);

        }
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title) {
      setError('Please enter a song title.');
      return;
    }
    if (!artist) {
      setError('Please enter an artist name.');
      return;
    }
    if (!artworkFile) {
      setError('Please select an artwork image.');
      return;
    }
    if (!songFile) {
      setError('Please select a song file.');
      return;
    }
      if (duration === null) {
        setError("Could not determine song duration.");
        return;
    }

    setError(null);
    setIsUploading(true);
    setSuccess(false);
    setUploadProgress(0);


      // Upload Artwork
      let artworkURL = "";
      try {
        const artworkRef = ref(storage, `artworks/${Date.now()}_${artworkFile.name}`);
        const artworkUploadTask = uploadBytesResumable(artworkRef, artworkFile);
          artworkUploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 50; // Artwork is 50% of total
                setUploadProgress(progress);
              },
              (error) => {
                console.error("Artwork upload error", error)
                setError("Artwork Upload failed");
                setIsUploading(false);
                throw new Error("Artwork Upload Failed") // Stop the process
              }
          );
            await artworkUploadTask;
          artworkURL = await getDownloadURL(artworkUploadTask.snapshot.ref);

      } catch(artworkError) {
            console.error("Artwork Error:", artworkError);
            setError("Artwork Upload Failed");
            setIsUploading(false);
            return;
      }

        // Upload Song
        let songURL = "";

      try {
        const songRef = ref(storage, `songs/${Date.now()}_${songFile.name}`);
        const songUploadTask = uploadBytesResumable(songRef, songFile);

          songUploadTask.on('state_changed',
                (snapshot) => {
                    const progress = 50 + (snapshot.bytesTransferred / snapshot.totalBytes) * 50; //song is the other 50%
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Song upload error:", error);
                    setError("Song upload failed");
                    setIsUploading(false);
                    throw new Error("Song Upload Failed"); //stop the all process
                }
          );
            await songUploadTask;
            songURL = await getDownloadURL(songUploadTask.snapshot.ref);
      } catch(songError) {
        console.error("Song Upload error:", songError);
        setError("Song Upload Failed");
        setIsUploading(false)
        return; // Stop execution
      }

    // Save to Firestore
    try {
      await addDoc(collection(db, 'songs'), {
        title,
        artist,
        artworkURL,
        songURL,
        duration,
        timestamp: serverTimestamp(),
      });

      setSuccess(true);
      // Reset form
      setTitle('');
      setArtist('');
      setArtworkFile(null);
      setSongFile(null);
      setDuration(null);
    } catch (dbError) {
      console.error('Firestore error:', dbError);
      setError('Failed to save song details. Please try again.');

    } finally {
        setIsUploading(false);
        setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 w-full bg-[#0A192F] rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-white">Upload Top/Latest Song</h2>

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
          <span className="block sm:inline">Song uploaded and saved successfully!</span>
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <progress value={uploadProgress || 0} max="100" className="w-full h-2"></progress>
            <div className='flex items-center gap-4'>
                <p className="text-sm text-gray-300">Uploading... {uploadProgress?.toFixed(0)}%</p>
                <Loader2 className='animate-spin' size={20}/>
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-white text-sm font-bold mb-2">Song Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {setTitle(e.target.value); setError(null);}}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Song Title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="artist" className="block text-white text-sm font-bold mb-2">Artist:</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => {setArtist(e.target.value); setError(null)}}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Artist Name"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="artwork" className="block text-white text-sm font-bold mb-2">Artwork:</label>
          <input
            type="file"
            id="artwork"
            accept="image/*"
            onChange={handleArtworkChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
          />
           {artworkFile && <p className="text-sm text-gray-300">Selected Artwork: {artworkFile.name}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="song" className="block text-gray-300 text-sm font-bold mb-2">Song File:</label>
          <input
            type="file"
            id="song"
            accept="audio/*"
            onChange={handleSongChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
          />
            {songFile && <p className="text-sm text-gray-300">Selected Song: {songFile.name}</p>}
        </div>
         {duration !== null && (
            <p className="text-sm text-gray-300">Song Duration: {duration.toFixed(2)} seconds</p>
        )}

        <button
          type="submit"
          className="bg-blue-500 mt-3 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>
    </div>
  );
};

export default TopSongsUpload;