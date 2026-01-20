import { useState, useEffect, useRef } from "react";
import { Send, Bot, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

// Typing Animation Bubble
const TypingIndicator = () => (
  <div className="flex justify-start animate-in fade-in duration-300">
    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-1.5 h-12">
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
    </div>
  </div>
);

export default function ChatbotWindow({ onClose }: Props) {
  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. STATE (No localStorage means it clears on refresh!)
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: "bot", 
      text: "Hello! 👋 Welcome to SwadeshIntern. To get started, please enter your 𝗡𝗮𝗺𝗲.", 
      time: getTime() 
    }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState<"NAME" | "CHAT">("NAME");
  const [userName, setUserName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2. AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 3. AUTO FOCUS (Only when active to prevent mobile keyboard jumps)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, flow, loading]);

  // HELPER: Add Bot Message
  const addBotMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: "bot", text, time: getTime() }]);
  };

  // HELPER: Add User Message
  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { sender: "user", text, time: getTime() }]);
  };

  // MAIN LOGIC
  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    addUserMessage(text);

    // --- STAGE 1: NAME FLOW ---
    if (flow === "NAME") {
      const lowerText = text.toLowerCase();
      // Block common non-names
      const invalidNames = ["hi", "hello", "hey", "yes", "no", "ok", "bye", "bot", "help", "swadesh", "admin"];

      if (text.length < 2 || invalidNames.includes(lowerText)) {
        setTimeout(() => addBotMessage("That doesn't look like a real name. Please enter your **actual name**."), 400);
        return;
      }
      
      setUserName(text);
      setFlow("CHAT");
      
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        addBotMessage(`Welcome, ${text}! 🚀 \n\nHow can I help you? (Internships, Domains, Certificates)`);
      }, 600);
      return;
    }

    // --- STAGE 2: CHAT FLOW ---
    if (flow === "CHAT") {
      setLoading(true);
      
      try {
        const isLocal = window.location.hostname === "localhost";
        const apiUrl = isLocal 
          ? "http://localhost:8888/.netlify/functions/chat" 
          : "/.netlify/functions/chat";

        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, userName: userName }),
        });

        const data = await res.json();
        addBotMessage(data.reply); 

      } catch (err) {
        addBotMessage("I'm having trouble connecting to the internet. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-[90vw] md:w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100 font-sans">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            {/* Keeping Bot icon INSIDE the chat makes sense for context, but button is sleek now */}
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Swadesh Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] opacity-90">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition"><X size={18}/></button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar overscroll-contain">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
              m.sender === "user" ? "bg-orange-500 text-white rounded-tr-none" : "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
            }`}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className={`text-[10px] mt-1 text-right ${m.sender === "user" ? "text-orange-100" : "text-slate-400"}`}>{m.time}</p>
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-200 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={flow === "NAME" ? "Enter your Name..." : "Type your question..."}
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
            disabled={loading}
            autoFocus
          />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 transition shadow-sm">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}