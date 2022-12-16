import 'bootstrap/dist/css/bootstrap.min.css';
import { useCallback, useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container';

import HeroText from './components/HeroText'
import logo from './logo.svg';
import './scss/theme.scss';

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
        <HeroText></HeroText>
        Backend's working? {message}
      </Container>
    </div>
  );
}

export default App;
