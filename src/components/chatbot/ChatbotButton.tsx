import { useState } from "react";
import ChatbotWindow from "./ChatbotWindow";
import { MessageSquareText, X, Sparkles } from "lucide-react";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // 'pointer-events-none' ensures the invisible wrapper doesn't block footer clicks
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* CHAT WINDOW CONTAINER */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-90 translate-y-8 pointer-events-none"
        }`}
      >
        <ChatbotWindow onClose={() => setIsOpen(false)} />
      </div>

      {/* BUTTON CONTAINER */}
      <div className="relative group pointer-events-auto">
        
        {/* TOOLTIP: "Ask Swadesh" */}
        <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xl whitespace-nowrap transition-all duration-300 border border-slate-700 ${
          isOpen ? "opacity-0 translate-x-2 pointer-events-none" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
        }`}>
          Ask Swadesh
          {/* Tooltip Arrow */}
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-t border-slate-700" />
        </div>

        {/* MAIN BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full shadow-[0_8px_30px_rgba(249,115,22,0.4)] transition-all duration-500 hover:shadow-[0_8px_40px_rgba(249,115,22,0.6)] hover:scale-105 active:scale-95 ${
            isOpen ? "bg-slate-900 rotate-0" : "bg-gradient-to-tr from-orange-500 to-orange-600"
          }`}
        >
          {/* Glowing Ring Pulse (Only when closed) */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border border-white/30 animate-ping [animation-duration:2s]" />
          )}

          {/* ICON ANIMATION CONTAINER */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            
            {/* 1. PROFESSIONAL CHAT ICON (Visible when Closed) */}
            <div className={`absolute inset-0 transition-all duration-300 flex items-center justify-center ${
              isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            }`}>
              <MessageSquareText size={28} className="text-white fill-white/10" strokeWidth={2} />
              
              {/* Subtle AI Sparkle */}
              <Sparkles 
                size={14} 
                className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" 
                fill="currentColor"
              />
            </div>

            {/* 2. CLOSE ICON (Visible when Open) */}
            <X
              className={`absolute inset-0 text-white transition-all duration-300 ${
                isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              }`}
              size={28}
              strokeWidth={2.5}
            />
          </div>
        </button>
      </div>
    </div>
  );
}