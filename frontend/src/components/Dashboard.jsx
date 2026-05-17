import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Target, RefreshCw } from 'lucide-react';
import api from '../api';

export default function Dashboard({ balance, transactions, userName, businessName }) {
  const [summary, setSummary] = useState(null);
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Intentar cargar del backend
      const summaryData = await api.getSummary();
      if (summaryData) setSummary(summaryData);

      const salesData = await api.getSales();
      if (salesData && salesData.length > 0) setTodaySales(salesData);
    } catch (e) {
      console.warn('Usando datos locales');
    }
    setLoading(false);
  };

  // Usar datos del backend si existen, sino los props/localStorage
  const displayTransactions = todaySales.length > 0
    ? todaySales.map(s => ({
        id: s.id,
        prod: s.product_name || s.prod || 'Venta',
        method: s.payment_method || s.method || 'Efectivo',
        amount: s.amount,
        time: s.created_at ? new Date(s.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : (s.time || ''),
      }))
    : transactions;

  const totalBalance = summary?.total_week || balance || displayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const percentageUp = summary?.percentage_up || 0;
  const healthStatus = summary?.health_status || 'Bueno';

  // Datos del gráfico: usar backend o calcular desde ventas locales
  const chartData = summary?.last_5_days || calculateLocalChart(displayTransactions);

  const maxAmount = Math.max(...chartData.map(d => d.amount), 1);

  const formattedBalance = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [integerPart, decimalPart] = formattedBalance.split('.');

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Hero Balance */}
      <div className="relative pt-12 pb-10 px-6 bg-gradient-to-br from-[#002C6A] to-[#001b44] rounded-b-[2.5rem] shadow-[0_10px_40px_rgba(0,44,106,0.3)] mb-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6007E]/20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#3FB6DA]/20 blur-[60px] rounded-full -translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 text-center">
          {businessName && (
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/50 mb-1 font-medium">{businessName}</p>
          )}
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#3FB6DA] font-semibold mb-2">Balance Actual</h2>
          <div className="flex justify-center items-baseline gap-1 text-white">
            <span className="text-2xl font-light text-white/80">Bs.</span>
            <h1 className="text-6xl font-bold tracking-tight">{integerPart}<span className="text-2xl font-medium text-white/60">.{decimalPart}</span></h1>
          </div>
          {percentageUp !== 0 && (
            <div className={`inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full text-[10px] font-bold ${percentageUp > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              <TrendingUp size={12} />
              {percentageUp > 0 ? '+' : ''}{percentageUp}% vs ayer
            </div>
          )}
        </div>
      </div>

      <div className="px-6">

      {/* Metric Cards - Premium FinTech Design */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white border border-[#ebebeb] p-5 rounded-[24px] shadow-[0_8px_30px_rgba(0,44,106,0.04)] hover:shadow-[0_12px_40px_rgba(0,44,106,0.08)] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#3FB6DA]/10 to-transparent rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-[#3FB6DA]/20 transition-all" />
          
          {/* Custom Premium SVG: Health */}
          <div className="w-12 h-12 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3FB6DA]/20 to-[#3FB6DA]/5 rounded-2xl rotate-3 group-hover:rotate-6 transition-transform" />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md border border-[#3FB6DA]/20 rounded-2xl flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13.5L9 7.5L13.5 12L21 4.5" stroke="url(#health-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 4.5H21V9.5" stroke="url(#health-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 13.5L9 7.5L13.5 12L21 4.5" stroke="#3FB6DA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" filter="blur(2px)" transform="translate(0, 2)"/>
                <defs>
                  <linearGradient id="health-grad" x1="3" y1="13.5" x2="21" y2="4.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#002C6A" />
                    <stop offset="1" stopColor="#3FB6DA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#888] mb-1">Salud del Negocio</h3>
          <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#002C6A] to-[#3FB6DA]">{healthStatus}</p>
        </div>

        <div className="bg-white border border-[#ebebeb] p-5 rounded-[24px] shadow-[0_8px_30px_rgba(230,0,126,0.04)] hover:shadow-[0_12px_40px_rgba(230,0,126,0.08)] transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E6007E]/10 to-transparent rounded-full blur-2xl -translate-y-8 translate-x-8 group-hover:bg-[#E6007E]/20 transition-all" />
          
          {/* Custom Premium SVG: Sales Target */}
          <div className="w-12 h-12 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E6007E]/20 to-[#E6007E]/5 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform" />
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md border border-[#E6007E]/20 rounded-2xl flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="url(#sales-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 4"/>
                <circle cx="12" cy="12" r="4" fill="url(#sales-grad)"/>
                <circle cx="12" cy="12" r="4" fill="#E6007E" opacity="0.5" filter="blur(3px)" transform="translate(0, 2)"/>
                <defs>
                  <linearGradient id="sales-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#C40079" />
                    <stop offset="1" stopColor="#E6007E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#888] mb-1">Ventas de Hoy</h3>
          <p className="text-2xl font-bold text-[#E6007E] leading-none">{displayTransactions.length}</p>
        </div>
      </div>

      {/* Reporte de Desempeño con DATOS REALES */}
      <div className="mb-10 bg-white border border-[#ebebeb] p-5 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-baseline mb-6">
          <h2 className="text-sm font-bold text-[#002C6A]">Reporte de Desempeño</h2>
          <button onClick={loadData} className="text-[10px] text-[#E6007E] font-medium uppercase tracking-wider bg-[#E6007E]/10 px-2 py-1 rounded-full hover:bg-[#E6007E]/20 transition-colors flex items-center gap-1">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
        
        {/* Gráfico de Barras */}
        <div className="h-40 flex items-end justify-between gap-2 px-1">
          {chartData.map((bar, index) => {
            const height = maxAmount > 0 ? `${(bar.amount / maxAmount) * 100}%` : '5%';
            const isToday = index === chartData.length - 1;
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <span className="text-[9px] font-medium text-[#002C6A] opacity-0 group-hover:opacity-100 transition-opacity mb-2 -translate-y-2 group-hover:translate-y-0 duration-300">Bs.{bar.amount}</span>
                <div 
                  className={`w-full rounded-xl transition-all duration-700 ease-out shadow-sm ${isToday ? 'bg-gradient-to-t from-[#E6007E] to-[#ff47a6]' : 'bg-gradient-to-t from-[#ebebeb] to-[#f5f5f5] group-hover:from-[#3FB6DA]/40 group-hover:to-[#3FB6DA]/60'}`} 
                  style={{ height: bar.amount > 0 ? height : '4px' }} 
                />
                <span className={`text-[9px] mt-3 font-semibold ${isToday ? 'text-[#E6007E]' : 'text-[#888]'}`}>{bar.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oferta de Crédito AI */}
      <div className="mb-10 border-0 rounded-3xl p-6 bg-gradient-to-br from-[#002C6A] to-[#001230] text-white relative overflow-hidden shadow-[0_10px_30px_rgba(0,44,106,0.4)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6007E]/40 blur-[50px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3FB6DA]/30 blur-[50px] rounded-full" />
        
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <span className="w-2 h-2 bg-[#3FB6DA] rounded-full animate-pulse shadow-[0_0_10px_#3FB6DA]" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#3FB6DA]">Coach IA • Pre-Aprobado</h3>
        </div>
        <p className="text-sm font-light mb-5 leading-relaxed relative z-10 text-white/90">
          {totalBalance > 1500
            ? <>Tus ventas superan el promedio. Calificas para expandir tu negocio.</>
            : <>Sigue registrando tus ventas para desbloquear ofertas de crédito.</>
          }
        </p>
        <button className="relative z-10 bg-white text-[#002C6A] text-xs uppercase tracking-widest font-bold px-4 py-3.5 w-full rounded-xl shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all">
          {totalBalance > 1500 ? 'Tomar Crédito (Bs. 2,000)' : 'Ver mi progreso'}
        </button>
      </div>

      {/* Transacciones Reales */}
      <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#ebebeb]">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#f5f5f5]">
          <h2 className="text-sm font-bold text-[#002C6A]">Transacciones</h2>
          <span className="text-[10px] text-[#888] font-medium uppercase tracking-wider bg-[#f5f5f5] px-3 py-1.5 rounded-full">Hoy</span>
        </div>
        
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#888]">Aún no tienes ventas registradas</p>
            <p className="text-xs text-[#bbb] mt-1">Ve a "Vender" para registrar tu primera venta</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayTransactions.slice(0, 10).map(sale => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f8f9fa] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#002C6A] group-hover:bg-[#E6007E] group-hover:text-white transition-colors shadow-sm">
                    <ArrowUpRight size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black group-hover:text-[#002C6A] transition-colors">{sale.prod}</h4>
                    <p className="text-[11px] text-[#888] font-medium">{sale.method} • {sale.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#3FB6DA]">+{sale.amount?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// Función helper: calcular gráfico desde ventas locales
function calculateLocalChart(transactions) {
  const daysNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const result = [];
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayName = daysNames[date.getDay()];
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTotal = transactions
      .filter(t => {
        if (!t.created_at) return false;
        return t.created_at.startsWith(dateStr);
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    result.push({ day: dayName, amount: Math.round(dayTotal) });
  }
  
  return result;
}
