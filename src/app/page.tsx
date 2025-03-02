
'use client';

import React from 'react';
import MusicNavCard from '../components/MusicNavCard';
import './HomePage.css';

export default function Page() {

  const handleChangeGenre = () => {
    console.log('Changing genre');
    // Implement your genre change logic here
  };

  const handleDifferentTypes = () => {
    console.log('Finding different types in same genre');
    // Implement your different types logic here
  };

  const handleMoreSame = () => {
    console.log('Finding more of the same kind');
    // Implement your more of same kind logic here
  };

  return (
    <div className="home-page">
      <h1>Music Explorer</h1>
      
      <MusicNavCard 
        onChangeGenre={handleChangeGenre}
        onDifferentTypes={handleDifferentTypes}
        onMoreSame={handleMoreSame}
      />
    </div>
  );
};
