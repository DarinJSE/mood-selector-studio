const MoodSelector = ({ moods, selectedMood, onSelectMood }) => {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {moods.map((mood) => {
        const isActive = mood === selectedMood;
        return (
          <button
            key={mood}
            onClick={() => onSelectMood(mood)}
            style={{
              padding: '0.45rem 0.9rem',
              cursor: 'pointer',
              borderRadius: '999px',
              border: isActive ? '2px solid #fff' : '1px solid transparent',
              backgroundColor: isActive ? '#646cff' : '#1a1a1a',
              color: 'white',
              boxShadow: isActive
                ? '0 0 12px rgba(100,108,255,0.6)'
                : '0 0 6px rgba(0,0,0,0.4)',
              transform: isActive ? 'translateY(-1px)' : 'none',
              transition:
                'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
            }}
          >
            {mood}
          </button>
        );
      })}
    </div>
  );
};

export default MoodSelector;
