import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Dashboard from './components/Dashboard';

// Componentes temporales
const NuevaVenta = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 bg-fie-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
        <span className="text-2xl">💰</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800">Nueva Venta</h2>
      <p className="text-gray-500 mt-2 text-sm">El formulario estará aquí pronto...</p>
    </div>
  </div>
);

const CoachIA = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <div className="w-16 h-16 bg-fie-magenta/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <span className="text-2xl">🤖</span>
      </div>
      <h2 className="text-xl font-bold text-gray-800">Coach Tinka</h2>
      <p className="text-gray-500 mt-2 text-sm">Tu asistente financiero IA...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vender" element={<NuevaVenta />} />
          <Route path="/coach" element={<CoachIA />} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
