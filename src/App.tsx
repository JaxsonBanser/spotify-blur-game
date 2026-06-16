import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import './App.css'

function App() {

  const[blur, setBlur] = useState(50)
  const[showVignette, setShowVignette] = useState(false)
  const[guess, setGuess] = useState('')

  const[finish, setFinish] = useState(false)
  const[attempts, setAttempts] = useState(0)
  const[boxStates, setBoxStates] = useState<('empty' | 'wrong' | 'correct')[]>(Array(6).fill('empty'))

  const revealProgress = 50 - blur*2
  const vignetteSize = 70 - (revealProgress) / 2
  const vignetteOpacity = .5 + (revealProgress) / 100
  
  const BLURREDUCTION = 10

  const ALERTFADEDURATION = 3000

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

  const handleGuess = () => { //Handles logic for inputted guesses
    toast.dismissAll() //Dismisses any existing toasts before showing a new one
    if (guess.trim().toLowerCase() === '') { //If the user enters a blank guess, print an error message but do not reduce the blur
      toast.error('Please enter a guess before submitting.')
      return
    }

    if (guess.trim().toLowerCase() === 'feedbacker') { //If user guesses correctly, show a success message and end the game
      toast.success('Correct! The album is "Feedbacker" by Boris.')

      //Win blur conditions
      setBlur(0)
      setShowVignette(false)

      //Win box conditions
      boxSucc(attempts)
      setFinish(true)
      return
    } else { //If the guess is incorrect, handles game logic
      if (blur - BLURREDUCTION < 0) { //If the user has run out of attempts, show a game over message and end the game
        toast.error('You have run out of attempts. The album was "Feedbacker" by Boris')

        //Loss blur conditions
        setBlur(-100)

        //Loss box conditions
        boxFail(attempts)
        setAttempts(attempts + 1)
        setFinish(true)
      } else { //If the user still has attempts left, show an error message and reduce the blur
        toast.error('Incorrect guess. Try again!')

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

      {boxStates.map((state, index) => (
        <div key={index} className={`guess-boxes ${state}`} />
      ))}

      <div className="guess-container">
        <input 
          value={guess} 
          onChange={(e) => setGuess(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          
          disabled={finish}
          type="text" placeholder="Enter your guess..." 
          className="guess-input" />

        <button
          disabled={finish} 
          className="guess-button"
          onClick={handleGuess}>Guess
        </button>
      </div>


    </div>
  )
}

export default App;
