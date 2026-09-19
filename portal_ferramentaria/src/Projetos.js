import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, LayoutGrid, BarChart2, Settings, AlertTriangle, CheckCircle2, Trash2, Undo2, Monitor, Play, Square, X, Sparkles, FolderPlus } from 'lucide-react';

function Projetos() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  
  const [novoProjeto, setNovoProjeto] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoEstampo, setTipoEstampo] = useState('');
  
  const [mensagemErro, setMensagemErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  // Estados do Modal de Limpeza (Atalho 5S)
  const [modalLimpeza, setModalLimpeza] = useState(false);
  const [idAlunoLimpeza, setIdAlunoLimpeza] = useState('');
  const [carregandoLimpeza, setCarregandoLimpeza] = useState(false);

  const carregarProjetos = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(resposta => setProjetos(resposta.data))
      .catch(erro => {
        console.error(erro);
        setMensagemErro("Falha ao carregar a lista. Verifique se o back-end está online.");
      });
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  const handleCadastrar = async () => {
    setMensagemErro(null); 
    setMensagemSucesso(null); 

    if (!novoProjeto) return setMensagemErro("Por favor, digite o nome do projeto.");
    if (!tipoEstampo) return setMensagemErro("Selecione o tipo estrutural do estampo.");
    if (!dataInicio) return setMensagemErro("A data de início é obrigatória.");

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
        nome: novoProjeto, data_inicio: dataInicio, data_fim: dataFim, tipo: tipoEstampo
      });
      setNovoProjeto(''); setDataInicio(''); setDataFim(''); setTipoEstampo('');
      setMensagemSucesso("Projeto cadastrado com sucesso!");
      carregarProjetos(); 
    } catch (error) {
      setMensagemErro(JSON.stringify(error.response?.data || error.message));
    }
  };


  const total = parseInt(projetos.total_processos) || 0;
  const concluidos = parseInt(projetos.processos_concluidos) || 0;
  const percentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;






  const handleAlterarStatus = async (id, novoStatus, e) => {
    e.stopPropagation(); 
    if (!window.confirm(`Deseja ${novoStatus === 'Concluído' ? 'concluir' : 'reabrir'} este projeto?`)) return;
    let dataHoje = novoStatus === 'Concluído' ? new Date().toLocaleDateString('pt-BR') : null;
    try {
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}/status`, { status: novoStatus, data_conclusao: dataHoje });
      carregarProjetos(); 
    } catch (error) {
      alert(`Erro ao atualizar projeto.`);
    }
  };

  const handleDeletar = async (id, e) => {
    e.stopPropagation(); 
    if (!window.confirm("Tem certeza que deseja APAGAR este projeto definitivamente?")) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}`);
      carregarProjetos();
    } catch (error) {
      alert("Erro ao deletar projeto.");
    }
  };

  // ==========================================
  // LÓGICA DO ATALHO RÁPIDO DE LIMPEZA (5S)
  // ==========================================
  const buscarProcessoLimpeza = async () => {
    try {
      // 1. Busca o projeto que contenha "5S" ou "Limpeza" no nome
      const resProj = await axios.get('https://gestao-ferramentaria.onrender.com/api/projetos');
      const projetoLimpeza = resProj.data.find(p => p.projeto.toLowerCase().includes('5s') || p.projeto.toLowerCase().includes('limpeza') || p.projeto.toLowerCase().includes('rotina'));
      
      if (!projetoLimpeza) {
        alert("Projeto administrativo não encontrado! Vá em Ajustes e crie um projeto com o nome 'Rotinas de Fábrica (5S)'.");
        return null;
      }

      // 2. Busca o ID do processo genérico de limpeza dentro desse projeto
      const resEng = await axios.get(`https://gestao-ferramentaria.onrender.com/api/projetos/${projetoLimpeza.projeto_id}/engenharia`);
      const pecas = resEng.data;
      if (pecas.length === 0 || !pecas[0].processos || pecas[0].processos.length === 0) {
        alert("O projeto 'Rotinas de Fábrica (5S)' existe, mas falta cadastrar a Peça e o Processo na aba Engenharia!");
        return null;
      }

      return pecas[0].processos[0].id; // Retorna o ID da operação de Limpeza
    } catch (error) {
      alert("Erro ao se comunicar com o banco de dados.");
      return null;
    }
  };

  const handleAcaoLimpeza = async (acao) => {
    if (!idAlunoLimpeza) return alert("Digite o ID do seu crachá!");
    setCarregandoLimpeza(true);

    try {
      const processoId = await buscarProcessoLimpeza();
      if (!processoId) {
        setCarregandoLimpeza(false);
        return;
      }

      if (acao === 'iniciar') {
        await axios.post('https://gestao-ferramentaria.onrender.com/api/apontamentos/iniciar', {
          processo_id: processoId, operador_id: idAlunoLimpeza
        });
        alert("✅ Bom trabalho! Seu tempo de Organização/Limpeza começou a rodar.");
      } else {
        // Usamos o 'finalizar' normal (parcial) em vez de 100%, para que a tarefa possa ser usada infinitamente!
        await axios.put('https://gestao-ferramentaria.onrender.com/api/apontamentos/finalizar', {
          processo_id: processoId, operador_id: idAlunoLimpeza, ocorrencia: "Apontamento Rápido de 5S / Limpeza Concluído"
        });
        alert("🛑 Tempo de Limpeza finalizado e salvo no sistema com sucesso!");
      }
      
      setModalLimpeza(false);
      setIdAlunoLimpeza('');
    } catch (error) {
      alert("❌ Erro: Verifique se o seu Crachá está correto, ou se você já possui outra máquina rodando no seu nome.");
    }
    setCarregandoLimpeza(false);
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* Barra Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-cecdr.png" alt="CECDR" style={{ height: '32px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, marginLeft: '8px' }}>Projetos - Construtor de Estampos de Corte, Dobra e Repuxo</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Home size={24} color="#111827" /></button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Bell size={24} color="#111827" /></button>
        </div>
      </div>

      <div style={{ padding: '0 24px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* BOTÃO GIGANTE DE ATALHO DE LIMPEZA (5S) */}
        <div 
          onClick={() => setModalLimpeza(true)}
          style={{ 
            backgroundColor: '#0F766E', 
            borderRadius: '16px', 
            padding: '24px', 
            marginBottom: '24px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 4px 15px rgba(15, 118, 110, 0.2)',
            transition: 'transform 0.2s',
            ':hover': { transform: 'scale(1.01)' }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ backgroundColor: '#115E59', padding: '16px', borderRadius: '12px' }}>
              <Sparkles size={32} color="#CCFBF1" />
            </div>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', color: '#FFFFFF', fontWeight: '800' }}>Inspecionar, Limpar e Organizar (5S)</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#CCFBF1' }}>Atalho rápido para apontar o tempo de organização da fábrica no fim do turno.</p>
            </div>
          </div>
          <button style={{ backgroundColor: '#FFFFFF', color: '#0F766E', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
            ABRIR PAINEL 5S
          </button>
        </div>

        {mensagemErro && <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #EF4444', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#991B1B', display: 'flex', gap: '12px', alignItems: 'center' }}><AlertTriangle size={24} color="#DC2626" /><div><strong style={{ display: 'block', fontSize: '14px' }}>Atenção:</strong><span style={{ fontSize: '13px' }}>{mensagemErro}</span></div></div>}
        {mensagemSucesso && <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #22C55E', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontWeight: '600' }}>{mensagemSucesso}</div>}
        
        {/* LISTA DE PROJETOS */}
        {projetos.map((proj) => (
          
          
          <div 
            key={proj.projeto_id} 
            onClick={() => navigate(`/estampo/${proj.estampo_id}`)}
            style={{ cursor: 'pointer', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' }}
          >
            {/* BARRA DE PROGRESSO */}
      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>
            Progresso de Fabricação
          </span>
          <span style={{ fontSize: '13px', fontWeight: '800', color: percentagem === 100 ? '#059669' : '#2563EB' }}>
            {percentagem}%
          </span>
        </div>
        
        <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${percentagem}%`, 
            backgroundColor: percentagem === 100 ? '#10B981' : '#3B82F6', 
            height: '100%', 
            borderRadius: '999px',
            transition: 'width 0.8s ease-in-out'
          }}></div>
        </div>
        
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9CA3AF', textAlign: 'right', fontWeight: '500' }}>
          {concluidos} de {total} operações finalizadas
        </p>
      </div>



            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              
              {/* === INÍCIO DA ÁREA DA IMAGEM + TÍTULOS === */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                
                {/* MINIATURA DA IMAGEM */}
                {proj.imagem ? (
                  <img src={proj.imagem} alt="Referência" style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E7EB', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '120px', height: '120px', borderRadius: '8px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #D1D5DB', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>Sem Foto</span>
                  </div>
                )}

                {/* TEXTOS (NOME, BADGES E SUBTÍTULO) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '700' }}>{proj.projeto}</h3>
                    <span style={{ backgroundColor: proj.status === 'Concluído' ? '#DCFCE7' : proj.status === 'Em Execução' ? '#DBEAFE' : '#FEF9C3', color: proj.status === 'Concluído' ? '#166534' : proj.status === 'Em Execução' ? '#1D4ED8' : '#A16207', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{proj.status}</span>
                    <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{proj.tipo || 'TIPO NÃO DEFINIDO'}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>ID do Projeto: {proj.projeto_id} | Estampo: {proj.estampo} (ID: {proj.estampo_id})</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 {proj.status === 'Concluído' ? (
                   <button onClick={(e) => handleAlterarStatus(proj.projeto_id, 'Em Execução', e)} title="Reabrir Projeto" style={{ background: 'none', border: 'none', color: '#D97706', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><Undo2 size={24} /></button>
                 ) : (
                   <button onClick={(e) => handleAlterarStatus(proj.projeto_id, 'Concluído', e)} title="Marcar como Concluído" style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><CheckCircle2 size={24} /></button>
                 )}
                 <button onClick={(e) => handleDeletar(proj.projeto_id, e)} title="Apagar Projeto" style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}><Trash2 size={24} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
              <div><span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Início Planejado</span><span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_inicio || 'Não informado'}</span></div>
              <div><span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Previsão de Fim</span><span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_fim || 'Não informado'}</span></div>
              <div><span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Conclusão Real</span><span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_conclusao || 'Aguardando conclusão'}</span></div>
            </div>
          </div>
      
      
        ))}

      </div>  

      {/* MODAL DE ATALHO PARA LIMPEZA */}
      {modalLimpeza && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '360px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={24} color="#0F766E" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#111827' }}>Apontamento de 5S</h3>
              </div>
              <button onClick={() => setModalLimpeza(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={24} /></button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.5' }}>Insira o seu crachá para iniciar ou encerrar o seu tempo gasto com organização e faxina.</p>

            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>ID do Aluno (Crachá)</label>
            <input type="number" value={idAlunoLimpeza} onChange={(e) => setIdAlunoLimpeza(e.target.value)} placeholder="Ex: 20265" disabled={carregandoLimpeza} style={{ width: '100%', boxSizing: 'border-box', padding: '16px', border: '1px solid #D1D5DB', borderRadius: '12px', fontSize: '16px', outline: 'none', marginBottom: '24px', backgroundColor: '#FAFBFC', textAlign: 'center', fontWeight: '700' }} />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleAcaoLimpeza('iniciar')} disabled={carregandoLimpeza} style={{ flex: 1, padding: '16px', backgroundColor: '#0F766E', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: carregandoLimpeza ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: carregandoLimpeza ? 0.7 : 1 }}>
                <Play size={18} fill="currentColor" /> INICIAR
              </button>
              
              <button onClick={() => handleAcaoLimpeza('finalizar')} disabled={carregandoLimpeza} style={{ flex: 1, padding: '16px', backgroundColor: '#DC2626', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: carregandoLimpeza ? 'wait' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: carregandoLimpeza ? 0.7 : 1 }}>
                <Square size={18} fill="currentColor" /> PARAR
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MENU INFERIOR FIXO */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#111827', cursor: 'pointer' }}><LayoutGrid size={24} color="#111827" /><span style={{ fontSize: '10px', fontWeight: '700' }}>PAINEL</span></div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Monitor size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>DASHBOARD</span></div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Projetos;