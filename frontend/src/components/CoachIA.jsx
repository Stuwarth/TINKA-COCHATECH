import { useState } from 'react';
import { Send } from 'lucide-react';
import logoBot from '../assets/img/logoTinkaChatBot.png';

export default function CoachIA() {
  const [messages, setMessages] = useState([
    { id: 1, text: "¡Hola! Soy tu Coach Tinka. He notado que esta semana vendiste un 15% más. ¿En qué te ayudo?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { id: Date.now(), text: input, sender: 'user' }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: "Los días Martes vendes más empanadas. Te sugiero preparar un 20% más de masa para mañana.", 
        sender: 'bot' 
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border border-[#ebebeb] overflow-hidden p-0.5">
            <img src={logoBot} alt="Coach" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-black">Coach Tinka</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-black rounded-full" />
              <span className="text-[10px] text-[#888] uppercase tracking-widest">En línea</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] text-sm leading-relaxed p-4 ${
              msg.sender === 'user' 
                ? 'bg-black text-white rounded-l-lg rounded-tr-lg' 
                : 'bg-white border border-[#ebebeb] text-black rounded-r-lg rounded-tl-lg shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white border-t border-[#ebebeb] p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-[#f5f5f5] h-12 px-4 rounded text-sm text-black placeholder:text-[#888] focus:outline-none focus:ring-1 focus:ring-black transition-all"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="w-12 h-12 bg-black text-white rounded flex items-center justify-center disabled:opacity-20 hover:bg-[#222] transition-colors"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
