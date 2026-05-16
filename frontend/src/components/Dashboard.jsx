import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Saludo y Semáforo */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-gray-500 text-sm font-medium">Hola Doña María 👋</h2>
            <h3 className="text-xl font-bold text-gray-800 mt-1">Salud del negocio</h3>
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            <span className="text-green-700 text-xs font-bold">Excelente</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">Tus ventas están <strong>15% arriba</strong> comparado con la semana pasada. ¡Sigue así!</p>
      </div>

      {/* Tarjeta principal de ganancias */}
      <div className="bg-gradient-to-br from-fie-blue to-[#001a40] p-6 rounded-3xl text-white shadow-lg shadow-fie-blue/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <DollarSign size={150} />
        </div>
        <p className="text-white/80 text-sm font-medium">Ventas de esta semana</p>
        <h2 className="text-4xl font-black mt-2 tracking-tight">Bs. 1,450<span className="text-lg text-white/60 font-medium">.00</span></h2>
        
        <div className="mt-6 flex items-center bg-white/10 rounded-2xl p-3 backdrop-blur-md">
          <Target className="text-fie-magenta mr-3" size={20} />
          <div className="flex-1">
            <div className="flex justify-between text-xs text-white/80 mb-1">
              <span>Meta semanal (Bs. 2000)</span>
              <span className="font-bold">72%</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-fie-magenta h-1.5 rounded-full relative" style={{ width: '72%' }}>
                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 animate-[pulse_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Visual */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Últimos 5 días</h3>
          <button className="text-fie-magenta text-xs font-bold bg-fie-magenta/5 px-3 py-1.5 rounded-full">Ver reporte</button>
        </div>
        
        <div className="flex items-end justify-between h-40 pt-4 px-2">
          {[
            { day: 'Lun', val: 40, amt: '250' },
            { day: 'Mar', val: 70, amt: '450', high: true },
            { day: 'Mié', val: 30, amt: '150' },
            { day: 'Jue', val: 50, amt: '300' },
            { day: 'Hoy', val: 60, amt: '400' },
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center flex-1 group">
              <span className="text-[10px] text-gray-400 font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Bs.{bar.amt}</span>
              <div 
                className={`w-full max-w-[2.5rem] rounded-t-xl transition-all duration-700 ease-out group-hover:opacity-80 ${bar.high ? 'bg-fie-magenta shadow-[0_0_15px_rgba(196,0,121,0.3)]' : 'bg-gray-100'}`} 
                style={{ height: `${bar.val}%` }}
              ></div>
              <span className={`text-[10px] mt-2 font-medium ${bar.high ? 'text-fie-magenta font-bold' : 'text-gray-400'}`}>{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
