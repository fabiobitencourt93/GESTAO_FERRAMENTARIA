import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Info, CheckCircle } from 'lucide-react';

function Notificacoes() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/alertas')
      .then(res => {
        setAlertas(res.data);
        setCarregando(false);
      })
      .catch(err => {
        console.error("Erro ao buscar alertas:", err);
        setCarregando(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ChevronLeft size={28} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Alertas Operacionais</h1>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Home size={24} />
        </button>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {carregando ? (
          <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>Verificando o chão de fábrica...</p>
        ) : alertas.length === 0 ? (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #22C55E', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#166534' }}>
            <CheckCircle size={40} color="#22C55E" />
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '16px' }}>Tudo limpo!</strong>
              <span style={{ fontSize: '14px' }}>Não há apontamentos esquecidos abertos no momento.</span>
            </div>
          </div>
        ) : (
          alertas.map((alerta, index) => (
            <div key={index} style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <Info color="#3B82F6" size={24} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, color: '#1E40AF', fontSize: '15px' }}>Apontamento Aberto</h4>
                <p style={{ margin: '4px 0 0 0', color: '#1D4ED8', fontSize: '13px' }}>
                  A operação <strong>{alerta.operacao || 'desconhecida'}</strong> está em andamento. Verificar necessidade de encerramento.
                </p>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default Notificacoes;