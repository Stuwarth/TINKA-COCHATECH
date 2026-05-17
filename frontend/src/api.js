// src/api.js
// Conexión con Backend NestJS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // 1. Login con teléfono + PIN
  login: async (phone, pin) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'PIN incorrecto');
      }
      const data = await response.json();
      // Guardar token y datos de usuario
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.business) localStorage.setItem('business', JSON.stringify(data.business));
      return data;
    } catch (error) {
      console.warn("Backend no conectado. Usando modo offline.");
      // FALLBACK OFFLINE: buscar en localStorage usuarios registrados localmente
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
      const user = localUsers.find(u => u.phone === phone && u.pin === pin);
      if (user) {
        const fakeToken = btoa(JSON.stringify({ sub: user.id, phone: user.phone }));
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.business) localStorage.setItem('business', JSON.stringify(user.business));
        return { access_token: fakeToken, user, business: user.business };
      }
      throw new Error(error.message || 'PIN incorrecto o usuario no encontrado');
    }
  },

  // 2. Registro completo
  register: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error al registrar');
      }
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.business) localStorage.setItem('business', JSON.stringify(data.business));
      return data;
    } catch (error) {
      console.warn("Backend no conectado. Guardando registro localmente.");
      // FALLBACK OFFLINE: guardar usuario en localStorage
      const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
      const exists = localUsers.find(u => u.phone === formData.phone);
      if (exists) throw new Error('Ya existe una cuenta con este número');
      
      const newUser = {
        id: `local-${Date.now()}`,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        pin: formData.pin,
        business: {
          id: `biz-${Date.now()}`,
          name: formData.business_name,
          category: formData.category || 'General',
        },
      };
      localUsers.push(newUser);
      localStorage.setItem('local_users', JSON.stringify(localUsers));
      return { user: newUser, business: newUser.business };
    }
  },

  // 3. Obtener resumen del Dashboard
  getSummary: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/sales/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al conectar');
      return await response.json();
    } catch (error) {
      console.warn("Backend no conectado. Usando datos locales.");
      return null;
    }
  },

  // 4. Registrar Nueva Venta
  createSale: async (saleData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });
      
      if (response.ok) {
        // Actualizar el balance localmente
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.current_balance = (Number(user.current_balance) || 0) + Number(saleData.amount);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return response.ok;
    } catch (error) {
      console.warn("Backend no conectado. Guardando venta localmente.");
      // FALLBACK: guardar venta en localStorage
      const sales = JSON.parse(localStorage.getItem('local_sales') || '[]');
      sales.unshift({ ...saleData, id: Date.now(), created_at: new Date().toISOString() });
      localStorage.setItem('local_sales', JSON.stringify(sales));
      
      // Actualizar balance localmente en fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.current_balance = (Number(user.current_balance) || 0) + Number(saleData.amount);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return true;
    }
  },

  // 5. Obtener ventas
  getSales: async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/sales`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error');
      return await response.json();
    } catch (error) {
      return JSON.parse(localStorage.getItem('local_sales') || '[]');
    }
  },

  // 6. Chat con Coach IA
  chatWithCoach: async (message) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/coach/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.warn("Backend de IA no conectado.");
      return null;
    }
  },

  // 7. Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
  },

  // 8. Verificar si hay sesión activa
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // 9. Obtener datos del usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 10. Obtener datos del negocio actual
  getCurrentBusiness: () => {
    const business = localStorage.getItem('business');
    return business ? JSON.parse(business) : null;
  },

  // 11. Establecer Dinero Inicial
  setInitialBalance: async (amount) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/auth/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ initial_balance: Number(amount) }),
      });
      if (!response.ok) throw new Error('Error al actualizar balance');
      const data = await response.json();
      
      // Actualizar localStorage con el nuevo balance
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.initial_balance = Number(amount);
        user.current_balance = Number(amount); // se reinicia el actual
        localStorage.setItem('user', JSON.stringify(user));
      }
      return data;
    } catch (error) {
      console.warn("Backend no conectado. Guardando balance localmente.");
      // FALLBACK
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.initial_balance = Number(amount);
        user.current_balance = Number(amount);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return true;
    }
  },
};

// Exports individuales para compatibilidad
export const registerUser = api.register;
export const loginUser = api.login;
export default api;
