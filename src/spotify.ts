const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = `${window.location.origin}/callback`

export type Album = {
    name: string
    artist: string
    image: string
}

function randomString(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map((x) => chars[x % chars.length])
        .join('')
}

async function sha256(text: string) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
}

function base64UrlEncode(buffer: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

export async function spotifyLogin() {
    const verifier = randomString(64)
    const challenge = base64UrlEncode(await sha256(verifier))

    localStorage.setItem('spotify_code_verifier', verifier)

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        scope: [
            'user-library-read',
            'user-top-read',
            'playlist-read-private'
        ].join(' '),
        code_challenge_method: 'S256',
        code_challenge: challenge,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(code: string) {
    const verifier = localStorage.getItem('spotify_code_verifier')

    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier ?? '',
    })

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    })

    const data = await res.json()
    console.log('TOKEN RESPONSE:', data)

    if (!res.ok) {
        throw new Error(data.error_description || 'Token exchange failed')
    }

    localStorage.setItem('spotify_access_token', data.access_token)
    return data.access_token
}

export async function getCurrentUser() {
    const token = localStorage.getItem('spotify_access_token')

    const res = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText)
    }    

    return await res.json()
}

export async function getSavedAlbums(): Promise<Album[]> {
    const token = localStorage.getItem('spotify_access_token')

    const res = await fetch('https://api.spotify.com/v1/me/albums?limit=50', 
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await res.json()

    return data.items.map((item: any) => ({
        name: item.album.name,
        artist: item.album.artists.map((artist: any) => artist.name).join(', '),
        image: item.album.images[0]?.url,
    }))
}

export async function getTopSongs(): Promise<Album[]> {
    const token = localStorage.getItem('spotify_access_token')

    const res = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await res.json()

    return data.items.map((track: any) => ({
        name: track.album.name,
        artist: track.album.artists.map((artist: any) => artist.name).join(', '),
        image: track.album.images[0]?.url,
    }))
}