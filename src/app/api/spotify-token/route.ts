import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET() {
  try {
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
      redirectUri: 'https://www.tarat.space/'
    });

    const response = await spotifyApi.clientCredentialsGrant();
    const token = response.body['access_token'];
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
} 