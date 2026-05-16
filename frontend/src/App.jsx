import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Dashboard from './components/Dashboard';
import NuevaVenta from './components/NuevaVenta';
import CoachIA from './components/CoachIA';
import Login from './components/Login';
import Register from './components/Register';
import { registerUser } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userToken, setUserToken] = useState(null);

  // Estado Global para la Demo
  const [balance, setBalance] = useState(1450.00);
  const [transactions, setTransactions] = useState([
    { id: 1, prod: '5 Salteñas', method: 'QR', amount: 35.00, time: '11:30' },
    { id: 2, prod: '2 Jugos', method: 'Efectivo', amount: 20.00, time: '09:15' },
  ]);

  const handleAddTransaction = (amountStr, method) => {
    const amount = parseFloat(amountStr);
    const newTx = {
      id: Date.now(),
      prod: 'Venta Rápida',
      method: method === 'qr' ? 'Pago QR' : 'Efectivo',
      amount: amount,
      time: 'Justo ahora'
    };
    setTransactions([newTx, ...transactions]);
    setBalance(prev => prev + amount);
  };

  const handleRegister = async (formData) => {
    try {
      const response = await registerUser(formData);
      // Después del registro, volver a la pantalla de Login
      // para iniciar sesión con el PIN de la nueva cuenta
      setShowRegister(false);
    } catch (error) {
      throw new Error(error.message || 'Error al registrar');
    }
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onBackToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={() => setIsAuthenticated(true)}
        onRegisterClick={() => setShowRegister(true)}
      />
    );
  }

  return (
    <Router>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Dashboard balance={balance} transactions={transactions} />} />
          <Route path="/vender" element={<NuevaVenta onAddTransaction={handleAddTransaction} />} />
          <Route path="/coach" element={<CoachIA />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
