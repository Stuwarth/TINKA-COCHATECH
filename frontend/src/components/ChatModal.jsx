import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import api from '../api';

export default function ChatModal({ open, onClose, logo }) {
  const [messages, setMessages] = useState([
    { id: 1, text: '¡Hola! Soy tu asistente Tinka. ¿En qué puedo ayudarte?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const text = input.trim();
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await api.chatWithCoach(text);
      if (reply) {
        setMessages(prev => [...prev, { id: Date.now(), text: reply, sender: 'bot' }]);
      } else {
        throw new Error('No reply');
      }
    } catch {
      // Respuesta local rápida
      const sales = JSON.parse(localStorage.getItem('local_sales') || '[]');
      const total = sales.reduce((s, v) => s + (v.amount || 0), 0);
      const quickReply = total > 0
        ? `Tienes ${sales.length} ventas registradas por un total de Bs. ${total.toFixed(2)}. ¿Necesitas algo más?`
        : 'Aún no tienes ventas registradas. ¡Ve a la sección "Vender" para empezar!';
      
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: quickReply, sender: 'bot' }]);
      }, 600);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[400px] bg-white rounded-t-3xl sm:rounded-3xl border border-[#ebebeb] m-0 sm:m-4 shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '70vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#002C6A] to-[#001b44] text-white">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Asistente" className="w-8 h-8 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#E6007E]" />
            )}
            <div>
              <h3 className="text-sm font-bold">Asistente Tinka</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#3FB6DA] rounded-full animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-white/70">En línea</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafbfc]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] text-[13px] leading-relaxed px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-[#E6007E] text-white rounded-l-2xl rounded-tr-2xl'
                  : 'bg-white border border-[#ebebeb] text-[#333] rounded-r-2xl rounded-tl-2xl shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#ebebeb] rounded-r-2xl rounded-tl-2xl shadow-sm px-4 py-3 flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#E6007E] rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-[#E6007E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#E6007E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#ebebeb] p-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 border border-[#ebebeb] bg-[#fafafa] rounded-2xl px-4 py-3 text-sm text-[#002C6A] focus:outline-none focus:border-[#E6007E] transition-colors placeholder:text-[#bbb] disabled:opacity-50"
              placeholder="Escribe un mensaje..."
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-[#E6007E] text-white w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-[#c20068] transition-colors disabled:opacity-20 active:scale-95 shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
