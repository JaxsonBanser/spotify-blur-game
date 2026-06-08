import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div> 
      <h1>Coverdle</h1>

      <div className="album-container">
        <img 
          src="/FeedbackerImg.jpg"
          alt="Album Cover"
          className="album-cover"
        />  
      </div>
    </div>
  )
}

export default App;
