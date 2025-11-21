import Quotes from './Quotes';

const Wallpaper = ({ mood, refresh }) => {
  const getBackground = () => {
    switch(mood) {
      case 'Happy': return 'linear-gradient(to right, #c496b7ff, #88adecff)';
      case 'Chill': return 'linear-gradient(to right, #498a8fff, #497dc5ff)';
      case 'Focus': return 'linear-gradient(to right, #a17676ff, #5a7e91ff)';
      case 'Sleepy': return 'linear-gradient(to right, #2b1055, #7597de)';
      case 'Hype': return 'linear-gradient(to right, #ff512f, #dd2476)';
      default: return '#333';
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2rem',
        background: getBackground(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background 0.5s ease',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem',
        textAlign: 'center',
        maxWidth: '80%'
      }}>
        <Quotes mood={mood} refresh={refresh} className={"text-outline"} />
      </div>
    </div>
  );
};

export default Wallpaper;
