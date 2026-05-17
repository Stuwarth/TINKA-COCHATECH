import { useState } from 'react';
import logoTinka from '../assets/img/logoTinka.png';
import { ChevronLeft, Mail, User, Lock, Smartphone, KeyRound, Store, Tag, FileText } from 'lucide-react';

function InputField({ icon: Icon, label, name, type = 'text', placeholder, maxLength, centered, value, onChange, error }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider font-bold text-[#002C6A] mb-2 ml-1">{label}</label>
      <div className={`flex items-center bg-white border ${error ? 'border-red-400' : 'border-[#ebebeb]'} rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden hover:border-[#3FB6DA]/50 focus-within:border-[#E6007E] focus-within:shadow-[0_0_0_3px_rgba(230,0,126,0.08)] transition-all`}>
        <div className="pl-4 pr-1 text-[#002C6A]/40">
          <Icon size={18} strokeWidth={2} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-3 py-3.5 bg-transparent focus:outline-none text-[#002C6A] font-semibold text-sm placeholder:text-[#ccc] placeholder:font-normal ${centered ? 'text-center tracking-[0.5em] text-lg' : ''}`}
        />
      </div>
      {error && (
        <p className="text-[#E6007E] text-[11px] mt-1.5 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
}

export default function Register({ onRegister, onBackToLogin }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    phone: '',
    pin: '',
    business_name: '',
    category: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email requerido';
    if (!formData.full_name || formData.full_name.length < 3)
      newErrors.full_name = 'Nombre completo requerido';
    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Contraseña requerida (mínimo 6 caracteres)';
    if (!formData.phone) newErrors.phone = 'Teléfono requerido';
    if (!formData.pin || formData.pin.length < 4)
      newErrors.pin = 'PIN requerido (mínimo 4 dígitos)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.business_name)
      newErrors.business_name = 'Nombre del negocio requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    try {
      await onRegister(formData);
    } catch (error) {
      setErrors({
        submit: error.message || 'Error al registrar',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafbfc] font-sans animate-in fade-in duration-500">
      {/* Header Sticky Impeccable */}
      <div className="flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md relative z-30 border-b border-[#f0f0f0] sticky top-0">
        <button
          onClick={step === 1 ? onBackToLogin : () => setStep(1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] active:scale-90 transition-all text-[#002C6A]"
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <img src={logoTinka} alt="Tinka" className="h-6 object-contain" />
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mini Banner Magenta */}
        <div className="bg-[#E6007E] text-white py-4 px-6 text-center">
          <h1 className="text-lg font-extrabold tracking-wide">
            {step === 1 ? 'Datos Personales' : 'Tu Negocio'}
          </h1>
          <p className="text-[11px] font-medium opacity-90 mt-1">
            Paso {step} de 2
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2 px-8 mt-5 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#E6007E]' : 'bg-[#ebebeb]'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#E6007E]' : 'bg-[#ebebeb]'}`} />
        </div>

        {/* Form Content */}
        <div className="px-6 pb-8">
          {step === 1 ? (
            <div className="space-y-4">
              <InputField icon={Mail} label="Correo electrónico" name="email" type="email" placeholder="email@ejemplo.com" value={formData.email} onChange={handleChange} error={errors.email} />
              <InputField icon={User} label="Nombres y Apellidos" name="full_name" placeholder="Juan Pérez" value={formData.full_name} onChange={handleChange} error={errors.full_name} />
              <InputField icon={Lock} label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} error={errors.password} />
              <InputField icon={Smartphone} label="Celular (WhatsApp)" name="phone" type="tel" placeholder="68549537" value={formData.phone} onChange={handleChange} error={errors.phone} />
              <InputField icon={KeyRound} label="PIN de Seguridad" name="pin" type="password" placeholder="0000" maxLength="4" centered value={formData.pin} onChange={handleChange} error={errors.pin} />
            </div>
          ) : (
            <div className="space-y-4">
              <InputField icon={Store} label="Nombre del Negocio" name="business_name" placeholder="Mi Tienda" value={formData.business_name} onChange={handleChange} error={errors.business_name} />
              <InputField icon={Tag} label="Categoría (Opcional)" name="category" placeholder="Tienda, Restaurante..." value={formData.category} onChange={handleChange} error={errors.category} />
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-[#002C6A] mb-2 ml-1">Descripción (Opcional)</label>
                <div className="bg-white border border-[#ebebeb] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden hover:border-[#3FB6DA]/50 focus-within:border-[#E6007E] focus-within:shadow-[0_0_0_3px_rgba(230,0,126,0.08)] transition-all p-1">
                  <div className="flex items-start gap-2 px-3 pt-2">
                    <FileText size={18} strokeWidth={2} className="text-[#002C6A]/40 mt-0.5 shrink-0" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Cuéntanos sobre tu negocio..."
                      rows="3"
                      className="w-full bg-transparent focus:outline-none text-[#002C6A] font-semibold text-sm placeholder:text-[#ccc] placeholder:font-normal resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[#E6007E] text-sm font-medium text-center">{errors.submit}</p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={step === 1 ? handleNextStep : handleSubmit}
            disabled={loading}
            className="w-full mt-8 bg-[#E6007E] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-[#c20068] disabled:opacity-50 transition-all active:scale-[0.98] shadow-[0_8px_25px_rgba(230,0,126,0.3)]"
          >
            {loading
              ? 'Enviando...'
              : step === 1
                ? 'Siguiente →'
                : 'Crear Cuenta'}
          </button>

          {step === 1 && (
            <button
              onClick={onBackToLogin}
              className="w-full mt-3 py-3 text-[#002C6A] font-bold text-xs uppercase tracking-widest hover:bg-[#002C6A]/5 rounded-2xl transition-all active:scale-[0.98]"
            >
              Ya tengo cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
