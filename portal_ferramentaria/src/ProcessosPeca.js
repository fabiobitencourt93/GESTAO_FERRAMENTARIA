import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, Play, LayoutGrid, BarChart2, Settings, X, Activity, Clock } from 'lucide-react';

function ProcessosPeca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [operadorId, setOperadorId] = useState('');

  useEffect(() => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/pecas/${id}/processos`)
      .then(response => setProcessos(response.data))
      .catch(error => console.error("Erro:", error));
  }, [id]);

  const abrirModal = (proc) => {
    setProcessoSelecionado(proc);
    setModalAberto(true);
  };

  const iniciarApontamento = async () => {
    if (!operadorId) return alert("Digite o ID do Operador!");
    
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/apontamentos/iniciar', {
        processo_id: processoSelecionado.id,
        operador_id: operadorId
      });
      alert('Operação iniciada com sucesso!');
      setModalAberto(false);
      setOperadorId('');
    } catch (error) {
      alert('Erro ao iniciar. O ID deste operador existe no banco de dados?');
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '80px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}>
            <ChevronLeft size={28} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Roteiro de Fabricação</h1>
        </div>
        <Bell size={24} color="#111827" />
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
            {processos.length > 0 && processos[0].nome_peca 
              ? `${processos[0].nome_peca} (Pos: ${processos[0].posicao_peca})` 
              : `Peça ID: ${id}`}
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{processos.length} operações na sequência</p>
        </div>

        {/* Lista de Processos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {processos.map((proc) => (
            <div key={proc.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ backgroundColor: '#FFF4ED', color: '#C2410C', minWidth: '48px', height: '48px', borderRadius: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>OP</span>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>{proc.ordem_execucao}</span>
                </div>
                
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>{proc.nome_operacao}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={14} /> {proc.maquina_sugerida}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#007A33', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', backgroundColor: '#E6F4EA', padding: '2px 6px', borderRadius: '6px' }}>
                      <Clock size={12} /> {proc.tempo_planejado_min || 0} min
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => abrirModal(proc)} style={{ backgroundColor: '#007A33', color: '#FFFFFF', border: 'none', borderRadius: '14px', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0, 122, 51, 0.25)' }}>
                <Play size={20} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Apontamento */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '340px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>Apontamento</h3>
              <button onClick={() => setModalAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={24} /></button>
            </div>
            
            <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' }}>Operação Atual</span>
              <p style={{ margin: '4px 0 12px 0', fontSize: '15px', color: '#111827', fontWeight: '600' }}>{processoSelecionado?.nome_operacao}</p>
              
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>Tempo Alvo:</span>
                <span style={{ fontSize: '14px', color: '#007A33', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} /> {processoSelecionado?.tempo_planejado_min || 0} minutos
                </span>
              </div>
            </div>
            
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>ID do Aluno</label>
            <input type="number" value={operadorId} onChange={(e) => setOperadorId(e.target.value)} placeholder="Ex: 1234" style={{ width: '100%', boxSizing: 'border-box', padding: '14px', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '16px', outline: 'none', marginBottom: '24px', backgroundColor: '#FAFBFC' }} />
            
            <button onClick={iniciarApontamento} style={{ width: '100%', padding: '16px', backgroundColor: '#007A33', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0, 122, 51, 0.2)' }}>
              <Play size={18} fill="currentColor" /> Confirmar Início
            </button>
          </div>
        </div>
      )}

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>PAINEL</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PRODUÇÃO</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>AJUSTES</span></div>
      </div>

    </div>
  );
}

export default ProcessosPeca;