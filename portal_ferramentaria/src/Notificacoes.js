import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Home, AlertTriangle, Info } from 'lucide-react';

function Notificacoes() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Alertas Operacionais</h1>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Mock de Alerta de Tempo */}
        <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #DC2626', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <AlertTriangle color="#DC2626" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, color: '#991B1B', fontSize: '15px' }}>Estouro de Tempo Planejado</h4>
            <p style={{ margin: '4px 0 0 0', color: '#B91C1C', fontSize: '13px' }}>A operação de fresamento no Destacador Macho ultrapassou os 120 minutos estipulados.</p>
          </div>
        </div>

        {/* Mock de Apontamento Esquecido */}
        <div style={{ backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', padding: '16px', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info color="#3B82F6" size={24} style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: 0, color: '#1E40AF', fontSize: '15px' }}>Apontamento Aberto</h4>
            <p style={{ margin: '4px 0 0 0', color: '#1D4ED8', fontSize: '13px' }}>O Aluno ID 20265 possui uma operação em andamento desde ontem. Verificar necessidade de encerramento manual.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Notificacoes;