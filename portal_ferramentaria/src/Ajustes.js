import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Clock, Settings as SettingsIcon, LayoutGrid, BarChart2, Settings, Lock, Unlock } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  
  const [autenticado, setAutenticado] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');

  // Ao carregar a tela, verifica se o professor já digitou a senha nesta sessão
  useEffect(() => {
    const sessaoAtiva = sessionStorage.getItem('professorAutenticado');
    if (sessaoAtiva === 'true') {
      setAutenticado(true);
    }
  }, []);

  const verificarSenha = () => {
    if (senhaDigitada === '1234') { 
      setAutenticado(true);
      sessionStorage.setItem('professorAutenticado', 'true');
    } else {
      alert('Senha incorreta!');
      setSenhaDigitada('');
    }
  };

  const sairEBloquear = () => {
    setAutenticado(false);
    sessionStorage.removeItem('professorAutenticado');
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#FFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Ajustes do Sistema</h1>
        </div>
        
        {autenticado && (
          <button onClick={sairEBloquear} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontWeight: '600' }}>
            <Lock size={18} /> Bloquear
          </button>
        )}
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        
        {!autenticado ? (
          /* TELA DE BLOQUEIO */
          <div style={{ backgroundColor: '#FFFFFF', padding: '32px 24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center', marginTop: '20px' }}>
            <div style={{ backgroundColor: '#FEE2E2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}>
              <Lock size={32} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Área Restrita</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>Digite o PIN para acessar os ajustes do sistema.</p>
            
            <input 
              type="password" 
              placeholder="Digite o PIN" 
              value={senhaDigitada}
              onChange={(e) => setSenhaDigitada(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verificarSenha()}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #D1D5DB', fontSize: '18px', textAlign: 'center', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' }}
            />
            
            <button 
              onClick={verificarSenha}
              style={{ width: '100%', padding: '16px', backgroundColor: '#007A33', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Unlock size={20} /> Desbloquear Acesso
            </button>
          </div>
        ) : (
          /* MENU DO PROFESSOR (Desbloqueado) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <button 
              onClick={() => navigate('/alunos')}
              style={{ width: '100%', padding: '20px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'left' }}
            >
              <div style={{ backgroundColor: '#E0F2FE', padding: '12px', borderRadius: '12px' }}><Users size={24} color="#0284C7" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Gerenciar Alunos (Crachás)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar, editar ou remover IDs de operadores.</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/correcao')}
              style={{ width: '100%', padding: '20px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'left' }}
            >
              <div style={{ backgroundColor: '#FEF9C3', padding: '12px', borderRadius: '12px' }}><Clock size={24} color="#CA8A04" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Correção de Apontamentos</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Ajustar manualmente horários que ficaram em aberto.</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/engenharia')}
              style={{ width: '100%', padding: '20px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'left' }}
            >
              <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '12px' }}><SettingsIcon size={24} color="#4B5563" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Engenharia e Roteiros</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar peças, editar processos, sequência e tempos.</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/retroativo')}
              style={{ width: '100%', padding: '20px', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', textAlign: 'left' }}
            >
              <div style={{ backgroundColor: '#FFEDD5', padding: '12px', borderRadius: '12px' }}><Clock size={24} color="#EA580C" /></div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Lançamento Retroativo de Horas</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Inserção de tempo para operadores que esqueceram.</p>
              </div>
            </button>

          </div>
        )}
      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Ajustes;