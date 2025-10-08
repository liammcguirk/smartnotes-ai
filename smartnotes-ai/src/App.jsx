import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [notesInput, setNotesInput] = useState("");
  const [decks, setDecks] = useState(() => {
    return JSON.parse(localStorage.getItem("decks")) || [];
  });
  const [currentDeck, setCurrentDeck] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem("streak")) || 0;
  });

  // Save decks and streak to localStorage
  useEffect(() => {
    localStorage.setItem("decks", JSON.stringify(decks));
    localStorage.setItem("streak", streak);
  }, [decks, streak]);

  const generateFlashcards = () => {
    if (!notesInput.trim()) return;
    const lines = notesInput.split("\n").filter(line => line.trim());
    const newCards = lines.map(line => ({
      question: line,
      answer: "",
      correct: 0,
      interval: 1,
      lastReviewed: null,
      type: "text"
    }));
    const newDeck = {
      name: `Deck ${decks.length + 1}`,
      cards: newCards
    };
    setDecks([...decks, newDeck]);
    setNotesInput("");
  };

  const startReview = deck => {
    const queue = deck.cards.map(card => ({ ...card }));
    setReviewQueue(queue);
    setCurrentCard(queue[0] || null);
    setCurrentDeck(deck);
    setShowAnswer(false);
    setStartTime(Date.now());
  };

  const handleAnswer = correct => {
    const timeTaken = (Date.now() - startTime) / 1000;
    let updatedCard = { ...currentCard };
    if (correct) {
      updatedCard.correct += 1;
      updatedCard.interval *= 2;
    } else {
      updatedCard.correct = 0;
      updatedCard.interval = 1;
    }
    updatedCard.lastReviewed = Date.now();

    // Update deck
    const updatedDeck = { ...currentDeck };
    const cardIndex = updatedDeck.cards.findIndex(c => c.question === currentCard.question);
    updatedDeck.cards[cardIndex] = updatedCard;
    const newDecks = decks.map(d => (d.name === updatedDeck.name ? updatedDeck : d));
    setDecks(newDecks);

    // Update streak
    if (correct) setStreak(prev => prev + 1);
    else setStreak(0);

    // Move to next card
    const nextQueue = reviewQueue.slice(1);
    setReviewQueue(nextQueue);
    setCurrentCard(nextQueue[0] || null);
    setShowAnswer(false);
    setStartTime(Date.now());
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>SmartNotes AI Prototype</h1>
      <p>Streak: {streak} 🔥</p>

      {/* Note Input */}
      <textarea
        placeholder="Paste your notes here..."
        value={notesInput}
        onChange={e => setNotesInput(e.target.value)}
        rows={6}
        style={{ width: "100%" }}
      />
      <button onClick={generateFlashcards} style={{ margin: "10px 0" }}>
        Generate Flashcards
      </button>

      {/* Decks */}
      <h2>Decks</h2>
      {decks.map((deck, idx) => (
        <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", margin: "5px 0" }}>
          <strong>{deck.name}</strong> ({deck.cards.length} cards)
          <button onClick={() => startReview(deck)} style={{ marginLeft: "10px" }}>
            Review
          </button>
        </div>
      ))}

      {/* Review Mode */}
      {currentCard && (
        <div style={{ border: "2px solid #333", padding: "20px", marginTop: "20px" }}>
          <h3>Question:</h3>
          {currentCard.type === "text" ? (
            <p>{currentCard.question}</p>
          ) : (
            <img src={currentCard.question} alt="card" style={{ maxWidth: "100%" }} />
          )}
          {showAnswer && (
            <>
              <h3>Answer:</h3>
              <p>{currentCard.answer || "(Add answer later)"}</p>
            </>
          )}
          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)}>Show Answer</button>
          ) : (
            <>
              <button onClick={() => handleAnswer(true)}>✅ Correct</button>
              <button onClick={() => handleAnswer(false)}>❌ Wrong</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
