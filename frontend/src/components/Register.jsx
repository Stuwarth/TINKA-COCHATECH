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
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = () => {
    const textToCopy = `ACTIVAR:${successData?.activationToken}:${successData?.businessName}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      const res = await onRegister(formData);
      if (res && res.whatsapp_link) {
        setSuccessData({
          whatsappLink: res.whatsapp_link,
          activationToken: res.business?.activation_token || '',
          businessName: formData.business_name,
        });
        setStep(3);
      } else {
        onBackToLogin();
      }
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
        {step !== 3 ? (
          <button
            onClick={step === 1 ? onBackToLogin : () => setStep(1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] active:scale-90 transition-all text-[#002C6A]"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <img src={logoTinka} alt="Tinka" className="h-6 object-contain mx-auto" />
        <div className="w-10" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mini Banner */}
        {step === 3 ? (
          <div className="bg-gradient-to-br from-[#002C6A] to-[#001c40] text-white py-5 px-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6007E]/20 blur-[40px] rounded-full translate-x-1/3 -translate-y-1/3" />
            <h1 className="text-lg font-extrabold tracking-wide relative z-10">¡Registro Exitoso! 🎉</h1>
            <p className="text-[11px] font-medium opacity-90 mt-1 relative z-10">Activación del Bot de WhatsApp</p>
          </div>
        ) : (
          <div className="bg-[#E6007E] text-white py-4 px-6 text-center">
            <h1 className="text-lg font-extrabold tracking-wide">
              {step === 1 ? 'Datos Personales' : 'Tu Negocio'}
            </h1>
            <p className="text-[11px] font-medium opacity-90 mt-1">
              Paso {step} de 2
            </p>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex gap-2 px-8 mt-5 mb-6">
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#E6007E]' : 'bg-[#ebebeb]'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#E6007E]' : 'bg-[#ebebeb]'}`} />
          <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#E6007E]' : 'bg-[#ebebeb]'}`} />
        </div>

        {/* Form Content */}
        <div className="px-6 pb-8">
          {step === 1 && (
            <div className="space-y-4">
              <InputField icon={Mail} label="Correo electrónico" name="email" type="email" placeholder="email@ejemplo.com" value={formData.email} onChange={handleChange} error={errors.email} />
              <InputField icon={User} label="Nombres y Apellidos" name="full_name" placeholder="Juan Pérez" value={formData.full_name} onChange={handleChange} error={errors.full_name} />
              <InputField icon={Lock} label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={handleChange} error={errors.password} />
              <InputField icon={Smartphone} label="Celular (WhatsApp)" name="phone" type="tel" placeholder="68549537" value={formData.phone} onChange={handleChange} error={errors.phone} />
              <InputField icon={KeyRound} label="PIN de Seguridad" name="pin" type="password" placeholder="0000" maxLength="4" centered value={formData.pin} onChange={handleChange} error={errors.pin} />
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && successData && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
              {/* Animated Checkmark and Pulse */}
              <div className="flex justify-center my-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#3FB6DA]/20 rounded-full blur-xl scale-125 animate-pulse" />
                  <div className="w-20 h-20 bg-gradient-to-tr from-[#002C6A] to-[#3FB6DA] rounded-full flex items-center justify-center shadow-lg relative border-4 border-white">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#002C6A]">¡Felicidades, {formData.full_name}!</h2>
                <p className="text-sm text-[#555] px-2 leading-relaxed">
                  Tu negocio <strong className="text-[#E6007E]">{successData.businessName}</strong> ha sido creado con éxito.
                </p>
              </div>

              <div className="bg-white border border-[#ebebeb] p-5 rounded-[24px] shadow-[0_8px_30px_rgba(0,44,106,0.04)] text-left space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#E6007E]/10 to-transparent rounded-full blur-2xl" />
                <h3 className="text-xs uppercase tracking-widest font-extrabold text-[#002C6A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E6007E] inline-block animate-ping" />
                  Paso final obligatorio
                </h3>
                <p className="text-xs text-[#666] leading-relaxed">
                  Para registrar tus ventas enviando audios o textos, debes vincular tu WhatsApp con el bot. Haz clic en el botón verde de abajo para abrir el chat.
                </p>

                <div className="bg-[#f8f9fa] border border-[#f0f0f0] p-4 rounded-2xl relative">
                  <p className="text-[10px] uppercase font-bold text-[#888] mb-1.5 tracking-wider">Mensaje a enviar:</p>
                  <code className="text-xs font-mono font-bold text-[#002C6A] block break-all pr-12 select-all">
                    ACTIVAR:{successData.activationToken}:{successData.businessName}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-white border border-[#ebebeb] hover:bg-[#fafafa] active:scale-95 text-[#002C6A] text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-sm transition-all"
                  >
                    {copied ? '¡Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              {/* WhatsApp Button CTA */}
              <a
                href={successData.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-[0_8px_25px_rgba(37,211,102,0.3)] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.62.962 3.21 1.48 4.797 1.481 5.379 0 9.761-4.38 9.764-9.759.002-2.607-1.01-5.059-2.85-6.902C16.46 2.13 14.013.974 11.4 1.01 6.023 1.01 1.642 5.39 1.64 10.77c-.001 1.705.452 3.37 1.31 4.866l-.997 3.64 3.73-.978l.374.202zM17.15 14.4c-.3-.15-1.782-.88-2.057-.98-.275-.1-.475-.15-.675.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.49-1.777-1.665-2.078-.175-.3-.02-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.48-.508-.675-.518-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.11 3.22 5.11 4.52.714.31 1.272.495 1.705.632.718.228 1.37.196 1.885.119.574-.086 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.127-.275-.202-.575-.352z"/>
                </svg>
                Vincular mi WhatsApp
              </a>

              <button
                onClick={onBackToLogin}
                className="w-full py-4 text-[#002C6A] font-bold text-xs uppercase tracking-widest hover:bg-[#002C6A]/5 rounded-2xl transition-all active:scale-[0.98] border border-[#002C6A]/10 mt-2"
              >
                Ya lo vinculé, ir al Login
              </button>
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-[#E6007E] text-sm font-medium text-center">{errors.submit}</p>
            </div>
          )}

          {step !== 3 && (
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
          )}

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
