import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Dashboard from './components/Dashboard';
import NuevaVenta from './components/NuevaVenta';
import CoachIA from './components/CoachIA';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
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

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
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
