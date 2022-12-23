import { useCallback, useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/theme.scss';

import Container from 'react-bootstrap/Container';

import ButHow from './components/ButHow'
import EmojiSpacer from './components/EmojiSpacer'
import HeroText from './components/HeroText'
import NavBar from './components/NavBar'
import StartGame from './components/StartGame'

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
    callBackendAPI()
  }, [callBackendAPI])

  return (
    <div className="App">
      <Container>
        <NavBar />
        <HeroText />
        <EmojiSpacer />
        <ButHow />
        <EmojiSpacer />
        <StartGame />
        {/*Backend's working? {message}*/}
      </Container>
    </div>
  );
}

export default App;
