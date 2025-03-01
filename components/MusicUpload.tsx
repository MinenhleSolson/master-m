// UploadForm.tsx
'use client';

import React, { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, XCircle } from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  audioUrl: string;
}

const UploadForm: React.FC = () => {
  const [uploadType, setUploadType] = useState<string>('');
  const [songs, setSongs] = useState<{ title: string; artist: string; file: File | null }[]>([{ title: '', artist: '', file: null }]);
  const [artwork, setArtwork] = useState<File | null>(null);
  const [albumOrEPName, setAlbumOrEPName] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({}); // Track progress per song + artwork
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleAddSong = () => {
    setSongs([...songs, { title: '', artist: '', file: null }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newSongs = [...songs];
      newSongs[index].file = file;
      setSongs(newSongs);
      setError(null); // Clear errors on successful file selection
    }
  };

  const handleArtworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          setArtwork(file);
          setError(null); // Clear any previous error
      }
  };

  const handleUpload = async () => {
        setError(null); // Clear any previous error at the start
        setSuccess(false);
        setIsUploading(true);
        setUploadProgress({}); // Initialize progress

    // 1. Validate Inputs
    if (!uploadType) {
      setError('Please select an upload type (Single, EP, or Album).');
      setIsUploading(false);
      return;
    }

    if (uploadType !== 'Single' && !albumOrEPName) {
      setError('Please enter a name for the EP or Album.');
      setIsUploading(false);
      return;
    }

    if (!artwork) {
      setError('Please select an artwork image.');
      setIsUploading(false);
      return;
    }

    for (const [index, song] of songs.entries()) {
      if (!song.title) {
        setError(`Please enter a title for song ${index + 1}.`);
        setIsUploading(false);
        return;
      }
      if (!song.artist) {
        setError(`Please enter an artist for song ${index + 1}.`);
        setIsUploading(false);
        return;
      }
      if (!song.file) {
          setError(`Please select a song file for song ${index+1}`);
          setIsUploading(false);
          return;
      }
    }


    // 2. Upload Artwork
      let artworkUrl = '';
      try {
            const artworkRef = ref(storage, `artworks/${Date.now()}_${artwork.name}`);
            const artworkUploadTask = uploadBytesResumable(artworkRef, artwork);

              artworkUploadTask.on('state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(prev => ({ ...prev, artwork: progress }));
              },
              (error) => {
                console.error("Artwork upload error:", error);
                setError('Artwork upload failed. Please try again.');
                setIsUploading(false); // Stop uploading if artwork fails
                throw error; // Re-throw to prevent further execution
              }
            );
            await artworkUploadTask; // Await the artwork upload
            artworkUrl = await getDownloadURL(artworkUploadTask.snapshot.ref);
      } catch (artworkError) {
          console.error("Artwork upload error:", artworkError);
          setError("Artwork Upload failed");
          setIsUploading(false);
          return; //stop if artwork failed.
      }



    // 3. Upload Songs and get URLs
      const uploadedSongs: Song[] = [];
    try {

        for (const [index, song] of songs.entries()) {

            if(!song.file) continue;

            const songRef = ref(storage, `songs/${Date.now()}_${song.file.name}`);
            const songUploadTask = uploadBytesResumable(songRef, song.file);

            songUploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(prev => ({ ...prev, [`song-${index}`]: progress }));
            },
            (error) => {
                console.error(`Song ${index + 1} upload error:`, error);
                setError(`Song ${index + 1} upload failed.  Please try again.`);
                setIsUploading(false); // Stop uploading if a song fails
                throw error; // Re-throw to stop the loop
            }
            );

            await songUploadTask; // Await each song upload
            const songUrl = await getDownloadURL(songUploadTask.snapshot.ref);

            uploadedSongs.push({
            title: song.title,
            artist: song.artist,
            audioUrl: songUrl,
            });
        }
      } catch(songUploadError) {
          console.error("Song upload error", songUploadError);
          setError("Song upload failed");
          setIsUploading(false);
          return; //stop the function
      }


        // 4. Save to Firestore
        try {
            if (uploadType === 'Single') {
              await addDoc(collection(db, 'singles'), {
                songs: uploadedSongs,
                artwork: artworkUrl,
                timestamp: serverTimestamp(),
              });
            } else {
              await addDoc(collection(db, uploadType.toLowerCase()), {
                name: albumOrEPName,
                songs: uploadedSongs,
                artwork: artworkUrl,
                timestamp: serverTimestamp(),
              });
            }

            setSuccess(true);
            // Reset form state
            setUploadType('');
            setSongs([{ title: '', artist: '', file: null }]);
            setArtwork(null);
            setAlbumOrEPName('');
            setUploadProgress({});

        } catch(dbError) {
            console.error("Firestore error:", dbError);
            setError('Failed to save music details. Please try again.');
        } finally {
             setIsUploading(false);
        }

  };


  const calculateTotalProgress = () => {
    if (Object.keys(uploadProgress).length === 0) {
        return 0;
    }
    const totalFiles = songs.filter(song => song.file).length + 1; // +1 for artwork
    let totalProgress = 0;

    if (uploadProgress.artwork) {
      totalProgress += uploadProgress.artwork;
    }
    for (let i = 0; i < songs.length; i++) {
      totalProgress += uploadProgress[`song-${i}`] || 0;
    }
    return totalProgress / totalFiles;
  };

  const totalProgress = calculateTotalProgress();

  return (
    <div className="max-w-md mx-auto p-6 w-full bg-[#0A192F] text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Upload Music</h2>

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
            <span className="block sm:inline">Music uploaded and saved successfully!</span>
         </div>
      )}

       {isUploading && (
            <div className="mb-4">
              <progress value={totalProgress} max="100" className="w-full h-2"></progress>
                <div className='flex items-center gap-4'>
                    <p className="text-sm text-gray-300">Uploading... {totalProgress.toFixed(0)}%</p>
                      <Loader2 className='animate-spin' size={20}/>
                </div>
            </div>
        )}

      <form onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
        <div className="mb-4">
          <label htmlFor="uploadType" className="block text-white text-sm font-bold mb-2">Upload Type:</label>
          <select
            id="uploadType"
            value={uploadType}
            onChange={(e) => {setUploadType(e.target.value); setError(null);}}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select Type</option>
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
          </select>
        </div>

        {uploadType && (
          <>
            {uploadType !== 'Single' && (
              <div className="mb-4">
                <label htmlFor="albumOrEPName" className="block text-white text-sm font-bold mb-2">{uploadType} Name:</label>
                <input
                  type="text"
                  id="albumOrEPName"
                  value={albumOrEPName}
                  onChange={(e) => {setAlbumOrEPName(e.target.value); setError(null);}}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`${uploadType} Name`}
                />
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="artwork" className="block text-white text-sm font-bold mb-2">Artwork:</label>
              <input
                type="file"
                id="artwork"
                accept="image/*"
                onChange={handleArtworkChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
              />
              {artwork && <p className="text-sm text-gray-400">Selected Artwork: {artwork.name}</p>}
            </div>

            {songs.map((song, index) => (
              <div key={index} className="mb-4">
                <label htmlFor={`title-${index}`} className="block text-white text-sm font-bold mb-2">Song Title {index + 1}:</label>
                <input
                  type="text"
                  id={`title-${index}`}
                  value={song.title}
                  onChange={(e) => {
                    const newSongs = [...songs];
                    newSongs[index].title = e.target.value;
                    setSongs(newSongs);
                    setError(null);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline mb-2"
                  placeholder="Song Title"
                />

                <label htmlFor={`artist-${index}`} className="block text-white text-sm font-bold mb-2">Artist:</label>
                <input
                  type="text"
                  id={`artist-${index}`}
                  value={song.artist}
                  onChange={(e) => {
                    const newSongs = [...songs];
                    newSongs[index].artist = e.target.value;
                    setSongs(newSongs);
                    setError(null);
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline mb-2"
                  placeholder="Artist"
                />

                <label htmlFor={`song-file-${index}`} className="block text-white text-sm font-bold mb-2">Song File:</label>
                <input
                  type="file"
                  id={`song-file-${index}`}
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-300 bg-[#0A192F] leading-tight focus:outline-none focus:shadow-outline"
                />
               {song.file && <p className="text-sm text-gray-300">Selected File: {song.file.name}</p>}

              </div>
            ))}

            {uploadType !== 'Single' && songs.length < 10 &&(
              <button
                type="button"
                onClick={handleAddSong}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Add Song
              </button>
            )}

            <button
              type="button"  // Use type="button" to prevent form submission
              onClick={handleUpload}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 ml-3 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Music'}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default UploadForm;
