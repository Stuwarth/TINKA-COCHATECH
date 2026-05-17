import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Dashboard from './components/Dashboard';
import NuevaVenta from './components/NuevaVenta';
import CoachIA from './components/CoachIA';
import Login from './components/Login';
import Register from './components/Register';
import Reportes from './components/Reportes';
import api from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(api.getCurrentUser());
  const [business, setBusiness] = useState(api.getCurrentBusiness());

  // Estado de Ventas (persistido en localStorage e aislado por Negocio)
  const [balance, setBalance] = useState(() => {
    const activeBiz = api.getCurrentBusiness();
    const key = activeBiz?.id ? `local_sales_${activeBiz.id}` : 'local_sales_guest';
    const sales = JSON.parse(localStorage.getItem(key) || '[]');
    return sales.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
  });

  const [transactions, setTransactions] = useState(() => {
    const activeBiz = api.getCurrentBusiness();
    const key = activeBiz?.id ? `local_sales_${activeBiz.id}` : 'local_sales_guest';
    const sales = JSON.parse(localStorage.getItem(key) || '[]');
    return sales.slice(0, 20); // Últimas 20
  });

  const handleLogin = (data) => {
    setIsAuthenticated(true);
    const activeUser = data?.user || api.getCurrentUser();
    const activeBusiness = data?.business || api.getCurrentBusiness();
    setUser(activeUser);
    setBusiness(activeBusiness);
    
    // Recargar ventas del localStorage utilizando la clave del negocio ingresado
    const key = activeBusiness?.id ? `local_sales_${activeBusiness.id}` : 'local_sales_guest';
    const sales = JSON.parse(localStorage.getItem(key) || '[]');
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
    // Limpiar caché local del negocio actual para máxima privacidad
    const key = business?.id ? `local_sales_${business.id}` : 'local_sales_guest';
    localStorage.removeItem(key);

    api.logout();
    setIsAuthenticated(false);
    setUser(null);
    setBusiness(null);
    setTransactions([]);
    setBalance(0);
  };

  const handleAddTransaction = (amountStr, method, productName, location) => {
    const amount = parseFloat(amountStr);
    const newTx = {
      id: Date.now(),
      prod: productName || 'Venta Rpida',
      product_name: productName || 'Venta Rpida',
      method: method === 'qr' ? 'Pago QR' : 'Efectivo',
      payment_method: method === 'qr' ? 'Pago QR' : 'Efectivo',
      location: location || 'Tienda',
      amount: amount,
      time: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString(),
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    setBalance(prev => prev + amount);

    // Persistir en localStorage de forma aislada por Negocio
    const key = business?.id ? `local_sales_${business.id}` : 'local_sales_guest';
    const allSales = JSON.parse(localStorage.getItem(key) || '[]');
    allSales.unshift(newTx);
    localStorage.setItem(key, JSON.stringify(allSales));

    // Intentar enviar al backend también
    api.createSale({
      product_name: productName || 'Venta General',
      amount,
      payment_method: method === 'qr' ? 'QR' : 'Efectivo',
      location: location || 'Tienda',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center bg-[#f0f4f8] min-h-screen font-sans">
        <div className="w-full max-w-[400px] md:shadow-[0_20px_60px_rgba(0,0,0,0.1)] md:border-x md:border-[#ebebeb] bg-white flex flex-col h-screen relative overflow-hidden">
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
          <Route path="/reportes" element={<Reportes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
