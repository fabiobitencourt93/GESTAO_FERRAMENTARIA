import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, Play, Square, LayoutGrid, BarChart2, Settings, X, Activity, Clock, Timer, Home, CheckCircle, Monitor, Lock } from 'lucide-react';

function ProcessosPeca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [operadorId, setOperadorId] = useState('');
  const [tipoAcao, setTipoAcao] = useState(''); 
  const [ocorrencia, setOcorrencia] = useState('');
  const [agora, setAgora] = useState(new Date());
  const [carregandoAcao, setCarregandoAcao] = useState(false);

  const carregarProcessos = () => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/pecas/${id}/processos`)
      .then(response => setProcessos(response.data))
      .catch(error => console.error("Erro:", error));
  };

  const formatarTempoAlvo = (minutos) => {
  if (!minutos) return 'Tempo não definido';
  
  const horas = Math.floor(minutos / 60);
  const minRestantes = minutos % 60;
  
  if (horas > 0 && minRestantes > 0) {
    return `${horas}h ${minRestantes}m`;
  } else if (horas > 0) {
    return `${horas} Horas`;
  } else {
    return `${minRestantes} Minutos`;
  }
};

  useEffect(() => {
    carregarProcessos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  const abrirModal = (proc, acao) => {
    setProcessoSelecionado(proc);
    setTipoAcao(acao);
    setOperadorId('');
    setOcorrencia('');
    setModalAberto(true);
  };

  const confirmarAcao = async () => {
    if (!operadorId) return alert("Digite o ID do Aluno (Crachá)!");
    
    // ==========================================
    // AÇÃO 1: INICIAR OPERAÇÃO
    // ==========================================
    if (tipoAcao === 'iniciar') {
      try {
        await axios.post('https://gestao-ferramentaria.onrender.com/api/apontamentos/iniciar', {
          processo_id: processoSelecionado.id, 
          operador_id: operadorId
        });
        fecharModal();
        carregarProcessos(); 
        alert('▶️ Operação iniciada com sucesso!');
      } catch (error) {
        alert('❌ Erro ao iniciar. Verifique se o ID deste aluno está cadastrado.');
      }
    } 
    // ==========================================
    // AÇÃO 2: PAUSAR (PARCIAL)
    // ==========================================
    else if (tipoAcao === 'finalizar') {
      try {
        await axios.put('https://gestao-ferramentaria.onrender.com/api/apontamentos/finalizar', {
          processo_id: processoSelecionado.id, 
          operador_id: operadorId,
          ocorrencia: ocorrencia
        });
        fecharModal();
        carregarProcessos(); 
        alert('⏱️ Operação pausada com sucesso!');
      } catch (error) {
        alert('❌ ACESSO NEGADO: O número do crachá está incorreto ou a operação não está aberta.');
      }
    }
    // ==========================================
    // AÇÃO 3: CONCLUIR 100%
    // ==========================================
    else if (tipoAcao === 'finalizar-100') {
      const certeza = window.confirm("ATENÇÃO: Você está marcando esta operação como 100% CONCLUÍDA. Confirma esta ação?");
      if (!certeza) return; 

      try {
        await axios.put('https://gestao-ferramentaria.onrender.com/api/apontamentos/finalizar-100', {
          processo_id: processoSelecionado.id, 
          operador_id: operadorId,
          ocorrencia: ocorrencia
        });
        
        // MÁGICA VISUAL AQUI: Altera o status da operação na mesma hora no Front-end
        setProcessos(processosAnteriores => 
          processosAnteriores.map(proc => 
            proc.id === processoSelecionado.id ? { ...proc, concluido: true, data_hora_inicio: null } : proc
          )
        );

        fecharModal();
        // Não precisamos mais do carregarProcessos() aqui porque a tela já se atualizou lindamente!
        alert('✅ Sucesso! Operação concluída em 100%!');
      } catch (error) {
        alert('❌ ACESSO NEGADO: O número do crachá está incorreto ou a operação não está aberta.');
      }
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setOperadorId('');
    setTipoAcao('');
    setOcorrencia('');
  };

  const formatarTempo = (dataISO) => {
    if (!dataISO) return '';
    const inicio = new Date(dataISO);
    const diferencaSegundos = Math.floor((agora.getTime() - inicio.getTime()) / 1000);
    if (diferencaSegundos < 0) return '00:00:00';
    const h = String(Math.floor(diferencaSegundos / 3600)).padStart(2, '0');
    const m = String(Math.floor((diferencaSegundos % 3600) / 60)).padStart(2, '0');
    const s = String(diferencaSegundos % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '80px' }}>
      <style>{`@keyframes pulse-fast { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }`}</style>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Roteiro de Fabricação</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}><Home size={24} /></button>
          <Bell size={24} color="#111827" />
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            {processos.length > 0 && processos[0].nome_peca ? `${processos[0].nome_peca} (Pos: ${processos[0].posicao_peca})` : `Peça ID: ${id}`}
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{processos.length} operações na sequência</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {processos.map((proc) => {
            // LÓGICA DE ESTADO VISUAL
            // Considera o status local que injetamos, ou o status que possa vir do banco
            const isConcluido = proc.concluido || proc.status === 'Concluído' || proc.status === 'concluido';
            const emAndamento = !!proc.data_hora_inicio && !isConcluido;
            
            return (
              <div key={proc.id} style={{ 
                // Se concluído: verde claro, Se em andamento: verde vivo, Se livre: branco
                backgroundColor: isConcluido ? '#ECFDF5' : (emAndamento ? '#F0FDF4' : '#FFFFFF'), 
                border: isConcluido ? '2px solid #D1FAE5' : (emAndamento ? '2px solid #22C55E' : '2px solid transparent'),
                borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                boxShadow: isConcluido ? 'none' : '0 4px 20px rgba(0,0,0,0.03)', 
                transition: 'all 0.3s ease',
                opacity: isConcluido ? 0.6 : 1 // Deixa desbotadinho se já terminou!
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ backgroundColor: isConcluido ? '#D1FAE5' : (emAndamento ? '#DCFCE7' : '#FFF4ED'), color: isConcluido ? '#059669' : (emAndamento ? '#166534' : '#C2410C'), minWidth: '48px', height: '48px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '700' }}>OP</span>
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{proc.ordem_execucao}</span>
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827',
                      textDecoration: isConcluido ? 'line-through' : 'none' // Risco no texto!
                    }}>
                      {proc.nome_operacao}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> {proc.maquina_sugerida}</p>
                    </div>
                    {emAndamento && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontWeight: '700', fontSize: '13px', marginTop: '8px' }}>
                        <Timer size={16} style={{ animation: 'pulse-fast 1.5s infinite' }} /> Rodando: {formatarTempo(proc.data_hora_inicio)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* ESCONDE OS BOTÕES SE JÁ ESTIVER CONCLUÍDO */}
                  {!isConcluido ? (
                    <>
                      <button onClick={() => abrirModal(proc, 'iniciar')} style={{ backgroundColor: '#007A33', color: '#FFFFFF', border: 'none', borderRadius: '14px', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: emAndamento ? 0.5 : 1 }} disabled={emAndamento}><Play size={20} fill="currentColor" /></button>
                      <button onClick={() => abrirModal(proc, 'finalizar')} style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '14px', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: !emAndamento ? 0.5 : 1 }} disabled={!emAndamento}><Square size={18} fill="currentColor" /></button>
                      <button onClick={() => abrirModal(proc, 'finalizar-100')} style={{ backgroundColor: '#16A34A', color: '#FFF', border: 'none', borderRadius: '14px', padding: '0 12px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)' }}>100%</button>
                    </>
                  ) : (
                    // MOSTRA O SELO DE CONCLUÍDO
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '800', fontSize: '14px', backgroundColor: '#D1FAE5', padding: '8px 12px', borderRadius: '10px' }}>
                      <CheckCircle size={18} color="#059669" /> Concluído
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalAberto && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
    <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
      
      {/* CABEÇALHO DO MODAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tipoAcao === 'iniciar' ? <Play size={20} color="#007A33"/> : tipoAcao === 'finalizar-100' ? <CheckCircle size={20} color="#16A34A"/> : <Lock size={20} color="#DC2626" />} 
          {tipoAcao === 'iniciar' ? 'Iniciar Operação' : tipoAcao === 'finalizar-100' ? 'Concluir 100%' : 'Segurança da Máquina'}
        </h3>
        <button onClick={fecharModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={24} /></button>
      </div>
      

      {/* INFORMAÇÕES DA OPERAÇÃO (CAIXA CINZA) */}
      <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#111827', fontWeight: '600' }}>{processoSelecionado?.nome_operacao}</p>
        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500', marginRight: '8px' }}>Tempo Alvo:</span>
            <span style={{ fontSize: '14px', color: '#111827', fontWeight: '700' }}>
              {
                !processoSelecionado?.tempo_planejado_min || processoSelecionado.tempo_planejado_min === 0 
                  ? 'Não definido' 
                  : processoSelecionado.tempo_planejado_min >= 60 
                    ? processoSelecionado.tempo_planejado_min % 60 === 0 
                      ? `${Math.floor(processoSelecionado.tempo_planejado_min / 60)} Horas` 
                      : `${Math.floor(processoSelecionado.tempo_planejado_min / 60)}h ${processoSelecionado.tempo_planejado_min % 60}m`
                    : `${processoSelecionado.tempo_planejado_min} Minutos`
              }
            </span>
          </div>
        </div>
      </div> {/* <-- ESSA DIV FECHA A CAIXA CINZA */}

      {/* ========================================================= */}
      {/* O SEU PROBLEMA DE LAYOUT ESTAVA DAQUI PARA BAIXO          */}
      {/* ========================================================= */}
      
      {tipoAcao === 'iniciar' ? (
        <form onSubmit={confirmarAcao}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Seu ID (Crachá)
            </label>
            <input 
              type="number" 
              value={operadorId} 
              onChange={e => setOperadorId(e.target.value)} 
              placeholder="Ex: 20265" 
              required 
              style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
            />
          </div>
          
          <button type="submit" disabled={carregandoAcao} style={{ width: '100%', padding: '14px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: carregandoAcao ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {carregandoAcao ? 'Aguarde...' : <><Play size={18} /> Confirmar Início</>}
          </button>
        </form>
      ) : tipoAcao === 'pausar' ? (
          // O seu código existente para pausar
          <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FCA5A5', marginBottom: '20px' }}>
             {/* ... */}
          </div>
      ) : (
          // O seu código existente para finalizar ou finalizar-100
          <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FCA5A5', marginBottom: '20px' }}>
             {/* ... */}
          </div>
      )}

    </div>
  </div>
)}

      {/* MENU INFERIOR PADRONIZADO COM 4 BOTÕES */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span>
        </div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span>
        </div>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Monitor size={24} />
          <span style={{ fontSize: '10px', fontWeight: '700' }}>DASHBOARD</span>
        </div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span>
        </div>
      </div>
    </div>
  );
}

export default ProcessosPeca;