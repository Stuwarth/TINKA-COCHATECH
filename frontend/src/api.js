// src/api.js
// Archivo de conexión con nuestro Backend (NestJS)
const API_URL = 'http://localhost:3000'; // Cambiar esto cuando NestJS esté levantado

export const api = {
  // 1. Obtener el resumen para el Dashboard
  getSummary: async () => {
    try {
      const response = await fetch(`${API_URL}/sales/summary`);
      if (!response.ok) throw new Error('Error al conectar con backend');
      return await response.json();
    } catch (error) {
      console.warn("Backend no conectado aún. Mostrando datos falsos.");
      return null; // El frontend usará sus datos hardcodeados si esto falla
    }
  },

  // 2. Registrar una Nueva Venta
  createSale: async (amount, method) => {
    try {
      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: "Venta General", // Por ahora genérico
          amount: parseFloat(amount),
          payment_method: method === 'efectivo' ? 'Efectivo' : 'QR',
          location: "Tienda"
        })
      });
      return response.ok;
    } catch (error) {
      console.error("Error al registrar venta:", error);
      return false;
    }
  },

  // 3. Hablar con el Coach IA (Groq)
  chatWithCoach: async (message) => {
    try {
      const response = await fetch(`${API_URL}/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      return data.reply; // El texto que responde la IA
    } catch (error) {
      console.warn("Backend de IA no conectado.");
      return null;
    }
  }
};
