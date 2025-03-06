import { useState, useEffect, useRef } from "react";

// Import images
const cardImages = import.meta.glob("/src/img/cards/*.png", { eager: true });

// Import sounds
import shuffleSound from "/src/sounds/shuffle.mp3";
import clickSound from "/src/sounds/click.mp3";
import backgroundMusic from "/src/sounds/bg1.mp3";

// Background image
import tableBackground from "/src/img/table.jpg";

const suits = ["spades", "hearts", "diamonds", "clubs"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
    let deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
}

function calculateScore(hand) {
    let score = 0;
    let aceCount = 0;
    hand.forEach(card => {
        if (card.value === "A") {
            aceCount++;
            score += 11;
        } else if (["J", "Q", "K"].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    return score;
}

function App() {
    const [deck, setDeck] = useState([]);
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [playerScore, setPlayerScore] = useState(0);
    const [dealerScore, setDealerScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [result, setResult] = useState("");
    const [showWelcome, setShowWelcome] = useState(true);
    const [volume, setVolume] = useState(0.5);
    const [isHovered, setIsHovered] = useState({
        hit: false,
        stand: false,
        newGame: false,
    });

    const bgMusicRef = useRef(new Audio(backgroundMusic));
    bgMusicRef.current.loop = true;

    useEffect(() => {
        bgMusicRef.current.volume = volume;
        if (!showWelcome) bgMusicRef.current.play();
    }, [volume, showWelcome]);

    const playSound = (sound) => {
        const audio = new Audio(sound);
        audio.volume = volume;
        audio.play();
    };

    function dealCard(deck) {
        const newDeck = [...deck];
        const card = newDeck.pop();
        return { card, newDeck };
    }

    const startGame = () => {
        playSound(shuffleSound);

        const newDeck = createDeck();
        const playerStart = [newDeck.pop(), newDeck.pop()];
        const dealerStart = [newDeck.pop(), newDeck.pop()];

        setDeck(newDeck);
        setPlayerHand(playerStart);
        setDealerHand(dealerStart);
        setPlayerScore(calculateScore(playerStart));
        setDealerScore(calculateScore(dealerStart));
        setGameOver(false);
        setResult("");
    };

    const handleHit = () => {
        if (gameOver) return;
        playSound(clickSound);

        const { card, newDeck } = dealCard(deck);
        const updatedHand = [...playerHand, card];
        const newScore = calculateScore(updatedHand);

        setDeck(newDeck);
        setPlayerHand(updatedHand);
        setPlayerScore(newScore);

        if (newScore > 21) {
            setResult("You Busted!");
            setGameOver(true);
        }
    };

    const handleStand = () => {
        if (gameOver) return;
        playSound(clickSound);

        let currentDeck = [...deck];
        let updatedDealerHand = [...dealerHand];
        let newScore = dealerScore;

        while (newScore < 17) {
            const { card, newDeck } = dealCard(currentDeck);
            updatedDealerHand.push(card);
            newScore = calculateScore(updatedDealerHand);
            currentDeck = newDeck;
        }

        setDeck(currentDeck);
        setDealerHand(updatedDealerHand);
        setDealerScore(newScore);
        setGameOver(true);

        if (newScore > 21 || playerScore > newScore) {
            setResult("You Win!");
        } else if (playerScore < newScore) {
            setResult("Dealer Wins!");
        } else {
            setResult("It's a Tie!");
        }
    };

    const startFromWelcome = () => {
        setShowWelcome(false);
        startGame();
    };

    return (
        <div style={{ ...styles.game, backgroundImage: `url(${tableBackground})` }}>
            {showWelcome ? (
                <div style={styles.welcomeScreen}>
                    <h1>Welcome to Blackjack!</h1>
                    <button
                        style={{
                            ...styles.button,
                            ...(isHovered.newGame ? styles.buttonHover : {})
                        }}
                        onMouseEnter={() => setIsHovered({ ...isHovered, newGame: true })}
                        onMouseLeave={() => setIsHovered({ ...isHovered, newGame: false })}
                        onClick={startFromWelcome}
                    >
                        Start Game
                    </button>
                </div>
            ) : (
                <>
                    <h1 style={styles.title}>Blackjack</h1>

                    <div style={styles.section}>
                        <h2>Dealer - Points: {dealerScore}</h2>
                        <div style={styles.hand}>
                            {dealerHand.map((card, index) => {
                                const fileName = `/src/img/cards/${card.value.toLowerCase()}_of_${card.suit}.png`;
                                return (
                                    <img
                                        key={index}
                                        style={styles.card}
                                        src={cardImages[fileName]?.default || cardImages[fileName]}
                                        alt={`${card.value} of ${card.suit}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div style={styles.section}>
                        <h2>Player - Points: {playerScore}</h2>
                        <div style={styles.hand}>
                            {playerHand.map((card, index) => {
                                const fileName = `/src/img/cards/${card.value.toLowerCase()}_of_${card.suit}.png`;
                                return (
                                    <img
                                        key={index}
                                        style={styles.card}
                                        src={cardImages[fileName]?.default || cardImages[fileName]}
                                        alt={`${card.value} of ${card.suit}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div style={styles.controls}>
                        <button
                            style={{
                                ...styles.button,
                                ...(isHovered.hit ? styles.buttonHover : {})
                            }}
                            onMouseEnter={() => setIsHovered({ ...isHovered, hit: true })}
                            onMouseLeave={() => setIsHovered({ ...isHovered, hit: false })}
                            onClick={handleHit}
                            disabled={gameOver}
                        >
                            Hit
                        </button>

                        <button
                            style={{
                                ...styles.button,
                                ...(isHovered.stand ? styles.buttonHover : {})
                            }}
                            onMouseEnter={() => setIsHovered({ ...isHovered, stand: true })}
                            onMouseLeave={() => setIsHovered({ ...isHovered, stand: false })}
                            onClick={handleStand}
                            disabled={gameOver}
                        >
                            Stand
                        </button>

                        <button
                            style={{
                                ...styles.button,
                                ...(isHovered.newGame ? styles.buttonHover : {})
                            }}
                            onMouseEnter={() => setIsHovered({ ...isHovered, newGame: true })}
                            onMouseLeave={() => setIsHovered({ ...isHovered, newGame: false })}
                            onClick={startGame}
                        >
                            New Game
                        </button>
                    </div>

                    <h2>{result}</h2>

                    <div style={styles.volumeControl}>
                        <label>Volume:</label>
                        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(Number(e.target.value))} />
                    </div>
                </>
            )}
        </div>
    );
}


const styles = {
    game: {
        fontFamily: "'Pacifico', cursive",
        textAlign: "center",
        color: "white",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        minWidth: "70vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    hand: {
        display: "flex",
        gap: "10px",
    },
    card: {
        width: "80px",
    },
    controls: {
        display: "flex",
        gap: "10px",
        marginTop: "20px",
    },
    button: {
        padding: "10px 20px",
        fontSize: "16px",
        cursor: "pointer",
        backgroundColor: "black",
        color: "white",
        border: "2px solid white",
        borderRadius: "10px",
        transition: "all 0.3s ease",
    },
    buttonHover: {
        backgroundColor: "white",
        color: "black",
    },
    volumeControl: {
        marginTop: "20px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },
    welcomeScreen: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    startButton: {
        padding: "15px 30px",
        fontSize: "20px",
    },
    section: {
        marginBottom: "20px",
    },
    title: {
        margin: "10px 0",
    }
};

export default App;
