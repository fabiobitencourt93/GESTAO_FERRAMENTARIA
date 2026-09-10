import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart2, Settings, Home, ChevronLeft, Bell, Users, Clock, Wrench, Lock, Key } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  
  // Controles de Segurança
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(false);

  // === DEFINA A SENHA DO PROFESSOR/ADMIN AQUI ===
  const SENHA_CORRETA = 'Rkk1324?'; 

  const verificarSenha = (e) => {
    e.preventDefault(); // Evita recarregar a página ao dar Enter
    if (senha === SENHA_CORRETA) {
      setAutenticado(true);
      setErro(false);
    } else {
      setErro(true);
      setSenha('');
    }
  };

  // ==========================================
  // TELA 1: BLOQUEIO DE SEGURANÇA (PIN)
  // ==========================================
  if (!autenticado) {
    return (
      <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Bar Simplificado para a tela de bloqueio */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#111827' }}>
            <ChevronLeft size={28} /> <span style={{ fontWeight: '600' }}>Voltar</span>
          </button>
        </div>

        {/* Card de Senha */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '340px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            
            <div style={{ backgroundColor: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}>
              <Lock size={32} color="#4B5563" />
            </div>
            
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#111827' }}>Acesso Restrito</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6B7280' }}>Área exclusiva para professores e administração.</p>

            <form onSubmit={verificarSenha}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <Key size={20} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  inputMode="numeric"
                  placeholder="Digite o PIN" 
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px 14px 14px 48px', borderRadius: '12px', border: erro ? '2px solid #EF4444' : '1px solid #D1D5DB', fontSize: '16px', outline: 'none', backgroundColor: erro ? '#FEF2F2' : '#FFFFFF' }}
                />
              </div>
              
              {erro && <p style={{ margin: '0 0 16px 0', color: '#DC2626', fontSize: '13px', fontWeight: '500' }}>Senha incorreta. Tente novamente.</p>}
              
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#007A33', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                Desbloquear
              </button>
            </form>
          </div>
        </div>

        {/* Menu Inferior Fixo */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
          <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span></div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: ÁREA ADMINISTRATIVA (Após colocar a senha)
  // ==========================================
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
        
        <div onClick={() => navigate('/alunos')} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ backgroundColor: '#E0F2FE', color: '#0284C7', padding: '12px', borderRadius: '12px' }}><Users size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Gerenciar Alunos (Crachás)</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Cadastrar, editar ou remover IDs de operadores.</p>
          </div>
        </div>

        <div onClick={() => navigate('/correcao')} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ backgroundColor: '#FEF9C3', color: '#CA8A04', padding: '12px', borderRadius: '12px' }}><Clock size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Correção de Apontamentos</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Ajustar manualmente horários que ficaram em aberto.</p>
          </div>
        </div>

        {/* BOTÃO 3: ENGENHARIA E ROTEIROS */}
        <div onClick={() => navigate('/engenharia')} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '12px', borderRadius: '12px' }}><Settings size={24} /></div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>Engenharia e Roteiros</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>Cadastrar peças, editar processos, sequência e tempos alvo.</p>
          </div>
        </div>

      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6' }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Ajustes;