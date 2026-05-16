import { useState } from 'react';
import logoTinka from '../assets/img/logoTinka.png';
import { Delete } from 'lucide-react';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          setTimeout(() => onLogin(), 300);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => setPin(pin.slice(0, -1));

  return (
    <div className="flex flex-col h-screen bg-white font-sans animate-in fade-in duration-700">
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <img src={logoTinka} alt="Tinka" className="h-6 object-contain mb-16 opacity-90" />
        
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#888] mb-6 font-semibold">Security PIN</p>
        
        <div className="flex gap-6 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-colors duration-300 ${i < pin.length ? (error ? 'bg-red-500' : 'bg-black') : 'bg-[#ebebeb]'}`} />
          ))}
        </div>
      </div>

      <div className="pb-16 px-8 max-w-[320px] mx-auto w-full">
        <div className="grid grid-cols-3 gap-y-4 gap-x-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handlePress(num.toString())} className="h-16 text-2xl font-light text-black hover:bg-[#fafafa] rounded transition-colors">
              {num}
            </button>
          ))}
          <div></div>
          <button onClick={() => handlePress('0')} className="h-16 text-2xl font-light text-black hover:bg-[#fafafa] rounded transition-colors">0</button>
          <button onClick={handleBackspace} className="h-16 flex items-center justify-center text-[#888] hover:bg-[#fafafa] rounded transition-colors">
            <Delete size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
