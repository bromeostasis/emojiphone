import { useCallback, useEffect, useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/theme.scss';

import Container from 'react-bootstrap/Container';

import ButHow from './components/ButHow'
import EmojiSpacer from './components/EmojiSpacer'
import Feedback from './components/Feedback'
import FRANMAYO from './components/FranMayo'
import HeroText from './components/HeroText'
import NavBar from './components/NavBar'
import StartGame from './components/StartGame'

function App() {
  const [message, setMessage] = useState('')
  const howRef = useRef(null);
  const playRef = useRef(null);
  const feedbackRef = useRef(null);

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
    const url = window.location.href
    if (url.includes('#how')) {
      howRef.current.scrollIntoView();
    }
    if (url.includes('#play')) {
      playRef.current.scrollIntoView();
    }
    if (url.includes('#feedback')) {
      feedbackRef.current.scrollIntoView();
    }
  }, [callBackendAPI])

  return (
    <div className="App">
      <Container className='pb-0'>
        <NavBar />
        <HeroText />
        <EmojiSpacer />
        <ButHow inputRef={howRef} />
        <EmojiSpacer />
        <StartGame inputRef={playRef} />
        <EmojiSpacer />
        <Feedback inputRef={feedbackRef} />
        {/*Backend's working? {message}*/}
      </Container>
      <FRANMAYO />
    </div>
  );
}

export default App;
