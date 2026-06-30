import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

import { 
  spotifyLogin, 
  exchangeCodeForToken, 
  getCurrentUser,
  getTopSongs,
  type Album,
} from './spotify'

import './App.css'

function App() {
  const hasHandledSpotifyCallback = useRef(false)

  //Used for hilighting the input text box
  const inputRef = useRef<HTMLInputElement>(null)

  //Used to hold the user's guess 
  const[guess, setGuess] = useState('')

  //Used for game end control
  const[finish, setFinish] = useState(false)

  //Used for adjusting toast alert duration
  const ALERTFADEDURATION = 3000

  //Used for tracking attempts
  const[attempts, setAttempts] = useState(0)
  const[boxStates, setBoxStates] = useState<('empty' | 'wrong' | 'correct')[]>(Array(6).fill('empty'))

  //Used for adjusting blur
  const[blur, setBlur] = useState(70)
  const BLURREDUCTION = 14

  //Album list used for testing
  // const testRepeatAlbums = [
  //   { name: "Thriller", artist: "Michael Jackson", image: "/Album Covers/Thriller.jpg" },
  //   { name: "Nevermind", artist: "Nirvana", image: "/Album Covers/Nevermind.jpg" },
  // ]

  //Hard coded list of top albums 
  const topAlbumsOAT= [
  { name: "Abbey Road", artist: "The Beatles", image: "/Assets/55RJTiPQU.jpg" },
  { name: "The Dark Side of the Moon", artist: "Pink Floyd", image: "/Assets/LdHaV0pD.jpg" },
  { name: "Rumours", artist: "Fleetwood Mac", image: "/Assets/8F0Q880Z.jpg" },
  { name: "Thriller", artist: "Michael Jackson", image: "/Assets/eKKs1s8m.jpg" },
  { name: "Nevermind", artist: "Nirvana", image: "/Assets/t8vGtNnM.jpg" },
  { name: "OK Computer", artist: "Radiohead", image: "/Assets/R5LuAE0m.jpg" },
  { name: "To Pimp a Butterfly", artist: "Kendrick Lamar", image: "/Assets/dYkvs8ys.jpg" },
  { name: "Blonde", artist: "Frank Ocean", image: "/Assets/a06mn7G0.jpg" },
  { name: "Illmatic", artist: "Nas", image: "/Assets/vv8CC3F5.jpg" },
  { name: "The College Dropout", artist: "Kanye West", image: "/Assets/RJfT8Thk.jpg" },

  { name: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", image: "/Assets/orvmkJk7.jpg" },
  { name: "good kid, m.A.A.d city", artist: "Kendrick Lamar", image: "/Assets/ck9E5bm9.jpg" },
  { name: "Back to Black", artist: "Amy Winehouse", image: "/Assets/bbw0yPeL.jpg" },
  { name: "Purple Rain", artist: "Prince", image: "/Assets/cN4TTGK4.jpg" },
  { name: "Kid A", artist: "Radiohead", image: "/Assets/YP1VUMcx.jpg" },
  { name: "Sgt. Pepper's Lonely Hearts Club Band", artist: "The Beatles", image: "/Assets/cX046FKJ.jpg" },
  { name: "The Wall", artist: "Pink Floyd", image: "/Assets/ruBx25sV.jpg" },
  { name: "London Calling", artist: "The Clash", image: "/Assets/1cHmpi5i.jpg" },
  { name: "The Velvet Underground & Nico", artist: "The Velvet Underground", image: "/Assets/wmYk9qgt.jpg" },
  { name: "Pet Sounds", artist: "The Beach Boys", image: "/Assets/xK5DFhDz.jpg" },

  { name: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", image: "/Assets/4kM0dMMh.jpg" },
  { name: "Graduation", artist: "Kanye West", image: "/Assets/jQ59Rhez.jpg" },
  { name: "DAMN.", artist: "Kendrick Lamar", image: "/Assets/FXheVfV6.jpg" },
  { name: "IGOR", artist: "Tyler, The Creator", image: "/Assets/rJyYsF4z.jpg" },
  { name: "Flower Boy", artist: "Tyler, The Creator", image: "/Assets/JdpPW2kW.jpg" },
  { name: "Channel Orange", artist: "Frank Ocean", image: "/Assets/qdRcHq7J.jpg" },
  { name: "1989", artist: "Taylor Swift", image: "/Assets/D5EirHZg.jpg" },
  { name: "Emotion", artist: "Carly Rae Jepsen", image: "/Assets/DM3B3ewj.jpg" },
  { name: "Future Nostalgia", artist: "Dua Lipa", image: "/Assets/ey9TakM1.jpg" },
  { name: "Melodrama", artist: "Lorde", image: "/Assets/11hLgDZY.jpg" },

  { name: "Currents", artist: "Tame Impala", image: "/Assets/92zF6Nt2.jpg" },
  { name: "In Rainbows", artist: "Radiohead", image: "/Assets/pEAhDPu1.jpg" },
  { name: "Is This It", artist: "The Strokes", image: "/Assets/7J4hFQdz.jpg" },
  { name: "AM", artist: "Arctic Monkeys", image: "/Assets/F3fHjx09.jpg" },
  { name: "Funeral", artist: "Arcade Fire", image: "/Assets/Vb1zABqC.jpg" },
  { name: "The Suburbs", artist: "Arcade Fire", image: "/Assets/t2bXRUHH.jpg" },
  { name: "The Queen Is Dead", artist: "The Smiths", image: "/Assets/1KVjpGH8.jpg" },
  { name: "Disintegration", artist: "The Cure", image: "/Assets/TcAX0z8y.jpg" },
  { name: "Loveless", artist: "My Bloody Valentine", image: "/Assets/qH41tWKW.jpg" },
  { name: "Grace", artist: "Jeff Buckley", image: "/Assets/nzrfgyp2.jpg" },

  { name: "Songs in the Key of Life", artist: "Stevie Wonder", image: "/Assets/1gmEiNvW.jpg" },
  { name: "What's Going On", artist: "Marvin Gaye", image: "/Assets/J9KeKvps.jpg" },
  { name: "Innervisions", artist: "Stevie Wonder", image: "/Assets/gA0bh3AC.jpg" },
  { name: "Blue", artist: "Joni Mitchell", image: "/Assets/AtDE6Xcu.jpg" },
  { name: "A Love Supreme", artist: "John Coltrane", image: "/Assets/WB5Xwz20.jpg" },
  { name: "Kind of Blue", artist: "Miles Davis", image: "/Assets/WGXP5x6U.jpg" },
  { name: "Discovery", artist: "Daft Punk", image: "/Assets/5Ea8zR53.jpg" },
  { name: "Random Access Memories", artist: "Daft Punk", image: "/Assets/bEZogj9C.jpg" },
  { name: "Rodeo", artist: "Travis Scott", image: "/Assets/1ZX01epC.jpg" },
  { name: "The Black Album", artist: "Jay-Z", image: "/Assets/mt8GhQzN.jpg" },

  { name: "Dummy", artist: "Portishead", image: "/Assets/0cpyD79A.jpg"},
  { name: "Master Of Puppets", artist: "Metallica", image: "/Assets/zxpYb3oB.jpg"},
  ]

  //Used for keeping track of the index of used albums
  const albumKey = (album: Album) => 
    album.id ?? `${album.name.trim().toLowerCase()}-${album.artist.trim().toLowerCase()}`

  const getUniqueAlbums = (albumList: Album[]) => {
    const seen = new Set<string>()

    return albumList.filter((album) => {
      const key = albumKey(album)

      if (seen.has(key)) return false

      seen.add(key)
      return true
    })
  }

  const[albums, setAlbums] = useState<Album[]>(() => getUniqueAlbums(topAlbumsOAT))
  const[albumNum, setAlbumNum] = useState(()=>Math.floor(Math.random() * albums.length))
  const usedRef = useRef<Set<string>>(new Set([albumKey(albums[albumNum])]))

  //Marks off a box with an X upon an incorrect guess 
  const boxFail = (boxNum: number) => {
    setBoxStates((prev) => 
      prev.map((value, index) => (index === boxNum ? 'wrong' : value)))
  }

  //Marks off a box with a check upon a correct guess 
  const boxSucc = (boxNum: number) => {
    setBoxStates((prev) => 
      prev.map((value, index) => (index === boxNum ? 'correct' : value)))
  }

  useEffect(() => {
    async function handleSpotifyCallback() {
      if (hasHandledSpotifyCallback.current) return 
      hasHandledSpotifyCallback.current = true

      const code = new URLSearchParams(window.location.search).get('code')

      if (!code) return

      try {
        await exchangeCodeForToken(code)
        await getCurrentUser()

        //const albums = await getSavedAlbums()
        const spotifyAlbums = getUniqueAlbums(await getTopSongs())
        const firstAlbumNum = Math.floor(Math.random() * spotifyAlbums.length)

        setAlbums(spotifyAlbums)
        setAlbumNum(firstAlbumNum)
        usedRef.current = new Set([albumKey(spotifyAlbums[firstAlbumNum])])
         
        window.history.replaceState({}, document.title, '/')
      } catch (error) {
        console.error('Spotify callback failed: ', error)
      }
    }
  handleSpotifyCallback()
  }, [])

  //Switches the album to a new one
  const newAlbum = () => {
    if (usedRef.current.size >= albums.length) {
      toast.success("YOU RAN OUT OF ALBUMS!")
      return
      //usedRef.current.clear()
    }

    let candidate: Album
    let randAlbumNum: number

    do {
      randAlbumNum = Math.floor(Math.random() * albums.length)
      candidate = albums[randAlbumNum]
    } while (usedRef.current.has(albumKey(candidate)))

    usedRef.current.add(albumKey(candidate))
    setAlbumNum(randAlbumNum)

    setAttempts(0)
    setFinish(false)
    setBlur(70)
    setBoxStates(Array(6).fill('empty'))

    setGuess('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  //Handles logic for inputted guesses
  const handleGuess = () => {
    toast.dismissAll() //Dismisses any existing toasts before showing a new one
    if (guess.trim().toLowerCase() === '') { //If the user enters a blank guess, print an error message but do not reduce the blur
      toast.error('Please enter a guess before submitting.')
      return
    }

    if (guess.trim().toLowerCase() === albums[albumNum].name.toLowerCase()) { //If user guesses correctly, show a success message and end the game
      toast.success('Correct! The album is "' + albums[albumNum].name + '" by ' + albums[albumNum].artist + '.')

      //Win blur conditions
      setBlur(0)

      //Win box conditions
      boxSucc(attempts)
      setFinish(true)
      return
    } else { //If the guess is incorrect, handles game logic
      if (attempts === 5) { //If the user has run out of attempts, show a game over message and end the game
        toast.error('You have run out of attempts. The album was "' + albums[albumNum].name + '" by ' + albums[albumNum].artist + '.')

        //Loss blur conditions
        setBlur(0)

        //Loss box conditions
        boxFail(attempts)
        setAttempts(attempts + 1)
        setFinish(true)
      } else { //If the user still has attempts left, show an error message and reduce the blur
        //Attempt box conditions
        boxFail(attempts)
        setAttempts(attempts + 1)

        //Attempt blur conditions
        setBlur(blur - BLURREDUCTION)
      }
    }
    setGuess('')
  }

  return (
    <div> 
      <div>
        <button
          onClick={spotifyLogin}> 
            Spotify Login
        </button>
      </div>

      <h1>UNTITLED</h1>

      <Toaster //Used for win and lose popups 
        position="bottom-center"
        toastOptions={{ duration: ALERTFADEDURATION }}
       />

      <div className="album-container">
        {albums.length > 0 && (
        <img //Used for holding the album cover image and applies the blur effect 
          src={albums[albumNum].image}
          alt="Album Cover"
          className="album-cover"
          style={{ filter: `blur(${blur}px)` }}
          draggable='false'
        />  
        )}
      </div>
        
      {boxStates.map((state, index) => (
        //Used for mapping the guess box states
        <div key={index} className={`guess-boxes ${state}`} />
      ))}
      
      <div className="guess-container">
        <input //Used for entering in your album guess 
          value={guess} 
          onChange={(e) => setGuess(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          
          autoFocus
          
          disabled={finish}
          ref={inputRef}
          type="text" placeholder="Enter your guess..." 
          className="guess-input"
          id="guessInput"/>

        <button //Used for submitting a guess
          onClick={handleGuess}
          disabled={finish} 
          className="guess-button">
            Guess
        </button>

        <button //Used for continuing to the next album cover
          onClick={newAlbum}
          disabled={!finish}
          id="nextButton">
            Next Album
        </button>
      </div>

    </div>
  )
}

export default App;
