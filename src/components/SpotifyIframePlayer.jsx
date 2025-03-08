'use client';
import React, { useEffect, useRef, useState } from 'react';
import './SpotifyIframePlayer.css';

const scriptSrc = "https://open.spotify.com/embed/iframe-api/v1";

if(typeof window !== 'undefined'){
  // Load the Spotify Embed SDK
  const script = document.createElement("script");
  script.src = scriptSrc;
  script.async = true;
  document.body.appendChild(script);

}

export default function SpotifyIframePlayer({ trackId, songName, artistName, albumArt, onGenreChange, firstLoad, updateFirstLoad, genreName, scrollToNextSong }) {
  const embedRef = useRef(null);
  const controllerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    // console.log('useEffect', trackId);

    // Define the callback for when the API is ready
    window.onSpotifyIframeApiReady = (IFrameAPI) => {
      console.log('onSpotifyIframeApiReady', IFrameAPI);
      const element = embedRef.current;
      if (!element) return;

      const options = {
        width: '100%',
        height: '80px',
        uri: `spotify:track:${trackId}`,
      };

      // Create the controller
      IFrameAPI.createController(element, options, (controller) => {
        // console.log('creating the controller');

        controllerRef.current = controller;
        let buffered = false;

        let toggledBuffering = false;
        // Add event listeners
        controller.addListener('playback_update', (e) => {
          setIsPlaying(!e.data.isPaused);
          setIsBuffering(e.data.isBuffering);
          setPosition(e.data.position);
          setDuration(e.data.duration);
          console.log('e.data', e.data, e.data.position, e.data.isBuffering);
          if(e.data.isBuffering){
            toggledBuffering = true;
          }
          if(!e.data.isBuffering && toggledBuffering){
            buffered = true;
            toggledBuffering = false;
          }
          // Check if song has ended
          if (e.data.position === e.data.duration && buffered && !e.data.isBuffering) {
            console.log('Song has ended, getting next song in genre:', genreName);
            buffered = false;
            scrollToNextSong();
          }
        });

        controller.addListener('ready', () => {
          // console.log('playing the songgg')
          // Auto-play when ready
          controller.play();
        });
      });
    };

    return () => {
      // Cleanup
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy();
        } catch (error) {
          console.log('Error cleaning up controller:', error);
        }
        controllerRef.current = null;
      }
      // Remove the callback to prevent memory leaks
      window.onSpotifyIframeApiReady = null;
    };
  }, [trackId]);

  // Update player when trackId changes
  useEffect(() => {
    if (controllerRef.current && trackId) {
      // console.log('loading the uri', `spotify:track:${trackId}`);
      controllerRef.current.loadUri(`spotify:track:${trackId}`);
      controllerRef.current.play();
    }
  }, [trackId]);

  const handlePlayPause = () => {
    if (controllerRef.current) {
      // console.log('toggling play', controllerRef.current);
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

  return (

    <div className="music-reel-container">
      <div className="reel-card">
        <div 
          className="album-art" 
          style={{ backgroundImage: `url(${albumArt})` }}
        >
        </div>

        <div className="overlay">

            <div className="header-container">
              <button className="home-button" onClick={() => {
                updateFirstLoad();
                setIsPlaying(false);
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"> 
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </button>

              <h3 className="genre-name">
                {genreName}
              </h3>

              <div className="go-to-spotify-container">
                <button className="share-button" onClick={() => {
                  // open spotify in new tab
                  window.open(`https://open.spotify.com/track/${trackId}`, '_blank');
                  // navigator.clipboard.writeText(`https://open.spotify.com/track/${trackId}`);
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="32" height="32" viewBox="0,0,256,256">
                    <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDashoffset="0"><g transform="scale(5.33333,5.33333)"><path d="M25.912,3.584c-5.156,0.124 -7.375,0.841 -10.887,2.013c-1.384,0.462 -2.21,1.161 -3.421,1.975c-1.438,0.966 -3.187,2.914 -4.166,4.343c-4.159,6.073 -4.983,14.373 -1.778,21c1.88,3.886 5.031,7.195 8.95,9.005c3.975,1.836 7.577,2.716 11.929,2.232c4.19,-0.466 4.947,-0.873 8.089,-2.793c0.867,-0.53 2.48,-1.787 3.142,-2.558c0.803,-0.934 2.89,-3.095 3.55,-4.135c2.328,-3.666 3.015,-6.388 2.972,-12.017c-0.014,-1.778 -0.525,-3.887 -1.096,-5.571c-1.163,-3.432 -2.292,-5.975 -5.206,-8.128c-3.211,-2.373 -5.161,-4.574 -12.102,-5.375" fill="#ffffff"></path><path d="M24.212,44.785c-3.191,0 -6.246,-0.764 -9.812,-2.411c-3.919,-1.811 -7.183,-5.092 -9.19,-9.241c-3.246,-6.711 -2.533,-15.149 1.816,-21.5c0.999,-1.459 2.797,-3.465 4.3,-4.476c0.235,-0.158 0.456,-0.312 0.669,-0.461c0.908,-0.633 1.692,-1.179 2.873,-1.573c3.421,-1.142 5.69,-1.898 10.911,-2.036c0.054,-0.012 0.111,-0.014 0.167,-0.009c6.16,0.711 8.462,2.488 11.127,4.546c0.393,0.303 0.793,0.612 1.215,0.924c3.141,2.321 4.296,5.164 5.383,8.37c0.412,1.217 1.105,3.579 1.122,5.728c0.043,5.668 -0.669,8.54 -3.05,12.289c-0.49,0.773 -1.681,2.079 -2.638,3.129c-0.382,0.42 -0.724,0.794 -0.956,1.064c-0.733,0.854 -2.42,2.145 -3.26,2.658c-3.205,1.959 -4.032,2.391 -8.296,2.863c-0.808,0.09 -1.599,0.136 -2.381,0.136zM25.931,4.084c-0.002,0 -0.004,0 -0.007,0c-5.157,0.125 -7.378,0.866 -10.74,1.988c-1.044,0.348 -1.739,0.832 -2.618,1.444c-0.217,0.152 -0.443,0.309 -0.683,0.471c-1.398,0.94 -3.087,2.829 -4.032,4.21c-4.15,6.061 -4.833,14.106 -1.741,20.5c1.906,3.941 4.999,7.056 8.709,8.769c4.264,1.971 7.751,2.624 11.664,2.189c4.062,-0.45 4.776,-0.822 7.885,-2.723c0.871,-0.533 2.414,-1.748 3.023,-2.457c0.236,-0.275 0.585,-0.657 0.976,-1.086c0.881,-0.967 2.088,-2.291 2.532,-2.99c2.286,-3.603 2.936,-6.237 2.894,-11.746c-0.012,-1.468 -0.401,-3.44 -1.069,-5.415c-1.068,-3.151 -2.117,-5.733 -5.029,-7.886c-0.428,-0.316 -0.834,-0.63 -1.232,-0.937c-2.534,-1.955 -4.724,-3.644 -10.532,-4.331z" fill="#010101"></path><path d="M22.929,27.838c-2.716,-0.138 -2.342,-0.062 -5.169,0.193c-0.965,0.087 -1.967,0.253 -2.928,0.372c-0.647,0.08 -1.326,0.173 -1.846,0.567c-0.52,0.393 -0.791,1.194 -0.397,1.713c0.364,0.479 1.071,0.549 1.667,0.469c3.921,-0.527 5.509,-0.682 9.002,-0.637c1.526,0.02 4.506,0.769 5.886,1.42c0.934,0.44 2.731,1.312 3.262,1.494c0.697,0.238 1.201,-0.399 1.363,-0.937c0.148,-0.491 -0.323,-0.988 -0.639,-1.252c-2.418,-2.023 -7.048,-3.14 -10.19,-3.406" fill="#d6e5e5"></path><path d="M24.471,24.527c-1.434,-0.407 -2.565,-0.288 -3.803,-0.26c-0.656,0.015 -2.594,0.178 -3.238,0.307c-1.562,0.312 -1.997,0.42 -3.559,0.732c-0.36,0.072 -0.728,0.144 -1.093,0.098c-0.594,-0.075 -1.134,-0.488 -1.363,-1.042c-0.078,-0.188 -0.121,-0.401 -0.06,-0.595c0.08,-0.254 0.073,-0.851 0.883,-1.153c3.186,-1.185 4.792,-1.124 7.516,-1.324c3.498,-0.256 5.457,0.393 8.136,0.926c1.751,0.348 3.585,1.101 5.257,1.728c1.279,0.479 2.409,0.881 2.669,2.043c0.082,0.368 -0.024,1.064 -0.275,1.346c-0.175,0.196 -0.335,0.42 -0.594,0.463c-0.83,0.139 -1.603,-0.388 -2.385,-0.697c-0.535,-0.211 -1.46,-0.549 -1.998,-0.755c-1.724,-0.66 -3.123,-1.179 -6.137,-1.819" fill="#d6e5e5"></path><path d="M24.634,18.143c-3.739,-0.572 -7.626,-0.157 -11.299,0.749c-0.453,0.112 -0.91,0.235 -1.376,0.223c-0.466,-0.012 -0.952,-0.182 -1.232,-0.555c-0.24,-0.32 -0.425,-0.593 -0.473,-0.99c-0.036,-0.3 0.06,-0.764 0.195,-1.034c0.109,-0.217 0.312,-0.37 0.515,-0.504c1.055,-0.697 2.299,-1.105 3.562,-1.17c0.749,-0.038 1.578,-0.332 2.324,-0.401c0.678,-0.063 2.676,-0.278 3.357,-0.251c3.683,0.15 3.407,-0.15 7.095,0.311c0.611,0.076 1.725,0.374 2.329,0.492c1.062,0.207 1.414,0.274 2.433,0.638c0.992,0.354 1.545,0.437 2.079,0.685c0.604,0.281 1.476,0.599 2.061,0.918c1.369,0.746 1.57,0.695 2.399,1.582c0.724,0.774 0.249,1.991 -0.142,2.364c-0.223,0.213 -0.424,0.299 -0.718,0.392c-0.997,0.318 -2.069,-0.078 -3.029,-0.495c-2.248,-0.977 -4.478,-2.116 -6.906,-2.446c-0.969,-0.131 -1.729,-0.333 -3.15,-0.508" fill="#d6e5e5"></path><path d="M32.703,33.979c-0.151,0 -0.306,-0.026 -0.459,-0.079c-0.455,-0.154 -1.695,-0.744 -2.691,-1.218l-0.622,-0.296c-1.378,-0.649 -4.297,-1.354 -5.679,-1.372c-3.378,-0.043 -4.939,0.096 -8.93,0.632c-0.938,0.13 -1.716,-0.114 -2.131,-0.661c-0.233,-0.307 -0.33,-0.702 -0.274,-1.114c0.069,-0.502 0.356,-0.988 0.767,-1.3c0.643,-0.485 1.443,-0.585 2.086,-0.664c0.342,-0.042 0.688,-0.091 1.037,-0.14c0.638,-0.089 1.28,-0.178 1.908,-0.234c0.606,-0.055 1.064,-0.101 1.437,-0.139c1.369,-0.138 1.627,-0.165 3.733,-0.059c0.032,-0.003 0.065,-0.003 0.098,-0.001c3.467,0.293 8.048,1.495 10.47,3.521c0.686,0.573 0.969,1.206 0.796,1.779c-0.16,0.531 -0.508,0.977 -0.93,1.193c-0.197,0.101 -0.404,0.152 -0.616,0.152zM22.171,30.006c0.345,0 0.708,0.003 1.093,0.008c1.649,0.021 4.728,0.824 6.092,1.468l0.626,0.297c0.922,0.438 2.184,1.039 2.585,1.175c0.107,0.037 0.198,0.033 0.294,-0.016c0.178,-0.091 0.351,-0.329 0.43,-0.592c0.045,-0.151 -0.152,-0.449 -0.48,-0.724c-2.226,-1.861 -6.645,-3.004 -9.842,-3.286c-0.021,0.002 -0.043,0.003 -0.065,0.001c-2.094,-0.105 -2.301,-0.085 -3.651,0.052c-0.376,0.038 -0.837,0.085 -1.448,0.14c-0.611,0.055 -1.238,0.143 -1.859,0.229c-0.354,0.049 -0.706,0.098 -1.052,0.141c-0.552,0.068 -1.178,0.146 -1.606,0.47c-0.197,0.149 -0.347,0.4 -0.379,0.639c-0.021,0.15 0.006,0.276 0.079,0.372c0.28,0.367 0.99,0.302 1.203,0.276c3.592,-0.484 5.245,-0.65 7.98,-0.65z" fill="#010101"></path><path d="M34.669,28.319c-0.638,0 -1.221,-0.271 -1.746,-0.515c-0.182,-0.084 -0.362,-0.168 -0.545,-0.24c-0.316,-0.124 -0.771,-0.294 -1.199,-0.454l-0.794,-0.299c-1.605,-0.614 -2.991,-1.146 -6.062,-1.796c-0.046,-0.01 -0.089,-0.025 -0.129,-0.047c-1.079,-0.282 -1.989,-0.252 -2.951,-0.219l-0.564,0.017c-0.648,0.015 -2.547,0.177 -3.152,0.297c-0.767,0.153 -1.262,0.258 -1.752,0.361c-0.508,0.106 -1.011,0.213 -1.806,0.371c-0.375,0.076 -0.803,0.162 -1.253,0.104c-0.774,-0.098 -1.465,-0.627 -1.762,-1.348c-0.139,-0.336 -0.164,-0.651 -0.074,-0.937c0.094,-0.428 0.244,-1.12 1.186,-1.47c2.804,-1.043 4.462,-1.148 6.561,-1.281c0.347,-0.021 0.708,-0.045 1.092,-0.073c2.94,-0.213 4.855,0.201 6.884,0.643c0.447,0.097 0.905,0.196 1.387,0.292c1.528,0.304 3.076,0.892 4.573,1.461l0.762,0.289c1.351,0.506 2.667,0.999 2.98,2.401c0.115,0.511 -0.018,1.371 -0.392,1.789c-0.236,0.273 -0.479,0.555 -0.883,0.622c-0.123,0.023 -0.243,0.032 -0.361,0.032zM24.667,24.066c3.052,0.653 4.456,1.19 6.076,1.812l0.787,0.296c0.434,0.162 0.895,0.334 1.216,0.461c0.199,0.078 0.399,0.171 0.599,0.263c0.537,0.25 1.044,0.483 1.521,0.405c0.048,-0.008 0.158,-0.136 0.23,-0.22l0.071,-0.081c0.113,-0.128 0.221,-0.643 0.162,-0.904c-0.187,-0.833 -0.987,-1.172 -2.278,-1.656l-0.844,-0.318c-1.458,-0.555 -2.966,-1.129 -4.413,-1.416c-0.487,-0.097 -0.95,-0.197 -1.403,-0.296c-2.042,-0.442 -3.804,-0.825 -6.599,-0.621c-0.388,0.028 -0.752,0.051 -1.103,0.073c-2.096,0.133 -3.61,0.229 -6.276,1.221c-0.428,0.159 -0.477,0.386 -0.534,0.648c-0.015,0.071 -0.03,0.134 -0.046,0.186c-0.006,0.02 -0.021,0.095 0.044,0.253c0.16,0.389 0.547,0.685 0.963,0.737c0.287,0.033 0.616,-0.029 0.932,-0.093c0.791,-0.157 1.291,-0.263 1.796,-0.369c0.494,-0.104 0.991,-0.209 1.763,-0.363c0.667,-0.133 2.643,-0.301 3.325,-0.316l0.553,-0.017c1.035,-0.035 2.107,-0.07 3.398,0.295c0.02,0.005 0.04,0.013 0.06,0.02z" fill="#010101"></path><path d="M36.972,22.208c-0.859,0 -1.702,-0.326 -2.455,-0.652c-0.361,-0.157 -0.722,-0.318 -1.083,-0.479c-1.83,-0.817 -3.723,-1.662 -5.691,-1.93c-0.415,-0.057 -0.793,-0.125 -1.199,-0.199c-0.533,-0.099 -1.118,-0.205 -1.914,-0.304c-0.023,0 -0.047,-0.002 -0.07,-0.006c-3.32,-0.51 -7.055,-0.259 -11.104,0.74l-0.103,0.025c-0.447,0.11 -0.906,0.23 -1.406,0.212c-0.681,-0.018 -1.271,-0.292 -1.618,-0.755c-0.275,-0.367 -0.507,-0.714 -0.569,-1.23c-0.046,-0.382 0.06,-0.948 0.245,-1.318c0.162,-0.322 0.438,-0.533 0.687,-0.697c1.136,-0.749 2.454,-1.182 3.811,-1.251c0.359,-0.019 0.75,-0.105 1.165,-0.197c0.374,-0.082 0.761,-0.168 1.139,-0.203l0.45,-0.043c1.202,-0.117 2.422,-0.229 2.975,-0.209c1.384,0.058 2.219,0.048 2.89,0.043c1.161,-0.011 1.925,-0.019 4.246,0.271c0.412,0.052 1.022,0.193 1.561,0.318c0.302,0.07 0.586,0.136 0.802,0.179c1.076,0.209 1.464,0.284 2.506,0.657c0.442,0.157 0.795,0.26 1.097,0.348c0.376,0.11 0.701,0.204 1.025,0.355c0.223,0.104 0.484,0.212 0.753,0.324c0.468,0.195 0.951,0.397 1.337,0.608c0.334,0.182 0.598,0.315 0.817,0.428c0.703,0.356 1.023,0.52 1.708,1.25c0.946,1.012 0.396,2.535 -0.163,3.068c-0.284,0.271 -0.549,0.392 -0.91,0.507c-0.312,0.099 -0.622,0.14 -0.929,0.14zM24.673,17.644c0.015,0.001 0.031,0.002 0.046,0.004c0.836,0.102 1.447,0.214 2.004,0.315c0.391,0.072 0.754,0.139 1.153,0.193c2.111,0.286 4.069,1.16 5.964,2.007c0.358,0.159 0.716,0.319 1.074,0.475c0.855,0.373 1.839,0.744 2.678,0.478c0.248,-0.079 0.375,-0.135 0.524,-0.277c0.229,-0.218 0.624,-1.126 0.123,-1.661c-0.563,-0.602 -0.765,-0.704 -1.431,-1.042c-0.227,-0.115 -0.498,-0.254 -0.843,-0.441c-0.341,-0.187 -0.8,-0.378 -1.243,-0.563c-0.282,-0.117 -0.556,-0.231 -0.789,-0.34c-0.256,-0.119 -0.533,-0.2 -0.884,-0.302c-0.317,-0.093 -0.688,-0.201 -1.153,-0.367c-0.972,-0.347 -1.312,-0.413 -2.322,-0.61c-0.266,-0.052 -0.561,-0.12 -0.876,-0.193c-0.514,-0.119 -1.097,-0.255 -1.458,-0.3c-2.255,-0.281 -2.995,-0.275 -4.112,-0.264c-0.683,0.006 -1.531,0.015 -2.941,-0.043c-0.526,-0.028 -2.029,0.124 -2.835,0.204l-0.455,0.044c-0.315,0.029 -0.655,0.104 -1.015,0.184c-0.437,0.097 -0.887,0.196 -1.33,0.219c-1.179,0.061 -2.324,0.437 -3.312,1.088c-0.139,0.092 -0.288,0.2 -0.344,0.312c-0.098,0.194 -0.168,0.56 -0.146,0.75c0.03,0.251 0.141,0.435 0.376,0.751c0.159,0.212 0.475,0.345 0.844,0.354c0.368,0.025 0.741,-0.083 1.139,-0.183l0.104,-0.025c4.166,-1.031 8.021,-1.288 11.46,-0.767z" fill="#010101"></path></g></g>
                  </svg>
                </button>
              </div>
            </div>

            <div className="track-info">
              <h2>{songName}</h2>
              <p>{artistName}</p>
            </div>

            <div className="controls">
              <div 
                className="progress-container"
              >
                <div 
                  className="progress-bar"
                  style={{ width: `${(position / duration) * 100}%` }}
                />
              </div>
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
        style={{ width: '800px', height: '800px', zIndex: '1000' }} 
      />
      
     
    </div>
  );
} 