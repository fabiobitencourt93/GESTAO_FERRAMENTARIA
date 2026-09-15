import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, LayoutGrid, BarChart2, Settings, AlertTriangle, CheckCircle2, Trash2, Undo2, Monitor } from 'lucide-react';

function Projetos() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  
  const [novoProjeto, setNovoProjeto] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoEstampo, setTipoEstampo] = useState('');
  
  const [mensagemErro, setMensagemErro] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

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
        nome: novoProjeto,
        data_inicio: dataInicio,
        data_fim: dataFim,
        tipo: tipoEstampo
      });
      
      setNovoProjeto(''); 
      setDataInicio('');
      setDataFim('');
      setTipoEstampo('');
      
      setMensagemSucesso("Projeto cadastrado com sucesso!");
      carregarProjetos(); 
      
    } catch (error) {
      const erroReal = error.response?.data || error.message;
      setMensagemErro(JSON.stringify(erroReal));
    }
  };

  // --- NOVA FUNÇÃO UNIFICADA DE STATUS ---
  // Ela faz exatamente o que a tela de Ajustes faz, mas através dos botões!
const handleAlterarStatus = async (id, novoStatus, e) => {
    e.stopPropagation(); 
    const acao = novoStatus === 'Concluído' ? 'marcar este projeto como Concluído' : 'reabrir este projeto (mudando para Em Execução)';
    
    if (!window.confirm(`Deseja ${acao}?`)) return;

    // Lógica inteligente de data
    let dataHoje = null;
    if (novoStatus === 'Concluído') {
      // Pega o dia exato do clique no formato brasileiro (DD/MM/AAAA)
      dataHoje = new Date().toLocaleDateString('pt-BR'); 
    }

    try {
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}/status`, { 
        status: novoStatus,
        data_conclusao: dataHoje // <-- Envia a data para o Render!
      });
      carregarProjetos(); 
    } catch (error) {
      alert(`Erro ao ${novoStatus === 'Concluído' ? 'concluir' : 'reabrir'} projeto.`);
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

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* Barra Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <ChevronLeft size={28} color="#111827" />
          </button>
          {/* Logo CECDR */}
          <img src="/logo-cecdr.png" alt="CECDR" style={{ height: '32px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, marginLeft: '8px' }}>Projetos - Construtor de Estampos de Corte, Dobra e Repuxo</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Home size={24} color="#111827" />
          </button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Bell size={24} color="#111827" />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {mensagemErro && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #EF4444', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#991B1B', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>Atenção:</strong>
              <span style={{ fontSize: '13px' }}>{mensagemErro}</span>
            </div>
          </div>
        )}

        {mensagemSucesso && (
          <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #22C55E', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontWeight: '600' }}>
            {mensagemSucesso}
          </div>
        )}
        
        {/* Lista de Projetos */}
        {projetos.map((proj) => (
  <div key={proj.projeto_id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
    
    {/* CABEÇALHO DO CARD */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
           <h3 style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '700' }}>{proj.projeto}</h3>
           
           {/* TAG DE STATUS */}
           <span style={{ 
             backgroundColor: proj.status === 'Concluído' ? '#DCFCE7' : proj.status === 'Em Execução' ? '#DBEAFE' : '#FEF9C3', 
             color: proj.status === 'Concluído' ? '#166534' : proj.status === 'Em Execução' ? '#1D4ED8' : '#A16207', 
             padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' 
           }}>
             {proj.status}
           </span>

           {/* NOVA TAG DE TIPO DO PROJETO */}
           <span style={{ 
             backgroundColor: '#F3F4F6', color: '#4B5563', 
             padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' 
           }}>
             {proj.tipo || 'TIPO NÃO DEFINIDO'}
           </span>
         </div>

         <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
           ID do Projeto: {proj.projeto_id} | Estampo: {proj.estampo} (ID: {proj.estampo_id})
         </p>
      </div>

      {/* AQUI FICAM SEUS BOTÕES DE CHECK E LIXEIRA */}
      <div style={{ display: 'flex', gap: '12px' }}>
         {/* (Mantenha os botões que você já tem codificados aqui) */}
      </div>
    </div>

    {/* CAIXA CINZA DE DATAS */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
      <div>
        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Início Planejado</span>
        <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_inicio || 'Não informado'}</span>
      </div>
      <div>
        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Previsão de Fim</span>
        <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_fim || 'Não informado'}</span>
      </div>
      <div>
        <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>Conclusão Real</span>
        <span style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{proj.data_conclusao || 'Aguardando conclusão'}</span>
      </div>
    </div>

  </div>
))}
      </div>

      {/* MENU INFERIOR PADRONIZADO COM 4 BOTÕES */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#111827', cursor: 'pointer' }}>
          <LayoutGrid size={24} color="#111827" />
          <span style={{ fontSize: '10px', fontWeight: '700' }}>PAINEL</span>
        </div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span>
        </div>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Monitor size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>DASHBOARD</span>
        </div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span>
        </div>
      </div>
    </div>
  );
}

export default Projetos;