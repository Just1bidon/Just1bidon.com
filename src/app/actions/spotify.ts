"use server";

interface TokenData {
  accessToken: string;
  expiresAt: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  followers?: {
    total: number;
  };
  images?: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres?: string[];
}

// Cache en mémoire pour stocker le token côté serveur
let tokenCache: TokenData | null = null;

export async function getSpotifyToken(): Promise<TokenData> {
  // Vérifier si on a un token valide en cache
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Les identifiants Spotify ne sont pas configurés');
  }
  
  const tokenEndpoint = 'https://accounts.spotify.com/api/token';
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération du token: ${response.status}`);
    }
    
    const data = await response.json();
    const expiresAt = Date.now() + (data.expires_in * 1000);
    
    // Mettre à jour le cache
    tokenCache = {
      accessToken: data.access_token,
      expiresAt
    };
    
    return tokenCache;
  } catch (error) {
    console.error('Erreur d\'authentification Spotify:', error);
    throw error;
  }
}

export async function testSpotifyAPI(token: string): Promise<SpotifyArtist> {
  try {
    const artistId = "0LnhY2fzptb0QEs5Q5gM7S"; // Laylow
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du test de l\'API:', error);
    throw error;
  }
} 