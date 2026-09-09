import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart2, Settings, Home, ChevronLeft, Bell, Users, Clock, Wrench } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Ajustes do Sistema</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Bell size={24} /></button>
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* BOTÃO 1: GERENCIAR ALUNOS */}
        <div 
          onClick={() => navigate('/alunos')} 
          style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        >
          <div style={{ backgroundColor: '#E0F2FE', color: '#0284C7', padding: '12px', borderRadius: '12px' }}><Users size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Gerenciar Alunos (Crachás)</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Cadastrar, editar ou remover IDs de operadores.</p>
          </div>
        </div>

        {/* BOTÃO 2: CORREÇÃO DE APONTAMENTOS */}
        <div 
          onClick={() => navigate('/correcao')} 
          style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        >
          <div style={{ backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '12px', borderRadius: '12px' }}><Clock size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Correção de Apontamentos</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Ajustar manualmente horários que ficaram em aberto.</p>
          </div>
        </div>

        {/* BOTÃO 3: PARQUE FABRIL */}
        <div 
          onClick={() => navigate('/maquinas')} 
          style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
        >
          <div style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '12px', borderRadius: '12px' }}><Wrench size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Parque Fabril e Máquinas</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Gerenciar centro de usinagem ROMI D800 (Comando FANUC 0i-MF), tornos e retíficas.</p>
          </div>
        </div>

      </div>
        </div>

      

      {/* Menu Inferior */}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        
        {/* Botão Painel (Home) */}
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PAINEL</span>
        </div>

        {/* Botão Produção */}
        <div 
          onClick={() => navigate('/producao')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PRODUÇÃO</span>
        </div>

        {/* Botão Ajustes */}
        <div 
          onClick={() => navigate('/ajustes')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#005eff', cursor: 'pointer' }}
        >
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>AJUSTES</span>
        </div>

      </div>
    </div>
  );
}

export default Ajustes;