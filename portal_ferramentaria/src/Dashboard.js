/* =========================================================================
   ARQUIVO: Producao.js (FRONT-END / REACT)
   Versão Final Boss no Topo + Pódio para a Turma
   ========================================================================= */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Monitor, Minimize, User, Wrench, Clock, Activity, CheckCircle, AlertTriangle, Shield, Zap, Flame, ChevronDown, ChevronUp, Skull } from 'lucide-react';

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

        // ORDENAÇÃO: Joga o Fabio Bitencourt Ribeiro SEMPRE para a primeira posição (Índice 0)
        alunosAgrupados.sort((a, b) => {
          const isFabioA = a.operador_nome.toLowerCase().includes('professor');
          const isFabioB = b.operador_nome.toLowerCase().includes('professor');
          if (isFabioA) return -1;
          if (isFabioB) return 1;
          return (b.xp_acumulado || 0) - (a.xp_acumulado || 0);
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
    <div style={{ backgroundColor: '#0F172A', minHeight: '100vh', height: modoTV ? '100vh' : 'auto', overflow: modoTV ? 'hidden' : 'auto', fontFamily: "'Inter', sans-serif", paddingBottom: modoTV ? '0px' : '120px', color: '#F8FAFC' }}>
      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .medalha-hover:hover { transform: scale(1.1); transition: transform 0.2s; }
        @keyframes fire { 
          0% { filter: drop-shadow(0 0 2px #EF4444); transform: scale(1); } 
          100% { filter: drop-shadow(0 0 8px #DC2626); transform: scale(1.15); } 
        }
        @keyframes bossGlow {
          0% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.6), inset 0 0 15px rgba(234, 179, 8, 0.4); border-color: #DC2626; }
          50% { box-shadow: 0 0 35px rgba(234, 179, 8, 0.9), inset 0 0 25px rgba(220, 38, 38, 0.8); border-color: #EAB308; }
          100% { box-shadow: 0 0 15px rgba(220, 38, 38, 0.6), inset 0 0 15px rgba(234, 179, 8, 0.4); border-color: #DC2626; }
        }
        .boss-card {
          animation: bossGlow 3s infinite ease-in-out;
          background: linear-gradient(145deg, #1E293B 0%, #0F172A 100%) !important;
          border: 3px solid #DC2626 !important;
        }
      `}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: modoTV ? '12px 32px' : '24px 32px', backgroundColor: modoTV ? '#090D16' : 'transparent', color: '#FFFFFF', transition: 'all 0.3s' }}>
        <div>
          <h1 style={{ fontSize: modoTV ? '24px' : '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={modoTV ? 28 : 24} color="#22C55E" /> 
            Dashboard de Produção — Chão de Fábrica
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
            Atualização automática. Status ao vivo do chão de fábrica.
          </p>
        </div>
        
        <button onClick={toggleModoTV} style={{ backgroundColor: modoTV ? '#334155' : '#1E293B', color: '#FFFFFF', border: '1px solid #475569', padding: '10px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          {modoTV ? <><Minimize size={18} /> Sair da TV</> : <><Monitor size={18} /> Modo TV</>}
        </button>
      </div>

      <div style={{ padding: '0 32px', height: modoTV ? 'calc(100vh - 75px)' : 'auto' }}>
        {operadores.length === 0 ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', marginTop: '40px' }}>Carregando dados da fábrica...</p>
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
              
              // IDENTIFICAÇÃO DO FINAL BOSS (Seu usuário fica sempre fixo no topo)
              const isFinalBoss = op.operador_nome.toLowerCase().includes('fabio');

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

              const xp = isFinalBoss ? 99999 : (op.xp_acumulado || 0);
              const nivel = isFinalBoss ? '999+' : (op.nivel || 1);
              const progresso = isFinalBoss ? 100 : (xp % 100); 

              let corBordaAvatar = isFinalBoss ? '#EF4444' : '#E5E7EB'; 
              let sombraAvatar = isFinalBoss ? '0 0 25px rgba(239, 68, 68, 0.8)' : 'none';
              let iconePodio = isFinalBoss ? <Skull size={modoTV ? 16 : 22} color="#DC2626" /> : null;

              // Pódio para os alunos começa a partir do índice 1 (já que o Boss ocupa o 0)
              if (!isFinalBoss && xp > 0) {
                if (idx === 1) {
                  corBordaAvatar = '#EAB308'; 
                  sombraAvatar = '0 0 15px rgba(234, 179, 8, 0.4)';
                  iconePodio = '👑';
                } else if (idx === 2) {
                  corBordaAvatar = '#9CA3AF'; 
                  iconePodio = '🥈';
                } else if (idx === 3) {
                  corBordaAvatar = '#B45309'; 
                  iconePodio = '🥉';
                } 
                else if (idx === 4) {
                  corBordaAvatar = '#EF4444'; 
                  sombraAvatar = '0 0 10px rgba(239, 68, 68, 0.3)';
                  iconePodio = <Flame size={16} color="#DC2626" style={{ animation: 'fire 0.6s infinite alternate' }} />;
                }
              }

              const medalhas = [];
              if (isFinalBoss || nivel >= 2) medalhas.push({ id: 'mestre-5s', nome: 'Mestre do 5S', cor: '#EAB308', fallback: <Shield size={18} color="#FDE047" /> });
              if (isFinalBoss || nivel >= 5) medalhas.push({ id: 'operador-ferro', nome: 'Operador de Ferro', cor: '#9CA3AF', fallback: <Wrench size={18} color="#E5E7EB" /> });
              if (isFinalBoss || nivel >= 10) medalhas.push({ id: 'lenda-cnc', nome: 'Lenda CNC', cor: '#8B5CF6', fallback: <Zap size={18} color="#C4B5FD" /> });

              return (
                <div key={op.operador_id} className={isFinalBoss ? 'boss-card' : ''} style={{ 
                  backgroundColor: isFinalBoss ? '#1E293B' : '#FFFFFF', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  boxShadow: isFinalBoss ? '0 0 30px rgba(220, 38, 38, 0.4)' : '0 4px 20px rgba(0,0,0,0.04)', 
                  border: isFinalBoss ? '3px solid #DC2626' : `2px solid ${rodando ? '#22C55E' : corFundo}`, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  transition: 'all 0.3s ease',
                  height: '100%',
                  minHeight: 0,
                  color: isFinalBoss ? '#F8FAFC' : '#111827'
                }}>
                  
                  <div onClick={() => toggleCard(op.operador_id)} style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    
                    <div style={{ backgroundColor: isFinalBoss ? '#7F1D1D' : corFundo, color: isFinalBoss ? '#FEF2F2' : (rodando ? '#FFFFFF' : corForte), padding: modoTV ? '8px 12px' : '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isFinalBoss ? '🔥 FINAL BOSS DA FÁBRICA 🔥' : textoStatus}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rodando && <Activity size={14} style={{ animation: 'pulse 1.5s infinite' }} />}
                        {isExpandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    <div style={{ padding: modoTV ? '8px' : '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: modoTV ? '8px' : '12px', textAlign: 'center', flex: 1, minHeight: 0 }}>
                      
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={imagensComErro[op.operador_id] 
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(op.operador_nome)}&background=1E293B&color=EF4444&size=300&bold=true` 
                            : `/avatares/${op.operador_id}.jpg`} 
                          alt={`Avatar de ${op.operador_nome}`}
                          onError={() => setImagensComErro(prev => ({ ...prev, [op.operador_id]: true }))}
                          style={{ 
                            width: modoTV ? '12vh' : '300px', 
                            height: modoTV ? '12vh' : '300px', 
                            borderRadius: '50%', objectFit: 'cover', border: `3px solid ${corBordaAvatar}`, boxShadow: sombraAvatar, backgroundColor: '#334155' 
                          }} 
                        />
                        {iconePodio && (
                          <div style={{ position: 'absolute', bottom: modoTV ? '5px' : '25px', right: modoTV ? '5px' : '25px', backgroundColor: isFinalBoss ? '#7F1D1D' : '#FFFFFF', borderRadius: '50%', width: modoTV ? '26px' : '40px', height: modoTV ? '26px' : '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: modoTV ? '14px' : '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.3)', border: '2px solid #EF4444' }}>
                            {iconePodio}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ display: 'block', fontSize: isFinalBoss ? '12px' : '11px', color: isFinalBoss ? '#FCA5A5' : '#6B7280', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {isFinalBoss ? '⚡ NÍVEL 999+ (FINAL BOSS) ⚡' : `Nível ${nivel}`}
                        </span>
                        <span style={{ display: 'block', fontSize: modoTV ? '14px' : '20px', color: isFinalBoss ? '#FFFFFF' : '#111827', fontWeight: '800', marginBottom: '6px', textShadow: isFinalBoss ? '0 0 10px rgba(239,68,68,0.5)' : 'none' }}>
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
                        <div style={{ height: '1px', backgroundColor: isFinalBoss ? '#334155' : '#F3F4F6', width: '100%', marginBottom: '4px' }}></div>
                        
                        {rodando ? (
                          op.tarefas.map((tarefa, idxTarefa) => (
                            <div key={idxTarefa} style={{ backgroundColor: isFinalBoss ? '#0F172A' : '#F9FAFB', padding: '10px', borderRadius: '8px', border: `1px solid ${isFinalBoss ? '#475569' : '#E5E7EB'}` }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <Wrench size={14} color={isFinalBoss ? '#FCA5A5' : '#4B5563'} style={{ marginTop: '2px' }} />
                                <div>
                                  <span style={{ display: 'block', fontSize: '12px', color: isFinalBoss ? '#F8FAFC' : '#111827', fontWeight: '700' }}>{tarefa.nome_operacao}</span>
                                  <span style={{ display: 'block', fontSize: '11px', color: isFinalBoss ? '#94A3B8' : '#6B7280' }}>Maq: {tarefa.maquina_sugerida} | Peça: {tarefa.nome_peca}</span>
                                </div>
                              </div>
                              <div style={{ marginTop: '8px', backgroundColor: isFinalBoss ? '#14532D' : '#F0FDF4', padding: '6px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', border: `1px solid ${isFinalBoss ? '#22C55E' : '#BBF7D0'}` }}>
                                <Clock size={14} color={isFinalBoss ? '#86EFAC' : '#16A34A'} />
                                <span style={{ fontSize: '14px', fontWeight: '800', color: isFinalBoss ? '#DCFCE7' : '#166534', fontFamily: 'monospace' }}>
                                  {formatarTempo(tarefa.data_hora_inicio)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px 0', opacity: 0.9 }}>
                            <IconeCentro size={20} color={isFinalBoss ? '#EF4444' : corForte} style={{ marginBottom: '6px' }} />
                            <span style={{ fontSize: '12px', color: isFinalBoss ? '#FCA5A5' : corForte, fontWeight: '700' }}>
                              {isFinalBoss ? 'DOMINANDO A FÁBRICA' : (textoStatus === 'LIVRE / SEM TAREFA' ? 'Aguardando 1ª tarefa' : 'Aluno Ocioso')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ padding: modoTV ? '0 12px 10px 12px' : '0 20px 20px 20px', borderTop: isExpandido ? 'none' : `1px solid ${isFinalBoss ? '#334155' : '#F3F4F6'}`, paddingTop: isExpandido ? '0' : (modoTV ? '8px' : '16px') }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', color: isFinalBoss ? '#FCA5A5' : '#6B7280' }}>{isFinalBoss ? 'STATUS: DEUS DA USINAGEM' : `Próximo: Nível ${nivel + 1}`}</span>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: isFinalBoss ? '#F8FAFC' : '#111827' }}>{isFinalBoss ? 'MAX XP' : `${progresso} / 100 XP`}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: isFinalBoss ? '#334155' : '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progresso}%`, height: '100%', background: isFinalBoss ? 'linear-gradient(90deg, #DC2626, #EAB308)' : '#0284C7', transition: 'width 0.5s ease-out' }}></div>
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
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1E293B', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #334155', zIndex: 10 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
          <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#22C55E', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>PRODUÇÃO</span></div>
          <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94A3B8', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
        </div>
      )}
    </div>
  );
}

export default Producao;