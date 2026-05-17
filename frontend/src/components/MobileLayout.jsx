import React, { useEffect, useState } from 'react';
import { ChevronDown, Home, LogOut, PlusSquare, UserRound, FileText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoTinka from '../assets/img/logoTinka.png';
import defaultAssistantLogo from '../assets/img/logoTinkaChatBot.png';

export default function MobileLayout({ children, assistantLogo, userName, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [showTooltip, setShowTooltip] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const logoSrc = assistantLogo || defaultAssistantLogo;

  const getBankDisplayName = (name) => {
    if (!name) return 'Emprendedor';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0];
    
    // Lógica bancaria: Primer nombre + Primer apellido
    const firstName = words[0];
    let surname = words[1];
    
    if (words.length >= 4) {
      surname = words[2]; // Formato: Nombre1 Nombre2 Apellido1 Apellido2 -> Tomamos Apellido1
    } else if (words.length === 3) {
      surname = words[1]; // Formato: Nombre1 Nombre2 Apellido -> Tomamos Nombre1 y Nombre2/Apellido
    }
    
    const shortName = `${firstName} ${surname}`;
    
    // Si la combinación sigue siendo muy larga (>15 chars), usamos Inicial + Apellido (Ej: D. Camacho)
    if (shortName.length > 15) {
      return `${firstName.charAt(0)}. ${surname}`;
    }
    
    return shortName;
  };

  const displayName = getBankDisplayName(userName);

  const handleLogout = () => {
    setUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex justify-center bg-[#f7f7f7] min-h-screen font-sans">
      <div className="w-full max-w-100 md:shadow-[0_0_40px_rgba(0,0,0,0.04)] md:border-x md:border-[#ebebeb] bg-white flex flex-col h-screen relative">
        
        {/* Top Nav - Minimalist */}
        <header className="bg-white px-6 py-5 border-b border-[#ebebeb] flex items-center justify-between sticky top-0 z-20">
          <img src={logoTinka} alt="Tinka" className="h-5 object-contain shrink-0" />
          <div className="relative ml-4">
            <button
              type="button"
              onClick={() => setUserMenuOpen((value) => !value)}
              className="group inline-flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#f8f9fa] px-3 py-2 text-[10px] uppercase tracking-widest font-semibold text-fie-blue shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all hover:border-[#3FB6DA]/40 hover:bg-white hover:shadow-[0_8px_20px_rgba(0,44,106,0.08)] max-w-[180px]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fie-blue/10 text-fie-blue">
                <UserRound size={12} strokeWidth={2.5} />
              </span>
              <span className="truncate">{displayName}</span>
              <ChevronDown
                size={12}
                className={`shrink-0 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-3xl border border-[#ebebeb] bg-white/95 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,44,106,0.12)] overflow-hidden z-30 p-2">
                <div className="px-3 pt-2 pb-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#888]">Cuenta</p>
                  <p className="mt-1 text-sm font-semibold text-fie-blue truncate" title={userName}>{userName}</p>
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

        {/* Assistant Bubble (Solo visible si no estamos ya en la vista del Coach) */}
        {currentPath !== '/coach' && (
          <div className="absolute right-5 bottom-24 z-30 flex items-end animate-in fade-in zoom-in duration-500">
            <div className="relative">
              {showTooltip && (
                <div className="absolute right-14 top-1 bg-white text-[10px] font-bold text-[#002C6A] px-3 py-2 rounded-xl rounded-tr-none shadow-[0_4px_15px_rgba(0,0,0,0.08)] whitespace-nowrap border border-[#ebebeb]">
                  ¿En qué puedo ayudarte?
                </div>
              )}

              <button 
                onClick={() => navigate('/coach')} 
                className="bg-white border-2 border-[#E6007E]/20 text-white p-0.5 rounded-full shadow-[0_8px_30px_rgb(230,0,126,0.15)] hover:scale-105 hover:border-[#E6007E] transition-all flex items-center justify-center relative group"
              >
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-10 shadow-sm" />
                <img src={logoSrc} alt="Asistente" className="w-11 h-11 rounded-full object-cover bg-white" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Nav - Linear style (Reducido a 3 items) */}
        <nav className="w-full bg-[#002C6A] backdrop-blur-xl border-t border-[#001b44] flex justify-evenly px-4 h-20 pb-6 pt-4 shrink-0">
          <Link to="/" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/' ? 'text-[#3FB6DA]' : 'text-white/60 hover:text-white'}`}>
            <Home size={22} strokeWidth={currentPath === '/' ? 2.5 : 1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Inicio</span>
          </Link>
          
          <Link to="/vender" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/vender' ? 'text-[#3FB6DA]' : 'text-white/60 hover:text-white'}`}>
            <PlusSquare size={22} strokeWidth={currentPath === '/vender' ? 2.5 : 1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Vender</span>
          </Link>

          <Link to="/reportes" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/reportes' ? 'text-[#3FB6DA]' : 'text-white/60 hover:text-white'}`}>
            <FileText size={22} strokeWidth={currentPath === '/reportes' ? 2.5 : 1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Reportes</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
