import React, { useEffect, useState } from 'react';
import { ChevronDown, Home, LogOut, MessageSquare, PlusSquare, UserRound } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoTinka from '../assets/img/logoTinka.png';
import defaultAssistantLogo from '../assets/img/logoTinkaChatBot.png';
import ChatModal from './ChatModal';

export default function MobileLayout({ children, assistantLogo, userName, onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [modalOpen, setModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
  const handleLogout = () => {
    setUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex justify-center bg-[#f7f7f7] min-h-screen font-sans">
      <div className="w-full max-w-100 bg-white flex flex-col h-screen shadow-[0_0_40px_rgba(0,0,0,0.04)] border-x border-[#ebebeb] relative">
        
        {/* Top Nav - Minimalist */}
        <header className="bg-white px-6 py-5 border-b border-[#ebebeb] flex items-center justify-between sticky top-0 z-20">
          <img src={logoTinka} alt="Tinka" className="h-5 object-contain" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((value) => !value)}
              className="group inline-flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#f8f9fa] px-3 py-2 text-[10px] uppercase tracking-widest font-semibold text-fie-blue shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:border-[#3FB6DA]/40 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,44,106,0.08)]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-fie-blue/10 text-fie-blue">
                <UserRound size={12} strokeWidth={2.5} />
              </span>
              {displayName}
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-[#ebebeb] bg-white/95 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,44,106,0.12)] overflow-hidden z-30 p-2">
                <div className="px-3 pt-2 pb-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#888]">Cuenta</p>
                  <p className="mt-1 text-sm font-semibold text-fie-blue truncate">{displayName}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="group flex w-full items-center gap-3 rounded-2xl bg-linear-to-r from-[#fff0f5] to-[#fff7fa] px-4 py-3 text-left transition-all hover:from-[#E6007E] hover:to-[#c20068] hover:shadow-[0_10px_25px_rgba(230,0,126,0.15)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#E6007E] transition-colors group-hover:bg-white/15 group-hover:text-white">
                    <LogOut size={16} strokeWidth={2.3} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-fie-magenta transition-colors group-hover:text-white">Cerrar sesión</span>
                    <span className="text-[11px] text-[#a1a1a1] transition-colors group-hover:text-white/75">Salir de tu cuenta</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white" onClick={() => setUserMenuOpen(false)}>
          {children}
        </main>

        {/* Bottom Nav - Linear style */}
        {/* Assistant button placed just above the bottom nav (parte derecha) */}
        <div className="absolute right-4 bottom-23 z-30 flex items-end">
          <div className="relative">
            {showTooltip && !modalOpen && (
              <div className="bg-white text-xs text-black px-3 py-2 rounded-lg shadow-md mb-2">¿En qué puedo ayudarte?</div>
            )}

            <button onClick={toggleModal} className="bg-white border border-[#ebebeb] text-white p-1 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-105 transition-transform flex items-center justify-center">
              <img src={logoSrc} alt="Asistente" className="w-10 h-10 rounded-full object-cover" />
            </button>
          </div>
        </div>

        <nav className="w-full bg-fie-blue backdrop-blur-xl border-t border-[#ebebeb] flex justify-between px-10 h-20 pb-6 pt-4 shrink-0">
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
