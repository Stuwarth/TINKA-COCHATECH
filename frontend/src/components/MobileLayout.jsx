import { Home, PlusSquare, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoTinka from '../assets/img/logoTinka.png';

export default function MobileLayout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex justify-center bg-[#f7f7f7] min-h-screen font-sans">
      <div className="w-full max-w-[400px] bg-white flex flex-col h-screen shadow-[0_0_40px_rgba(0,0,0,0.04)] border-x border-[#ebebeb] relative">
        
        {/* Top Nav - Minimalist */}
        <header className="bg-white px-6 py-5 border-b border-[#ebebeb] flex items-center justify-between sticky top-0 z-20">
          <img src={logoTinka} alt="Tinka" className="h-5 object-contain" />
          <div className="text-[10px] uppercase tracking-widest font-semibold text-[#888]">Doña María</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>

        {/* Bottom Nav - Linear style */}
        <nav className="w-full bg-white/80 backdrop-blur-xl border-t border-[#ebebeb] flex justify-between px-8 h-[80px] pb-6 pt-4 shrink-0">
          <Link to="/" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/' ? 'text-black' : 'text-[#a1a1a1] hover:text-black'}`}>
            <Home size={20} strokeWidth={currentPath === '/' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Overview</span>
          </Link>
          
          <Link to="/vender" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/vender' ? 'text-black' : 'text-[#a1a1a1] hover:text-black'}`}>
            <PlusSquare size={20} strokeWidth={currentPath === '/vender' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Vender</span>
          </Link>
          
          <Link to="/coach" className={`flex flex-col items-center gap-1.5 transition-colors ${currentPath === '/coach' ? 'text-black' : 'text-[#a1a1a1] hover:text-black'}`}>
            <MessageSquare size={20} strokeWidth={currentPath === '/coach' ? 2.5 : 1.5} />
            <span className="text-[9px] font-medium tracking-wide">Coach IA</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
