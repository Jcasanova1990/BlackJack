import React, { useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import ThreeCanvas from './components/ThreeCanvas';
import ReactDOM from 'react-dom/client';

// Import your background image (you can place this in /src/img/ or wherever you want)
import backgroundImage from '/src/img/bjbg.jpg';

function App() {
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current?.startGame) {
      gameRef.current.startGame();
    }
  }, []);

  const styles = {
    global: {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
    },
    app: {
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `url(${backgroundImage})`, // Set background image here
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    },
    mobileMessage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      fontSize: '18px',
      backgroundColor: '#000', // Black background
      color: 'red', // Red text
    },
  };

  useEffect(() => {
    Object.assign(document.body.style, styles.global);
    Object.assign(document.documentElement.style, styles.global);
  }, []);

  if (isMobile) {
    return (
      <div style={styles.mobileMessage}>
        <p>Sorry, this site is currently not available on mobile devices at this time. Please visit on a tablet, laptop, or desktop.</p>
      </div>
    );
  }

  return (
    <div style={styles.app}>
      <ThreeCanvas ref={gameRef} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;
