'use server';

import SpotifyWebApi from 'spotify-web-api-node';

async function getSpotifyTrackInfo(trackName: string, artistName: string) {
    try {
        if (!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || !process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET) {
            throw new Error('Spotify credentials are not configured');
        }
        
        const spotifyApi = new SpotifyWebApi({
            clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
            redirectUri: 'https://www.tarat.space/'
        });

        const response = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(response.body['access_token']);

        const searchResponse = await spotifyApi.searchTracks(`${trackName} ${artistName}`);
        if (!searchResponse.body.tracks) {
            throw new Error('No tracks found in search response');
        }
        
        const track = searchResponse.body.tracks.items[0];

        if (!track) {
            throw new Error('No track found on Spotify');
        }
        
        // Get track ID, preview URL, and album art
        const trackId = track.id;
        const previewUrl = track.preview_url;
        const albumArt = track.album.images[0]?.url || '';
        
        // Also get the embed HTML for fallback
        const embedHtml = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/${trackId}?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
        
        return { 
            trackId, 
            previewUrl, 
            albumArt, 
            embedHtml 
        };
    } catch (error) {
        console.error('Error getting Spotify track info:', error);
        return { 
            trackId: null, 
            previewUrl: null, 
            albumArt: null, 
            embedHtml: null 
        };
    }
}

export const getARandomSongFromLastFM = async () => {
    try {
        const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptags&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`,
            { 
                cache: 'no-store',
                next: { revalidate: 0 }  // Force revalidation
            }
        );
        const data = await response.json();
        
        // get a random tag from the top tags
        const randomTag = data.tags.tag[Math.floor(Math.random() * data.tags.tag.length)];

        // get a random song from the tag
        const randomSongResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${randomTag.name}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);
        const randomSongData = await randomSongResponse.json();
        const randomSong = randomSongData.tracks.track[Math.floor(Math.random() * randomSongData.tracks.track.length)];

        const songName = randomSong.name;
        const artistName = randomSong.artist.name;
        const trackInfo = await getSpotifyTrackInfo(songName, artistName);
        
        return { 
            songName, 
            artistName, 
            ...trackInfo 
        };
    } catch(error) {
        console.error('Error getting a random song from LastFM:', error);
        return null;
    }
}

export const getSimilarSongsFromLastFM = async (songName: string, artistName: string) => {

    // get the tags of the song
    const tagsResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getinfo&artist=${artistName}&track=${songName}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);
    const tagsData = await tagsResponse.json();
    const tags = tagsData.track.toptags.tag;

    // get a random tag
    const randomTag = tags[Math.floor(Math.random() * tags.length)];

    const topTag = randomTag.name;

    // get the similar songs based on the top tag
    const similarSongsResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${topTag}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);
    const similarSongsData = await similarSongsResponse.json();
    const similarSongs = similarSongsData.tracks.track;

    // get a random song from the similar songs
    const randomSong = similarSongs[Math.floor(Math.random() * similarSongs.length)];
    const trackInfo = await getSpotifyTrackInfo(randomSong.name, randomSong.artist.name);

    return { 
        songName: randomSong.name, 
        artistName: randomSong.artist.name, 
        ...trackInfo 
    };
}

export const getSongsFromTheSameArtist = async (artistName: string) => {
    const similarSongsResponse = await fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${artistName}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);
    const similarSongsData = await similarSongsResponse.json();
 
    const randomSong = similarSongsData.toptracks.track[Math.floor(Math.random() * similarSongsData.toptracks.track.length)];

    const trackInfo = await getSpotifyTrackInfo(randomSong.name, randomSong.artist.name);

    return { 
        songName: randomSong.name, 
        artistName: randomSong.artist.name, 
        ...trackInfo 
    };
}

export const getARandomSongFromLastFMByGenre = async (genre: string) => {
    const genreFormatted = genre.replace(/ /g, '+');
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${genreFormatted}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);
    const data = await response.json();
    const tracks = data.tracks.track;

    console.log('tracks', `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${genreFormatted}&api_key=${process.env.NEXT_PUBLIC_LASTFM_API_KEY}&format=json`);

    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    const trackInfo = await getSpotifyTrackInfo(randomTrack.name, randomTrack.artist.name);

    return { 
        songName: randomTrack.name, 
        artistName: randomTrack.artist.name, 
        ...trackInfo 
    };
}
