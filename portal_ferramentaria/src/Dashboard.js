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

  // --- LÓGICA DE CÁLCULO DE TELA PARA A TV ---
  const qtd = operadores.length;
  let colunasNaTV = 3; 
  if (qtd <= 2) colunasNaTV = qtd || 1;
  else if (qtd <= 4) colunasNaTV = 2; // Forma um grid 2x2
  else if (qtd <= 6) colunasNaTV = 3; // Forma um grid 3x2
  else if (qtd <= 8) colunasNaTV = 4; // Forma um grid 4x2
  else if (qtd <= 12) colunasNaTV = 4; // Forma um grid 4x3
  else colunasNaTV = 5; // Acima de 12, espreme em 5 colunas

  return (
    <div style={{ 
      backgroundColor: '#F8F9FA', 
      minHeight: '100vh',
      height: modoTV ? '100vh' : 'auto', // Trava a altura da tela no Modo TV
      overflow: modoTV ? 'hidden' : 'auto', // Esconde a barra de rolagem no Modo TV
      fontFamily: "'Inter', sans-serif", 
      paddingBottom: modoTV ? '0' : '120px',
      display: 'flex', 
      flexDirection: 'column' // Permite que a grade preencha o resto da tela
    }}>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: modoTV ? '16px 32px' : '24px 32px', backgroundColor: 'transparent', color: '#111827', transition: 'all 0.3s' }}>
        <div>
          <h1 style={{ fontSize: modoTV ? '24px' : '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={modoTV ? 28 : 24} color="#16A34A" /> 
            Dashboard da Fábrica
          </h1>
          {!modoTV && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>Status ao vivo das máquinas e alunos.</p>}
        </div>
        <button onClick={toggleModoTV} style={{ backgroundColor: '#111827', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {modoTV ? <><Minimize size={18} /> Sair da TV</> : <><Monitor size={18} /> Modo TV</>}
        </button>
      </div>

      {/* ÁREA DOS CARDS (GRID DINÂMICO) */}
      <div style={{ padding: '0 32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {operadores.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Carregando dados da fábrica...</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            // Se for TV usa o cálculo dinâmico, se for Celular/PC usa o padrão
            gridTemplateColumns: modoTV ? `repeat(${colunasNaTV}, 1fr)` : 'repeat(auto-fill, minmax(320px, 1fr))',
            // No modo TV, força todas as linhas a terem a mesma altura preenchendo a tela
            gridAutoRows: modoTV ? '1fr' : 'auto', 
            gap: modoTV ? '12px' : '20px', 
            marginTop: modoTV ? '0' : '16px',
            paddingBottom: modoTV ? '24px' : '0',
            flex: 1 // Faz o grid esticar até o final da tela
          }}>
            {operadores.map((op, idx) => {
              const rodando = !!op.data_hora_inicio;
              return (
                <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: rodando ? '2px solid #22C55E' : '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Tarja Status */}
                  <div style={{ backgroundColor: rodando ? '#22C55E' : '#F3F4F6', color: rodando ? '#FFFFFF' : '#6B7280', padding: modoTV ? '8px 16px' : '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: modoTV ? '12px' : '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>{rodando ? 'EM OPERAÇÃO' : 'LIVRE / PARADO'}</span>
                    {rodando && <Activity size={16} style={{ animation: 'pulse 1.5s infinite' }} />}
                  </div>

                  {/* Corpo do Card */}
                  <div style={{ padding: modoTV ? '12px 16px' : '20px', display: 'flex', flexDirection: 'column', gap: modoTV ? '10px' : '16px', flex: 1, justifyContent: 'space-between' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ backgroundColor: '#F0F9FF', padding: modoTV ? '8px' : '10px', borderRadius: '50%' }}><User size={modoTV ? 20 : 24} color="#0284C7" /></div>
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Operador (Aluno)</span>
                        <span style={{ fontSize: modoTV ? '15px' : '16px', color: '#111827', fontWeight: '700' }}>{op.operador_nome}</span>
                      </div>
                    </div>
                    
                    {rodando ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <Wrench size={16} color="#4B5563" style={{ marginTop: '2px' }} />
                          <div>
                            <span style={{ display: 'block', fontSize: modoTV ? '13px' : '14px', color: '#111827', fontWeight: '700' }}>{op.nome_operacao}</span>
                            <span style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>Máquina: {op.maquina_sugerida}</span>
                            <span style={{ display: 'block', fontSize: '12px', color: '#6B7280' }}>Peça: {op.nome_peca}</span>
                          </div>
                        </div>
                        <div style={{ backgroundColor: '#F0FDF4', padding: modoTV ? '8px' : '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid #BBF7D0' }}>
                          <Clock size={18} color="#16A34A" />
                          <span style={{ fontSize: modoTV ? '18px' : '20px', fontWeight: '800', color: '#166534', fontFamily: 'monospace' }}>{formatarTempo(op.data_hora_inicio)}</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px 0', opacity: 0.6 }}>
                        <CheckCircle size={28} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500', textAlign: 'center' }}>Aguardando próxima tarefa</span>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MENU INFERIOR (ESCONDIDO NA TV) */}
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