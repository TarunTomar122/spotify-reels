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

  const nextSong = async () => {
    setIsLoading(true);

    const randomChance = Math.random();

    if (randomChance < 0.2) {
      // console.log('getting songs by artist type');
      const similarSongData = await getSimilarSongsFromLastFM(currentSong.songName, currentSong.artistName);
      setCurrentGenre(similarSongData.genreName);
      setCurrentSong(similarSongData);
    } else {
      // console.log('getting random song by genre');
      const randomSongData = await getARandomSongFromLastFMByGenre(currentGenre);
      setCurrentGenre(randomSongData.genreName);
      setCurrentSong(randomSongData);
    }
    setIsLoading(false);
  }

  const handlers = useSwipeable({
    onSwipedLeft: async () => {
      setShowFeedback('left');
      setIsLoading(true);
      const randomSongData = await getARandomSongFromLastFM();

      // console.log("randomSongData", randomSongData);
      setCurrentGenre(randomSongData.genreName);
      setCurrentSong(randomSongData);
      setIsLoading(false);
    },
    onSwipedRight: async () => {
      setShowFeedback('right');
      setIsLoading(true);
      const sameArtistData = await getSongsFromTheSameArtist(currentSong.artistName);
      setCurrentGenre(sameArtistData.genreName);
      setCurrentSong(sameArtistData);
      setIsLoading(false);
    },
    onSwipedUp: async () => {
      setShowFeedback('up');
      nextSong();
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleGenreChange = (genre) => {
    // console.log('Genre changed to:', genre);
    // Add your logic here to handle the genre change
    getARandomSongFromLastFMByGenre(genre).then((data) => {
      // console.log('data', genre);
      setCurrentSong(data);
      setIsLoading(false);
      setFirstLoad(false);
      setCurrentGenre(genre);
    });
  };

  if (firstLoad) {
    return (
        <div className="music-reel-container">
            <div className="first-load-container">
                <h2> Choose a genre to get started</h2>

                <div className="genre-buttons"> 
                    <button className="genre-button" onClick={() => handleGenreChange('house')}>
                        <span>House</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('uk garage')}>
                        <span>Uk Garage</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('dubstep')}>
                      <span>Dubstep</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('drum and bass')}>
                        <span>Drum and Bass</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('rock')}>
                        <span>Rock</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('metal')}>  
                      <span>Metal</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('alternative rock')}>
                        <span>Alternative Rock</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('indie')}>
                        <span>Indie</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('pop')}>
                        <span>Pop</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('jazz')}>
                        <span>Jazz</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('desi hip-hop')}>
                        <span>Desi Hip Hop</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('hip-hop')}>
                        <span>Hip-Hop</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('edm')}>
                        <span>EDM</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('rap')}>
                        <span>Rap</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('bollywood')}>
                        <span>Bollywood</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('rnb')}>  
                      <span>r&b</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('disco')}>
                      <span>Disco</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('techno')}>
                      <span>Techno</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('classical')}>
                      <span>Classical</span>
                    </button>
                    <button className="genre-button" onClick={() => handleGenreChange('folk')}>
                      <span>Folk</span>
                    </button>
                    
                </div>
                <p>Copyright 2025 @tarat</p>
            </div>
        </div>
    )
  }

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
              firstLoad={firstLoad}
              genreName={currentGenre}
              updateFirstLoad={() => setFirstLoad(true)}
              scrollToNextSong={() => {
                nextSong();
              }}
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
