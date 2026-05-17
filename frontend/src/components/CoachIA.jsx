import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import logoBot from '../assets/img/logoTinkaChatBot.png';
import api from '../api';

export default function CoachIA({ userName }) {
  const business = api.getCurrentBusiness();
  const businessName = business?.name || 'tu negocio';
  
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: `Hola${userName ? ` ${userName.split(' ')[0]}` : ''}! Soy tu Coach Inteligente para **${businessName}**.\n\nEstoy conectado con tus ventas y puedo ayudarte a analizar tu rendimiento, darte consejos o responder cualquier duda que tengas. En quǸ te puedo ayudar hoy?`, 
      sender: 'bot' 
    }
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
    'Cmo van mis ventas hoy?',
    'Cuǭl es mi producto estrella?',
    'Dame un consejo para vender mǭs',
  ];

  // RAG Local fallback si no hay conexin al backend
  const generateLocalResponse = (message) => {
    const key = business?.id ? `local_sales_${business.id}` : 'local_sales_guest';
    const sales = JSON.parse(localStorage.getItem(key) || '[]');
    const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
    const totalCount = sales.length;
    const avgSale = totalCount > 0 ? (totalSales / totalCount).toFixed(2) : 0;

    // Agrupar ventas por producto
    const byProduct = {};
    sales.forEach(s => {
      const prod = s.product_name || s.prod || 'Venta General';
      byProduct[prod] = (byProduct[prod] || 0) + Number(s.amount);
    });
    const bestProduct = Object.entries(byProduct).sort((a, b) => b[1] - a[1])[0];

    const msg = message.toLowerCase();

    if (msg.includes('venta') || msg.includes('resumen') || msg.includes('hoy')) {
      if (totalCount === 0) {
        return `Actualmente no tengo registros de ventas para **${businessName}**. \n\nTe invito a registrar tu primera venta en la seccin "Vender" para que pueda empezar a analizar tu rendimiento!`;
      }
      return `Claro que s! Aqu tienes un resumen rǭpido de **${businessName}**:\n\n* **Total acumulado:** Bs. ${totalSales.toFixed(2)}\n* **Cantidad de ventas:** ${totalCount}\n* **Ticket promedio:** Bs. ${avgSale}\n\nExcelente trabajo! Cada boliviano cuenta para seguir creciendo. o.`;
    }

    if (msg.includes('producto') || msg.includes('estrella') || msg.includes('mǭs')) {
      if (!bestProduct) return 'Necesito que registres mǭs ventas con nombres de productos para decirte cuǭl es tu estrella. Y"';
      return `He analizado tus datos y tu producto estrella en **${businessName}** es **"${bestProduct[0]}"**, con el cual has generado **Bs. ${bestProduct[1].toFixed(2)}** en total.\n\n**Tip:** Asegǧrate de tener siempre stock de este producto!`;
    }

    if (msg.includes('consejo') || msg.includes('tip') || msg.includes('mejorar')) {
      const tips = [
        `He notado que tu ticket promedio es de Bs. ${avgSale}. Un buen truco es **ofrecer un producto complementario** justo antes de cobrar para subir ese promedio.`,
        `Si notas horas muertas en **${businessName}**, podras lanzar una "oferta relǭmpago" vǭlida solo por WhatsApp para tus clientes frecuentes.`,
        `Sabas que los clientes que pagan por QR suelen gastar un 15% mǭs? Asegǧrate de tener tu cdigo QR siempre visible.`,
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }

    return `He revisado la base de datos de **${businessName}**.\n\nHasta ahora has registrado **${totalCount} ventas** (Bs. ${totalSales.toFixed(2)} en total). \n\nSoy una Inteligencia Artificial, as que puedes preguntarme sobre cmo mejorar tus finanzas, marketing para tu negocio, o cualquier otra cosa. QuǸ te gustara saber?`;
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
      }, 1000); // Simulando delay de IA
    }

    setLoading(false);
  };

  const handleQuickQuestion = (q) => {
    setInput(q);
    setTimeout(() => handleSend({ preventDefault: () => {} }), 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfc] font-sans relative">
      
      {/* Header Estilo ChatGPT */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-[#ebebeb] flex items-center justify-center p-0.5 shadow-sm bg-white overflow-hidden">
             <img src={logoBot} alt="Tinka AI" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#212121] tracking-tight flex items-center gap-1">
              Coach Tinka <Sparkles size={12} className="text-[#E6007E]" />
            </h2>
            <p className="text-[10px] text-[#888] font-medium leading-none mt-0.5">Asistente IA para {businessName}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && (
               <div className="w-7 h-7 rounded-full bg-white border border-[#eaeaea] shrink-0 mr-3 flex items-center justify-center shadow-sm overflow-hidden mt-1">
                 <img src={logoBot} alt="Bot" className="w-5 h-5 object-contain" />
               </div>
            )}
            
            <div className={`max-w-[85%] text-[15px] leading-[1.6] ${
              msg.sender === 'user' 
                ? 'bg-[#f4f4f4] text-[#0d0d0d] px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm' 
                : 'text-[#2d2d2d]'
            }`}>
              {msg.sender === 'bot' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-strong:text-[#0d0d0d]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex w-full justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-white border border-[#eaeaea] shrink-0 mr-3 flex items-center justify-center shadow-sm overflow-hidden">
               <img src={logoBot} alt="Bot" className="w-5 h-5 object-contain" />
            </div>
            <div className="flex gap-1.5 items-center h-8">
              <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#d1d5db] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Box Flotante Estilo ChatGPT */}
      <div className="absolute bottom-6 left-0 right-0 px-4 bg-gradient-to-t from-[#fcfcfc] via-[#fcfcfc] to-transparent pt-10">
        
        {/* Sugerencias rǭpidas (desaparecen al hablar) */}
        {messages.length <= 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mt-6 pb-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleQuickQuestion(q)}
                className="shrink-0 text-[13px] font-medium text-[#444] bg-white border border-[#e5e5e5] px-4 py-2 rounded-full hover:bg-[#f9f9f9] shadow-sm transition-all whitespace-nowrap active:scale-95"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="relative flex items-center w-full bg-white border border-[#e5e5e5] rounded-[24px] shadow-[0_5px_20px_rgba(0,0,0,0.05)] focus-within:border-[#ccc] focus-within:shadow-[0_5px_25px_rgba(0,0,0,0.08)] transition-all overflow-hidden p-1 pl-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mensaje al Coach..."
            disabled={loading}
            className="flex-1 h-12 text-[15px] bg-transparent text-[#0d0d0d] placeholder:text-[#999] focus:outline-none disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 mr-1 ${
              input.trim() && !loading
                ? 'bg-[#000] text-white hover:bg-[#333] shadow-md active:scale-90' 
                : 'bg-[#f0f0f0] text-[#a0a0a0] cursor-not-allowed'
            }`}
          >
            <Send size={18} strokeWidth={2} className={input.trim() && !loading ? 'ml-0.5' : ''} />
          </button>
        </form>
        <p className="text-center text-[10px] text-[#aaa] mt-3 font-medium">
          Tinka Coach puede cometer errores. Considera verificar la informacin importante.
        </p>
      </div>
    </div>
  );
}
