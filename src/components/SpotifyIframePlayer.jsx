'use client';
import React, { useEffect, useRef, useState } from 'react';
import './SpotifyIframePlayer.css';
if (typeof window !== 'undefined') {
const scriptSrc = "https://open.spotify.com/embed/iframe-api/v1";
// Load the Spotify Embed SDK
const script = document.createElement("script");
script.src = scriptSrc;
script.async = true;


  document.body.appendChild(script);
}

export default function SpotifyIframePlayer({ trackId, songName, artistName, albumArt, onGenreChange, firstLoad }) {
  const embedRef = useRef(null);
  const controllerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    console.log('useEffect', trackId);

    // Define the callback for when the API is ready
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      console.log('onSpotifyIframeApiReady', IFrameAPI);
      const element = embedRef.current;
      const options = {
        width: '100%',
        height: '80px', // Reduced height since we're hiding it
        uri: `spotify:track:${trackId}`,
      };

      // Create the controller
      IFrameAPI.createController(element, options, (controller) => {
        console.log('creating the controller');

        controllerRef.current = controller;

        // Add event listeners
        controller.addListener('playback_update', (e) => {
          setIsPlaying(!e.data.isPaused);
          setIsBuffering(e.data.isBuffering);
          setPosition(e.data.position);
          setDuration(e.data.duration);
        });

        controller.addListener('ready', () => {
          // Auto-play when ready
          controller.play();
        });
      });
    };

    return () => {
      // Cleanup
      if (controllerRef.current) {
        controllerRef.current.destroy();
      }
    };
  }, [trackId]);

  // Update player when trackId changes
  useEffect(() => {
    if (controllerRef.current && trackId) {
      console.log('loading the uri', `spotify:track:${trackId}`);
      controllerRef.current.loadUri(`spotify:track:${trackId}`);
    }
  }, [trackId]);

  const handlePlayPause = () => {
    if (controllerRef.current) {
      console.log('toggling play', controllerRef.current);
      if (isPlaying) {
        controllerRef.current.pause();
      } else {
        controllerRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const seekPosition = clickPosition * duration;
    
    if (controllerRef.current) {
      controllerRef.current.seek(seekPosition);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (firstLoad) {
    return (
        <div className="music-reel-container">
            <div className="first-load-container">
                <h2> Choose a genre to get started</h2>

                <div className="genre-buttons"> 
                    <button className="genre-button" onClick={() => onGenreChange('house')}>
                        <span>House</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('uk garage')}>
                        <span>Uk Garage</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('rock')}>
                        <span>Rock</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('indie')}>
                        <span>Indie</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('pop')}>
                        <span>Pop</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('jazz')}>
                        <span>Jazz</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('hip-hop')}>
                        <span>Hip-Hop</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('drum and bass')}>
                        <span>Drum and Bass</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('edm')}>
                        <span>EDM</span>
                    </button>
                    <button className="genre-button" onClick={() => onGenreChange('rap')}>
                        <span>Rap</span>
                    </button>
                </div>
            </div>
        </div>
    )
  }

  return (

    <div className="music-reel-container">
      <div className="reel-card">
        <div 
          className="album-art" 
          style={{ backgroundImage: `url(${albumArt})` }}
        >
        </div>

        <div className="overlay">
            <div className="track-info">
              <h2>{songName}</h2>
              <p>{artistName}</p>
            </div>
            
            {/* <div className="controls">
            
              
              <button 
                className="control-btn play-pause"
                onClick={handlePlayPause}
                disabled={isBuffering}
              >
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
              
            
            </div>

            <div 
              className="progress-container"
              onClick={handleSeek}
            >
              <div 
                className="progress-bar"
                style={{ width: `${(position / duration) * 100}%` }}
              />
            </div> */}
          </div>

        {/* <div className="interaction-sidebar">
          <button className="interaction-btn" >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            <span>Open in Spotify</span>
          </button>
        </div> */}
      </div>
      
      <div 
        ref={embedRef} 
        className="spotify-embed" 
        style={{ width: '100%', height: '80px', display: 'none' }} 
      />
    </div>
  );
} 