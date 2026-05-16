import { ArrowUpRight } from 'lucide-react';

export default function Dashboard({ balance = 1450, transactions = [] }) {
  const formattedBalance = balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const [integerPart, decimalPart] = formattedBalance.split('.');
  return (
    <div className="animate-in fade-in duration-700 px-6 pt-8">
      {/* Hero Balance - Editorial Typography */}
      <div className="mb-12">
        <h2 className="text-[11px] uppercase tracking-[0.2em] text-[#888] font-semibold mb-3">Balance Actual</h2>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl text-[#888] font-light">Bs.</span>
          <h1 className="text-6xl font-medium tracking-tighter text-black">{integerPart}<span className="text-2xl text-[#a1a1a1]">.{decimalPart}</span></h1>
        </div>
      </div>

      {/* Metric Cards - Minimalist Grid */}
      <div className="grid grid-cols-2 gap-3 mb-12">
        <div className="border border-[#ebebeb] p-4 rounded-lg bg-[#fafafa]">
          <h3 className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Crecimiento</h3>
          <p className="text-lg font-medium text-green-600">+15.2%</p>
        </div>
        <div className="border border-[#ebebeb] p-4 rounded-lg bg-[#fafafa]">
          <h3 className="text-[10px] uppercase tracking-wider text-[#888] mb-1">Meta Semanal</h3>
          <p className="text-lg font-medium text-black">72%</p>
          <div className="w-full h-1 bg-[#eaeaea] mt-2 rounded-none">
            <div className="h-full bg-black" style={{ width: '72%' }}></div>
          </div>
        </div>
      </div>

      {/* WOW Factor: Oferta de Crédito AI */}
      <div className="mb-12 border border-[#ebebeb] p-5 bg-black text-white relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
        
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <h3 className="text-[10px] uppercase tracking-widest font-semibold text-white/80">Coach IA • Oportunidad</h3>
        </div>
        <p className="text-sm font-light mb-4 leading-relaxed">
          Tus ventas superan el promedio de la zona en un <strong className="font-semibold text-white">15.2%</strong>. Calificas para expandir tu negocio hoy.
        </p>
        <button className="bg-white text-black text-xs uppercase tracking-widest font-semibold px-4 py-3 w-full hover:bg-[#f0f0f0] transition-colors">
          Tomar Microcrédito (Bs. 2,000)
        </button>
      </div>

      {/* Transactions - Wireframe aesthetics */}
      <div>
        <div className="flex justify-between items-baseline mb-6 border-b border-[#ebebeb] pb-4">
          <h2 className="text-sm font-medium text-black">Transacciones</h2>
          <span className="text-[10px] text-[#888] uppercase tracking-wider">Hoy</span>
        </div>
        
        <div className="flex flex-col">
          {transactions.map(sale => (
            <div key={sale.id} className="flex items-center justify-between py-4 border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors -mx-6 px-6 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded border border-[#ebebeb] flex items-center justify-center text-[#888]">
                  <ArrowUpRight size={14} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-black">{sale.prod}</h4>
                  <p className="text-[11px] text-[#888] mt-0.5">{sale.method} · {sale.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-black">+{sale.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
