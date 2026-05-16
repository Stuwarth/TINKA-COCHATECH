import { useState } from 'react';
import logoTinka from '../assets/img/logoTinka.png';
import { ChevronLeft } from 'lucide-react';

export default function Register({ onRegister, onBackToLogin }) {
  const [step, setStep] = useState(1); // paso 1: datos personales, paso 2: datos negocio
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
    e.preventDefault();
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
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#ebebeb]">
        <button
          onClick={step === 1 ? onBackToLogin : () => setStep(1)}
          className="flex items-center gap-2 text-[#888]"
        >
          <ChevronLeft size={20} />
        </button>
        <img src={logoTinka} alt="Tinka" className="h-6 object-contain opacity-90" />
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 1 ? (
          <div className="max-w-md mx-auto">
             <h2 className="text-2xl font-bold mb-1">Crea tu cuenta</h2>
             <p className="text-sm text-[#888] mb-6">
               Ingresa tus datos personales para comenzar
             </p>

             <form className="space-y-3">
               <div>
                 <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                   placeholder="email@ejemplo.com"
                   className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                     errors.email ? 'border-red-500' : 'border-[#ebebeb]'
                   }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1">
                   Nombre Completo
                 </label>
                 <input
                   type="text"
                   name="full_name"
                   value={formData.full_name}
                   onChange={handleChange}
                   placeholder="Juan Pérez"
                   className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                     errors.full_name ? 'border-red-500' : 'border-[#ebebeb]'
                   }`}
                 />
                 {errors.full_name && (
                   <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   Contraseña
                 </label>
                 <input
                   type="password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   placeholder="••••••"
                   className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                     errors.password ? 'border-red-500' : 'border-[#ebebeb]'
                   }`}
                 />
                 {errors.password && (
                   <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   Teléfono (WhatsApp)
                 </label>
                 <input
                   type="tel"
                   name="phone"
                   value={formData.phone}
                   onChange={handleChange}
                   placeholder="68549537"
                   className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                     errors.phone ? 'border-red-500' : 'border-[#ebebeb]'
                   }`}
                 />
                 {errors.phone && (
                   <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium mb-1">
                   PIN de Seguridad (4 dígitos)
                 </label>
                 <input
                   type="password"
                   name="pin"
                   value={formData.pin}
                   onChange={handleChange}
                   placeholder="0000"
                   maxLength="4"
                   className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                     errors.pin ? 'border-red-500' : 'border-[#ebebeb]'
                   }`}
                 />
                 {errors.pin && (
                   <p className="text-red-500 text-xs mt-1">{errors.pin}</p>
                 )}
               </div>

              {errors.submit && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
                  {errors.submit}
                </p>
              )}
            </form>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-1">Tu Negocio</h2>
            <p className="text-sm text-[#888] mb-6">
              Cuéntanos sobre tu negocio
            </p>

            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre del Negocio *
                </label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Mi Tienda"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                    errors.business_name ? 'border-red-500' : 'border-[#ebebeb]'
                  }`}
                />
                {errors.business_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.business_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría (Opcional)
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Ej: Tienda, Restaurante, Servicios"
                  className="w-full px-4 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Cuéntanos sobre tu negocio..."
                  rows="3"
                  className="w-full px-4 py-2 border border-[#ebebeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
                />
              </div>

              {errors.submit && (
                <p className="text-red-500 text-sm bg-red-50 p-3 rounded">
                  {errors.submit}
                </p>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Footer/Actions */}
      <div className="border-t border-[#ebebeb] p-6 space-y-3">
        <button
          onClick={step === 1 ? handleNextStep : handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
        >
          {loading
            ? 'Registrando...'
            : step === 1
              ? 'Siguiente'
              : 'Crear Cuenta'}
        </button>
        {step === 1 && (
          <button
            onClick={onBackToLogin}
            className="w-full bg-[#f5f5f5] text-black py-3 rounded-lg font-medium hover:bg-[#ebebeb] transition-colors"
          >
            Volver
          </button>
        )}
      </div>
    </div>
  );
}








