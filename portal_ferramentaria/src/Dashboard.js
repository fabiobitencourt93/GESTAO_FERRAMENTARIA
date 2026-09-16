import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Monitor, Minimize, User, Wrench, Clock, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

function Producao() {
  const navigate = useNavigate();
  const [operadores, setOperadores] = useState([]);
  const [modoTV, setModoTV] = useState(false);
  const [agora, setAgora] = useState(new Date());
  
  // Memória para o React saber quais alunos ainda não têm foto
  const [imagensComErro, setImagensComErro] = useState({});

  const carregarDadosAoVivo = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/ao-vivo')
      .then(response => {
        setOperadores(response.data);
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
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: modoTV ? '24px' : '120px' }}>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', backgroundColor: modoTV ? '#111827' : 'transparent', color: modoTV ? '#FFFFFF' : '#111827', transition: 'all 0.3s' }}>
        <div>
          <h1 style={{ fontSize: modoTV ? '28px' : '22px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={modoTV ? 32 : 24} color={modoTV ? '#22C55E' : '#111827'} /> 
            Dashboard de Produção
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: modoTV ? '#9CA3AF' : '#6B7280' }}>
            Atualização automática. Status ao vivo do chão de fábrica.
          </p>
        </div>
        
        <button onClick={toggleModoTV} style={{ backgroundColor: modoTV ? '#374151' : '#111827', color: '#FFFFFF', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          {modoTV ? <><Minimize size={18} /> Sair da TV</> : <><Monitor size={18} /> Modo TV</>}
        </button>
      </div>

      <div style={{ padding: '0 32px' }}>
        {operadores.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Carregando dados da fábrica...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
            {operadores.map((op, idx) => {
              
              // ==========================================
              // LÓGICA DE CORES (SISTEMA ANDON)
              // ==========================================
              const rodando = !!op.data_hora_inicio;
              const ocioso = op.ocioso_minutos ? Number(op.ocioso_minutos) : 0;
              
              let corForte = '#6B7280'; // Cinza (padrão)
              let corFundo = '#F3F4F6';
              let textoStatus = 'LIVRE / SEM TAREFA';
              let IconeCentro = CheckCircle;

              if (rodando) {
                corForte = '#22C55E'; // Verde
                corFundo = '#22C55E'; 
                textoStatus = 'EM OPERAÇÃO';
              } else if (ocioso >= 60) {
                corForte = '#DC2626'; // Vermelho
                corFundo = '#FEF2F2';
                textoStatus = 'PARADO > 1 HORA';
                IconeCentro = AlertTriangle;
              } else if (ocioso >= 20) {
                corForte = '#D97706'; // Amarelo
                corFundo = '#FFFBEB';
                textoStatus = 'PARADO > 20 MIN';
                IconeCentro = Clock;
              }

              // ==========================================
              // LÓGICA DE GAMIFICAÇÃO (Fase 2)
              // ==========================================
              const xp = op.xp_acumulado || 0;
              const nivel = op.nivel || 1;
              const progresso = xp % 100; // Porcentagem para o próximo nível

              // Pódio para o Top 3 (Apenas se o aluno tiver mais de 0 XP)
              let corBordaAvatar = '#E5E7EB'; 
              let sombraAvatar = 'none';
              let iconePodio = null;

              if (xp > 0) {
                if (idx === 0) {
                  corBordaAvatar = '#EAB308'; // Ouro
                  sombraAvatar = '0 0 15px rgba(234, 179, 8, 0.4)';
                  iconePodio = '👑';
                } else if (idx === 1) {
                  corBordaAvatar = '#9CA3AF'; // Prata
                  iconePodio = '🥈';
                } else if (idx === 2) {
                  corBordaAvatar = '#B45309'; // Bronze
                  iconePodio = '🥉';
                }
              }

              return (
                <div key={op.operador_id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: `2px solid ${rodando ? '#22C55E' : corFundo}`, display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Tarja Superior Dinâmica */}
                  <div style={{ backgroundColor: corFundo, color: rodando ? '#FFFFFF' : corForte, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {textoStatus}
                    </span>
                    {rodando && <Activity size={16} style={{ animation: 'pulse 1.5s infinite' }} />}
                  </div>

                  {/* Corpo do Card */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    
                    {/* Cabeçalho do Aluno com Caricatura Automática e Pódio */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                      
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          // A MÁGICA: Se der erro, gera as iniciais do aluno. Se não, tenta a foto.
                          src={imagensComErro[op.operador_id] 
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(op.operador_nome)}&background=E5E7EB&color=374151&size=64&bold=true` 
                            : `/avatares/${op.operador_id}.jpg`} 
                          alt={`Avatar de ${op.operador_nome}`}
                          onError={() => setImagensComErro(prev => ({ ...prev, [op.operador_id]: true }))}
                          style={{ 
                            width: '64px', 
                            height: '64px', 
                            borderRadius: '50%', 
                            objectFit: 'cover',
                            border: `3px solid ${corBordaAvatar}`,
                            boxShadow: sombraAvatar,
                            backgroundColor: '#F3F4F6'
                          }} 
                        />
                        {/* Selo do Pódio */}
                        {iconePodio && (
                          <div style={{ 
                            position: 'absolute', bottom: '-4px', right: '-4px', 
                            backgroundColor: '#FFFFFF', borderRadius: '50%', 
                            width: '26px', height: '26px', display: 'flex', 
                            justifyContent: 'center', alignItems: 'center',
                            fontSize: '14px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' 
                          }}>
                            {iconePodio}
                          </div>
                        )}
                      </div>

                      {/* Nome e Nível */}
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Nível {nivel}
                        </span>
                        <span style={{ fontSize: '16px', color: '#111827', fontWeight: '700' }}>
                          {op.operador_nome}
                        </span>
                      </div>
                    </div>

                    {/* Informações de Operação */}
                    {rodando ? (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ height: '1px', backgroundColor: '#F3F4F6', width: '100%', marginBottom: '16px' }}></div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <Wrench size={18} color="#4B5563" style={{ marginTop: '2px' }} />
                          <div>
                            <span style={{ display: 'block', fontSize: '14px', color: '#111827', fontWeight: '700' }}>{op.nome_operacao}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#6B7280' }}>Máquina: {op.maquina_sugerida}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#6B7280' }}>Peça: {op.nome_peca}</span>
                          </div>
                        </div>
                        <div style={{ marginTop: '16px', backgroundColor: '#F0FDF4', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: '1px solid #BBF7D0' }}>
                          <Clock size={20} color="#16A34A" />
                          <span style={{ fontSize: '20px', fontWeight: '800', color: '#166534', fontFamily: 'monospace' }}>
                            {formatarTempo(op.data_hora_inicio)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px 0', opacity: 0.9 }}>
                        <IconeCentro size={32} color={corForte} style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '14px', color: corForte, fontWeight: '700' }}>
                          {textoStatus === 'LIVRE / SEM TAREFA' ? 'Aguardando 1ª tarefa' : 'Aluno Ocioso'}
                        </span>
                        {ocioso > 0 && (
                          <span style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px', fontWeight: '500' }}>
                            Inativo há {Math.floor(ocioso)} minutos
                          </span>
                        )}
                      </div>
                    )}

                    {/* BARRA DE EXPERIÊNCIA (XP) */}
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6B7280' }}>Progresso Nvl {nivel + 1}</span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#111827' }}>{progresso} / 100 XP</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${progresso}%`, 
                          height: '100%', 
                          backgroundColor: '#0284C7', // Azul SENAI
                          transition: 'width 0.5s ease-out' 
                        }}></div>
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