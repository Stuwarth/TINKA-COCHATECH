import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Target, RefreshCw, FileText, Calendar, Activity, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard({ balance, transactions, userName, businessName, business }) {
  const [summary, setSummary] = useState(null);
  const [todaySales, setTodaySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState('5');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [loadedFromBackend, setLoadedFromBackend] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState(business);

  const isPending = currentBusiness?.status === 'pending';
  const whatsappLink = currentBusiness?.whatsapp_link || '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const summaryData = await api.getSummary();
      if (summaryData) setSummary(summaryData);

      const salesData = await api.getSales();
      if (salesData) {
        setTodaySales(salesData);
        setLoadedFromBackend(true);
      }
      if (salesData && salesData.length > 0) setTodaySales(salesData);

      // Verificar si el estado del negocio cambió en la base de datos
      if (business && business.status === 'pending') {
        const myBizs = await api.getMyBusinesses();
        if (myBizs && myBizs.length > 0) {
          const match = myBizs.find(b => b.id === business.id);
          if (match && match.status === 'active') {
            const updated = { ...business, status: 'active', whatsapp_phone: match.whatsapp_phone };
            localStorage.setItem('business', JSON.stringify(updated));
            setCurrentBusiness(updated);
          }
        }
      }
    } catch (e) {
      console.warn('Usando datos locales');
      setLoadedFromBackend(false);
    }
    setLoading(false);
  };

  // Usar datos del backend si existen, sino los props/localStorage
  const displayTransactions = loadedFromBackend
    ? todaySales.map(s => ({
        id: s.id,
        prod: s.product_name || s.prod || 'Venta',
        method: s.payment_method || s.method || 'Efectivo',
        amount: s.amount,
        time: s.created_at ? new Date(s.created_at).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : (s.time || ''),
        created_at: s.created_at
      }))
    : transactions;

  // Si cargó del backend, el balance total debe venir del total_balance calculado dinámicamente por negocio,
  // evitando usar el balance desactualizado o compartido global del usuario.
  const dbBalance = summary?.total_balance !== undefined ? Number(summary.total_balance) : (summary?.total_week ?? 0);

  const totalBalance = loadedFromBackend
    ? dbBalance
    : (balance || displayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0));

  const percentageUp = summary?.percentage_up || 0;
  const healthStatus = summary?.health_status || 'Bueno';

  const chartData = calculateLocalChart(displayTransactions, chartFilter, customStart, customEnd);

  const formattedBalance = totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [integerPart, decimalPart] = formattedBalance.split('.');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#002C6A] text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-[#3FB6DA]/30">
          <p className="font-bold opacity-80 uppercase tracking-widest text-[9px] mb-1">{label}</p>
          <p className="font-semibold">Bs. {payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

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
          <div className="flex justify-center items-center gap-2 mb-2">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#3FB6DA] font-semibold">Balance Actual</h2>
            <button onClick={() => setShowBalance(!showBalance)} className="text-[#3FB6DA]/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
              {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
          <div className="flex justify-center items-baseline gap-1 text-white select-none transition-all duration-300">
            <span className="text-2xl font-light text-white/80">Bs.</span>
            <h1 className="text-6xl font-bold tracking-tight">
              {showBalance ? integerPart : '***'}<span className="text-2xl font-medium text-white/60">{showBalance ? `.${decimalPart}` : ''}</span>
            </h1>
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

        {/* Weekly Goal Progress */}
        <div className="mb-6 bg-white border border-[#ebebeb] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[#002C6A] uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-[#E6007E]" /> Meta Semanal
            </h3>
            <span className="text-[10px] font-bold text-[#888] bg-[#f0f4f8] px-2 py-1 rounded-full">
              Bs. 1000
            </span>
          </div>
          
          <div className="w-full bg-[#f0f4f8] rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#002C6A] to-[#3FB6DA] h-2.5 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(((summary?.total_week || totalBalance) / 1000) * 100, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-semibold text-[#888]">
            <span>Llevas Bs. {(summary?.total_week || totalBalance).toFixed(0)}</span>
            <span>{summary?.total_week >= 1000 ? 'Meta Superada!' : `Faltan Bs. ${Math.max(1000 - (summary?.total_week || totalBalance), 0).toFixed(0)}`}</span>
          </div>
        </div>

        {isPending && (
          <div className="mb-8 p-5 bg-gradient-to-r from-[#002C6A] via-[#0b3875] to-[#E6007E]/20 border border-[#E6007E]/20 rounded-[28px] shadow-[0_10px_30px_rgba(230,0,126,0.15)] relative overflow-hidden animate-in slide-in-from-top-6 duration-500">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#25D366]/10 rounded-full blur-xl -translate-y-6 translate-x-6" />
            
            <div className="flex gap-4 items-start relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-sm relative">
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full animate-ping" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full" />
                <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.48 4.797 1.481 5.379 0 9.761-4.38 9.764-9.759.002-2.607-1.01-5.059-2.85-6.902C16.46 2.13 14.013.974 11.4 1.01 6.023 1.01 1.642 5.39 1.64 10.77c-.001 1.705.452 3.37 1.31 4.866l-.997 3.64 3.73-.978l.374.202zM17.15 14.4c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.777-1.665-2.078-.175-.3-.02-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.508-.675-.518-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.272.495 1.705.632.718.228 1.37.196 1.885.119.574-.086 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
                </svg>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-white font-extrabold text-sm tracking-wide">¡Activa tu Bot de WhatsApp!</h4>
                  <p className="text-[11px] text-white/70 leading-relaxed mt-1 font-semibold">
                    Vincula tu número para poder enviar tus ventas por audio o texto directamente a Tinka.
                  </p>
                </div>

                {whatsappLink ? (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-[#25D366]/20 font-bold"
                  >
                    Vincular ahora
                  </a>
                ) : (
                  <p className="text-[10px] text-yellow-300 font-bold bg-white/5 py-1 px-2.5 rounded-lg inline-block">
                    ⚠️ Abre WhatsApp y envía: ACTIVAR:token:{businessName}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Metric Cards - Banca Móvil Style */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Card: Salud del Negocio */}
        <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#002C6A]/10 flex items-center justify-center text-[#002C6A]">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            {healthStatus === 'Necesita atención' && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            {healthStatus !== 'Necesita atención' && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </div>
          <div className="flex-1 flex items-end">
            <div>
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#888] mb-1">Salud del Negocio</h3>
              <p className="text-base font-bold text-[#002C6A] leading-tight">{healthStatus}</p>
            </div>
          </div>
        </div>

        {/* Card: Ventas de Hoy */}
        <div className="bg-white border border-[#f0f0f0] p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-[120px]">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#E6007E]/10 flex items-center justify-center text-[#E6007E]">
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1 flex items-end">
            <div>
              <h3 className="text-[10px] uppercase tracking-wider font-semibold text-[#888] mb-1">Ventas de Hoy</h3>
              <p className="text-2xl font-bold text-[#002C6A] leading-none flex items-baseline gap-1">
                {displayTransactions.length}
                <span className="text-xs font-semibold text-[#666]">Trans.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica Profesional con Recharts */}
      <div className="mb-10 bg-white border border-[#ebebeb] p-5 pt-6 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <div className="w-full">
            <h2 className="text-sm font-bold text-[#002C6A] flex items-center justify-between w-full">
              Flujo de Ingresos
              <button onClick={loadData} className="text-[#3FB6DA] hover:text-[#002C6A] transition-colors p-1.5 rounded-full hover:bg-[#3FB6DA]/10">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </h2>
            <div className="mt-3 flex items-center gap-1 bg-[#f0f4f8] rounded-xl px-3 py-1.5 w-fit">
              <Calendar size={12} className="text-[#888]" />
              <select 
                value={chartFilter} 
                onChange={(e) => setChartFilter(e.target.value)}
                className="text-[10px] uppercase tracking-widest font-bold text-[#002C6A] bg-transparent outline-none appearance-none cursor-pointer pr-1"
              >
                <option value="5">Últimos 5 días</option>
                <option value="7">Últimos 7 días</option>
                <option value="15">Últimos 15 días</option>
                <option value="30">Último mes</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {chartFilter === 'custom' && (
              <div className="flex gap-2 items-center mt-3 animate-in slide-in-from-top-2">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e => setCustomStart(e.target.value)} 
                  className="bg-white border border-[#ebebeb] text-[#002C6A] text-[10px] px-2 py-1.5 rounded-lg w-full font-medium shadow-sm outline-none focus:border-[#E6007E]"
                />
                <span className="text-[10px] text-[#888] font-bold uppercase">a</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e => setCustomEnd(e.target.value)} 
                  className="bg-white border border-[#ebebeb] text-[#002C6A] text-[10px] px-2 py-1.5 rounded-lg w-full font-medium shadow-sm outline-none focus:border-[#E6007E]"
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="h-48 w-full -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E6007E" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#E6007E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ebebeb" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#888', fontWeight: 600 }}
                dy={10}
                minTickGap={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#888' }}
                tickFormatter={(value) => `Bs${value}`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3FB6DA', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#E6007E" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                activeDot={{ r: 6, fill: '#002C6A', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
      <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#ebebeb]">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#f5f5f5]">
          <h2 className="text-sm font-bold text-[#002C6A]">Transacciones Recientes</h2>
          <Link to="/reportes" className="flex items-center gap-1 text-[10px] text-[#E6007E] font-bold uppercase tracking-wider bg-[#E6007E]/10 px-3 py-1.5 rounded-full hover:bg-[#E6007E]/20 transition-colors">
            <FileText size={12} /> Ver Todas
          </Link>
        </div>
        
        {displayTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#888]">Aún no tienes ventas registradas</p>
            <p className="text-xs text-[#bbb] mt-1">Ve a "Vender" para registrar tu primera venta</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {displayTransactions.slice(0, 5).map(sale => (
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

// Función helper: calcular gráfico desde ventas locales arreglado (Timezone-safe y Dinámico)
function calculateLocalChart(transactions, filterType, customStart, customEnd) {
  const result = [];
  const daysNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  let datesToRender = [];
  const today = new Date();
  today.setHours(0,0,0,0);
  
  if (filterType === 'custom' && customStart && customEnd) {
    // Forzamos "T00:00:00" para evitar offset de UTC en el parseo del navegador
    const start = new Date(customStart + 'T00:00:00');
    const end = new Date(customEnd + 'T00:00:00');
    if (end < start) return []; // Inválido
    
    // Evitar demasiados días que colapsen el navegador (max 60 días en gráfica)
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const renderLimit = Math.min(diffDays, 60); 
    
    for (let i = 0; i <= renderLimit; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      datesToRender.push(new Date(d));
    }
  } else {
    const numDays = Number(filterType) || 5;
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      datesToRender.push(d);
    }
  }

  const numDaysRendered = datesToRender.length;

  for (const d of datesToRender) {
    const dayLabel = numDaysRendered <= 7 
      ? daysNames[d.getDay()] 
      : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

    const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    const dayTotal = transactions
      .filter(t => {
        if (!t.created_at) return false;
        const tDate = new Date(t.created_at);
        const tDateStr = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}-${String(tDate.getDate()).padStart(2, '0')}`;
        return tDateStr === localDateStr;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    result.push({ day: dayLabel, amount: Math.round(dayTotal) });
  }
  
  return result;
}
