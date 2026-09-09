import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, Bell, Clock, AlertCircle } from 'lucide-react';

function CorrecaoApontamentos() {
  const navigate = useNavigate();
  const [pendentes] = useState([
    { id: 1, aluno: 'João', id_aluno: 20267, operacao: 'Fresamento', inicio: 'Ontem, 16:30' }
  ]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Correção Manual</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <h3 style={{ fontSize: '16px', color: '#4B5563', marginBottom: '16px' }}>Apontamentos Esquecidos Abertos</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pendentes.map(item => (
            <div key={item.id} style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <AlertCircle size={16} color="#CA8A04" />
                  <span style={{ fontWeight: '700', color: '#854D0E', fontSize: '14px' }}>{item.operacao}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#A16207' }}>Iniciado por {item.aluno} (ID {item.id_aluno}) - {item.inicio}</p>
              </div>
              <button style={{ backgroundColor: '#CA8A04', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}>Encerrar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CorrecaoApontamentos;