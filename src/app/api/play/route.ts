import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function POST(request: Request) {
  try {
    const { trackId } = await request.json();
    
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET,
      redirectUri: 'https://www.tarat.space/'
    });

    const authResponse = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(authResponse.body['access_token']);
    
    // Play the track on the active device
    await spotifyApi.play({
      uris: [`spotify:track:${trackId}`]
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error playing track:', error);
    return NextResponse.json({ error: 'Failed to play track' }, { status: 500 });
  }
} 