import logo from './logo.svg';
import './App.css';
import { useCallback, useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('')

  // fetching the GET route from the Express server which matches the GET route from server.js
  const callBackendAPI = useCallback(async () => {
    const response = await fetch('/test');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    setMessage(body.express)
  }, [])

  useEffect(() => {
    // const messageContent = 'blerp'
    callBackendAPI()
  }, [callBackendAPI])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn ReactZ

          {message}
        </a>
      </header>
    </div>
  );
}

export default App;
