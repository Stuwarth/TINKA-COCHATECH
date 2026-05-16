import React from 'react';

export default function ChatModal({ open, onClose, logo }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-[400px] bg-white rounded-t-lg sm:rounded-lg p-4 m-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Asistente" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200" />
            )}
            <h3 className="text-sm font-semibold">Asistente</h3>
          </div>

          <button onClick={onClose} className="text-gray-500 text-sm">Cerrar</button>
        </div>

        <div className="h-60 overflow-y-auto mb-3 bg-gray-50 p-3 rounded text-sm text-gray-600">
          <div className="text-xs text-gray-400">Chat del bot (simulado)</div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            aria-label="Mensaje"
            className="flex-1 border rounded px-3 py-2 text-sm"
            placeholder="Escribe un mensaje..."
          />
          <button className="bg-[#002C6A] text-white px-3 py-2 rounded text-sm">Enviar</button>
        </form>
      </div>
    </div>
  );
}
