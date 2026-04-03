import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Music, 
  Music2, 
  Gamepad2, 
  Video, 
  BookHeart, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Volume2,
  VolumeX,
  Star,
  Trophy,
  Users,
  User,
  Send,
  Copy,
  Check,
  Share2,
  Loader2,
  X,
  MessageCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Mic,
  Volume1,
  Trash
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp,
  getDocFromServer,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1488971088305324153/6xV-fK_WukQ1uM3Py-KNVQVtuvty6RThrMathYDtLH5VJaJKioJ1QPxHMDW1TxEcwyQ8";

async function sendToDiscord(title: string, data: any) {
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title,
          description: JSON.stringify(data, null, 2),
          color: 0xFF69B4 // Pink
        }]
      })
    });
  } catch (err) {
    console.error("Discord webhook failed:", err);
  }
}

// --- Constants ---

const QUESTIONS = [
  "What is my favorite thing about you?",
  "When did I first start liking you?",
  "What is my biggest fear?",
  "What makes me happiest?",
  "What is something I never told you?",
  "What do I love the most about our bond?",
  "What is my dream life?",
  "What do I get annoyed by quickly?",
  "What reminds me of you instantly?",
  "What is one thing I’d never leave you for?"
];

// --- Components ---

const LoveCounter = ({ startDate }: { startDate: string }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = new Date(startDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      
      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-pink-100 shadow-sm mb-8 text-center">
      <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest mb-4">Together For</h3>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Days', value: time.days },
          { label: 'Hrs', value: time.hours },
          { label: 'Min', value: time.minutes },
          { label: 'Sec', value: time.seconds }
        ].map((t, i) => (
          <div key={i} className="bg-white/60 p-2 rounded-xl">
            <div className="text-xl font-black text-pink-600 leading-none">{t.value}</div>
            <div className="text-[8px] font-bold text-pink-300 uppercase mt-1">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractionOverlay = ({ type, sender, onComplete }: { type: 'hug' | 'kiss', sender: string, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-pink-500/20 backdrop-blur-sm pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 1.2], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.8 }}
        className="text-9xl mb-4"
      >
        {type === 'hug' ? '🫂' : '💋'}
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white px-6 py-3 rounded-full shadow-2xl border-2 border-pink-200"
      >
        <p className="text-pink-600 font-black text-xl">
          {sender} sent you a {type}!
        </p>
      </motion.div>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ 
            x: (Math.random() - 0.5) * 600, 
            y: (Math.random() - 0.5) * 600, 
            opacity: 0,
            scale: 0
          }}
          transition={{ duration: 2, delay: Math.random() }}
          className="absolute text-4xl"
        >
          {type === 'hug' ? '💖' : '❤️'}
        </motion.div>
      ))}
    </motion.div>
  );
};

const Scrapbook = ({ photos, onAdd }: { photos: any[], onAdd: (data: string, caption: string) => void }) => {
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAdd(reader.result as string, caption);
        setCaption('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
        <h3 className="text-pink-600 font-black mb-4">Add a Memory</h3>
        <input 
          type="text" 
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-3 rounded-xl border border-pink-100 focus:ring-2 focus:ring-pink-200 outline-none mb-3"
        />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-pink-500 text-white py-3 rounded-xl font-black shadow-lg hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Upload Photo
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {photos.map((p, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-3xl shadow-md border border-pink-50"
          >
            <img src={p.data} alt="Memory" className="w-full h-48 object-cover rounded-2xl mb-3" referrerPolicy="no-referrer" />
            <p className="text-slate-600 font-medium italic">"{p.caption}"</p>
            <p className="text-[10px] text-slate-400 mt-2">{new Date(p.timestamp).toLocaleDateString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const DateIdeas = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const ideas = ["Netflix Marathon 🍿", "Late Night Walk 🌙", "Gaming Session 🎮", "Order Pizza 🍕", "Coffee Date ☕", "Cook Together 🍳", "Star Gazing ✨", "Bowling 🎳"];

  const spin = () => {
    setSpinning(true);
    setResult(null);
    setTimeout(() => {
      const random = ideas[Math.floor(Math.random() * ideas.length)];
      setResult(random);
      setSpinning(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 2000);
  };

  return (
    <div className="text-center py-12">
      <div className="relative w-64 h-64 mx-auto mb-8">
        <motion.div
          animate={spinning ? { rotate: 360 * 5 } : { rotate: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="w-full h-full rounded-full border-8 border-pink-200 bg-white flex items-center justify-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-pink-50" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-pink-50" />
          </div>
          <Heart className="text-pink-500 relative z-10" size={48} fill="currentColor" />
        </motion.div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-8 bg-pink-600 rounded-full z-20" />
      </div>
      
      {result && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-8">
          <h2 className="text-3xl font-black text-pink-600 mb-2">Let's do...</h2>
          <div className="bg-white px-8 py-4 rounded-full shadow-xl border-2 border-pink-200 inline-block text-2xl font-black text-slate-800">
            {result}
          </div>
        </motion.div>
      )}

      <button 
        onClick={spin}
        disabled={spinning}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-12 py-4 rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
      >
        {spinning ? "Spinning..." : "SPIN THE WHEEL"}
      </button>
    </div>
  );
};

const LoveLetters = ({ letters, onAdd }: { letters: any[], onAdd: (title: string, text: string) => void }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<any>(null);

  return (
    <div className="space-y-6">
      {!isWriting && !selectedLetter && (
        <>
          <button 
            onClick={() => setIsWriting(true)}
            className="w-full bg-white p-6 rounded-3xl border-2 border-dashed border-pink-200 text-pink-400 font-black flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors"
          >
            <Plus /> Write a new Love Letter
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {letters.map((l, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedLetter(l)}
                className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 cursor-pointer relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookHeart size={64} />
                </div>
                <h3 className="font-black text-pink-600 text-lg mb-1">{l.title}</h3>
                <p className="text-slate-400 text-sm">{new Date(l.timestamp).toLocaleDateString()}</p>
                <div className="mt-4 flex items-center text-pink-400 font-bold text-xs uppercase tracking-widest">
                  Read Letter <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {isWriting && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-100">
          <input 
            type="text" 
            placeholder="Letter Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-black text-pink-600 placeholder:text-pink-200 outline-none mb-6"
          />
          <textarea 
            placeholder="Start writing your heart out..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 p-4 rounded-2xl bg-pink-50/30 border border-pink-50 outline-none text-slate-700 leading-relaxed mb-6"
          />
          <div className="flex gap-4">
            <button 
              onClick={() => { onAdd(title, text); setIsWriting(false); setTitle(''); setText(''); }}
              className="flex-1 bg-pink-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-pink-600 transition-colors"
            >
              Seal & Send Letter
            </button>
            <button 
              onClick={() => setIsWriting(false)}
              className="px-8 py-4 rounded-2xl font-black text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {selectedLetter && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#fffcf9] p-10 rounded-[3rem] shadow-2xl border border-orange-100 relative">
          <button onClick={() => setSelectedLetter(null)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-orange-50 text-orange-300">
            <X />
          </button>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-orange-800 mb-2 font-serif italic">{selectedLetter.title}</h2>
            <p className="text-orange-300 text-sm mb-8 font-mono">{new Date(selectedLetter.timestamp).toLocaleString()}</p>
            <div className="prose prose-pink text-orange-900 leading-loose text-lg whitespace-pre-wrap font-serif">
              {selectedLetter.text}
            </div>
            <div className="mt-12 pt-8 border-t border-orange-100 text-center">
              <p className="text-orange-400 font-serif italic text-xl">With all my love,</p>
              <p className="text-orange-800 font-black text-2xl mt-2">{selectedLetter.sender}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const RelationshipGoals = ({ goals, onToggle, onAdd }: { goals: any[], onToggle: (i: number) => void, onAdd: (text: string) => void }) => {
  const [newGoal, setNewGoal] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100 flex gap-3">
        <input 
          type="text" 
          placeholder="New goal together..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-pink-100 focus:ring-2 focus:ring-pink-200 outline-none"
        />
        <button 
          onClick={() => { onAdd(newGoal); setNewGoal(''); }}
          className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-colors"
        >
          <Plus />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {goals.map((g, i) => (
          <motion.div 
            key={i}
            onClick={() => onToggle(i)}
            className={cn(
              "p-6 rounded-3xl border transition-all cursor-pointer flex items-center justify-between",
              g.completed ? "bg-pink-50 border-pink-200 opacity-70" : "bg-white border-pink-100 shadow-sm"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                g.completed ? "bg-pink-500 border-pink-500 text-white" : "border-pink-200"
              )}>
                {g.completed && <Check size={14} />}
              </div>
              <span className={cn("font-bold", g.completed ? "line-through text-pink-400" : "text-slate-700")}>
                {g.text}
              </span>
            </div>
            {g.completed && <Trophy className="text-pink-400" size={20} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const LocationSharing = ({ data, onUpdate }: { data: any, onUpdate: (city: string) => void }) => {
  const [city, setCity] = useState('');

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-pink-100 text-center">
      <div className="flex justify-center gap-8 mb-8">
        {['player1', 'player2'].map((p) => (
          <div key={p} className="space-y-2">
            <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mx-auto border-2 border-pink-100">
              <User size={40} className="text-pink-300" />
            </div>
            <p className="font-black text-pink-600">{data?.[p]?.name || (p === 'player1' ? 'Saif' : 'Ayesha')}</p>
            <p className="text-xs text-slate-400 font-bold uppercase">{data?.[p]?.city || 'Unknown Location'}</p>
            <p className="text-xl font-black text-slate-700">{data?.[p]?.time || '--:--'}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-3 max-w-xs mx-auto">
        <input 
          type="text" 
          placeholder="Update your city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 p-3 rounded-xl border border-pink-100 outline-none"
        />
        <button 
          onClick={() => { onUpdate(city); setCity(''); }}
          className="bg-pink-500 text-white px-6 py-3 rounded-xl font-black hover:bg-pink-600 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
};

const LoveMeter = ({ points }: { points: number }) => {
  const maxPoints = 100;
  const percentage = Math.min((points / maxPoints) * 100, 100);
  
  return (
    <div className="w-full bg-white/50 backdrop-blur-sm p-6 rounded-[2rem] border border-pink-100 shadow-sm mb-8">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h3 className="text-xs font-black text-pink-400 uppercase tracking-widest">Love Meter</h3>
          <p className="text-lg font-black text-pink-600">Level {Math.floor(points / 20) + 1}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-pink-500">{Math.floor(percentage)}%</span>
        </div>
      </div>
      <div className="h-4 w-full bg-pink-50 rounded-full overflow-hidden border border-pink-100 p-0.5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
        </motion.div>
      </div>
      <p className="text-[10px] text-pink-300 font-bold mt-3 text-center uppercase tracking-tighter">
        {percentage < 30 ? "Just getting started... 🌱" : 
         percentage < 60 ? "The spark is growing! ✨" : 
         percentage < 90 ? "Deeply connected ❤️" : "Soulmates Forever ♾️"}
      </p>
    </div>
  );
};

const FloatingHearts = () => {
  const hearts = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 10 + Math.random() * 30,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ bottom: -50, opacity: 0 }}
          animate={{
            bottom: '110%',
            opacity: [0, 0.5, 0.5, 0],
            x: [0, 20, -20, 0],
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "linear"
          }}
          className="absolute text-pink-200/40"
          style={{ left: heart.left }}
        >
          <Heart size={heart.size} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="w-full h-1.5 bg-pink-100 rounded-full overflow-hidden mb-8">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      className="h-full bg-pink-500"
    />
  </div>
);

// --- Main App ---

export default function App() {
  // Navigation State
  const [activeSection, setActiveSection] = useState<'proposal' | 'story' | 'gallery' | 'game'>('proposal');
  
  // Proposal State
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [yesScale, setYesScale] = useState(1);
  const [noClickCount, setNoClickCount] = useState(0);
  const [ayeshamessages, setAyeshamessages] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [showInteraction, setShowInteraction] = useState<{type: 'hug' | 'kiss', sender: string} | null>(null);

  // Game State
  const [gameView, setGameView] = useState<'home' | 'single' | 'multi-setup' | 'multi-game' | 'result' | 'timeline' | 'bucket-list' | 'mood-sync' | 'secret-notes' | 'scrapbook' | 'love-letters' | 'date-ideas' | 'goals'>('home');
  const [roomCode, setRoomCode] = useState('');
  const [playerNum, setPlayerNum] = useState<1 | 2>(1);
  const [playerName, setPlayerName] = useState('');
  const [roomData, setRoomData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameAnswers, setGameAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [detailedResults, setDetailedResults] = useState<{q: string, p1: string, p2: string}[]>([]);
  const [customQuestions, setCustomQuestions] = useState<string[]>(QUESTIONS);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [noteText, setNoteText] = useState('');

  const COMPLIMENTS = [
    "You are the most beautiful person I know, inside and out. ❤️",
    "Every day with you is a new adventure I never want to end. ✨",
    "Your smile is my favorite thing in the entire world. 😊",
    "I am so lucky to have you by my side. 💖",
    "You make my heart skip a beat every single time. 💓",
    "I love you more than words can ever express. 🌹",
    "You are my mirror and my better half. 👩‍❤️‍👨"
  ];

  const getDailyCompliment = () => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return COMPLIMENTS[dayOfYear % COMPLIMENTS.length];
  };

  // Music State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Using a reliable royalty-free romantic piano track
    const romanticTrack = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 
    audioRef.current = new Audio(romanticTrack);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2;

    const startMusic = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play()
          .then(() => setIsMusicPlaying(true))
          .catch(err => console.warn("Audio playback failed:", err));
      }
    };

    window.addEventListener('click', startMusic, { once: true });
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.removeEventListener('click', startMusic);
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(console.error);
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  // Firebase Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room');
    if (code) {
      setActiveSection('game');
      joinRoom(code);
    }
  }, []);

  useEffect(() => {
    if (roomCode) {
      const unsub = onSnapshot(doc(db, 'rooms', roomCode), (snapshot) => {
        const data = snapshot.data();
        if (data) {
          setRoomData(data);
          // Automatic join for host
          if (data.player2?.name && gameView === 'multi-setup') {
            setGameView('multi-game');
          }
          if (data.player1?.submitted && data.player2?.submitted && gameView !== 'result') {
            calculateMultiplayerResult(data);
          }
          if (data.virtualInteractions && data.virtualInteractions.timestamp !== roomData?.virtualInteractions?.timestamp) {
            if (data.virtualInteractions.sender !== playerName) {
              setShowInteraction({ type: data.virtualInteractions.type, sender: data.virtualInteractions.sender });
            }
          }
        }
      });
      return () => unsub();
    }
  }, [roomCode]);

  const createRoom = async () => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }
    setLoading(true);
    const code = generateRoomCode();
    setRoomCode(code);
    setPlayerNum(1);
    try {
      await setDoc(doc(db, 'rooms', code), {
        roomCode: code,
        questions: customQuestions,
        player1: { name: playerName, answers: [], submitted: false },
        player2: { name: '', answers: [], submitted: false },
        bucketList: [],
        timeline: [
          { date: "2026-03-23", title: "Met on 23 March 2026", description: "The day everything changed." },
          { date: new Date().toISOString().split('T')[0], title: "First Game Match", description: "Testing our connection!" }
        ],
        messages: [],
        moods: { player1: '', player2: '' },
        lovePoints: 0,
        loveCounterStartDate: new Date().toISOString(),
        virtualInteractions: null,
        scrapbook: [],
        loveLetters: [],
        locationData: { player1: { city: '', time: '' }, player2: { city: '', time: '' } },
        relationshipGoals: [
          { text: "First Trip Together ✈️", completed: false },
          { text: "Meeting the Parents 👨‍👩‍👧‍👦", completed: false },
          { text: "Moving in Together 🏠", completed: false }
        ],
        status: 'waiting',
        createdAt: serverTimestamp()
      });
      setGameView('multi-setup');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (code: string) => {
    if (!playerName) {
      alert("Please enter your name first!");
      return;
    }
    setLoading(true);
    try {
      const roomDoc = await getDoc(doc(db, 'rooms', code));
      if (roomDoc.exists()) {
        const data = roomDoc.data();
        if (data.status === 'waiting') {
          await updateDoc(doc(db, 'rooms', code), {
            'player2.name': playerName,
            status: 'playing'
          });
          setRoomCode(code);
          setPlayerNum(2);
          setGameView('multi-game');
        } else {
          alert("Room is already full or game started!");
        }
      } else {
        alert("Room not found!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const shareRoom = async () => {
    const text = `Join my "Do You Know Me?" room! Code: ${roomCode}\nLink: ${window.location.origin}?room=${roomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Do You Know Me?',
          text: text,
          url: window.location.origin + '?room=' + roomCode
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        // In a real app, upload to Storage. Here we'll convert to base64 for Firestore (limit 1MB)
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          if (roomCode) {
            updateDoc(doc(db, 'rooms', roomCode), { voiceNote: base64data });
          }
        };
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const updateMood = async (mood: string) => {
    if (roomCode) {
      await updateDoc(doc(db, 'rooms', roomCode), {
        [`moods.player${playerNum}`]: mood
      });
    }
  };

  const sendNote = async () => {
    if (!noteText.trim() || !roomCode) return;
    const newNote = {
      id: Math.random().toString(36).substring(7),
      sender: playerName || `Player ${playerNum}`,
      text: noteText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const currentMessages = roomData?.messages || [];
    await updateDoc(doc(db, 'rooms', roomCode), {
      messages: [...currentMessages, newNote]
    });
    setNoteText('');
  };

  const handleNoHover = useCallback(() => {
    const padding = 100;
    const maxX = Math.min(window.innerWidth / 2 - padding, 200);
    const maxY = Math.min(window.innerHeight / 2 - padding, 300);
    const newX = (Math.random() - 0.5) * maxX * 2;
    const newY = (Math.random() - 0.5) * maxY * 2;
    setNoButtonPos({ x: newX, y: newY });
    setYesScale(prev => Math.min(prev + 0.15, 3));
    setNoClickCount(prev => prev + 1);
  }, []);

  const handleYes = () => {
    setIsAccepted(true);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
  };

  const sendWhatsApp = () => {
    if (!ayeshamessages.trim()) return;
    const encodedMessage = encodeURIComponent(`Hey Saif! 💖\n\n${ayeshamessages}`);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    setIsMessageSent(true);
  };

  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) return;
    const newAnswers = [...gameAnswers, currentAnswer];
    const questionsToUse = roomData?.questions || QUESTIONS;
    if (currentQuestionIndex < questionsToUse.length - 1) {
      setGameAnswers(newAnswers);
      setCurrentAnswer('');
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setLoading(true);
      if (gameView === 'single') {
        let matches = 0;
        // Mock matching for single player
        newAnswers.forEach(ans => { if (ans.length > 5) matches++; });
        const percentage = (matches / questionsToUse.length) * 100;
        setMatchPercentage(percentage);
        setGameView('result');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        sendToDiscord("Single Player Result", { answers: newAnswers, match: percentage });
      } else {
        setLoading(true);
        const docRef = doc(db, 'rooms', roomCode);
        const update: any = {};
        update[`player${playerNum}.answers`] = newAnswers;
        update[`player${playerNum}.submitted`] = true;
        await updateDoc(docRef, update);
        setLoading(false);
      }
    }
  };

  const calculateMultiplayerResult = (data: any) => {
    let matches = 0;
    const a1 = data.player1.answers;
    const a2 = data.player2.answers;
    const questionsToUse = data.questions || QUESTIONS;
    const results = questionsToUse.map((q: string, i: number) => {
      const p1Ans = a1[i] || '';
      const p2Ans = a2[i] || '';
      if (p1Ans.toLowerCase().trim() === p2Ans.toLowerCase().trim()) matches++;
      return { q, p1: p1Ans, p2: p2Ans };
    });
    
    setDetailedResults(results);
    const percentage = (matches / questionsToUse.length) * 100;
    setMatchPercentage(percentage);
    setGameView('result');
    
    // Update Love Meter
    if (roomCode) {
      const pointsToAdd = Math.floor(percentage / 10);
      updateDoc(doc(db, 'rooms', roomCode), {
        lovePoints: increment(pointsToAdd)
      });
    }

    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
    sendToDiscord("Multiplayer Result", { room: roomCode, p1: a1, p2: a2, match: percentage });
    
    if (percentage === 100 && data.voiceNote && data.voiceNote.startsWith('data:audio')) {
      try {
        const audio = new Audio(data.voiceNote);
        audio.play().catch(err => console.warn("Voice note playback failed:", err));
      } catch (err) {
        console.warn("Invalid voice note data:", err);
      }
    }
  };

  const downloadResults = () => {
    const content = detailedResults.map((r, i) => 
      `Question ${i+1}: ${r.q}\nSaif's Answer: ${r.p1}\nAyesha's Answer: ${r.p2}\n${"-".repeat(30)}`
    ).join('\n\n');
    
    const header = `💖 OUR MATCH RESULTS 💖\nMatch Percentage: ${Math.round(matchPercentage)}%\n\n`;
    const blob = new Blob([header + content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `our_love_match_${roomCode}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-800 font-sans selection:bg-pink-200 overflow-x-hidden flex flex-col items-center">
      <FloatingHearts />
      
      <AnimatePresence>
        {showInteraction && (
          <InteractionOverlay 
            type={showInteraction.type} 
            sender={showInteraction.sender} 
            onComplete={() => setShowInteraction(null)} 
          />
        )}
      </AnimatePresence>

      {/* Global Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <button 
          onClick={toggleMusic}
          className="p-3 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-pink-100 text-pink-500 hover:scale-110 transition-transform"
        >
          {isMusicPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-pink-50 flex gap-6 md:gap-12">
        {[
          { id: 'proposal', icon: Heart, label: 'Proposal' },
          { id: 'story', icon: BookHeart, label: 'Story' },
          { id: 'gallery', icon: Video, label: 'Gallery' },
          { id: 'game', icon: Gamepad2, label: 'Game' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              activeSection === tab.id ? "text-pink-500 scale-110" : "text-slate-400 hover:text-pink-300"
            )}
          >
            <tab.icon size={20} fill={activeSection === tab.id ? "currentColor" : "none"} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="relative z-10 w-full max-w-lg flex-1 flex items-center justify-center p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeSection === 'proposal' && (
            <motion.div
              key="proposal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              {!isAccepted ? (
                <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(255,182,193,0.2)] border border-pink-50 text-center relative">
                    <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                    <img 
                      src="/proposal.jpg" 
                      alt="Romantic" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback if the user hasn't uploaded their image yet
                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/romantic/400/400";
                      }}
                    />
                  </div>
                  <motion.p className="text-pink-400 font-bold tracking-widest uppercase text-xs mb-4">A Special Message</motion.p>
                  <h1 className="text-4xl font-black text-pink-600 mb-2 leading-tight">Pookie Ayesha,</h1>
                  <h2 className="text-xl text-pink-500 mb-10 font-medium">Will you be my GF? <span className="inline-block animate-bounce">👉👈</span></h2>
                  
                  <div className="flex flex-col items-center gap-8 relative h-48 justify-center">
                    <motion.button
                      onClick={handleYes}
                      style={{ scale: yesScale }}
                      className="bg-pink-500 text-white px-10 py-5 rounded-full font-bold shadow-xl shadow-pink-200 flex items-center gap-3 z-20"
                    >
                      <Sparkles size={22} /> Yessssssssss 💖
                    </motion.button>
                    <motion.button
                      animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                      onMouseEnter={handleNoHover}
                      onClick={handleNoHover}
                      className="border-2 border-pink-100 text-pink-300 px-8 py-3 rounded-full font-semibold"
                    >
                      no
                    </motion.button>
                  </div>
                  <p className="mt-8 text-sm text-pink-200 italic font-medium">
                    {noClickCount > 5 ? "Resistance is futile! 😈" : "\"no\" seems a bit shy 😈"}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-pink-50 text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 100 }}
                    className="relative w-32 h-32 mx-auto mb-6"
                  >
                    <div className="absolute inset-0 bg-pink-400 rounded-full blur-xl opacity-50 animate-pulse" />
                    <div className="relative w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden z-10">
                      <img 
                        src="/ayesha-circle.jpg" 
                        alt="Ayesha" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/proposal.jpg";
                        }}
                      />
                    </div>
                  </motion.div>
                  <h1 className="text-4xl font-black text-pink-600 mb-6">OMGGG &lt;3</h1>
                  
                  <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100 text-left mb-6">
                    <div className="flex items-center gap-3 text-pink-600 font-bold mb-2">
                      <Calendar size={20} />
                      <span>Met on 23 March 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-pink-600 font-bold mb-4">
                      <Users size={20} />
                      <span>We are so similar!</span>
                    </div>
                    <p className="text-pink-500 text-sm leading-relaxed">
                      From the moment we met on that beautiful day in March, I knew there was something special. 
                      It's crazy how we think alike, like the same things, and just "click" so perfectly. 
                      You're my mirror and my better half. I promise to adore you, cherish every second with you, 
                      and love you with all my heart forever. 💖
                    </p>
                  </div>

                  <p className="text-pink-600 mb-8 font-black italic text-xl">"I promise to love you forever 💖"</p>
                  
                  {!isMessageSent ? (
                    <div className="space-y-4">
                      <p className="text-pink-400 font-bold text-xs uppercase tracking-widest">Write a message to ur good boy</p>
                      <textarea 
                        value={ayeshamessages}
                        onChange={(e) => setAyeshamessages(e.target.value)}
                        placeholder="Tell me something sweet..."
                        className="w-full h-32 p-4 rounded-2xl bg-pink-50 border border-pink-100 text-pink-700 text-sm focus:outline-none resize-none placeholder:text-pink-200"
                      />
                      <button 
                        onClick={async () => {
                          if (!ayeshamessages.trim()) return;
                          setLoading(true);
                          await sendToDiscord("Sweet Message from Ayesha 💖", { message: ayeshamessages });
                          setIsMessageSent(true);
                          setLoading(false);
                        }} 
                        className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors shadow-lg shadow-pink-100"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />} 
                        Send to Ur Lil kitty hehe 💖
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-600 font-bold"
                    >
                      Message Sent to Saif! 💌
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeSection === 'story' && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-pink-50"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-pink-100 rounded-2xl text-pink-500"><BookHeart size={28} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Our Journey</h2>
                  <p className="text-pink-400 text-sm">Where it all began...</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 border border-rose-100"><Calendar size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-700">March 23rd</h3>
                    <p className="text-slate-500 leading-relaxed">The day the universe decided to be kind. We met, and everything changed.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 border border-blue-100"><Gamepad2 size={24} /></div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-700">Valorant Duo</h3>
                    <p className="text-slate-500 leading-relaxed">Who knew a tactical shooter would lead to this? From clutching rounds to clutching hearts.</p>
                  </div>
                </div>
                <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100 italic text-pink-700 font-medium">
                  "Ayesha, you're the Vandal to my headshot, the Sage to my heal, and the light to my world."
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="w-full"
            >
              <h2 className="text-3xl font-black text-pink-600 mb-8 text-center">Adoring You</h2>
              <div className="grid grid-cols-1 gap-8">
                {[
                  { id: 1, title: "Your Beautiful Smile", src: "/ayesha1.mp4" },
                  { id: 2, title: "My cutieee pieeee", src: "/ayesha2.mp4" }
                ].map((video) => (
                  <div key={video.id} className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-pink-50 overflow-hidden">
                    <div className="bg-black rounded-[1.5rem] overflow-hidden relative group flex items-center justify-center min-h-[200px]">
                      <video 
                        src={video.src} 
                        controls 
                        preload="metadata"
                        className="max-w-full max-h-[70vh] w-auto h-auto"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="mt-4 flex items-center justify-between px-2">
                      <h4 className="font-bold text-slate-700">{video.title}</h4>
                      <Heart size={18} className="text-pink-400" fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 p-6 bg-white/50 rounded-3xl border border-dashed border-pink-200 text-center">
                <p className="text-pink-400 text-xs font-bold uppercase tracking-widest">More moments coming soon...</p>
              </div>
            </motion.div>
          )}

          {activeSection === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <AnimatePresence mode="wait">
                {gameView === 'home' && (
                  <div className="text-center">
                    {roomData && (
                      <>
                        <LoveCounter startDate={roomData.loveCounterStartDate || new Date().toISOString()} />
                        <LoveMeter points={roomData.lovePoints || 0} />
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <button 
                            onClick={async () => {
                              await updateDoc(doc(db, 'rooms', roomCode), {
                                virtualInteractions: { type: 'hug', sender: playerName, timestamp: Date.now() }
                              });
                              confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
                            }}
                            className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center gap-2 hover:bg-pink-50 transition-colors"
                          >
                            <span className="text-2xl">🫂</span>
                            <span className="text-[10px] font-black text-pink-500 uppercase">Send Hug</span>
                          </button>
                          <button 
                            onClick={async () => {
                              await updateDoc(doc(db, 'rooms', roomCode), {
                                virtualInteractions: { type: 'kiss', sender: playerName, timestamp: Date.now() }
                              });
                              confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
                            }}
                            className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center gap-2 hover:bg-pink-50 transition-colors"
                          >
                            <span className="text-2xl">💋</span>
                            <span className="text-[10px] font-black text-pink-500 uppercase">Send Kiss</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {[
                            { id: 'scrapbook', icon: '📸', label: 'Scrapbook' },
                            { id: 'love-letters', icon: '💌', label: 'Letters' },
                            { id: 'date-ideas', icon: '🎡', label: 'Date Ideas' },
                            { id: 'goals', icon: '🎯', label: 'Our Goals' }
                          ].map((item) => (
                            <button 
                              key={item.id}
                              onClick={() => setGameView(item.id as any)}
                              className="bg-white/60 backdrop-blur-sm p-4 rounded-3xl border border-pink-50 shadow-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform"
                            >
                              <span className="text-2xl">{item.icon}</span>
                              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{item.label}</span>
                            </button>
                          ))}
                        </div>

                        <LocationSharing 
                          data={roomData.locationData} 
                          onUpdate={async (city) => {
                            const update: any = {};
                            update[`locationData.player${playerNum}`] = { 
                              city, 
                              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            };
                            await updateDoc(doc(db, 'rooms', roomCode), update);
                          }} 
                        />
                      </>
                    )}
                    
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="mb-8 inline-block p-6 bg-white rounded-full shadow-xl border border-pink-50 cursor-pointer relative group"
                      onClick={() => alert(getDailyCompliment())}
                    >
                      <Heart className="text-pink-500" size={48} fill="currentColor" />
                      <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-bounce">Daily Tip</div>
                    </motion.div>
                    <h1 className="text-4xl font-black text-pink-600 mb-4">DO YOU KNOW ME?</h1>
                    <p className="text-pink-400 mb-10 font-medium italic">“This game was made for one person… maybe it’s you.”</p>
                    
                    <div className="mb-6">
                      <input 
                        type="text" 
                        placeholder="Your Name (e.g. Saif)" 
                        className="w-full bg-white border-2 border-pink-100 rounded-2xl px-6 py-4 text-pink-600 focus:outline-none font-bold text-center"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-4">
                      <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setGameView('single')} 
                        className="w-full bg-pink-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all active:scale-95"
                      >
                        <User size={20} /> Single Player Mode
                      </motion.button>
                      
                      <div className="bg-white p-6 rounded-3xl border-2 border-pink-50 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-pink-600 flex items-center gap-2"><Gamepad2 size={18} /> Multiplayer</h3>
                          <button 
                            onClick={() => setIsCustomMode(!isCustomMode)}
                            className={cn("text-xs font-bold px-3 py-1 rounded-full transition-all", isCustomMode ? "bg-pink-500 text-white" : "bg-pink-50 text-pink-400")}
                          >
                            {isCustomMode ? "Custom Mode ON" : "Standard Mode"}
                          </button>
                        </div>
                        
                        {isCustomMode && (
                          <div className="mb-4 space-y-2">
                            {customQuestions.map((q, i) => (
                              <div key={i} className="flex gap-2">
                                <input 
                                  className="flex-1 bg-pink-50/50 border border-pink-100 rounded-xl px-3 py-2 text-sm text-pink-700"
                                  value={q}
                                  onChange={(e) => {
                                    const newQ = [...customQuestions];
                                    newQ[i] = e.target.value;
                                    setCustomQuestions(newQ);
                                  }}
                                />
                                <button onClick={() => setCustomQuestions(customQuestions.filter((_, idx) => idx !== i))} className="text-pink-300 hover:text-pink-500"><Trash2 size={16} /></button>
                              </div>
                            ))}
                            <button 
                              onClick={() => setCustomQuestions([...customQuestions, ""])}
                              className="w-full py-2 border-2 border-dashed border-pink-100 rounded-xl text-pink-300 text-xs font-bold hover:border-pink-300 hover:text-pink-500 transition-all"
                            >
                              + Add Custom Question
                            </button>
                          </div>
                        )}

                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={createRoom} 
                          className="w-full bg-white border-2 border-pink-100 text-pink-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-pink-50 transition-all active:scale-95 mb-4"
                        >
                          {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />} Create Room
                        </motion.button>

                        <div className="pt-4 border-t border-pink-50">
                          <p className="text-xs font-bold text-pink-300 uppercase tracking-widest mb-3">Or Join a Room</p>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Enter Code" 
                              className="flex-1 bg-pink-50 border border-pink-100 rounded-xl px-4 py-3 text-pink-600 focus:outline-none uppercase font-bold tracking-widest"
                              value={roomCode}
                              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            />
                            <button 
                              onClick={() => joinRoom(roomCode)}
                              disabled={!roomCode || loading}
                              className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGameView('timeline')} 
                          className="bg-white border border-pink-100 p-4 rounded-2xl font-bold text-pink-500 flex flex-col items-center gap-2 shadow-sm hover:bg-pink-50 transition-all"
                        >
                          <Calendar size={24} /> Timeline
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGameView('bucket-list')} 
                          className="bg-white border border-pink-100 p-4 rounded-2xl font-bold text-pink-500 flex flex-col items-center gap-2 shadow-sm hover:bg-pink-50 transition-all"
                        >
                          <CheckCircle2 size={24} /> Bucket List
                        </motion.button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGameView('mood-sync')} 
                          className="bg-white border border-pink-100 p-4 rounded-2xl font-bold text-pink-500 flex flex-col items-center gap-2 shadow-sm hover:bg-pink-50 transition-all"
                        >
                          <Sparkles size={24} /> Mood Sync
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setGameView('secret-notes')} 
                          className="bg-white border border-pink-100 p-4 rounded-2xl font-bold text-pink-500 flex flex-col items-center gap-2 shadow-sm hover:bg-pink-50 transition-all"
                        >
                          <MessageCircle size={24} /> Secret Notes
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {(gameView === 'single' || gameView === 'multi-game') && (
                  <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] border border-pink-50 shadow-2xl">
                    <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />
                    <div className="mb-12">
                      <span className="text-pink-400 font-bold text-xs uppercase tracking-widest mb-2 block">Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
                      <h2 className="text-2xl font-bold text-pink-800 leading-tight">{QUESTIONS[currentQuestionIndex]}</h2>
                    </div>
                    <textarea 
                      autoFocus
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your heart out..."
                      className="w-full h-32 bg-pink-50 border border-pink-100 rounded-2xl p-4 text-pink-700 placeholder:text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all resize-none mb-8"
                    />
                    <button onClick={handleAnswerSubmit} disabled={!currentAnswer.trim()} className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all flex items-center justify-center gap-2">
                      Next Question <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {gameView === 'multi-setup' && (
                  <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] border border-pink-50 shadow-2xl text-center">
                    <div className="mb-8 p-6 bg-pink-50 rounded-3xl inline-block"><Users className="text-pink-500" size={40} /></div>
                    <h2 className="text-3xl font-black text-pink-800 mb-2">Invite Your Duo</h2>
                    <p className="text-pink-400 mb-8">Share this code or link to start the match.</p>
                    <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 mb-6">
                      <span className="text-pink-300 text-xs uppercase tracking-widest block mb-2 font-bold">Room Code</span>
                      <div className="text-4xl font-black tracking-widest text-pink-600">{roomCode}</div>
                    </div>
                    <div className="flex gap-3 mb-8">
                      <button onClick={shareRoom} className="flex-1 bg-white border-2 border-pink-100 text-pink-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                        {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />} {copied ? 'Copied!' : 'Share Link'}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-4 bg-pink-50 text-pink-500 rounded-xl border border-pink-100"><Copy size={20} /></button>
                    </div>

                    <div className="bg-pink-50/50 p-6 rounded-3xl border border-pink-100 mb-8">
                      <h3 className="font-bold text-pink-600 mb-2 flex items-center justify-center gap-2">
                        <Mic size={18} /> Record a Voice Note
                      </h3>
                      <p className="text-[10px] text-pink-300 mb-4 uppercase font-bold tracking-widest">Plays automatically at 100% match!</p>
                      <div className="flex items-center justify-center gap-4">
                        {!isRecording ? (
                          <button onClick={startRecording} className="w-14 h-14 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 transition-all">
                            <Mic size={20} />
                          </button>
                        ) : (
                          <button onClick={stopRecording} className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <X size={20} />
                          </button>
                        )}
                        {audioBlob && <div className="text-green-500 font-bold flex items-center gap-1 text-xs"><CheckCircle2 size={14} /> Recorded!</div>}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-pink-300">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm font-bold uppercase tracking-wider">Waiting for them to join...</span>
                    </div>
                  </div>
                )}

                {gameView === 'scrapbook' && (
                  <div className="space-y-8">
                    <button onClick={() => setGameView('home')} className="flex items-center gap-2 text-pink-500 font-black uppercase text-xs">
                      <ChevronLeft size={16} /> Back Home
                    </button>
                    <h2 className="text-3xl font-black text-pink-600">Our Scrapbook</h2>
                    <Scrapbook 
                      photos={roomData?.scrapbook || []} 
                      onAdd={async (data, caption) => {
                        const newPhotos = [{ data, caption, timestamp: Date.now() }, ...(roomData?.scrapbook || [])];
                        await updateDoc(doc(db, 'rooms', roomCode), { scrapbook: newPhotos.slice(0, 10) }); // Limit to 10 for Firestore size
                      }} 
                    />
                  </div>
                )}

                {gameView === 'love-letters' && (
                  <div className="space-y-8">
                    <button onClick={() => setGameView('home')} className="flex items-center gap-2 text-pink-500 font-black uppercase text-xs">
                      <ChevronLeft size={16} /> Back Home
                    </button>
                    <h2 className="text-3xl font-black text-pink-600">Love Letters</h2>
                    <LoveLetters 
                      letters={roomData?.loveLetters || []} 
                      onAdd={async (title, text) => {
                        const newLetters = [{ title, text, sender: playerName, timestamp: Date.now() }, ...(roomData?.loveLetters || [])];
                        await updateDoc(doc(db, 'rooms', roomCode), { loveLetters: newLetters });
                      }} 
                    />
                  </div>
                )}

                {gameView === 'date-ideas' && (
                  <div className="space-y-8">
                    <button onClick={() => setGameView('home')} className="flex items-center gap-2 text-pink-500 font-black uppercase text-xs">
                      <ChevronLeft size={16} /> Back Home
                    </button>
                    <h2 className="text-3xl font-black text-pink-600 text-center">Date Idea Wheel</h2>
                    <DateIdeas />
                  </div>
                )}

                {gameView === 'goals' && (
                  <div className="space-y-8">
                    <button onClick={() => setGameView('home')} className="flex items-center gap-2 text-pink-500 font-black uppercase text-xs">
                      <ChevronLeft size={16} /> Back Home
                    </button>
                    <h2 className="text-3xl font-black text-pink-600">Relationship Goals</h2>
                    <RelationshipGoals 
                      goals={roomData?.relationshipGoals || []} 
                      onToggle={async (i) => {
                        const newList = [...(roomData?.relationshipGoals || [])];
                        newList[i].completed = !newList[i].completed;
                        await updateDoc(doc(db, 'rooms', roomCode), { relationshipGoals: newList });
                      }}
                      onAdd={async (text) => {
                        const newList = [...(roomData?.relationshipGoals || []), { text, completed: false }];
                        await updateDoc(doc(db, 'rooms', roomCode), { relationshipGoals: newList });
                      }}
                    />
                  </div>
                )}

                {gameView === 'timeline' && (
                  <div className="w-full">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setGameView('home')} className="p-2 bg-white rounded-full shadow-sm text-pink-500"><ChevronLeft size={20} /></button>
                      <h2 className="text-2xl font-black text-pink-800">Our Love Timeline</h2>
                    </div>
                    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-pink-100">
                      {(roomData?.timeline || [
                        { date: "2026-03-23", title: "Met on 23 March 2026", description: "The day everything changed." },
                        { date: "2026-04-01", title: "First Game Match", description: "Testing our connection!" },
                        { date: "Soon...", title: "Our Next Adventure", description: "Can't wait to see what's next." }
                      ]).map((item: any, i: number) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[29px] top-1.5 w-4 h-4 bg-white border-2 border-pink-500 rounded-full z-10" />
                          <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-pink-50/50 border border-pink-50">
                            <p className="text-[10px] font-bold text-pink-300 uppercase tracking-widest mb-1">{item.date}</p>
                            <h4 className="text-lg font-black text-pink-600 mb-2">{item.title}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gameView === 'bucket-list' && (
                  <div className="w-full">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setGameView('home')} className="p-2 bg-white rounded-full shadow-sm text-pink-500"><ChevronLeft size={20} /></button>
                      <h2 className="text-2xl font-black text-pink-800">Shared Bucket List</h2>
                    </div>
                    <div className="space-y-4">
                      {(roomData?.bucketList || [
                        { text: "Win a Valo match together", completed: false },
                        { text: "Go on a coffee date", completed: false },
                        { text: "Watch a sunset together", completed: false },
                        { text: "Travel to a new city", completed: false }
                      ]).map((item: any, i: number) => (
                        <div 
                          key={i} 
                          onClick={async () => {
                            if (roomCode) {
                              const isCompleting = !item.completed;
                              const newList = [...(roomData?.bucketList || [])];
                              newList[i] = { ...item, completed: isCompleting };
                              await updateDoc(doc(db, 'rooms', roomCode), { 
                                bucketList: newList,
                                lovePoints: isCompleting ? increment(5) : increment(-5)
                              });
                            }
                          }}
                          className="bg-white p-5 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 group hover:border-pink-200 transition-all cursor-pointer"
                        >
                          <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", item.completed ? "bg-pink-500 border-pink-500 text-white" : "border-pink-100 text-transparent")}>
                            <Check size={14} />
                          </div>
                          <span className={cn("font-bold transition-all", item.completed ? "text-pink-300 line-through" : "text-slate-700")}>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gameView === 'mood-sync' && (
                  <div className="w-full">
                    <div className="flex items-center gap-4 mb-8">
                      <button onClick={() => setGameView('home')} className="p-2 bg-white rounded-full shadow-sm text-pink-500"><ChevronLeft size={20} /></button>
                      <h2 className="text-2xl font-black text-pink-800">Mood Sync</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-pink-300 uppercase mb-2">Saif's Mood</p>
                        <div className="text-4xl mb-2">{roomData?.moods?.player1 || "❓"}</div>
                        <p className="text-xs font-bold text-pink-600">{roomData?.moods?.player1 ? "Feeling good" : "Not set"}</p>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm text-center">
                        <p className="text-[10px] font-bold text-pink-300 uppercase mb-2">Ayesha's Mood</p>
                        <div className="text-4xl mb-2">{roomData?.moods?.player2 || "❓"}</div>
                        <p className="text-xs font-bold text-pink-600">{roomData?.moods?.player2 ? "Feeling good" : "Not set"}</p>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-pink-50 shadow-xl">
                      <h3 className="font-bold text-pink-800 mb-6 text-center">How are you feeling, {playerName || "love"}?</h3>
                      <div className="grid grid-cols-4 gap-4">
                        {['😊', '🥰', '🥺', '🥱', '🎮', '🍕', '💖', '😤'].map(m => (
                          <button 
                            key={m} 
                            onClick={() => updateMood(m)}
                            className={cn(
                              "text-3xl p-4 rounded-2xl transition-all hover:scale-110",
                              (playerNum === 1 ? roomData?.moods?.player1 : roomData?.moods?.player2) === m 
                                ? "bg-pink-100 border-2 border-pink-500" 
                                : "bg-pink-50 border-2 border-transparent"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {gameView === 'secret-notes' && (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <button onClick={() => setGameView('home')} className="p-2 bg-white rounded-full shadow-sm text-pink-500"><ChevronLeft size={20} /></button>
                      <h2 className="text-2xl font-black text-pink-800">Secret Notes</h2>
                    </div>

                    <div className="flex-1 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-pink-50 p-6 mb-4 overflow-y-auto max-h-[450px] space-y-4 custom-scrollbar">
                      {(roomData?.messages || []).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                          <div className="bg-pink-50 p-4 rounded-full mb-4"><MessageCircle className="text-pink-300" size={32} /></div>
                          <p className="text-pink-400 font-bold">No secret notes yet.</p>
                          <p className="text-[10px] text-pink-300 uppercase tracking-widest mt-2">Ask her anything or tell her a secret!</p>
                        </div>
                      ) : (
                        roomData.messages.map((msg: any) => (
                          <motion.div 
                            key={msg.id} 
                            initial={{ opacity: 0, y: 10, x: msg.sender === playerName ? 20 : -20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className={cn(
                              "max-w-[85%] p-4 rounded-2xl shadow-sm",
                              msg.sender === playerName 
                                ? "bg-pink-500 text-white self-end ml-auto rounded-tr-none" 
                                : "bg-white text-slate-700 self-start mr-auto rounded-tl-none border border-pink-50"
                            )}
                          >
                            <p className="text-[8px] font-bold uppercase tracking-widest mb-1 opacity-70">{msg.sender}</p>
                            <p className="text-sm font-medium">{msg.text}</p>
                            <p className="text-[8px] text-right mt-1 opacity-50">{msg.timestamp}</p>
                          </motion.div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Write a secret..." 
                        className="flex-1 bg-white border-2 border-pink-100 rounded-2xl px-6 py-4 text-pink-600 focus:outline-none font-medium"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendNote()}
                      />
                      <button 
                        onClick={sendNote}
                        disabled={!noteText.trim()}
                        className="bg-pink-500 text-white p-4 rounded-2xl shadow-lg shadow-pink-100 disabled:opacity-50"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
