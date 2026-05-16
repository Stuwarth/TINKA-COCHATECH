import { Home, PlusCircle, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileLayout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="flex justify-center bg-gray-200 min-h-screen">
      {/* Contenedor simulando celular */}
      <div className="w-full max-w-md bg-gray-50 flex flex-col h-screen shadow-2xl relative overflow-hidden">
        
        {/* Top App Bar */}
        <header className="bg-fie-magenta text-white p-4 shadow-md z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-wide">Tinka Coach</h1>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">DM</span> {/* Doña Maria */}
            </div>
          </div>
        </header>

        {/* Contenido principal scrolleable */}
        <main className="flex-1 overflow-y-auto p-4 pb-24">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 absolute bottom-0 w-full flex justify-around items-center h-16 pb-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${currentPath === '/' ? 'text-fie-magenta' : 'text-gray-400'}`}>
            <Home size={24} className={currentPath === '/' ? 'fill-fie-magenta/20' : ''} />
            <span className="text-[10px] mt-1 font-medium">Inicio</span>
          </Link>
          
          <Link to="/vender" className="flex flex-col items-center justify-center w-full h-full relative">
            <div className="absolute -top-5 bg-fie-blue text-white p-3 rounded-full shadow-lg border-4 border-gray-50">
              <PlusCircle size={28} />
            </div>
            <span className={`text-[10px] mt-8 font-medium ${currentPath === '/vender' ? 'text-fie-blue font-bold' : 'text-gray-500'}`}>Vender</span>
          </Link>
          
          <Link to="/coach" className={`flex flex-col items-center justify-center w-full h-full ${currentPath === '/coach' ? 'text-fie-magenta' : 'text-gray-400'}`}>
            <MessageSquare size={24} className={currentPath === '/coach' ? 'fill-fie-magenta/20' : ''} />
            <span className="text-[10px] mt-1 font-medium">Coach IA</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
