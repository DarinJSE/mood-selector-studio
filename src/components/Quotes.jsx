import { useState, useEffect } from "react";

const QUOTES = {
  Happy: [
    "Smile, it’s contagious! 😄",
    "Happiness looks good on you!",
    "Senyum senyum sendiri lu, gila ya? 😆",
    "Kebahagiaan itu lu bisa rasain pas beres BAB, lega bahagia 🚽",
    "Quotes apaan ini dawg? 💔🥀"
  ],
  Chill: [
    "Breathe in, breathe out... 🌿",
    "Keep calm and vibe on.",
    "Anjay, ovt. Chill bre, gak lagi mencret kan? 😎",
    "Ngopi ngapa ngopi, jan kasih liatin urat leher mulu ☕"
  ],
  Focus: [
    "Focus on what matters. 🎯",
    "One task at a time.",
    "Lu bukan cewe, jan multitasking, malah lieur.",
    "Hardolin? Cih, sudah lama kata itu tidak terdengar lagi dekade ini.",
    "DISIPLIN GOBLOG!"
  ],
  Sleepy: [
    "Ngantuk? Kopi dulu apa tidur dulu? ☕💤",
    "Matikan notifikasi, nyalakan mode bantal.",
    "Scroll terus sampe ketiduran, klasik banget bre.",
    "Produktif juga butuh tidur, bukan cuma niat."
  ],
  Hype: [
    "Gaskeun, dunia belum siap liat progress lu. 🔥",
    "Playlist EDM udah, energi udah, tinggal niat.",
    "Kalau sekarang nggak gerak, kapan lagi? 🚀",
    "Main karakter energy only today."
  ]
};

const getFontFamilyForMood = (mood) => {
  switch (mood) {
    case 'Happy':
      return "'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    case 'Chill':
      return "'Karla', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    case 'Focus':
      return "'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";
    case 'Sleepy':
      return "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    case 'Hype':
      return "'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    default:
      return "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }
};

const DEFAULT_QUOTE = "Pick a mood heula atuh meh teu garing!";

const Quotes = ({ mood, className, refresh }) => {
  const [fade, setFade] = useState(true);
  const [quote, setQuote] = useState(DEFAULT_QUOTE);

  useEffect(() => {
    if (!mood) {
      const resetTimeout = setTimeout(() => {
        setQuote(DEFAULT_QUOTE);
        setFade(true);
      }, 0);
      return () => clearTimeout(resetTimeout);
    }

    const list = QUOTES[mood];
    if (!list || list.length === 0) {
      const emptyTimeout = setTimeout(() => {
        setQuote(DEFAULT_QUOTE);
        setFade(true);
      }, 0);
      return () => clearTimeout(emptyTimeout);
    }

    const fadeTimeout = setTimeout(() => setFade(false), 0);
    const updateTimeout = setTimeout(() => {
      const next = list[Math.floor(Math.random() * list.length)];
      setQuote(next);
      setFade(true);
    }, 300);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(updateTimeout);
    };
  }, [mood, refresh]);

  return (
    <p
      className={className}
      style={{
        marginTop: '1rem',
        color: 'white',
        fontSize: '1.5rem',
        fontFamily: getFontFamilyForMood(mood),
        textShadow: '0 0 10px rgba(0,0,0,0.4)',
        transition: 'opacity 0.3s ease',
        opacity: fade ? 1 : 0,
      }}
    >
      {quote}
    </p>
  );
};

export default Quotes;
