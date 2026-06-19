const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI

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
        scope: 'user-library-read',
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

  const data = await res.json()

  console.log('CURRENT USER:', data)

  return data
}