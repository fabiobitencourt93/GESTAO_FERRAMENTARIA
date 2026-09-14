import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Monitor, Minimize, User, Wrench, Clock, Activity, CheckCircle } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState([]);
  const [modoTV, setModoTV] = useState(false);
  const [agora, setAgora] = useState(new Date());

  const carregarDadosAoVivo = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/ao-vivo')
      .then(response => setOperadores(response.data))
      .catch(error => console.error("Erro ao carregar Dashboard:", error));
  };

  useEffect(() => {
    carregarDadosAoVivo();
    const intervaloRefresh = setInterval(carregarDadosAoVivo, 30000);
    return () => clearInterval(intervaloRefresh);
  }, []);

  useEffect(() => {
    const intervaloRelogio = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervaloRelogio);
  }, []);

  const toggleModoTV = () => {
    if (!modoTV) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
      setModoTV(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setModoTV(false);
    }
  };

  useEffect(() => {
    const escListener = () => { if (!document.fullscreenElement) setModoTV(false); };
    document.addEventListener("fullscreenchange", escListener);
    return () => document.removeEventListener("fullscreenchange", escListener);
  }, []);

  const formatarTempo = (dataISO) => {
    if (!dataISO) return '00:00:00';
    const inicio = new Date(dataISO);
    const diferencaSegundos = Math.floor((agora.getTime() - inicio.getTime()) / 1000);
    if (diferencaSegundos < 0) return '00:00:00';
    const h = String(Math.floor(diferencaSegundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((diferencaSegundos % 3600) / 60)).padStart(2, '0');
    const s = String(diferencaSegundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: modoTV ? '24px' : '120px' }}>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', backgroundColor: modoTV ? '#111827' : 'transparent', color: modoTV ? '#FFFFFF' : '#111827', transition: 'all 0.3s' }}>
        <div>
          <h1 style={{ fontSize: modoTV ? '28px' : '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={modoTV ? 32 : 24} color={modoTV ? '#22C55E' : '#111827'} /> 
            Dashboard da Fábrica
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: modoTV ? '#9CA3AF' : '#6B7280' }}>Status ao vivo das máquinas e alunos.</p>
        </div>
        <button onClick={toggleModoTV} style={{ backgroundColor: modoTV ? '#374151' : '#111827', color: '#FFFFFF', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {modoTV ? <><Minimize size={18} /> Sair da TV</> : <><Monitor size={18} /> Modo TV</>}
        </button>
      </div>

      <div style={{ padding: '0 32px' }}>
        {operadores.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Carregando dados da fábrica...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
            {operadores.map((op, idx) => {
              const rodando = !!op.data_hora_inicio;
              return (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: rodando ? '2px solid #22C55E' : '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: rodando ? '#22C55E' : '#F3F4F6', color: rodando ? '#FFFFFF' : '#6B7280', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{rodando ? 'EM OPERAÇÃO' : 'LIVRE / PARADO'}</span>
                    {rodando && <Activity size={16} style={{ animation: 'pulse 1.5s infinite' }} />}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ backgroundColor: '#F0F9FF', padding: '10px', borderRadius: '50%' }}><User size={24} color="#0284C7" /></div>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>Operador (Aluno)</span>
                        <span style={{ fontSize: '16px', color: '#111827', fontWeight: '700' }}>{op.operador_nome}</span>
                      </div>
                    </div>
                    {rodando ? (
                      <>
                        <div style={{ height: '1px', backgroundColor: '#F3F4F6', width: '100%' }}></div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <Wrench size={18} color="#4B5563" style={{ marginTop: '2px' }} />
                          <div>
                            <span style={{ display: 'block', fontSize: '14px', color: '#111827', fontWeight: '700' }}>{op.nome_operacao}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#6B7280' }}>Máquina: {op.maquina_sugerida}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#6B7280' }}>Peça: {op.nome_peca}</span>
                          </div>
                        </div>
                        <div style={{ marginTop: 'auto', backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid #BBF7D0' }}>
                          <Clock size={20} color="#16A34A" />
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#166534', fontFamily: 'monospace' }}>{formatarTempo(op.data_hora_inicio)}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px 0', opacity: 0.6 }}>
                        <CheckCircle size={32} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>Aguardando próxima tarefa</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOVO MENU COM 4 BOTÕES */}
      {!modoTV && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
          <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
          <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><Monitor size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>DASHBOARD</span></div>
          <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;