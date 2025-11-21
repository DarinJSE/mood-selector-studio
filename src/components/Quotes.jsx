import { useState, useEffect } from "react";

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

const Quotes = ({ mood, className, refresh }) => {
  const quotes = {
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

  const [fade, setFade] = useState(true);
  const [quote, setQuote] = useState("Pick a mood heula atuh meh teu garing!"); 
  // ✅ default text dulu, jangan getQuote()

  const getQuote = () => {
    if (!mood) return "Pick a mood heula atuh meh teu garing!";
    const list = quotes[mood];
    return list[Math.floor(Math.random() * list.length)];
  };

  useEffect(() => {
    if (!mood) return; // kalau mood kosong, skip

    setFade(false);

    const timeout = setTimeout(() => {
      setQuote(getQuote());
      setFade(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [mood, refresh]); // trigger tiap mood atau refresh berubah

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
