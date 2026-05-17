import { useState } from 'react';
import logoTinka from '../assets/img/logoTinka.png';
import { Delete, Phone } from 'lucide-react';
import { loginUser } from '../api';

export default function Login({ onLogin, onRegisterClick }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'pin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        attemptLogin(newPin);
      }
    }
  };

  const attemptLogin = async (pinValue) => {
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(phone, pinValue);
      setTimeout(() => onLogin(data), 300);
    } catch (err) {
      setError(err.message || 'PIN incorrecto');
      setTimeout(() => {
        setPin('');
        setError('');
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleBackspace = () => setPin(pin.slice(0, -1));

  const handlePhoneSubmit = (e) => {
    e?.preventDefault();
    if (phone.length >= 7) {
      setStep('pin');
    }
  };

  // STEP 1: Ingresar Teléfono (Estilo Impeccable + Tinka)
  if (step === 'phone') {
    return (
      <div className="flex flex-col h-full bg-white font-sans animate-in fade-in duration-500 overflow-y-auto">
        {/* Barra superior de la marca */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#002C6A] via-[#3FB6DA] to-[#E6007E]" />

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="mb-14">
            <img src={logoTinka} alt="Tinka" className="h-12 object-contain" />
          </div>

          <div className="w-full max-w-[320px]">
            <h2 className="text-[#002C6A] text-xl font-bold mb-2 text-center tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-[#888] text-sm mb-8 text-center">Ingresa tu número de celular registrado</p>

            <form onSubmit={handlePhoneSubmit}>
              <div className="mb-8">
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#002C6A] mb-2 ml-1">Celular</label>
                <div className="flex items-center bg-white border border-[#ebebeb] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden hover:border-[#3FB6DA]/50 focus-within:border-[#E6007E] focus-within:shadow-[0_0_0_3px_rgba(230,0,126,0.08)] transition-all">
                  <div className="pl-4 pr-1 text-[#002C6A]/40">
                    <Phone size={18} strokeWidth={2} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ejem: 68549537"
                    maxLength={8}
                    className="w-full px-3 py-4 bg-transparent focus:outline-none text-[#002C6A] font-semibold text-lg tracking-widest placeholder:text-[#ccc] placeholder:font-normal placeholder:tracking-normal"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length < 7}
                className="w-full bg-[#E6007E] text-white py-4 rounded-2xl text-[12px] font-bold uppercase tracking-[0.2em] disabled:opacity-40 hover:bg-[#c20068] shadow-[0_8px_20px_rgba(230,0,126,0.25)] active:scale-[0.98] transition-all"
              >
                Continuar
              </button>
            </form>
          </div>
        </div>

        <div className="pb-8 px-8 text-center border-t border-[#ebebeb] pt-6 mx-8">
          <p className="text-[#888] text-xs mb-3">¿Aún no eres parte de Tinka?</p>
          <button
            onClick={onRegisterClick}
            className="text-[#002C6A] font-bold text-sm hover:text-[#E6007E] transition-colors"
          >
            Regístrate ahora
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: Ingresar PIN (Estilo Impeccable + Tinka)
  return (
    <div className="flex flex-col h-full bg-white font-sans animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#002C6A] via-[#3FB6DA] to-[#E6007E]" />
      
      <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-4 px-8">
        <div className="mb-6">
          <img src={logoTinka} alt="Tinka" className="h-10 object-contain" />
        </div>

        <h2 className="text-[#002C6A] text-lg font-bold mb-1">Ingresa tu PIN</h2>
        <button
          onClick={() => { setStep('phone'); setPin(''); setError(''); }}
          className="text-[#888] text-[13px] hover:text-[#E6007E] transition-colors mb-8 font-medium bg-[#f5f5f5] px-4 py-1.5 rounded-full"
        >
          {phone} <span className="text-[#002C6A] font-bold ml-1">Cambiar</span>
        </button>

        {/* Indicadores de PIN */}
        <div className="flex gap-4 mb-8 h-6 items-center">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`rounded-full transition-all duration-300 ${
                i < pin.length 
                  ? (error ? 'w-4 h-4 bg-red-500' : 'w-4 h-4 bg-[#E6007E]') 
                  : 'w-3.5 h-3.5 bg-[#ebebeb] border border-[#d1d1d1]'
              }`} 
            />
          ))}
        </div>

        <div className="h-6">
          {error && (
            <p className="text-[#E6007E] text-[13px] font-bold animate-in fade-in">{error}</p>
          )}
          {loading && (
            <p className="text-[#3FB6DA] text-[11px] uppercase tracking-widest font-bold animate-pulse">Verificando...</p>
          )}
        </div>
      </div>

      {/* Numpad Impeccable */}
      <div className="pb-10 px-8 max-w-[340px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-y-3 gap-x-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              onClick={() => handlePinPress(num.toString())} 
              disabled={loading} 
              className="h-[64px] flex items-center justify-center text-3xl font-medium text-[#002C6A] bg-white border border-[#ebebeb] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[20px] hover:border-[#3FB6DA]/30 hover:bg-[#f8f9fa] active:scale-95 transition-all disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <div></div>
          <button 
            onClick={() => handlePinPress('0')} 
            disabled={loading} 
            className="h-[64px] flex items-center justify-center text-3xl font-medium text-[#002C6A] bg-white border border-[#ebebeb] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[20px] hover:border-[#3FB6DA]/30 hover:bg-[#f8f9fa] active:scale-95 transition-all disabled:opacity-50"
          >
            0
          </button>
          <button 
            onClick={handleBackspace} 
            disabled={loading} 
            className="h-[64px] flex items-center justify-center text-[#888] bg-white border border-[#ebebeb] shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-[20px] hover:text-[#E6007E] hover:border-[#E6007E]/30 hover:bg-[#fff0f5] active:scale-95 transition-all disabled:opacity-50"
          >
            <Delete size={24} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
