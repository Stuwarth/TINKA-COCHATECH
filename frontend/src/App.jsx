import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Dashboard from './components/Dashboard';
import NuevaVenta from './components/NuevaVenta';
import CoachIA from './components/CoachIA';
import Login from './components/Login';
import Register from './components/Register';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(api.getCurrentUser());
  const [business, setBusiness] = useState(api.getCurrentBusiness());

  // Estado de Ventas (persistido en localStorage)
  const [balance, setBalance] = useState(() => {
    const sales = JSON.parse(localStorage.getItem('local_sales') || '[]');
    return sales.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
  });

  const [transactions, setTransactions] = useState(() => {
    const sales = JSON.parse(localStorage.getItem('local_sales') || '[]');
    return sales.slice(0, 20); // Últimas 20
  });

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    setUser(data?.user || api.getCurrentUser());
    setBusiness(data?.business || api.getCurrentBusiness());
    // Recargar ventas del localStorage
    const sales = JSON.parse(localStorage.getItem('local_sales') || '[]');
    setTransactions(sales.slice(0, 20));
    setBalance(sales.reduce((sum, s) => sum + (s.amount || 0), 0));
  };

  const handleRegister = async (formData) => {
    try {
      const response = await api.register(formData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al registrar');
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setBusiness(null);
    setTransactions([]);
    setBalance(0);
    localStorage.removeItem('local_sales'); // Limpiar el caché local para evitar fugas entre cuentas de prueba
  };

  const handleAddTransaction = (amountStr, method, productName) => {
    const amount = parseFloat(amountStr);
    const newTx = {
      id: Date.now(),
      prod: productName || 'Venta Rápida',
      product_name: productName || 'Venta Rápida',
      method: method === 'qr' ? 'Pago QR' : 'Efectivo',
      payment_method: method === 'qr' ? 'Pago QR' : 'Efectivo',
      amount: amount,
      time: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setBalance(prev => prev + amount);

    // Persistir en localStorage
    const allSales = JSON.parse(localStorage.getItem('local_sales') || '[]');
    allSales.unshift(newTx);
    localStorage.setItem('local_sales', JSON.stringify(allSales));

    // Intentar enviar al backend también
    api.createSale({
      product_name: productName || 'Venta General',
      amount,
      payment_method: method === 'qr' ? 'QR' : 'Efectivo',
      location: 'Tienda',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center bg-[#f0f4f8] min-h-screen font-sans">
        <div className="w-full max-w-[400px] bg-white flex flex-col h-screen shadow-[0_20px_60px_rgba(0,0,0,0.1)] border-x border-[#ebebeb] relative overflow-hidden">
          {showRegister ? (
            <Register
              onRegister={handleRegister}
              onBackToLogin={() => setShowRegister(false)}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onRegisterClick={() => setShowRegister(true)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Router>
      <MobileLayout userName={user?.full_name} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard balance={balance} transactions={transactions} userName={user?.full_name} businessName={business?.name} business={business} />} />
          <Route path="/vender" element={<NuevaVenta onAddTransaction={handleAddTransaction} />} />
          <Route path="/coach" element={<CoachIA userName={user?.full_name} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
