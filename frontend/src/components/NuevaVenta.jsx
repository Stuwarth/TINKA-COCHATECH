import { useState } from 'react';
import { Delete, Check, Mic } from 'lucide-react';

export default function NuevaVenta({ onAddTransaction }) {
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState('efectivo');
  const [step, setStep] = useState('input'); // input | qr_display | success
  const [isListening, setIsListening] = useState(false);

  const handlePress = (num) => {
    if (amount === '0') setAmount(num);
    else if (amount.length < 6) setAmount(amount + num);
  };

  const handleBackspace = () => {
    if (amount.length > 1) setAmount(amount.slice(0, -1));
    else setAmount('0');
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setAmount('45');
      setMethod('qr');
    }, 2500);
  };

  const handleSave = () => {
    if (method === 'qr') {
      setStep('qr_display');
    } else {
      finalizePayment();
    }
  };

  const finalizePayment = () => {
    if (onAddTransaction) onAddTransaction(amount, method);
    setStep('success');
    setTimeout(() => { 
      setStep('input'); 
      setAmount('0'); 
    }, 2000);
  };

  const formattedAmount = Number(amount).toLocaleString('en-US');

  // URL de la API gratuita para generar QRs reales al vuelo
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BancoFIE-${Date.now()}-${amount}`;

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500 bg-white">
        <div className="w-16 h-16 border border-[#ebebeb] rounded-full flex items-center justify-center mb-6 bg-black">
          <Check size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-medium text-black tracking-tight">Cobro registrado</h2>
        <p className="text-[10px] uppercase tracking-widest text-[#888] mt-2">+Bs. {formattedAmount} añadido a tu balance</p>
      </div>
    );
  }

  if (step === 'qr_display') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white px-8 animate-in slide-in-from-right-4 duration-500">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-8">Escanea para pagar</h2>
        
        <div className="bg-white border border-[#ebebeb] p-6 shadow-sm mb-8 relative">
          {/* Esquinas para simular scanner */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-black -translate-x-2 -translate-y-2" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-black translate-x-2 -translate-y-2" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-black -translate-x-2 translate-y-2" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-black translate-x-2 translate-y-2" />
          
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>

        <div className="text-center mb-12">
          <p className="text-3xl font-medium text-black mb-1">Bs. {formattedAmount}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#888]">Banco FIE</p>
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={finalizePayment}
            className="w-full text-xs uppercase tracking-widest font-semibold h-14 bg-black text-white hover:bg-[#222] transition-colors"
          >
            Simular Pago Recibido
          </button>
          <button 
            onClick={() => setStep('input')}
            className="w-full text-xs uppercase tracking-widest font-semibold h-14 border border-[#ebebeb] text-[#888] hover:text-black transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      
      {/* Display */}
      <div className="pt-16 pb-12 px-6 flex flex-col items-center justify-center border-b border-[#ebebeb]">
        <p className="text-[#888] text-[10px] uppercase tracking-[0.2em] mb-6">Monto a cobrar</p>
        <div className="flex items-baseline text-black">
          <span className="text-2xl text-[#888] mr-2 font-light">Bs.</span>
          <span className={`text-6xl font-medium tracking-tighter ${amount === '0' ? 'text-[#e0e0e0]' : 'text-black'}`}>
            {formattedAmount}
          </span>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex px-8 py-8 gap-4">
        <button 
          onClick={() => setMethod('efectivo')}
          className={`flex-1 pb-2 border-b-2 transition-all text-xs tracking-wide uppercase font-semibold ${method === 'efectivo' ? 'border-black text-black' : 'border-transparent text-[#888]'}`}
        >
          Efectivo
        </button>
        <button 
          onClick={() => setMethod('qr')}
          className={`flex-1 pb-2 border-b-2 transition-all text-xs tracking-wide uppercase font-semibold ${method === 'qr' ? 'border-black text-black' : 'border-transparent text-[#888]'}`}
        >
          Pago QR
        </button>
      </div>

      {/* Numpad */}
      <div className="flex-1 grid grid-cols-3 gap-y-2 px-8 pb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handlePress(num.toString())} className="h-16 text-2xl font-light text-black hover:bg-[#fafafa] active:bg-[#f0f0f0] transition-colors rounded">
            {num}
          </button>
        ))}
        
        {/* WOW Factor: Micrófono con IA */}
        <div className="flex items-center justify-center">
          <button 
            onClick={handleVoiceInput}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-black text-white animate-pulse scale-110 shadow-[0_0_20px_rgba(0,0,0,0.3)]' : 'bg-[#fafafa] text-black border border-[#ebebeb] hover:bg-[#f0f0f0]'}`}
          >
            <Mic size={20} />
          </button>
        </div>

        <button onClick={() => handlePress('0')} className="h-16 text-2xl font-light text-black hover:bg-[#fafafa] active:bg-[#f0f0f0] transition-colors rounded">
          0
        </button>
        <button onClick={handleBackspace} className="h-16 flex items-center justify-center text-[#888] hover:bg-[#fafafa] active:bg-[#f0f0f0] transition-colors rounded">
          <Delete size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Action */}
      <div className="p-6 relative">
        {/* Etiqueta flotante de IA cuando escucha */}
        {isListening && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] uppercase tracking-widest px-4 py-2 rounded-full whitespace-nowrap animate-in slide-in-from-bottom-2">
            Escuchando a Doña María...
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={amount === '0' || isListening}
          className="w-full text-xs uppercase tracking-widest font-semibold h-14 rounded-none transition-colors disabled:bg-[#f5f5f5] disabled:text-[#a1a1a1] bg-black text-white hover:bg-[#222] disabled:cursor-not-allowed"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
