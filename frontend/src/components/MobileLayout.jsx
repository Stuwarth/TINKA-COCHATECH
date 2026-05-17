import React, { useEffect, useState } from 'react';
import { Home, PlusSquare, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoTinka from '../assets/img/logoTinka.png';
import defaultAssistantLogo from '../assets/img/logoTinkaChatBot.png';
import ChatModal from './ChatModal';

export default function MobileLayout({ children, assistantLogo, userName, onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [modalOpen, setModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    if (modalOpen) {
      setShowTooltip(false);
      return;
    }

    const t = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(t);
  }, [modalOpen]);

  const toggleModal = () => setModalOpen((v) => !v);
  const logoSrc = assistantLogo || defaultAssistantLogo;

  const displayName = userName || 'Emprendedor';

  return (
    <div className="flex justify-center bg-[#f7f7f7] min-h-screen font-sans">
      <div className="w-full max-w-[400px] bg-white flex flex-col h-screen shadow-[0_0_40px_rgba(0,0,0,0.04)] border-x border-[#ebebeb] relative">
        
        {/* Top Nav - Minimalist */}
        <header className="bg-white px-6 py-5 border-b border-[#ebebeb] flex items-center justify-between sticky top-0 z-20">
          <img src={logoTinka} alt="Tinka" className="h-5 object-contain" />
          <div className="text-[10px] uppercase tracking-widest font-semibold text-[#888]">{displayName}</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>

        {/* Bottom Nav - Linear style */}
        {/* Assistant button placed just above the bottom nav (parte derecha) */}
        <div className="absolute right-4 bottom-[92px] z-30 flex items-end">
          <div className="relative">
            {showTooltip && !modalOpen && (
              <div className="bg-white text-xs text-black px-3 py-2 rounded-lg shadow-md mb-2">¿En qué puedo ayudarte?</div>
            )}

            <button onClick={toggleModal} className="bg-white border border-[#ebebeb] text-white p-1 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform flex items-center justify-center">
              <img src={logoSrc} alt="Asistente" className="w-10 h-10 rounded-full object-cover" />
            </button>
          </div>
        </div>

        <nav className="w-full bg-[#002C6A] backdrop-blur-xl border-t border-[#ebebeb] flex justify-between px-10 h-[80px] pb-6 pt-4 shrink-0">
          <Link to="/" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/' ? 'text-[#52B3DF]' : 'text-white hover:text-black'}`}>
            <Home size={20} strokeWidth={currentPath === '/' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Inicio</span>
          </Link>
          
          <Link to="/vender" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/vender' ? 'text-[#52B3DF]' : 'text-white hover:text-black'}`}>
            <PlusSquare size={20} strokeWidth={currentPath === '/vender' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Vender</span>
          </Link>
          
          <Link to="/coach" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/coach' ? 'text-[#52B3DF]' : 'text-white hover:text-black'}`}>
            <MessageSquare size={20} strokeWidth={currentPath === '/coach' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Coach IA</span>
          </Link>
        </nav>
        <ChatModal open={modalOpen} onClose={() => setModalOpen(false)} logo={logoSrc} />
      </div>
    </div>
  );
}
