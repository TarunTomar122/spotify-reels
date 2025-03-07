import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './MusicNavCard.css';
import { getARandomSongFromLastFM, getSimilarSongsFromLastFM, getSongsFromTheSameArtist, getARandomSongFromLastFMByGenre } from '../app/actions/spotify';
import SpotifyIframePlayer from './SpotifyIframePlayer';

export default function MusicNavCard({ onChangeGenre, onDifferentTypes, onMoreSame }) {


  const [showFeedback, setShowFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [firstLoad, setFirstLoad] = useState(true);
  const [currentGenre, setCurrentGenre] = useState('');

  const [currentSong, setCurrentSong] = useState({
    songName: '',
    artistName: '',
    embedHtml: ''
  });
  
  useEffect(() => {
    setIsLoading(true);
    getARandomSongFromLastFM().then((data) => {
      if (data) {
        setCurrentSong(data);
        setIsLoading(false);
      }
    });
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: async () => {
      setShowFeedback('left');
      setIsLoading(true);
      const randomSongData = await getARandomSongFromLastFM();

      console.log("randomSongData", randomSongData);

      setCurrentSong(randomSongData);
      setIsLoading(false);
    },
    onSwipedRight: async () => {
      setShowFeedback('right');
      setIsLoading(true);
      const sameArtistData = await getSongsFromTheSameArtist(currentSong.artistName);
      setCurrentSong(sameArtistData);
      setIsLoading(false);
    },
    onSwipedUp: async () => {
      setShowFeedback('up');
      setIsLoading(true);

      const randomChance = Math.random();

      if (randomChance < 0.2) {
        console.log('getting songs by artist type');
        const similarSongData = await getSimilarSongsFromLastFM(currentSong.songName, currentSong.artistName);
        setCurrentSong(similarSongData);
      } else {
        console.log('getting random song by genre');
        const randomSongData = await getARandomSongFromLastFMByGenre(currentGenre);
        setCurrentSong(randomSongData);
      }
      setIsLoading(false);
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleGenreChange = (genre) => {
    console.log('Genre changed to:', genre);
    // Add your logic here to handle the genre change
    getARandomSongFromLastFMByGenre(genre).then((data) => {
      console.log('data', genre);
      setCurrentSong(data);
      setIsLoading(false);
      setFirstLoad(false);
      setCurrentGenre(genre);
    });
  };

  return (
    <div className="music-nav-container">
      <div className={`music-nav-card ${showFeedback ? `swipe-${showFeedback}` : ''}`} {...handlers}>
        <div className="spotify-player-wrapper">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading song...</p>
            </div>
          ) : (
            <SpotifyIframePlayer 
              trackId={currentSong.trackId}
              songName={currentSong.songName}
              artistName={currentSong.artistName}
              albumArt={currentSong.albumArt}
              onGenreChange={handleGenreChange}
              firstLoad={firstLoad}
            />
          )}
        </div>
        
        {/* <div className="gesture-hints">
          <div className="hint left">
            <span className="arrow">←</span>
            <span className="text">a random song</span>
          </div>
          
          <div className="hint right">
            <span className="text">more of the same artist</span>
            <span className="arrow">→</span>
          </div>
          
          <div className="hint up">
            <span className="arrow">↑</span>
            <span className="text">more of the same kind</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};
