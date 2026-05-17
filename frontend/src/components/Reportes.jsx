import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, Calendar, Filter, ArrowUpRight, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import api from '../api';
import logoTinka from '../assets/img/logoTinka.png';

export default function Reportes() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, today, week, month, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const salesData = await api.getSales();
      if (salesData && salesData.length > 0) {
        setTransactions(salesData);
      } else {
        const localData = JSON.parse(localStorage.getItem('tinka_sales') || '[]');
        setTransactions(localData);
      }
    } catch (e) {
      const localData = JSON.parse(localStorage.getItem('tinka_sales') || '[]');
      setTransactions(localData);
    }
    setLoading(false);
  };

  const getFilteredTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.filter(t => {
      if (!t.created_at) return true;
      const tDate = new Date(t.created_at);
      
      if (filter === 'today') {
        return tDate >= today;
      } else if (filter === 'week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        return tDate >= lastWeek;
      } else if (filter === 'month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return tDate >= lastMonth;
      } else if (filter === 'custom') {
        if (customStart && customEnd) {
          const start = new Date(customStart + 'T00:00:00');
          const end = new Date(customEnd + 'T23:59:59');
          return tDate >= start && tDate <= end;
        }
        return true; // Si no hay fechas, mostrar todo o nada. Mostramos todo por defecto.
      }
      return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const filteredData = getFilteredTransactions();
  const totalAmount = filteredData.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // Data for Donut Chart
  const paymentMethodData = filteredData.reduce((acc, sale) => {
    const method = sale.payment_method || sale.method || 'Efectivo';
    const amount = Number(sale.amount) || 0;
    const existing = acc.find(item => item.name === method);
    if (existing) {
      existing.value += amount;
    } else {
      acc.push({ name: method, value: amount });
    }
    return acc;
  }, []);
  
  const COLORS = ['#E6007E', '#3FB6DA', '#002C6A', '#FBB03B'];

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Tinka Header
    doc.setFillColor(0, 44, 106); // #002C6A
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Ventas", 14, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado: ${new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 32);

    // Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen General", 14, 55);
    
    let periodText = "Periodo Histórico Completo";
    if (filter === 'today') periodText = "Periodo: Hoy";
    if (filter === 'week') periodText = "Periodo: Últimos 7 días";
    if (filter === 'month') periodText = "Periodo: Último mes";
    if (filter === 'custom' && customStart && customEnd) periodText = `Periodo: ${customStart} al ${customEnd}`;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(periodText, 14, 65);
    doc.text(`Total de Ventas: ${filteredData.length}`, 14, 72);
    doc.text(`Ingreso Total: Bs. ${totalAmount.toFixed(2)}`, 14, 79);

    // Table
    const tableColumn = ["Fecha y Hora", "Producto/Servicio", "Método de Pago", "Monto (Bs.)"];
    const tableRows = [];

    filteredData.forEach(sale => {
      const dateStr = sale.created_at ? new Date(sale.created_at).toLocaleString('es-BO') : sale.time;
      const saleData = [
        dateStr,
        sale.product_name || sale.prod || 'Venta',
        sale.payment_method || sale.method || 'Efectivo',
        Number(sale.amount).toFixed(2)
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: [230, 0, 126], textColor: [255, 255, 255], fontStyle: 'bold' }, // #E6007E
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`Tinka_Reporte_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Fecha,Producto,Metodo Pago,Monto\n";

    filteredData.forEach(sale => {
      const dateStr = sale.created_at ? new Date(sale.created_at).toLocaleString('es-BO').replace(',', '') : sale.time;
      const row = `${dateStr},"${sale.product_name || sale.prod || 'Venta'}","${sale.payment_method || sale.method || 'Efectivo'}",${sale.amount}`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tinka_Reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] font-sans animate-in fade-in duration-500 overflow-y-auto pb-24">
      {/* Header Banco */}
      <header className="bg-[#002C6A] px-6 py-6 pt-10 rounded-b-[2.5rem] shadow-[0_10px_30px_rgba(0,44,106,0.2)] relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6007E]/20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <Link to="/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <img src={logoTinka} alt="Tinka" className="h-6 object-contain brightness-0 invert" />
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
        
        <div className="relative z-10 text-center mb-4">
          <h1 className="text-white text-2xl font-bold tracking-tight">Reporte de Ventas</h1>
          <p className="text-white/70 text-xs uppercase tracking-widest mt-1">Historial Financiero</p>
        </div>
      </header>

      <div className="px-6 -mt-6 relative z-20">
        
        {/* KPI Summary */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#ebebeb] mb-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#888] mb-1">Ingreso del periodo</p>
            <p className="text-3xl font-bold text-[#002C6A]">Bs. {totalAmount.toFixed(2)}</p>
          </div>
          <div className="w-12 h-12 bg-[#E6007E]/10 rounded-full flex items-center justify-center text-[#E6007E]">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Payment Method Chart */}
        {paymentMethodData.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#ebebeb] mb-6">
            <h2 className="text-sm font-bold text-[#002C6A] mb-2 flex items-center gap-2">
              <PieChartIcon size={16} className="text-[#3FB6DA]" />
              Desglose por Mtodo de Pago
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `Bs. ${value.toFixed(2)}`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2 bg-white p-1.5 rounded-full border border-[#ebebeb] shadow-sm overflow-x-auto no-scrollbar">
            {['all', 'today', 'week', 'month', 'custom'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  filter === f 
                    ? 'bg-[#002C6A] text-white shadow-md' 
                    : 'text-[#888] hover:bg-[#f0f4f8] hover:text-[#002C6A]'
                }`}
              >
                {f === 'all' ? 'Todo' : f === 'today' ? 'Hoy' : f === 'week' ? 'Semana' : f === 'month' ? 'Mes' : 'Elegir'}
              </button>
            ))}
          </div>

          {filter === 'custom' && (
            <div className="flex gap-2 items-center bg-white p-3 rounded-[20px] border border-[#ebebeb] shadow-sm animate-in slide-in-from-top-2">
              <div className="flex flex-col w-full">
                <span className="text-[9px] uppercase tracking-widest text-[#888] font-bold mb-1 pl-1">Desde</span>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={e => setCustomStart(e.target.value)} 
                  className="bg-[#f0f4f8] text-[#002C6A] text-xs px-3 py-2 rounded-xl w-full font-medium outline-none focus:ring-2 focus:ring-[#3FB6DA]/50 transition-all"
                />
              </div>
              <div className="flex flex-col w-full">
                <span className="text-[9px] uppercase tracking-widest text-[#888] font-bold mb-1 pl-1">Hasta</span>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={e => setCustomEnd(e.target.value)} 
                  className="bg-[#f0f4f8] text-[#002C6A] text-xs px-3 py-2 rounded-xl w-full font-medium outline-none focus:ring-2 focus:ring-[#3FB6DA]/50 transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-1">
            <button onClick={exportPDF} className="flex-1 flex items-center justify-center gap-2 bg-[#E6007E] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(230,0,126,0.3)] hover:bg-[#c20068] active:scale-95 transition-all">
              <FileText size={16} /> Descargar PDF
            </button>
            <button onClick={exportCSV} className="flex-1 flex items-center justify-center gap-2 bg-white text-[#002C6A] border border-[#ebebeb] py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm hover:border-[#3FB6DA]/50 active:scale-95 transition-all">
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#ebebeb]">
          <h2 className="text-sm font-bold text-[#002C6A] mb-5 pl-1">Detalle de Transacciones ({filteredData.length})</h2>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#E6007E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#f0f4f8] rounded-full flex items-center justify-center text-[#3FB6DA] mx-auto mb-4">
                <FileText size={24} />
              </div>
              <p className="text-sm font-bold text-[#002C6A]">No hay registros</p>
              <p className="text-xs text-[#888] mt-1">No se encontraron ventas para este periodo.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredData.map(sale => {
                const saleDate = sale.created_at ? new Date(sale.created_at) : null;
                const timeStr = saleDate ? saleDate.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }) : (sale.time || '');
                const dateStr = saleDate ? saleDate.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }) : '';

                return (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f8f9fa] transition-colors cursor-pointer group border-b border-[#f5f5f5] last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#f0f4f8] flex items-center justify-center text-[#002C6A] group-hover:bg-[#E6007E] group-hover:text-white transition-colors shadow-sm shrink-0">
                        <ArrowUpRight size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-black group-hover:text-[#002C6A] transition-colors">{sale.product_name || sale.prod || 'Venta'}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#888] font-medium mt-0.5">
                          <span>{sale.payment_method || sale.method || 'Efectivo'}</span>
                          <span className="w-1 h-1 rounded-full bg-[#ccc]"></span>
                          <span>{dateStr} {timeStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-[#3FB6DA]">+{Number(sale.amount).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
