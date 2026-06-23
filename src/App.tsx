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
  
  //Used for keeping track of the index of used albums
  const usedRef = useRef<Album[]>([])

  //Used to hold the user's guess 
  const[guess, setGuess] = useState('')

  //Used for game end control
  const[finish, setFinish] = useState(false)

  //Used for counting attempts made and updating blur, guess boxes, and vignette based on that. UI Design components 
  const BLURREDUCTION = 14
  const ALERTFADEDURATION = 3000

  const[attempts, setAttempts] = useState(0)
  const[boxStates, setBoxStates] = useState<('empty' | 'wrong' | 'correct')[]>(Array(6).fill('empty'))
  const[blur, setBlur] = useState(70)
  const[showVignette, setShowVignette] = useState(false)

  const testRepeatAlbums = [
    { name: "Thriller", artist: "Michael Jackson", image: "/Album Covers/Thriller.jpg" },
    { name: "Nevermind", artist: "Nirvana", image: "/Album Covers/Nevermind.jpg" },
  ]

  //Hard coded list of albums 
  // const topAlbumsOAT= [
  // { name: "Abbey Road", artist: "The Beatles", image: "/Album Covers/AbbeyRoad.jpg" },
  // { name: "The Dark Side of the Moon", artist: "Pink Floyd", image: "/Album Covers/DarkSide.jpg" },
  // { name: "Rumours", artist: "Fleetwood Mac", image: "/Album Covers/Rumours.jpg" },
  // { name: "Thriller", artist: "Michael Jackson", image: "/Album Covers/Thriller.jpg" },
  // { name: "Nevermind", artist: "Nirvana", image: "/Album Covers/Nevermind.jpg" },
  // { name: "OK Computer", artist: "Radiohead", image: "/Album Covers/OkComputer.jpg" },
  // { name: "To Pimp a Butterfly", artist: "Kendrick Lamar", image: "/Album Covers/ToPimp.jpg" },
  // { name: "Blonde", artist: "Frank Ocean", image: "/Album Covers/Blonde.jpg" },
  // { name: "Illmatic", artist: "Nas", image: "/Album Covers/Illmatic.jpg" },
  // { name: "The College Dropout", artist: "Kanye West", image: "/Album Covers/CollegeDropout.jpg" },

  // { name: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", image: "/Album Covers/Miseducation.jpg" },
  // { name: "good kid, m.A.A.d city", artist: "Kendrick Lamar", image: "/Album Covers/GoodKid.jpg" },
  // { name: "Back to Black", artist: "Amy Winehouse", image: "/Album Covers/BackToBlack.jpg" },
  // { name: "Purple Rain", artist: "Prince", image: "/Album Covers/PurpleRain.jpg" },
  // { name: "Kid A", artist: "Radiohead", image: "/Album Covers/KidA.jpg" },
  // { name: "Sgt. Pepper's Lonely Hearts Club Band", artist: "The Beatles", image: "/Album Covers/SgtPeppers.jpg" },
  // { name: "The Wall", artist: "Pink Floyd", image: "/Album Covers/TheWall.jpg" },
  // { name: "London Calling", artist: "The Clash", image: "/Album Covers/LondonCalling.jpg" },
  // { name: "The Velvet Underground & Nico", artist: "The Velvet Underground", image: "/Album Covers/VelvetUnderground.jpg" },
  // { name: "Pet Sounds", artist: "The Beach Boys", image: "/Album Covers/PetSounds.jpg" },

  // { name: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", image: "/Album Covers/MBDTF.jpg" },
  // { name: "Graduation", artist: "Kanye West", image: "/Album Covers/Graduation.jpg" },
  // { name: "DAMN.", artist: "Kendrick Lamar", image: "/Album Covers/DAMN.jpg" },
  // { name: "IGOR", artist: "Tyler, The Creator", image: "/Album Covers/IGOR.jpg" },
  // { name: "Flower Boy", artist: "Tyler, The Creator", image: "/Album Covers/FlowerBoy.jpg" },
  // { name: "Channel Orange", artist: "Frank Ocean", image: "/Album Covers/ChannelOrange.jpg" },
  // { name: "1989", artist: "Taylor Swift", image: "/Album Covers/1989.jpg" },
  // { name: "Emotion", artist: "Carly Rae Jepsen", image: "/Album Covers/Emotion.jpg" },
  // { name: "Future Nostalgia", artist: "Dua Lipa", image: "/Album Covers/FutureNostalgia.jpg" },
  // { name: "Melodrama", artist: "Lorde", image: "/Album Covers/Melodrama.jpg" },

  // { name: "Currents", artist: "Tame Impala", image: "/Album Covers/Currents.jpg" },
  // { name: "In Rainbows", artist: "Radiohead", image: "/Album Covers/InRainbows.jpg" },
  // { name: "Is This It", artist: "The Strokes", image: "/Album Covers/IsThisIt.jpg" },
  // { name: "AM", artist: "Arctic Monkeys", image: "/Album Covers/AM.jpg" },
  // { name: "Funeral", artist: "Arcade Fire", image: "/Album Covers/Funeral.jpg" },
  // { name: "The Suburbs", artist: "Arcade Fire", image: "/Album Covers/TheSuburbs.jpg" },
  // { name: "The Queen Is Dead", artist: "The Smiths", image: "/Album Covers/TheQueenIsDead.jpg" },
  // { name: "Disintegration", artist: "The Cure", image: "/Album Covers/Disintegration.jpg" },
  // { name: "Loveless", artist: "My Bloody Valentine", image: "/Album Covers/Loveless.jpg" },
  // { name: "Grace", artist: "Jeff Buckley", image: "/Album Covers/Grace.jpg" },

  // { name: "Songs in the Key of Life", artist: "Stevie Wonder", image: "/Album Covers/SongsInTheKey.jpg" },
  // { name: "What's Going On", artist: "Marvin Gaye", image: "/Album Covers/WhatsGoingOn.jpg" },
  // { name: "Innervisions", artist: "Stevie Wonder", image: "/Album Covers/Innervisions.jpg" },
  // { name: "Blue", artist: "Joni Mitchell", image: "/Album Covers/Blue.jpg" },
  // { name: "A Love Supreme", artist: "John Coltrane", image: "/Album Covers/ALoveSupreme.jpg" },
  // { name: "Kind of Blue", artist: "Miles Davis", image: "/Album Covers/KindOfBlue.jpg" },
  // { name: "Discovery", artist: "Daft Punk", image: "/Album Covers/Discovery.jpg" },
  // { name: "Random Access Memories", artist: "Daft Punk", image: "/Album Covers/RAM.jpg" },
  // { name: "Rodeo", artist: "Travis Scott", image: "/Album Covers/Rodeo.jpg" },
  // { name: "The Black Album", artist: "Jay-Z", image: "/Album Covers/TheBlackAlbum.jpg" },

  // { name: "Dummy", artist: "Portishead", image: "/Album Covers/Dummy.jpg"},
  // { name: "Master Of Puppets", artist: "Metallica", image: "/Album Covers/MasterOf.jpg"},
  // ]

  const [albums, setAlbums] = useState<Album[]>(testRepeatAlbums)

  //Used for randomly picking through the list of albums
  const[albumNum, setAlbumNum] = useState(()=>Math.floor(Math.random() * albums.length))

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
        const albums = await getTopSongs()

        setAlbums(albums)
        setAlbumNum(Math.floor(Math.random() * albums.length))
         
        window.history.replaceState({}, document.title, '/')
      } catch (error) {
        console.error('Spotify callback failed: ', error)
      }
    }
  handleSpotifyCallback()
  }, [])

  //Switches the album to a new one
  const newAlbum = () => {
    //Picks a new album that hasn't been used before
    if (usedRef.current.length >= albums.length) {
      toast.success("YOU WIN!")
      usedRef.current = []
    }

    let candidate: Album
    let randAlbumNum: number
    do {
      randAlbumNum = Math.floor(Math.random() * albums.length)
      candidate = albums[randAlbumNum]
    } while (usedRef.current.some(album => album.name === candidate.name))

    usedRef.current.push(candidate)
    setAlbumNum(randAlbumNum)

    //Resets round ui values
    setAttempts(0)
    setFinish(false)
    setBlur(70)
    setBoxStates(Array(6).fill('empty'))

    setGuess('')
    setTimeout(() => inputRef.current!.focus(), 0)
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
      setShowVignette(false)

      //Win box conditions
      boxSucc(attempts)
      setFinish(true)
      return
    } else { //If the guess is incorrect, handles game logic
      if (attempts === 5) { //If the user has run out of attempts, show a game over message and end the game
        toast.error('You have run out of attempts. The album was "' + albums[albumNum].name + '" by ' + albums[albumNum].artist + '.')

        //Loss blur conditions
        setBlur(-100)

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
    setShowVignette(true)
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

      {showVignette && (<div //Used for applying the vignette overlay 
        className="screen-overlay"
        />
        )}

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
