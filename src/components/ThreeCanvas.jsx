import React, { useState, useEffect } from "react";

const jumpSound = new Audio('/sounds/flap.mp3');
const gameOverSound = new Audio('/sounds/go.mp3');

export default function FlappyBird() {
  const gameWidth = 1600;
  const gameHeight = 2400;
  const birdSize = 100;
  const gravity = 3.5;
  const jumpPower = -35;
  const buildingWidth = 180;
  const buildingGap = 600;

  const [birdY, setBirdY] = useState(gameHeight / 2 - birdSize / 2);
  const [velocity, setVelocity] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);

  useEffect(() => {
    if (!isGameStarted) return;

    resetGame();
    const handleKeyPress = (e) => {
      if (e.key === " ") jump();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isGameStarted]);

  useEffect(() => {
    if (isGameOver || !isGameStarted) return;

    const gameLoop = setInterval(() => {
      setBirdY((prev) => prev + velocity);
      setVelocity((prev) => prev + gravity);
      moveBuildings();
      checkCollision();
      updateScore();
    }, 30);

    return () => clearInterval(gameLoop);
  }, [velocity, buildings, isGameOver, isGameStarted]);

  useEffect(() => {
    if (isGameOver || !isGameStarted) return;

    const buildingTimer = setInterval(() => {
      addBuilding();
    }, 1000);

    return () => clearInterval(buildingTimer);
  }, [isGameOver, isGameStarted]);

  function jump() {
    jumpSound.pause();
    jumpSound.currentTime = 0;
    jumpSound.play();
    setVelocity(jumpPower);
  }

  function resetGame() {
    setBirdY(gameHeight / 2 - birdSize / 2);
    setVelocity(0);
    setBuildings([]);
    setScore(0);
    setIsGameOver(false);
  }

  function addBuilding() {
    const heightTop = getRandomBuildingHeight();
    setBuildings((prev) => [
      ...prev,
      { x: gameWidth, heightTop },
    ]);
  }

  function moveBuildings() {
    setBuildings((prev) => {
      return prev
        .map((building) => ({ ...building, x: building.x - 12 * 1.55 }))
        .filter((building) => building.x + buildingWidth > 0);
    });
  }

  function checkCollision() {
    if (birdY < 0 || birdY + birdSize > gameHeight) {
      if (!isGameOver) {
        gameOverSound.play();
        setIsGameOver(true);
      }
      return;
    }

    const birdLeft = 200;
    const birdRight = birdLeft + birdSize;
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;

    for (const building of buildings) {
      const buildingLeft = building.x;
      const buildingRight = building.x + buildingWidth;

      const topBuildingHeight = building.heightTop.height;
      const bottomBuildingTop = topBuildingHeight + buildingGap;

      const hitsTopBuilding = (
        birdRight > buildingLeft &&
        birdLeft < buildingRight &&
        birdTop < topBuildingHeight
      );

      const hitsBottomBuilding = (
        birdRight > buildingLeft &&
        birdLeft < buildingRight &&
        birdBottom > bottomBuildingTop
      );

      if (hitsTopBuilding || hitsBottomBuilding) {
        if (!isGameOver) {
          gameOverSound.play();
          setIsGameOver(true);
        }
        return;
      }
    }
  }

  function updateScore() {
    const birdLeft = 200;
    for (const building of buildings) {
      const buildingLeft = building.x;
      const buildingRight = building.x + buildingWidth;

      if (birdLeft > buildingLeft && birdLeft < buildingRight && !building.passed) {
        const topBuildingHeight = building.heightTop.height;
        const bottomBuildingTop = topBuildingHeight + buildingGap;
        const birdBottom = birdY + birdSize;

        if (birdY > topBuildingHeight && birdBottom < bottomBuildingTop) {
          setScore((prevScore) => prevScore + 1);
          building.passed = true;
        }
      }
    }
  }

  function getRandomBuildingHeight() {
    const heights = [
      { label: "lg bldg", height: 1300 },
      { label: "md bldg", height: 900 },
      { label: "sm bldg", height: 500 },
    ];
    return heights[Math.floor(Math.random() * heights.length)];
  }

  function buildingImage(label) {
    switch (label) {
      case "lg bldg":
        return 'url(/img/Large_Building.png)';
      case "md bldg":
        return 'url(/img/Medium_Building.png)';
      case "sm bldg":
        return 'url(/img/Small_Building.png)';
    }
  }

  function startGame() {
    setIsGameStarted(true);
  }

  return (
    <div style={styles.gameContainer}>
      {!isGameStarted ? (
        <div style={styles.welcomeScreen}>
          <h1 style={styles.welcomeTitle}>Welcome to Go Pigeon</h1>
          <button onClick={startGame} style={styles.startButton}>Start Game</button>
        </div>
      ) : (
        <>
          <div style={{ ...styles.bird, top: birdY }} />

          {buildings.map((building, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  ...styles.building,
                  height: building.heightTop.height,
                  left: building.x,
                  top: 0,
                  backgroundImage: buildingImage(building.heightTop.label),
                  backgroundSize: "contain",
                }}
              >
                <div style={styles.label}>{building.heightTop.label}</div>
              </div>

              <div
                style={{
                  ...styles.building,
                  height: gameHeight - building.heightTop.height - buildingGap,
                  left: building.x,
                  top: building.heightTop.height + buildingGap,
                  backgroundImage: buildingImage(building.heightTop.label),
                  backgroundSize: "contain",
                }}
              >
              </div>
            </React.Fragment>
          ))}

          <div style={styles.scoreOverlay}>
            <div style={styles.score}>{score}</div>
          </div>

          {isGameOver && (
            <div style={styles.gameOver}>
              <h2>Game Over</h2>
              <p>Score: {score}</p>
              <button onClick={resetGame} style={styles.button}>Restart</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  gameContainer: {
    width: "1600px",
    height: "2400px",
    backgroundImage: 'url(/img/gpbg.jpg)',
    backgroundSize: 'contain',
    position: "relative",
    overflow: "hidden",
    border: "4px solid #000",
    margin: "20px auto",
  },
  welcomeScreen: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 0 30px rgba(0,0,0,0.8)",
  },
  welcomeTitle: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  startButton: {
    padding: "20px 40px",
    fontSize: "32px",
    backgroundColor: "#FF4500",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    borderRadius: "10px",
  },
  bird: {
    width: "100px",
    height: "100px",
    backgroundImage: 'url(/img/Bird.png)', 
    backgroundSize: 'contain',  
    backgroundRepeat: 'no-repeat',  
    backgroundPosition: 'center', 
    position: "absolute",
    left: "200px",
    borderRadius: "50%",  
    boxShadow: "none", 
  },
  
  building: {
    width: "230px",
    position: "absolute",
    backgroundSize: "cover", 
    backgroundRepeat: "no-repeat",
  },

  scoreOverlay: {
    position: "absolute",
    top: "33.5%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: "20px 40px",
    borderRadius: "10px",
    zIndex: 100,
  },
  score: {
    fontSize: "72px",
    fontWeight: "bold",
    color: "#fff",
  },
  gameOver: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0,0,0,0.85)",
    color: "#fff",
    padding: "40px",
    textAlign: "center",
    borderRadius: "20px",
    boxShadow: "0 0 30px rgba(0,0,0,0.8)",
  },
  button: {
    padding: "20px 40px",
    fontSize: "32px",
    backgroundColor: "#FF4500",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    marginTop: "20px",
    borderRadius: "10px",
  },
};
