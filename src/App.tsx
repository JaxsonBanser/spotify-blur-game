import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import './App.css'

function App() {

  const[blur, setBlur] = useState(50)
  const[guess, setGuess] = useState('')
  const[showVignette, setShowVignette] = useState(false)
  const[win, setWin] = useState(false)

  const vignetteSize = 70 - (50 - blur*2) / 2
  const vignetteOpacity = .5 + (50 - blur*2) / 100
  
  const BLURREDUCTION = 10

  const ALERTFADEDURATION = 2000

  const handleGuess = async () => { //Handles logic for inputted guesses
    toast.dismissAll() //Dismisses any existing toasts before showing a new one
    if (guess.trim().toLowerCase() === '') { //If the user enters a blank guess, print an error message but do not reduce the blur
      toast.error('Please enter a guess before submitting.')
      return
    }

    if (guess.trim().toLowerCase() === 'feedbacker') { //If user guesses correctly, show a success message and end the game
      toast.success('Correct! The album is "Feedbacker" by Boris.')
      setBlur(0)
      setShowVignette(false)
      setWin(true)
      return
    } else { //If the guess is incorrect, handles game logic
      if (blur - BLURREDUCTION < 0) { //If the user has run out of attempts, show a game over message and end the game
        toast.error('Game over! You have run out of attempts.')
        setBlur(-1)
      } else { //If the user still has attempts left, show an error message and reduce the blur
        toast.error('Incorrect guess. Try again!')
        setBlur(blur - BLURREDUCTION)
      }
    }
    setShowVignette(true)
    setGuess('')
  }

  return (
    <div> 

      {showVignette && (<div 
        className="screen-overlay"
        style = {{background: `radial-gradient(ellipse 60% 60% at 50% 31%, transparent ${vignetteSize}%, rgba(0, 0, 0, ${vignetteOpacity}) 100%)`}}
        />
        )}

      <h1>UNTITLED</h1>

      <Toaster 
        position="bottom-center"
        toastOptions={{ duration: ALERTFADEDURATION }}
       />

      <div className="album-container">
        <img 
          src="/FeedbackerImg.jpg"
          alt="Album Cover"
          className="album-cover"
          style={{ filter: `blur(${blur}px)` }}
        />  
      </div>

      <div className="guess-container">
        <input 
          value={guess} 
          onChange={(e) => setGuess(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          disabled={blur<0 || win}
          type="text" placeholder="Enter your guess..." 
          className="guess-input" />

        <button 
          disabled={blur<0 || win}
          className="guess-button" 
          onClick={handleGuess}>Guess
        </button>
      </div>
    </div>
  )
}

export default App;
