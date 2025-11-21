import { useState } from 'react';
import Header from './components/Header';
import MoodSelector from './components/MoodSelector';
import Wallpaper from './components/Wallpaper';
import './App.css';
import './index.css';

function App() {
  const [mood, setMood] = useState('');
  const [refresh, setRefresh] = useState(0);

  const moods = ['Happy', 'Chill', 'Focus', 'Sleepy', 'Hype'];

  return (
    <div className="app-root">
      <Wallpaper mood={mood} refresh={refresh} />
      <Header />
      <div className="app-controls">
        <MoodSelector
          moods={moods}
          selectedMood={mood}
          onSelectMood={(m) => {
            setMood(m);
            setRefresh((r) => r + 1);
          }}
        />
      </div>
    </div>
  );
}

export default App;
