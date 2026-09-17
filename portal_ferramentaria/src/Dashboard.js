/* =========================================================================
   ARQUIVO: Producao.js (FRONT-END / REACT)
   Ajuste Fino: Altura da imagem dinâmica (12vh) e paddings menores no Modo TV
   para garantir que a barra de XP e as medalhas não sejam empurradas para fora.
   ========================================================================= */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Monitor, Minimize, User, Wrench, Clock, Activity, CheckCircle, AlertTriangle, Shield, Zap, Flame, ChevronDown, ChevronUp } from 'lucide-react';

function Producao() {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState([]);
  const [modoTV, setModoTV] = useState(false);
  const [agora, setAgora] = useState(new Date());
  const [imagensComErro, setImagensComErro] = useState({});
  const [cardsExpandidos, setCardsExpandidos] = useState({});

  const toggleCard = (operadorId) => {
    setCardsExpandidos(prev => ({
      ...prev,
      [operadorId]: !prev[operadorId]
    }));
  };

  const carregarDadosAoVivo = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/ao-vivo')
      .then(response => {
        const alunosAgrupados = [];
        const mapa = {};

        response.data.forEach(item => {
          if (!mapa[item.operador_id]) {
            mapa[item.operador_id] = {
              ...item,
              tarefas: [] 
            };
            alunosAgrupados.push(mapa[item.operador_id]);
          }
          
          if (item.data_hora_inicio) {
            mapa[item.operador_id].tarefas.push({
              nome_operacao: item.nome_operacao,
              maquina_sugerida: item.maquina_sugerida,
              nome_peca: item.nome_peca,
              data_hora_inicio: item.data_hora_inicio
            });
          }
        });

        setOperadores(alunosAgrupados);
      })
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
      window.scrollTo(0, 0); 
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setModoTV(false);
    }
  };

  useEffect(() => {
    const escListener = () => {
      if (!document.fullscreenElement) setModoTV(false);
    };
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
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', height: modoTV ? '100vh' : 'auto', overflow: modoTV ? 'hidden' : 'auto', fontFamily: "'Inter', sans-serif", paddingBottom: modoTV ? '0px' : '120px' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .medalha-hover:hover { transform: scale(1.1); transition: transform 0.2s; }
        @keyframes fire { 
          0% { filter: drop-shadow(0 0 2px #EF4444); transform: scale(1); } 
          100% { filter: drop-shadow(0 0 8px #DC2626); transform: scale(1.15); } 
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: modoTV ? '12px 32px' : '24px 32px', backgroundColor: modoTV ? '#111827' : 'transparent', color: modoTV ? '#FFFFFF' : '#111827', transition: 'all 0.3s' }}>
        <div>
          <h1 style={{ fontSize: modoTV ? '24px' : '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={modoTV ? 28 : 24} color={modoTV ? '#22C55E' : '#111827'} /> 
            Dashboard de Produção
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: modoTV ? '#9CA3AF' : '#6B7280' }}>
            Atualização automática. Status ao vivo do chão de fábrica.
          </p>
        </div>
        
        <button onClick={toggleModoTV} style={{ backgroundColor: modoTV ? '#374151' : '#111827', color: '#FFFFFF', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          {modoTV ? <><Minimize size={18} /> Sair da TV</> : <><Monitor size={18} /> Modo TV</>}
        </button>
      </div>

      <div style={{ padding: '0 32px', height: modoTV ? 'calc(100vh - 75px)' : 'auto' }}>
        {operadores.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Carregando dados da fábrica...</p>
        ) : (
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: modoTV ? 'repeat(5, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gridAutoRows: modoTV ? '1fr' : 'auto', 
            gap: modoTV ? '12px' : '20px', 
            marginTop: '8px',
            height: modoTV ? '100%' : 'auto',
            paddingBottom: modoTV ? '12px' : '0'
          }}>
            {operadores.map((op, idx) => {
              
              const rodando = op.tarefas && op.tarefas.length > 0;
              const ocioso = op.ocioso_minutos ? Number(op.ocioso_minutos) : 0;
              const isExpandido = cardsExpandidos[op.operador_id];
              
              let corForte = '#6B7280'; 
              let corFundo = '#F3F4F6';
              let textoStatus = 'LIVRE / SEM TAREFA';
              let IconeCentro = CheckCircle;

              if (rodando) {
                corForte = '#22C55E'; 
                corFundo = '#22C55E'; 
                textoStatus = op.tarefas.length > 1 ? `${op.tarefas.length} OPERAÇÕES ATIVAS` : 'EM OPERAÇÃO';
              } else if (ocioso >= 60) {
                corForte = '#DC2626'; 
                corFundo = '#FEF2F2';
                textoStatus = 'PARADO > 1 HORA';
                IconeCentro = AlertTriangle;
              } else if (ocioso >= 20) {
                corForte = '#D97706'; 
                corFundo = '#FFFBEB';
                textoStatus = 'PARADO > 20 MIN';
                IconeCentro = Clock;
              }

              const xp = op.xp_acumulado || 0;
              const nivel = op.nivel || 1;
              const progresso = xp % 100; 

              let corBordaAvatar = '#E5E7EB'; 
              let sombraAvatar = 'none';
              let iconePodio = null;

              if (xp > 0) {
                if (idx === 0) {
                  corBordaAvatar = '#EAB308'; 
                  sombraAvatar = '0 0 15px rgba(234, 179, 8, 0.4)';
                  iconePodio = '👑';
                } else if (idx === 1) {
                  corBordaAvatar = '#9CA3AF'; 
                  iconePodio = '🥈';
                } else if (idx === 2) {
                  corBordaAvatar = '#B45309'; 
                  iconePodio = '🥉';
                } 
                else if (idx === 3) {
                  corBordaAvatar = '#EF4444'; 
                  sombraAvatar = '0 0 10px rgba(239, 68, 68, 0.3)';
                  iconePodio = <Flame size={16} color="#DC2626" style={{ animation: 'fire 0.6s infinite alternate' }} />;
                }
              }

              const medalhas = [];
              if (nivel >= 2) medalhas.push({ id: 'mestre-5s', nome: 'Mestre do 5S', cor: '#EAB308', fallback: <Shield size={18} color="#FDE047" /> });
              if (nivel >= 5) medalhas.push({ id: 'operador-ferro', nome: 'Operador de Ferro', cor: '#9CA3AF', fallback: <Wrench size={18} color="#E5E7EB" /> });
              if (nivel >= 10) medalhas.push({ id: 'lenda-cnc', nome: 'Lenda CNC', cor: '#8B5CF6', fallback: <Zap size={18} color="#C4B5FD" /> });

              let bannerCacada = null;
              if (isExpandido && idx === 3 && xp > 0 && operadores[2]) {
                const xpTerceiro = operadores[2].xp_acumulado || 0;
                const diferenca = xpTerceiro - xp;
                const nomeTerceiro = operadores[2].operador_nome.split(' ')[0]; 
                if (diferenca > 0) {
                  bannerCacada = (
                    <div style={{ backgroundColor: '#FEF2F2', padding: '6px', borderRadius: '6px', border: '1px dashed #FCA5A5', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={14} color="#DC2626" style={{ animation: 'fire 0.6s infinite alternate' }} />
                      <span style={{ fontSize: '11px', color: '#991B1B', fontWeight: '700' }}>
                        Faltam {diferenca} XP para bater {nomeTerceiro}!
                      </span>
                    </div>
                  );
                }
              }

              return (
                <div key={op.operador_id} style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)', 
                  border: `2px solid ${rodando ? '#22C55E' : corFundo}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  transition: 'all 0.3s ease',
                  height: '100%',
                  minHeight: 0 // <--- Regra de Ouro do Flexbox
                }}>
                  
                  <div onClick={() => toggleCard(op.operador_id)} style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    
                    <div style={{ backgroundColor: corFundo, color: rodando ? '#FFFFFF' : corForte, padding: modoTV ? '8px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {textoStatus}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rodando && <Activity size={14} style={{ animation: 'pulse 1.5s infinite' }} />}
                        {isExpandido ? <ChevronUp size={16} color={rodando ? '#FFFFFF' : corForte} /> : <ChevronDown size={16} color={rodando ? '#FFFFFF' : corForte} />}
                      </div>
                    </div>

                    <div style={{ padding: modoTV ? '8px' : '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: modoTV ? '8px' : '12px', textAlign: 'center', flex: 1, minHeight: 0 }}>
                      
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={imagensComErro[op.operador_id] 
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(op.operador_nome)}&background=E5E7EB&color=374151&size=300&bold=true` 
                            : `/avatares/${op.operador_id}.jpg`} 
                          alt={`Avatar de ${op.operador_nome}`}
                          onError={() => setImagensComErro(prev => ({ ...prev, [op.operador_id]: true }))}
                          style={{ 
                            // Altura de 12vh no TV Mode dá espaço de sobra pro XP Bar em 1080p
                            width: modoTV ? '12vh' : '300px', 
                            height: modoTV ? '12vh' : '300px', 
                            borderRadius: '50%', objectFit: 'cover', border: `3px solid ${corBordaAvatar}`, boxShadow: sombraAvatar, backgroundColor: '#F3F4F6' 
                          }} 
                        />
                        {iconePodio && (
                          <div style={{ position: 'absolute', bottom: modoTV ? '5px' : '25px', right: modoTV ? '5px' : '25px', backgroundColor: '#FFFFFF', borderRadius: '50%', width: modoTV ? '26px' : '40px', height: modoTV ? '26px' : '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: modoTV ? '14px' : '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                            {iconePodio}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Nível {nivel}
                        </span>
                        <span style={{ display: 'block', fontSize: modoTV ? '14px' : '20px', color: '#111827', fontWeight: '700', marginBottom: '6px' }}>
                          {op.operador_nome}
                        </span>
                        
                        {medalhas.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                            {medalhas.map(m => (
                              <div key={m.id} title={m.nome} className="medalha-hover" style={{
                                width: modoTV ? '24px' : '36px', height: modoTV ? '24px' : '36px', borderRadius: '6px',
                                backgroundColor: '#1F2937', border: `2px solid ${m.cor}`,
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden'
                              }}>
                                <img src={`/medalhas/${m.id}.jpg`} alt={m.nome}
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ display: 'none', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                  {m.fallback}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                    
                    {isExpandido && (
                      <div style={{ padding: modoTV ? '0 12px 8px 12px' : '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ height: '1px', backgroundColor: '#F3F4F6', width: '100%', marginBottom: '4px' }}></div>
                        
                        {rodando ? (
                          op.tarefas.map((tarefa, idxTarefa) => (
                            <div key={idxTarefa} style={{ backgroundColor: '#F9FAFB', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <Wrench size={14} color="#4B5563" style={{ marginTop: '2px' }} />
                                <div>
                                  <span style={{ display: 'block', fontSize: '12px', color: '#111827', fontWeight: '700' }}>{tarefa.nome_operacao}</span>
                                  <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Maq: {tarefa.maquina_sugerida} | Peça: {tarefa.nome_peca}</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '8px', backgroundColor: '#F0FDF4', padding: '6px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', border: '1px solid #BBF7D0' }}>
                                <Clock size={14} color="#16A34A" />
                                <span style={{ fontSize: '14px', fontWeight: '800', color: '#166534', fontFamily: 'monospace' }}>
                                  {formatarTempo(tarefa.data_hora_inicio)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px 0', opacity: 0.9 }}>
                            <IconeCentro size={20} color={corForte} style={{ marginBottom: '6px' }} />
                            <span style={{ fontSize: '12px', color: corForte, fontWeight: '700' }}>
                              {textoStatus === 'LIVRE / SEM TAREFA' ? 'Aguardando 1ª tarefa' : 'Aluno Ocioso'}
                            </span>
                          </div>
                        )}

                        {bannerCacada}
                      </div>
                    )}

                    <div style={{ padding: modoTV ? '0 12px 10px 12px' : '0 20px 20px 20px', borderTop: isExpandido ? 'none' : '1px solid #F3F4F6', paddingTop: isExpandido ? '0' : (modoTV ? '8px' : '16px') }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', color: '#6B7280' }}>Próximo: Nível {nivel + 1}</span>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#111827' }}>{progresso} / 100 XP</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progresso}%`, height: '100%', backgroundColor: '#0284C7', transition: 'width 0.5s ease-out' }}></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!modoTV && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
          <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>PRODUÇÃO</span></div>
          <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
        </div>
      )}
    </div>
  );
}

export default Producao;