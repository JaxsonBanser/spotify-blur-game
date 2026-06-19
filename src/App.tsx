import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';

import { spotifyLogin, exchangeCodeForToken, getCurrentUser} from './spotify'

import './App.css'

function App() {
  const hasHandledSpotifyCallback = useRef(false)

  //Used for hilighting the input text box
  const inputRef = useRef<HTMLInputElement>(null)
  
  //Used for keeping track of the index of used albums
  const usedRef = useRef<number[]>([])

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

  const revealProgress = 20 - blur*2
  const vignetteSize = 70 - (revealProgress) / 2
  const vignetteOpacity = .5 + (revealProgress) / 100

  //Hard coded list of albums 
  const album = [
    {
      name: 'Feedbacker',
      artist: 'Boris',
      image: '/Feedbacker.jpg'
    },

    {
      name: 'Nevermind',
      artist: 'Nirvana',
      image: '/Nevermind.jpg'
    },

    {
      name: 'Ege Bamyasi',
      artist: 'CAN',
      image: '/EgeBamyasi.jpg'
    },
    {
      name: 'To Pimp A Butterfly',
      artist: 'Kendrick Lamar',
      image: '/TPAB.jpg'
    },
    {
      name: 'In Rainbows',
      artist: 'Radiohead',
      image: '/InRainbows.jpg'
    },
    {
      name: "In the Court of the Crimson King",
      artist: 'King Crimson',
      image: '/InTheCourt.jpg'
    },
    {
      name: 'The Dark Side of the Moon',
      artist: 'Pink Floyd',
      image: '/DarkSide.jpg'
    },
    {
      name: 'Abbey Road',
      artist: 'The Beatles',
      image: '/AbbeyRoad.jpg'
    },
    {
      name: 'OK Computer',
      artist: 'Radiohead',
      image: '/OkComputer.jpg'
    }
  ]

  //Used for randomly picking through the list of albums
  const[albumNum, setAlbumNum] = useState(()=>Math.floor(Math.random() * album.length))

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
        window.history.replaceState({}, document.title, '/')
      } catch (error) {
        console.error('Spotify callback failed: ', error)
      }
    }
  handleSpotifyCallback()
  }, [])

  //Switches the album to a new one
  const newAlbum = () => {
    //Picks a new number that isnt already used 
    if (usedRef.current.length >= album.length) {
      toast.success("YOU WIN!")
      usedRef.current = []
    }

    let candidate: number
    do {
      candidate = Math.floor(Math.random() * album.length)
    } while (usedRef.current.includes(candidate))
 
    usedRef.current.push(candidate)
    setAlbumNum(candidate)

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

    if (guess.trim().toLowerCase() === album[albumNum].name.toLowerCase()) { //If user guesses correctly, show a success message and end the game
      toast.success('Correct! The album is "' + album[albumNum].name + '" by ' + album[albumNum].artist + '.')

      //Win blur conditions
      setBlur(0)
      setShowVignette(false)

      //Win box conditions
      boxSucc(attempts)
      setFinish(true)
      return
    } else { //If the guess is incorrect, handles game logic
      if (attempts === 5) { //If the user has run out of attempts, show a game over message and end the game
        toast.error('You have run out of attempts. The album was "' + album[albumNum].name + '" by ' + album[albumNum].artist + '.')

        //Loss blur conditions
        setBlur(-100)

        //Loss box conditions
        boxFail(attempts)
        setAttempts(attempts + 1)
        setFinish(true)
      } else { //If the user still has attempts left, show an error message and reduce the blur
        //toast.error('Incorrect guess. Try again!')

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
        style = {{background: `radial-gradient(ellipse 60% 60% at 50% 31%, transparent ${vignetteSize}%, rgba(0, 0, 0, ${vignetteOpacity}) 100%)`}}
        />
        )}

      <h1>UNTITLED</h1>

      <Toaster //Used for win and lose popups 
        position="bottom-center"
        toastOptions={{ duration: ALERTFADEDURATION }}
       />

      <div className="album-container">
        <img //Used for holding the album cover image and applies the blur effect 
          src={album[albumNum].image}
          alt="Album Cover"
          className="album-cover"
          style={{ filter: `blur(${blur}px)` }}
        />  
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
