import { useState, useRef } from 'react';
import { Delete, Check, Mic, ShoppingBag } from 'lucide-react';

export default function NuevaVenta({ onAddTransaction }) {
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState('efectivo');
  const [location, setLocation] = useState('Tienda');
  const [productName, setProductName] = useState('');
  const [step, setStep] = useState('input'); // input | qr_display | success
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef(null);

  const handlePress = (num) => {
    if (amount === '0') setAmount(num);
    else if (amount.length < 6) setAmount(amount + num);
  };

  const handleBackspace = () => {
    if (amount.length > 1) setAmount(amount.slice(0, -1));
    else setAmount('0');
  };

  // Micrófono REAL con Web Speech API
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Fallback si el navegador no soporta Speech API
      setIsListening(true);
      setVoiceText('Escuchando...');
      setTimeout(() => {
        setIsListening(false);
        setVoiceText('');
        setProductName('Venta por voz');
        setAmount('45');
      }, 2000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'es-BO';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('Escuchando...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      
      // Intentar extraer número del texto hablado
      const numbers = transcript.match(/\d+/);
      if (numbers) {
        setAmount(numbers[0]);
      }
      
      // Usar el texto como nombre del producto
      const cleanText = transcript.replace(/\d+/g, '').trim();
      if (cleanText) {
        setProductName(cleanText);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setTimeout(() => setVoiceText(''), 2000);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceText('No se pudo escuchar');
      setTimeout(() => setVoiceText(''), 2000);
    };

    recognition.start();
  };

  const handleSave = () => {
    if (method === 'qr') {
      setStep('qr_display');
    } else {
      finalizePayment();
    }
  };

  const finalizePayment = () => {
    if (onAddTransaction) onAddTransaction(amount, method, productName || 'Venta Rpida', location);
    setStep('success');
    setTimeout(() => { 
      setStep('input'); 
      setAmount('0'); 
      setProductName('');
    }, 2000);
  };

  const formattedAmount = Number(amount).toLocaleString('en-US');

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BancoFIE-${Date.now()}-${amount}`;

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500 bg-white">
        <div className="w-16 h-16 border border-[#ebebeb] rounded-full flex items-center justify-center mb-6 bg-[#002C6A]">
          <Check size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-medium text-black tracking-tight">Cobro registrado</h2>
        <p className="text-sm font-semibold text-[#E6007E] mt-1">{productName || 'Venta Rápida'}</p>
        <p className="text-[10px] uppercase tracking-widest text-[#888] mt-2">+Bs. {formattedAmount} añadido a tu balance</p>
      </div>
    );
  }

  if (step === 'qr_display') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white px-8 animate-in slide-in-from-right-4 duration-500">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-8">Escanea para pagar</h2>
        
        <div className="bg-white border border-[#ebebeb] p-6 shadow-sm mb-8 relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#002C6A] -translate-x-2 -translate-y-2" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#002C6A] translate-x-2 -translate-y-2" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#002C6A] -translate-x-2 translate-y-2" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#002C6A] translate-x-2 translate-y-2" />
          
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>

        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-[#E6007E] mb-1">{productName || 'Venta Rápida'}</p>
          <p className="text-3xl font-medium text-black mb-1">Bs. {formattedAmount}</p>
          <p className="text-[10px] uppercase tracking-widest text-[#888]">Banco FIE</p>
        </div>

        <div className="w-full space-y-3">
          <button 
            onClick={finalizePayment}
            className="w-full text-xs uppercase tracking-widest font-semibold h-14 bg-[#002C6A] text-white hover:bg-[#001b44] transition-colors rounded-2xl"
          >
            Simular Pago Recibido
          </button>
          <button 
            onClick={() => setStep('input')}
            className="w-full text-xs uppercase tracking-widest font-semibold h-14 border border-[#ebebeb] text-[#888] hover:text-black transition-colors rounded-2xl"
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
      <div className="pt-8 pb-4 px-6 flex flex-col items-center justify-center bg-gradient-to-b from-[#f8f9fa] to-white border-b border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <p className="text-[#002C6A] text-[10px] font-bold uppercase tracking-[0.2em] mb-3 bg-[#002C6A]/10 px-3 py-1 rounded-full">Monto a cobrar</p>
        <div className="flex items-baseline text-black">
          <span className="text-2xl text-[#888] mr-2 font-medium">Bs.</span>
          <span className={`text-[64px] leading-none font-bold tracking-tighter transition-colors ${amount === '0' ? 'text-[#e0e0e0]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#002C6A] to-[#E6007E]'}`}>
            {formattedAmount}
          </span>
        </div>

        {/* Campo nombre producto */}
        <div className="w-full mt-3 flex items-center bg-[#f5f5f5] rounded-xl px-3 py-2.5">
          <ShoppingBag size={16} className="text-[#888] mr-2 shrink-0" />
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Qu vendiste? (ej: 5 Salteas)"
            className="flex-1 bg-transparent text-sm text-[#002C6A] font-medium placeholder:text-[#bbb] focus:outline-none"
          />
        </div>

        {/* Ubicacin Selector */}
        <div className="w-full mt-4 flex gap-2">
          {['Tienda', 'Feria', 'Delivery'].map((loc) => (
            <button
              key={loc}
              onClick={() => setLocation(loc)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                location === loc 
                  ? 'bg-[#E6007E]/10 border-[#E6007E] text-[#E6007E]' 
                  : 'bg-white border-[#ebebeb] text-[#888] hover:bg-[#f5f5f5]'
              }`}
            >
              {loc === 'Tienda' && ' 🏪 '}
              {loc === 'Feria' && ' 🎪 '}
              {loc === 'Delivery' && ' 🛵 '}
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex px-6 py-4 gap-3">
        <button 
          onClick={() => setMethod('efectivo')}
          className={`flex-1 py-3 rounded-2xl transition-all text-xs tracking-wide uppercase font-bold shadow-sm ${method === 'efectivo' ? 'bg-[#002C6A] text-white shadow-[0_4px_15px_rgba(0,44,106,0.3)] scale-[1.02]' : 'bg-[#f5f5f5] text-[#888] hover:bg-[#ebebeb]'}`}
        >
          Efectivo
        </button>
        <button 
          onClick={() => setMethod('qr')}
          className={`flex-1 py-3 rounded-2xl transition-all text-xs tracking-wide uppercase font-bold shadow-sm ${method === 'qr' ? 'bg-[#E6007E] text-white shadow-[0_4px_15px_rgba(230,0,126,0.3)] scale-[1.02]' : 'bg-[#f5f5f5] text-[#888] hover:bg-[#ebebeb]'}`}
        >
          Pago QR
        </button>
      </div>

      {/* Numpad */}
      <div className="flex-1 grid grid-cols-3 gap-y-2 gap-x-3 px-6 pb-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button key={num} onClick={() => handlePress(num.toString())} className="h-[60px] text-2xl font-medium text-[#002C6A] bg-white border border-[#f0f0f0] shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl hover:bg-[#f8f9fa] hover:border-[#3FB6DA]/30 active:scale-95 transition-all">
            {num}
          </button>
        ))}
        
        {/* Micrófono REAL */}
        <div className="flex items-center justify-center">
          <button 
            onClick={handleVoiceInput}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-gradient-to-r from-[#E6007E] to-[#ff47a6] text-white animate-pulse scale-110 shadow-[0_0_30px_rgba(230,0,126,0.6)]' : 'bg-white text-[#E6007E] border border-[#f0f0f0] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:scale-105 active:scale-95'}`}
          >
            <Mic size={22} strokeWidth={2.5} />
          </button>
        </div>

        <button onClick={() => handlePress('0')} className="h-[60px] text-2xl font-medium text-[#002C6A] bg-white border border-[#f0f0f0] shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl hover:bg-[#f8f9fa] hover:border-[#3FB6DA]/30 active:scale-95 transition-all">
          0
        </button>
        <button onClick={handleBackspace} className="h-[60px] flex items-center justify-center text-[#888] bg-white border border-[#f0f0f0] shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl hover:bg-[#fff0f5] hover:text-[#E6007E] active:scale-95 transition-all">
          <Delete size={22} strokeWidth={2} />
        </button>
      </div>

      {/* Action */}
      <div className="px-6 pb-6 pt-1 relative">
        {(isListening || voiceText) && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#002C6A] text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full whitespace-nowrap animate-in slide-in-from-bottom-2 shadow-[0_10px_20px_rgba(0,44,106,0.3)] border border-[#3FB6DA]/30">
            {voiceText || 'Escuchando...'}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#002C6A]"></span>
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={amount === '0' || isListening}
          className="w-full text-[13px] uppercase tracking-[0.2em] font-bold h-14 rounded-2xl transition-all disabled:bg-[#f5f5f5] disabled:text-[#a1a1a1] disabled:shadow-none bg-gradient-to-r from-[#E6007E] to-[#c20068] text-white hover:opacity-90 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(230,0,126,0.35)] active:scale-[0.98]"
        >
          Confirmar Cobro
        </button>
      </div>
    </div>
  );
}
