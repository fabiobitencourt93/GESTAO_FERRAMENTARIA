import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, LayoutGrid, BarChart2, Settings, Monitor, Edit2, Trash2, X } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);

  // Estados para o Formulário de Projetos
  const [idEdicao, setIdEdicao] = useState(null); 
  const [novoProjeto, setNovoProjeto] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [tipoEstampo, setTipoEstampo] = useState('');

  // Carrega os projetos ao abrir a tela
  const carregarProjetosDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(resposta => setProjetos(resposta.data))
      .catch(erro => console.error("Erro ao carregar projetos:", erro));
  };

  useEffect(() => {
    carregarProjetosDoBanco();
  }, []);

  // --- MOTOR DE PROJETOS (CADASTRAR E EDITAR) ---
  const salvarProjeto = async () => {
    if (!novoProjeto) return alert("Por favor, digite o nome do projeto.");

    try {
      if (idEdicao) {
        // MODO EDIÇÃO
        await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${idEdicao}/editar`, {
          nome: novoProjeto,
          data_inicio: dataInicio,
          data_fim: dataFim,
          data_conclusao: dataConclusao
        });
        alert("Projeto atualizado com sucesso!");
      } else {
        // MODO CADASTRO
        if (!dataInicio) return alert("A data de início é obrigatória.");
        await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
          nome: novoProjeto,
          data_inicio: dataInicio,
          data_fim: dataFim,
          tipo: tipoEstampo
        });
        alert("Projeto cadastrado com sucesso!");
      }
      
      // Limpa formulário após salvar
      setIdEdicao(null);
      setNovoProjeto('');
      setDataInicio('');
      setDataFim('');
      setDataConclusao('');
      setTipoEstampo('');
      carregarProjetosDoBanco();
      
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao salvar o projeto.");
    }
  };

  // Puxa os dados do card para o formulário no topo
  const prepararEdicao = (projeto) => {
    setIdEdicao(projeto.projeto_id);
    setNovoProjeto(projeto.projeto || '');
    setDataInicio(projeto.data_inicio || '');
    setDataFim(projeto.data_fim || '');
    setDataConclusao(projeto.data_conclusao || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola suavemente para o topo
  };

  const cancelarEdicao = () => {
    setIdEdicao(null);
    setNovoProjeto('');
    setDataInicio('');
    setDataFim('');
    setDataConclusao('');
    setTipoEstampo('');
  };

  // --- ATUALIZAR STATUS COM A CAIXA DE SELEÇÃO ---
  const alterarStatusProjeto = async (id, novoStatus) => {
    let dataHoje = null;
    if (novoStatus === 'Concluído') {
      dataHoje = new Date().toLocaleDateString('pt-BR');
    }

    try {
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}/status`, { 
        status: novoStatus,
        data_conclusao: dataHoje 
      });
      carregarProjetosDoBanco(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar o status do projeto.');
    }
  };

  // --- APAGAR PROJETO ---
  const deletarProjeto = async (id) => {
    if (!window.confirm("Tem certeza que deseja APAGAR este projeto definitivamente?")) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}`);
      carregarProjetosDoBanco();
    } catch (error) {
      alert("Erro ao deletar projeto.");
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* Barra Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft size={28} color="#111827" /></button>
          <img src="/logo-cecdr.png" alt="CECDR" style={{ height: '32px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, marginLeft: '8px' }}>Ajustes e Administração</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Home size={24} color="#111827" /></button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Bell size={24} color="#111827" /></button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>

        {/* PAINÉIS DE ADMINISTRAÇÃO (Navegação Rápida) */}
        <h2 style={{ fontSize: '16px', color: '#6B7280', marginTop: '0', marginBottom: '16px' }}>Atalhos de Sistema</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <button onClick={() => navigate('/alunos')} style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontWeight: '600', color: '#111827', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>👥 Gerenciar Alunos</button>
          <button onClick={() => navigate('/engenharia')} style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontWeight: '600', color: '#111827', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>⚙️ Gerenciar Engenharia</button>
          <button onClick={() => navigate('/correcoes')} style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontWeight: '600', color: '#111827', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>✅ Correção de Apontamentos</button>
          <button onClick={() => navigate('/retroativo')} style={{ padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', fontWeight: '600', color: '#111827', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>🕒 Apontamento Retroativo</button>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', marginBottom: '32px' }} />

        {/* GESTÃO DE PROJETOS - FORMULÁRIO */}
        <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px', fontWeight: '700' }}>Gestão de Projetos</h2>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: idEdicao ? '2px solid #0284C7' : '1px solid #E5E7EB', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0, color: idEdicao ? '#0284C7' : '#111827' }}>
              {idEdicao ? '✏️ Editando Projeto' : '➕ Novo Projeto'}
            </h3>
            {idEdicao && (
              <button onClick={cancelarEdicao} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                <X size={16} /> Cancelar Edição
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Nome do Projeto</label>
              <input type="text" value={novoProjeto} onChange={(e) => setNovoProjeto(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} placeholder="Ex: Estampo Progressivo" />
            </div>
            {!idEdicao && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Tipo de Estampo</label>
                <input type="text" value={tipoEstampo} onChange={(e) => setTipoEstampo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} placeholder="Corte, Dobra, etc." />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Data de Início (Planejada)</label>
              <input type="text" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} placeholder="DD/MM/AAAA" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6B7280', marginBottom: '4px' }}>Previsão de Fim</label>
              <input type="text" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} placeholder="DD/MM/AAAA" />
            </div>
            {idEdicao && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#16A34A', marginBottom: '4px' }}>Data de Conclusão Real</label>
                <input type="text" value={dataConclusao} onChange={(e) => setDataConclusao(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', backgroundColor: '#F0FDF4' }} placeholder="DD/MM/AAAA" />
              </div>
            )}
          </div>
          
          <button onClick={salvarProjeto} style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: idEdicao ? '#0284C7' : '#111827', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}>
            {idEdicao ? 'Salvar Alterações' : 'Cadastrar Projeto'}
          </button>
        </div>

        {/* GESTÃO DE PROJETOS - LISTA ATIVA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {projetos.map(proj => (
            <div key={proj.projeto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827' }}>{proj.projeto}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Início: {proj.data_inicio || '-'} | Status:</span>
                  
                  {/* CAIXA DE SELEÇÃO DE STATUS */}
                  <select 
                    value={proj.status || 'Em Planejamento'} 
                    onChange={(e) => alterarStatusProjeto(proj.projeto_id, e.target.value)}
                    style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', cursor: 'pointer', fontWeight: '600', color: proj.status === 'Concluído' ? '#16A34A' : proj.status === 'Em Execução' ? '#0284C7' : '#CA8A04' }}
                  >
                    <option value="Em Planejamento">Em Planejamento</option>
                    <option value="Em Execução">Em Execução</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              {/* BOTÕES EDITAR / APAGAR */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => prepararEdicao(proj)} style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', color: '#0284C7', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Edit2 size={16} /> <span style={{ fontSize: '12px', fontWeight: '600' }}>Editar</span>
                </button>
                <button onClick={() => deletarProjeto(proj.projeto_id)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
          <span style={{ fontSize: '10px', fontWeight: '600' }}>DASHBOARD</span>
        </div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#111827', cursor: 'pointer' }}>
          <Settings size={24} color="#111827" />
          <span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span>
        </div>
      </div>
    </div>
  );
}

export default Ajustes;