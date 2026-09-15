import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Trash2, Edit2, X } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);

  // Estados do Formulário
  const [idEdicao, setIdEdicao] = useState(null);
  const [novoProjeto, setNovoProjeto] = useState('');
  const [tipoEstampo, setTipoEstampo] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');

  const carregarProjetos = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(resposta => setProjetos(resposta.data))
      .catch(erro => console.error("Erro ao carregar projetos:", erro));
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  // --- FUNÇÃO CENTRAL DE SALVAR (CADASTRO E EDIÇÃO) ---
  const handleCadastrar = async () => {
    if (!novoProjeto) return alert("Por favor, digite o nome do projeto.");

    try {
      if (idEdicao) {
        // MODO EDIÇÃO
        await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${idEdicao}/editar`, {
          nome: novoProjeto,
          tipo: tipoEstampo,
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
      
      cancelarEdicao();
      carregarProjetos();
      
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao salvar o projeto.");
    }
  };

  // --- PREPARAR MODO EDIÇÃO ---
  const prepararEdicao = (projeto) => {
    setIdEdicao(projeto.projeto_id);
    setNovoProjeto(projeto.projeto || '');
    setTipoEstampo(projeto.tipo || '');
    setDataInicio(projeto.data_inicio || '');
    setDataFim(projeto.data_fim || '');
    setDataConclusao(projeto.data_conclusao || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sobe a tela suavemente
  };

  const cancelarEdicao = () => {
    setIdEdicao(null);
    setNovoProjeto('');
    setTipoEstampo('');
    setDataInicio('');
    setDataFim('');
    setDataConclusao('');
  };

  // --- ALTERAR STATUS ---
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
      carregarProjetos(); 
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao atualizar o status.');
    }
  };

  // --- DELETAR ---
  const handleDeletar = async (id) => {
    if (!window.confirm("Tem certeza que deseja APAGAR este projeto?")) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}`);
      carregarProjetos();
    } catch (error) {
      alert("Erro ao deletar projeto.");
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* BARRA SUPERIOR */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
          <ChevronLeft size={24} color="#111827" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0, marginLeft: '8px' }}>Projetos e Estampos</h1>
      </div>

      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: idEdicao ? '2px solid #0284C7' : '1px solid #E5E7EB', marginBottom: '32px' }}>
          
          {idEdicao && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#0284C7' }}>✏️ Editando Projeto (ID: {idEdicao})</h2>
              <button onClick={cancelarEdicao} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                <X size={16} /> Cancelar
              </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Nome do Projeto</label>
              <input type="text" value={novoProjeto} onChange={(e) => setNovoProjeto(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', outline: 'none' }} placeholder="Ex: Estampo Progressivo 05..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Tipo *</label>
              <select value={tipoEstampo} onChange={(e) => setTipoEstampo(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', backgroundColor: '#FFF', outline: 'none', cursor: 'pointer' }}>
                <option value="">Selecione...</option>
                <option value="Corte">Corte</option>
                <option value="Dobra">Dobra</option>
                <option value="Repuxo">Repuxo</option>
                <option value="Progressivo">Progressivo</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Data Início *</label>
              <input type="text" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', outline: 'none' }} placeholder="dd/mm/aaaa" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Previsão Fim</label>
              <input type="text" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', boxSizing: 'border-box', outline: 'none' }} placeholder="dd/mm/aaaa" />
            </div>
          </div>

          <button onClick={handleCadastrar} style={{ width: '100%', padding: '12px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {idEdicao ? 'Salvar Alterações' : '+ Cadastrar Projeto'}
          </button>
        </div>

        {/* LISTA DE PROJETOS ATIVOS */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '16px', color: '#111827', marginTop: '0', marginBottom: '16px', fontWeight: '700' }}>Projetos Ativos</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projetos.map((proj) => (
              <div key={proj.projeto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111827', fontWeight: '700' }}>{proj.projeto}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Início: {proj.data_inicio || 'Não definido'} | Status:</span>
                    
                    <select 
                      value={proj.status || 'Em Planejamento'} 
                      onChange={(e) => alterarStatusProjeto(proj.projeto_id, e.target.value)}
                      style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', outline: 'none', cursor: 'pointer', fontWeight: '600', color: proj.status === 'Concluído' ? '#16A34A' : proj.status === 'Em Execução' ? '#0284C7' : '#CA8A04' }}
                    >
                      <option value="Em Planejamento">Em Planejamento</option>
                      <option value="Em Execução">Em Execução</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>
                </div>

                {/* BOTÕES DE EDITAR E DELETAR (LADO A LADO) */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => prepararEdicao(proj)} style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Editar">
                    <Edit2 size={20} />
                  </button>
                  <button onClick={() => handleDeletar(proj.projeto_id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} title="Apagar">
                    <Trash2 size={20} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Ajustes;