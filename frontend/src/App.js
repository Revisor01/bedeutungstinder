import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users, Settings, Eye, EyeOff, Plus, Trash, Upload, Clock } from 'lucide-react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';
import { Slider } from './components/ui/slider';

// SwipeableCard Komponente (aktualisiert für verschiedene Inhaltstypen)
const SwipeableCard = ({ content, onSwipe, question, timer }) => {
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timer);
  
  useEffect(() => {
    if (timer && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      onSwipe('time_up');
    }
  }, [timeLeft, timer, onSwipe]);
  
  const handleStart = (clientX) => {
    setStartX(clientX);
    setIsDragging(true);
  };
  
  const handleMove = (clientX) => {
    if (isDragging) {
      const newOffsetX = clientX - startX;
      setOffsetX(newOffsetX);
    }
  };
  
  const handleEnd = () => {
    setIsDragging(false);
    if (offsetX > 100) onSwipe('right');
    else if (offsetX < -100) onSwipe('left');
    else setOffsetX(0);
  };
  
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
  const handleMouseDown = (e) => handleStart(e.clientX);
  const handleMouseMove = (e) => handleMove(e.clientX);
  
  useEffect(() => {
    const handleMouseUp = () => handleEnd();
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);
  
  const rotation = offsetX / 10; // Rotation basierend auf der Verschiebung
  const opacity = Math.max(0, 1 - Math.abs(offsetX) / 200); // Transparenz basierend auf der Verschiebung
  
  const renderContent = () => {
    switch (content.type) {
      case 'image':
        return <img src={content.url} alt="Zu bewertendes Bild" className="w-full h-full object-cover" />;
      case 'text':
        return <div className="w-full h-full flex items-center justify-center text-2xl p-4">{content.text}</div>;
      case 'video':
        return <video src={content.url} controls className="w-full h-full object-cover" />;
      default:
        return null;
    }
  };
  
  return (
    <div
    className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleEnd}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    >
    <div
    className="w-full h-full absolute"
    style={{
      transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
      transition: isDragging ? 'none' : 'transform 0.3s',
    }}
    >
    {renderContent()}
    </div>
    <div
    className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold"
    style={{ opacity: 1 - opacity }}
    >
    {offsetX > 0 ? (
      <span className="bg-green-500 px-4 py-2 rounded">Segnen</span>
    ) : (
      <span className="bg-red-500 px-4 py-2 rounded">Nicht segnen</span>
    )}
    </div>
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center">
    {question}
    </div>
    {timer && (
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
      {timeLeft}s
      </div>
    )}
    </div>
  );
};

// SegenstinderGame Komponente (aktualisiert)
const SegenstinderGame = ({ game, onDecision, participantId, onGameEnd }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [decision, setDecision] = useState(null);
  const [showDecision, setShowDecision] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const handleSwipe = (direction) => {
    setDecision(direction === 'right');
    setShowDecision(true);
    setTimeout(() => {
      setShowDecision(false);
      onDecision(currentImageIndex, direction === 'right', participantId);
      if (currentImageIndex === game.images.length - 1) {
        onGameEnd();
      } else {
        setCurrentImageIndex(prevIndex => prevIndex + 1);
      }
    }, 500);
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    <Card className="w-full h-full max-w-2xl max-h-[80vh] shadow-lg overflow-hidden">
    <CardContent className="p-0 relative h-full">
    {showDecision ? (
      <div className={`absolute inset-0 flex items-center justify-center ${decision ? 'bg-green-500' : 'bg-red-500'} text-white text-4xl font-bold`}>
      {decision ? 'Gesegnet' : 'Nicht gesegnet'}
      </div>
    ) : (
      <SwipeableCard image={game.images[currentImageIndex]} onSwipe={handleSwipe} question={game.question} />
    )}
    </CardContent>
    </Card>
    {showControls && (
      <div className="mt-4 flex justify-between w-full max-w-2xl">
      <Button onClick={() => handleSwipe('left')} variant="outline" size="icon">
      <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="text-center">
      <p className="text-sm">Ziehe nach rechts zum Segnen</p>
      <p className="text-sm">Ziehe nach links zum Nicht-Segnen</p>
      </div>
      <Button onClick={() => handleSwipe('right')} variant="outline" size="icon">
      <ChevronRight className="h-6 w-6" />
      </Button>
      </div>
    )}
    <Button
    onClick={() => setShowControls(!showControls)}
    className="fixed bottom-4 left-4"
    variant="outline"
    size="icon"
    >
    {showControls ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
    </div>
  );
};

// Statistiken Komponente
const Statistics = ({ gameResults }) => {
  return (
    <div className="p-4 bg-beige text-bordeaux">
    <h2 className="text-2xl font-bold mb-4">Spielstatistiken</h2>
    {gameResults.map((result, index) => (
      <div key={index} className="mb-4 p-2 bg-white rounded shadow">
      <h3 className="font-bold">Bild {index + 1}</h3>
      <p>Zustimmung: {result.agreement}%</p>
      <p>Ablehnung: {result.disagreement}%</p>
      <p>Übereinstimmung: {result.consensus}%</p>
      </div>
    ))}
    </div>
  );
};

// AdminPanel Komponente
// AdminPanel Komponente (erweitert)
const AdminPanel = ({ games, onAddGame, onEditGame, onDeleteGame, onUploadContent }) => {
  const [newGame, setNewGame] = useState({ 
    name: '', 
    question: '', 
    minPlayers: 1, 
    modes: { solo: false, group: false },
    timer: 0,
    useTimer: false
  });
  const [selectedGame, setSelectedGame] = useState(null);
  const [newContent, setNewContent] = useState({ type: 'image', url: '', text: '' });
  
  const handleAddGame = () => {
    onAddGame(newGame);
    setNewGame({ name: '', question: '', minPlayers: 1, modes: { solo: false, group: false }, timer: 0, useTimer: false });
  };
  
  const handleContentUpload = () => {
    if (selectedGame) {
      onUploadContent(selectedGame, newContent);
      setNewContent({ type: 'image', url: '', text: '' });
    }
  };
  
  return (
    <div className="p-4 bg-beige text-bordeaux">
    <h2 className="text-2xl font-bold mb-4">Admin-Bereich</h2>
    <div className="mb-4">
    <Input
    value={newGame.name}
    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
    placeholder="Spielname"
    className="mb-2"
    />
    <Input
    value={newGame.question}
    onChange={(e) => setNewGame({ ...newGame, question: e.target.value })}
    placeholder="Fragestellung"
    className="mb-2"
    />
    <Input
    type="number"
    value={newGame.minPlayers}
    onChange={(e) => setNewGame({ ...newGame, minPlayers: parseInt(e.target.value) })}
    placeholder="Minimale Spieleranzahl"
    className="mb-2"
    />
    <div className="flex items-center mb-2">
    <Checkbox
    checked={newGame.modes.solo}
    onCheckedChange={(checked) => setNewGame({ ...newGame, modes: { ...newGame.modes, solo: checked } })}
    id="solo-mode"
    />
    <label htmlFor="solo-mode" className="ml-2">Solospiel</label>
    </div>
    <div className="flex items-center mb-2">
    <Checkbox
    checked={newGame.modes.group}
    onCheckedChange={(checked) => setNewGame({ ...newGame, modes: { ...newGame.modes, group: checked } })}
    id="group-mode"
    />
    <label htmlFor="group-mode" className="ml-2">Gruppenspiel</label>
    </div>
    <div className="flex items-center mb-2">
    <Checkbox
    checked={newGame.useTimer}
    onCheckedChange={(checked) => setNewGame({ ...newGame, useTimer: checked })}
    id="use-timer"
    />
    <label htmlFor="use-timer" className="ml-2">Timer verwenden</label>
    </div>
    {newGame.useTimer && (
      <div className="mb-2">
      <label htmlFor="timer-slider" className="block mb-1">Timer-Dauer (Sekunden): {newGame.timer}</label>
      <Slider
      id="timer-slider"
      min={1}
      max={60}
      step={1}
      value={[newGame.timer]}
      onValueChange={(value) => setNewGame({ ...newGame, timer: value[0] })}
      />
      </div>
    )}
    <Button onClick={handleAddGame} className="w-full">
    <Plus className="mr-2 h-4 w-4" /> Neues Spiel hinzufügen
    </Button>
    </div>
    <div className="mb-4">
    <h3 className="text-xl font-bold mb-2">Inhalt hochladen</h3>
    <Select
    value={selectedGame ? selectedGame.name : ''}
    onChange={(e) => setSelectedGame(games.find(g => g.name === e.target.value))}
    className="mb-2"
    >
    <option value="">Wähle ein Spiel</option>
    {games.map((game, index) => (
      <option key={index} value={game.name}>{game.name}</option>
    ))}
    </Select>
    <Select
    value={newContent.type}
    onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
    className="mb-2"
    >
    <option value="image">Bild</option>
    <option value="text">Text</option>
    <option value="video">Video</option>
    </Select>
    {newContent.type === 'text' ? (
      <Input
      value={newContent.text}
      onChange={(e) => setNewContent({ ...newContent, text: e.target.value })}
      placeholder="Text eingeben"
      className="mb-2"
      />
    ) : (
      <Input
      value={newContent.url}
      onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
      placeholder="URL eingeben"
      className="mb-2"
      />
    )}
    <Button onClick={handleContentUpload} className="w-full">
    <Upload className="mr-2 h-4 w-4" /> Inhalt hochladen
    </Button>
    </div>
    <div>
    <h3 className="text-xl font-bold mb-2">Vorhandene Spiele</h3>
    {games.map((game, index) => (
      <div key={index} className="mb-2 p-2 bg-white rounded shadow flex justify-between items-center">
      <span>{game.name}</span>
      <div>
      <Button onClick={() => onEditGame(index)} variant="outline" size="sm" className="mr-2">
      Bearbeiten
      </Button>
      <Button onClick={() => onDeleteGame(index)} variant="outline" size="sm">
      <Trash className="h-4 w-4" />
      </Button>
      </div>
      </div>
    ))}
    </div>
    </div>
  );
};

// Hauptkomponente (erweitert)
const App = () => {
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gameState, setGameState] = useState('start'); // 'start', 'game', 'statistics'
  const [playersCount, setPlayersCount] = useState(0);
  const [gameResults, setGameResults] = useState([]);
  const [configuredGames, setConfiguredGames] = useState([]);
  const [showGameSelection, setShowGameSelection] = useState(true);
  
  useEffect(() => {
    // Hier würden Sie die Spiele vom Server laden
    // Beispiel:
    setGames([
      {
        name: 'Standardspiel',
        question: 'Soll dieses Bild gesegnet werden?',
        content: [
          { type: 'image', url: 'https://picsum.photos/800/600?random=1' },
          { type: 'text', text: 'Dies ist ein Beispieltext.' },
          { type: 'video', url: 'https://example.com/sample-video.mp4' },
        ],
        minPlayers: 2,
        modes: { solo: true, group: true },
        timer: 10,
        useTimer: true
      }
    ]);
  }, []);
  
  const handleDecision = (contentIndex, decision) => {
    // Hier würden Sie die Entscheidung an den Server senden und die Ergebnisse aktualisieren
    // Für dieses Beispiel simulieren wir einfach die Ergebnisse
    setGameResults(prevResults => {
      const newResults = [...prevResults];
      if (!newResults[contentIndex]) {
        newResults[contentIndex] = { agreement: 0, disagreement: 0, consensus: 0 };
      }
      if (decision) {
        newResults[contentIndex].agreement += 1;
      } else {
        newResults[contentIndex].disagreement += 1;
      }
      const total = newResults[contentIndex].agreement + newResults[contentIndex].disagreement;
      newResults[contentIndex].consensus = Math.max(newResults[contentIndex].agreement, newResults[contentIndex].disagreement) / total * 100;
      return newResults;
    });
  };
  
  const handleGameEnd = () => {
    setGameState('statistics');
  };
  
  const handleAddGame = (newGame) => {
    setGames(prevGames => [...prevGames, { ...newGame, content: [] }]);
  };
  
  const handleEditGame = (index) => {
    // Implementieren Sie hier die Logik zum Bearbeiten eines Spiels
  };
  
  const handleDeleteGame = (index) => {
    setGames(prevGames => prevGames.filter((_, i) => i !== index));
  };
  
  const handleUploadContent = (game, content) => {
    setGames(prevGames => prevGames.map(g => 
      g.name === game.name ? { ...g, content: [...g.content, content] } : g
    ));
  };
  
  const handleConfigureGames = (selectedGames, showSelection) => {
    setConfiguredGames(selectedGames);
    setShowGameSelection(showSelection);
  };
  
  return (
    <div className="bg-beige min-h-screen">
    {isAdmin ? (
      <AdminPanel
      games={games}
      onAddGame={handleAddGame}
      onEditGame={handleEditGame}
      onDeleteGame={handleDeleteGame}
      onUploadContent={handleUploadContent}
      onConfigureGames={handleConfigureGames}
      />
    ) : gameState === 'game' ? (
      <SegenstinderGame
      game={currentGame}
      onDecision={handleDecision}
      participantId="1" // Dies sollte dynamisch sein
      onGameEnd={handleGameEnd}
      />
    ) : gameState === 'statistics' ? (
      <Statistics gameResults={gameResults} />
    ) : (
      <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8 text-bordeaux">Segenstinder</h1>
      {showGameSelection ? (
        <Select
        value={currentGame ? currentGame.name : ''}
        onChange={(e) => setCurrentGame(configuredGames.find(g => g.name === e.target.value))}
        className="mb-4"
        >
        <option value="">Wähle ein Spiel</option>
        {configuredGames.map((game, index) => (
          <option key={index} value={game.name}>{game.name}</option>
        ))}
        </Select>
      ) : (
        <p className="text-lg mb-4 text-bordeaux">{currentGame.name}</p>
      )}
      {currentGame && (
        <>
        <p className="text-lg mb-4 text-bordeaux">{currentGame.question}</p>
        <p className="text-md mb-4 text-bordeaux">
        {currentGame.modes.solo && currentGame.modes.group
          ? "Solo- oder Gruppenspiel"
          : currentGame.modes.solo
          ? "Solospiel"
          : "Gruppenspiel"}
        </p>
        {currentGame.modes.group && (
          <p className="text-md mb-4 text-bordeaux">Mindestens {currentGame.minPlayers} Spieler benötigt</p>
        )}
        <Button
        onClick={() => {
          if (currentGame.modes.solo || playersCount >= currentGame.minPlayers) {
            setGameState('game');
          } else {
            setPlayersCount(prevCount => prevCount + 1);
          }
        }}
        className="mb-4 bg-bordeaux text-beige"
        >
        {currentGame.modes.group && playersCount < currentGame.minPlayers ? 'Beitreten' : 'Spiel starten'}
        </Button>
        {currentGame.modes.group && (
          <p className="text-bordeaux">Aktuelle Spieler: {playersCount}</p>
        )}
        </>
      )}
      </div>
    )}
    <Button
    onClick={() => setIsAdmin(!isAdmin)}
    className="fixed bottom-4 right-4 bg-bordeaux text-beige"
    variant="outline"
    size="icon"
    >
    <Settings className="h-4 w-4" />
    </Button>
    </div>
  );
};

export default App;