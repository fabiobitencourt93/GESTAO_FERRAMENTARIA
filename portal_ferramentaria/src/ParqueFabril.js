import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Bell, Wrench, Settings2 } from 'lucide-react';

function ParqueFabril() {
  const navigate = useNavigate();
  const [maquinas] = useState([
    { id: 1, nome: 'Centro de Usinagem ROMI D800', comando: 'FANUC 0i-MF', status: 'Ativa' },
    { id: 2, nome: 'Torno Mecânico', comando: 'Manual', status: 'Manutenção' }
  ]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Parque Fabril</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {maquinas.map(maq => (
            <div key={maq.id} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ backgroundColor: maq.status === 'Ativa' ? '#E6F4EA' : '#FEE2E2', color: maq.status === 'Ativa' ? '#166534' : '#991B1B', padding: '12px', borderRadius: '12px' }}>
                <Wrench size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{maq.nome}</h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '4px' }}><Settings2 size={12}/> {maq.comando}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: maq.status === 'Ativa' ? '#15803D' : '#DC2626' }}>{maq.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ParqueFabril;