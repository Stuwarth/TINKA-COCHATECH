import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import logoBot from '../assets/img/logoTinkaChatBot.png';
import api from '../api';

export default function CoachIA({ userName }) {
  const [messages, setMessages] = useState([
    { id: 1, text: `¡Hola${userName ? ` ${userName.split(' ')[0]}` : ''}! Soy tu Coach Tinka. Puedo analizar tus ventas y darte consejos personalizados. ¿En qué te ayudo?`, sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    '¿Cómo van mis ventas?',
    '¿Qué día vendo más?',
    '¿Cómo puedo mejorar?',
  ];

  // Respuestas inteligentes basadas en datos REALES de ventas locales
  const generateLocalResponse = (message) => {
    const sales = JSON.parse(localStorage.getItem('tinka_sales') || '[]');
    const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalCount = sales.length;
    const avgSale = totalCount > 0 ? (totalSales / totalCount).toFixed(2) : 0;

    // Agrupar ventas por día
    const byDay = {};
    sales.forEach(s => {
      if (!s.created_at) return;
      const day = new Date(s.created_at).toLocaleDateString('es-BO', { weekday: 'long' });
      byDay[day] = (byDay[day] || 0) + Number(s.amount);
    });
    const bestDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];

    // Agrupar por método de pago
    const byMethod = {};
    sales.forEach(s => {
      const m = s.payment_method || s.method || 'Efectivo';
      byMethod[m] = (byMethod[m] || 0) + Number(s.amount);
    });

    const msg = message.toLowerCase();

    if (msg.includes('venta') || msg.includes('cómo van') || msg.includes('resumen')) {
      if (totalCount === 0) {
        return 'Aún no tienes ventas registradas. ¡Ve a "Vender" para registrar tu primera venta y empezaré a darte consejos personalizados! 🚀';
      }
      return `📊 **Resumen de ventas:**\n\n• Total acumulado: **Bs. ${totalSales.toFixed(2)}**\n• Transacciones: **${totalCount}**\n• Promedio por venta: **Bs. ${avgSale}**\n${bestDay ? `• Tu mejor día: **${bestDay[0]}** con Bs. ${bestDay[1].toFixed(2)}` : ''}\n\n¡Sigue así! Cada venta cuenta para tu historial crediticio con Banco FIE. 💪`;
    }

    if (msg.includes('día') || msg.includes('mejor') || msg.includes('más')) {
      if (!bestDay) return 'Necesito más datos de ventas para identificar patrones. ¡Registra al menos una semana de ventas!';
      return `📅 Tu mejor día de ventas es el **${bestDay[0]}** con **Bs. ${bestDay[1].toFixed(2)}** en total.\n\n💡 Te sugiero preparar más inventario ese día para maximizar tus ganancias.`;
    }

    if (msg.includes('mejorar') || msg.includes('consejo') || msg.includes('tip')) {
      const tips = [
        `💡 Tu promedio por venta es Bs. ${avgSale}. Intenta ofrecer combos o productos complementarios para subir el ticket promedio.`,
        `📱 ${byMethod['Pago QR'] ? `Ya usas QR (Bs. ${byMethod['Pago QR'].toFixed(2)}). ¡Excelente! Los pagos digitales` : 'Prueba ofrecer pago QR. Los pagos digitales'} atraen más clientes jóvenes.`,
        `📊 Registra TODAS tus ventas, incluso las pequeñas. Esto mejora tu perfil crediticio con Banco FIE y te acerca a un crédito para expandir tu negocio.`,
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    if (msg.includes('crédito') || msg.includes('préstamo') || msg.includes('banco')) {
      return `🏦 **Acceso a Crédito con Banco FIE:**\n\nTu historial de ventas es tu mejor carta de presentación. Con ${totalCount} ventas registradas${totalSales > 1000 ? ' y más de Bs. 1,000 en ventas' : ''}, estás construyendo tu perfil.\n\n${totalSales > 1500 ? '✅ ¡Ya calificas para una pre-aprobación!' : '⏳ Sigue registrando para alcanzar el umbral de pre-aprobación (Bs. 1,500)'}`;
    }

    return `Entiendo tu consulta. Con ${totalCount} ventas registradas y un acumulado de Bs. ${totalSales.toFixed(2)}, tu negocio va por buen camino.\n\n¿Quieres que analice algo específico? Prueba preguntarme:\n• "¿Cómo van mis ventas?"\n• "¿Qué día vendo más?"\n• "¿Cómo puedo mejorar?"`;
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

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
      const localReply = generateLocalResponse(text);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: localReply, sender: 'bot' }]);
      }, 800);
    }

    setLoading(false);
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
    setTimeout(() => handleSend({ preventDefault: () => {} }), 100);
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
            <h2 className="text-sm font-semibold text-[#002C6A]">Coach Tinka</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#3FB6DA] rounded-full animate-pulse" />
              <span className="text-[10px] text-[#888] uppercase tracking-widest">En línea</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[#E6007E]">
          <Sparkles size={14} />
          <span className="text-[9px] uppercase tracking-widest font-bold">IA</span>
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleQuickQuestion(q)}
              className="shrink-0 text-[11px] font-medium text-[#002C6A] bg-[#002C6A]/5 border border-[#002C6A]/10 px-3 py-2 rounded-full hover:bg-[#002C6A]/10 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] text-sm leading-relaxed p-4 whitespace-pre-line ${
              msg.sender === 'user' 
                ? 'bg-[#002C6A] text-white rounded-l-2xl rounded-tr-2xl' 
                : 'bg-white border border-[#ebebeb] text-[#333] rounded-r-2xl rounded-tl-2xl shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-[#ebebeb] rounded-r-2xl rounded-tl-2xl shadow-sm p-4 flex gap-1.5">
              <div className="w-2 h-2 bg-[#E6007E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#E6007E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#E6007E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="bg-white border-t border-[#ebebeb] p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre tu negocio..."
            disabled={loading}
            className="flex-1 bg-[#f5f5f5] h-12 px-4 rounded-2xl text-sm text-[#002C6A] placeholder:text-[#888] focus:outline-none focus:ring-2 focus:ring-[#E6007E]/20 transition-all disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-[#E6007E] text-white rounded-2xl flex items-center justify-center disabled:opacity-20 hover:bg-[#c20068] transition-colors active:scale-95"
          >
            <Send size={16} strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
