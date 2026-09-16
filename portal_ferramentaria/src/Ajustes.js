import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Lock, Users, Clock, Settings, AlertOctagon, 
  LayoutGrid, BarChart2, User, Wrench, Calendar,   ClipboardList, Key, 
  TrendingUp, Filter, AlertTriangle, Plus, Trash2, FolderPlus, Download, 
  Edit2, X, BookOpen, Package, PlusCircle, MinusCircle, Archive } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  
  // ==========================================
  // 1. ESTADOS DE AUTENTICAÇÃO E NAVEGAÇÃO
  // ==========================================
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [carregandoLogin, setCarregandoLogin] = useState(false);
  const [telaAtual, setTelaAtual] = useState('menu'); 
  
  // ==========================================
  // 2. ESTADOS: TURMAS / SEMESTRES (NOVO)
  // ==========================================
  const [turmas, setTurmas] = useState([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(false);
  const [nomeNovaTurma, setNomeNovaTurma] = useState('');

  // ==========================================
  // 3. ESTADOS: OCORRÊNCIAS & RELATÓRIOS
  // ==========================================
  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(false);

  const [dadosPecas, setDadosPecas] = useState([]);
  const [dadosProcessos, setDadosProcessos] = useState([]);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [filtroUsinagem, setFiltroUsinagem] = useState('pecas'); 
  const [agrupamento, setAgrupamento] = useState('maquina'); 

  // ==========================================
  // 4. ESTADOS: ALUNOS E PROJETOS
  // ==========================================
  const [alunos, setAlunos] = useState([]);
  const [novoAlunoId, setNovoAlunoId] = useState('');
  const [novoAlunoNome, setNovoAlunoNome] = useState('');
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  const [projetos, setProjetos] = useState([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);
  const [novoProjNome, setNovoProjNome] = useState('');
  const [novoProjTipo, setNovoProjTipo] = useState('');
  const [novoProjInicio, setNovoProjInicio] = useState('');
  const [novoProjFim, setNovoProjFim] = useState('');

  // ==========================================
  // FUNÇÕES GERAIS E AUTENTICAÇÃO
  // ==========================================
  const verificarSenha = async (e) => {
    e.preventDefault();
    setCarregandoLogin(true);
    setErroSenha(false);
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/auth/login', { senha });
      setAutenticado(true);
      setSenha('');
    } catch (error) {
      setErroSenha(true);
      setSenha('');
    } finally {
      setCarregandoLogin(false);
    }
  };

  const handleBloquear = () => setAutenticado(false);

  const exportarParaExcel = (dados, nomeArquivo) => {
    if (!dados || dados.length === 0) return alert("Não há dados para exportar.");
    const chaves = Object.keys(dados[0]);
    const cabecalho = chaves.join(';');
    const linhas = dados.map(item => chaves.map(chave => `"${item[chave] || ''}"`).join(';')).join('\n');
    const csvCompleto = `${cabecalho}\n${linhas}`;
    const blob = new Blob(["\uFEFF" + csvCompleto], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${nomeArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // NAVEGAÇÃO ENTRE ABAS
  // ==========================================
  const abrirTurmas = () => {
    setCarregandoTurmas(true);
    setTelaAtual('turmas');
    carregarTurmasDoBanco();
  };

  const abrirHistorico = () => {
    setCarregandoOcorrencias(true);
    setTelaAtual('historico');
    axios.get('https://gestao-ferramentaria.onrender.com/api/ocorrencias')
      .then(res => { setOcorrencias(res.data); setCarregandoOcorrencias(false); })
      .catch(err => { console.error(err); setCarregandoOcorrencias(false); });
  };

  const abrirRelatorios = () => {
    setCarregandoRelatorio(true);
    setTelaAtual('relatorios');
    setFiltroUsinagem('pecas');
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/desempenho').then(res => setDadosPecas(res.data)).catch(console.error);
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/processos').then(res => { setDadosProcessos(res.data); setCarregandoRelatorio(false); }).catch(console.error);
  };

  const abrirAlunos = () => {
    setCarregandoAlunos(true);
    setTelaAtual('alunos');
    carregarAlunosDoBanco();
  };

  const abrirProjetos = () => {
    setCarregandoProjetos(true);
    setTelaAtual('projetos');
    carregarProjetosDoBanco();
  };

  // ==========================================
  // LÓGICA DE TURMAS (SEMESTRES)
  // ==========================================
  const carregarTurmasDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/turmas')
      .then(res => { setTurmas(res.data); setCarregandoTurmas(false); })
      .catch(console.error);
  };

  const criarNovaTurma = async (e) => {
    e.preventDefault();
    if (!nomeNovaTurma) return;
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/turmas', { nome: nomeNovaTurma });
      setNomeNovaTurma('');
      carregarTurmasDoBanco();
      alert("Nova turma criada e ativada! O sistema agora está limpo para este semestre.");
    } catch (error) {
      alert("Erro ao criar turma.");
    }
  };

  const ativarTurma = async (id) => {
    try {
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/turmas/${id}/ativar`);
      carregarTurmasDoBanco();
      alert("Turma ativada com sucesso! O sistema (Alunos, Projetos e Relatórios) foi atualizado para focar nesta turma.");
    } catch (error) {
      alert("Erro ao ativar turma.");
    }
  };

  const carregarAlunosDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/operadores').then(res => { setAlunos(res.data); setCarregandoAlunos(false); }).catch(console.error);
  };

  const carregarProjetosDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos').then(res => { setProjetos(res.data); setCarregandoProjetos(false); }).catch(console.error);
  };

  const cadastrarAluno = async (e) => {
    e.preventDefault();
    if (!novoAlunoId || !novoAlunoNome) return;
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/operadores', { id: novoAlunoId, nome: novoAlunoNome });
      setNovoAlunoId(''); setNovoAlunoNome(''); carregarAlunosDoBanco(); 
    } catch (error) { alert(error.response?.data?.error || 'Erro ao cadastrar aluno.'); }
  };

  const deletarAluno = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este crachá?')) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/operadores/${id}`);
      carregarAlunosDoBanco();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao excluir aluno.'); }
  };

  const formatarDataParaInput = (dataBR) => {
    if (!dataBR || dataBR === 'Não definido') return '';
    const partes = dataBR.split('/');
    if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return dataBR;
  };

  const prepararEdicao = (projeto) => {
    setIdEdicao(projeto.projeto_id);
    setNovoProjNome(projeto.projeto || '');
    setNovoProjTipo(projeto.estampo || 'Progressivo'); 
    setNovoProjInicio(formatarDataParaInput(projeto.data_inicio));
    setNovoProjFim(formatarDataParaInput(projeto.data_fim));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicao = () => {
    setIdEdicao(null);
    setNovoProjNome('');
    setNovoProjTipo('');
    setNovoProjInicio('');
    setNovoProjFim('');
  };

  const cadastrarOuEditarProjeto = async (e) => {
    e.preventDefault();
    if (!novoProjNome) return alert("Por favor, digite o nome do projeto.");

    try {
      if (idEdicao) {
        await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${idEdicao}`, {
          nome: novoProjNome,
          tipo: novoProjTipo,
          data_inicio: novoProjInicio,
          data_fim: novoProjFim
        });
        alert("Projeto atualizado com sucesso!");
      } else {
        if (!novoProjInicio) return alert("A data de início é obrigatória.");
        await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
          nome: novoProjNome,
          tipo: novoProjTipo,
          data_inicio: novoProjInicio,
          data_fim: novoProjFim
        });
        alert("Projeto cadastrado com sucesso!");
      }
      cancelarEdicao();
      carregarProjetosDoBanco();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao salvar o projeto.");
    }
  };

  const alterarStatusProjeto = async (id, novoStatus) => {
    try {
      const dataConclusao = novoStatus === 'Concluído' ? new Date().toISOString().split('T')[0] : null;
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}/status`, {
          status: novoStatus,
          data_conclusao: dataConclusao
      });
      carregarProjetosDoBanco();
    } catch (error) {
      console.error("Erro detalhado ao atualizar status:", error);
      alert(error.response?.data?.error || 'Erro ao atualizar o status.');
    }
  };

  const handleDeletarProjeto = async (id) => {
    if (!window.confirm("Tem certeza que deseja APAGAR este projeto?")) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}`);
      carregarProjetosDoBanco();
    } catch (error) {
      alert("Erro ao deletar projeto.");
    }
  };
  

  // Processamentos para Relatórios
  const processosComAtraso = [...dadosProcessos].filter(p => Number(p.realizado) > Number(p.planejado)).sort((a, b) => (Number(b.realizado) - Number(b.planejado)) - (Number(a.realizado) - Number(a.planejado)));
  const dadosAgrupados = dadosProcessos.reduce((acc, item) => {
    const chave = item[agrupamento] || 'Não definido';
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(item);
    return acc;
  }, {});

  const estiloInput = { width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF' };
  const estiloLabel = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' };



  // ==========================================
  // ESTADOS: ESTOQUE E MATERIAIS (NOVO)
  // ==========================================
  const [estoque, setEstoque] = useState([]);
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);
  
  const [novoEstoqueCodigo, setNovoEstoqueCodigo] = useState('');
  const [novoEstoqueDesc, setNovoEstoqueDesc] = useState('');
  const [novoEstoqueCat, setNovoEstoqueCat] = useState('Matéria-Prima');
  const [novoEstoqueEsp, setNovoEstoqueEsp] = useState('');
  const [novoEstoqueMin, setNovoEstoqueMin] = useState('');
  const [idEdicaoEstoque, setIdEdicaoEstoque] = useState(null); // <-- NOVO ESTADO AQUI
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [itemMovimentacao, setItemMovimentacao] = useState(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('Entrada');
  const [movQuantidade, setMovQuantidade] = useState('');
  const [movOperadorId, setMovOperadorId] = useState('');
  const [movProjetoId, setMovProjetoId] = useState('');
  const [movObservacao, setMovObservacao] = useState('');

  // ==========================================
  // FUNÇÕES DE ESTOQUE E MATERIAIS
  // ==========================================
  const abrirEstoque = () => {
    setCarregandoEstoque(true); setTelaAtual('estoque'); 
    carregarEstoqueDoBanco();
    carregarProjetosDoBanco(); // Necessário para a tela de Saída
    carregarAlunosDoBanco();   // Necessário para a tela de Saída
  };

  const carregarEstoqueDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/estoque')
      .then(res => { setEstoque(res.data); setCarregandoEstoque(false); })
      .catch(console.error);
  };

  const prepararEdicaoEstoque = (item) => {
    setIdEdicaoEstoque(item.id);
    setNovoEstoqueCodigo(item.codigo_interno || '');
    setNovoEstoqueDesc(item.descricao || '');
    setNovoEstoqueCat(item.categoria || 'Matéria-Prima');
    setNovoEstoqueEsp(item.especificacao || '');
    setNovoEstoqueMin(item.estoque_minimo || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicaoEstoque = () => {
    setIdEdicaoEstoque(null);
    setNovoEstoqueCodigo(''); setNovoEstoqueDesc(''); setNovoEstoqueCat('Matéria-Prima');
    setNovoEstoqueEsp(''); setNovoEstoqueMin('');
  };

  const cadastrarOuEditarItemEstoque = async (e) => {
    e.preventDefault();
    try {
      if (idEdicaoEstoque) {
        await axios.put(`https://gestao-ferramentaria.onrender.com/api/estoque/${idEdicaoEstoque}`, {
          codigo_interno: novoEstoqueCodigo, descricao: novoEstoqueDesc, categoria: novoEstoqueCat,
          especificacao: novoEstoqueEsp, estoque_minimo: novoEstoqueMin
        });
        alert("Material atualizado com sucesso!");
      } else {
        await axios.post('https://gestao-ferramentaria.onrender.com/api/estoque', {
          codigo_interno: novoEstoqueCodigo, descricao: novoEstoqueDesc, categoria: novoEstoqueCat,
          especificacao: novoEstoqueEsp, estoque_minimo: novoEstoqueMin
        });
        alert("Material cadastrado no estoque!");
      }
      cancelarEdicaoEstoque();
      carregarEstoqueDoBanco();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao salvar material.");
    }
  };

  const deletarItemEstoque = async (id) => {
    if (!window.confirm("Tem certeza que deseja APAGAR este material? Todo o histórico de entradas e saídas dele também será perdido!")) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/estoque/${id}`);
      carregarEstoqueDoBanco();
    } catch (error) { alert("Erro ao deletar material."); }
  };

  const abrirPainelMovimentacao = (item, tipo) => {
    setItemMovimentacao(item);
    setTipoMovimentacao(tipo);
    setMovQuantidade('');
    setMovOperadorId('');
    setMovProjetoId('');
    setMovObservacao('');
    setModalMovimentacao(true);
  };

  const confirmarMovimentacaoEstoque = async (e) => {
    e.preventDefault();
    if (tipoMovimentacao === 'Saída' && Number(movQuantidade) > Number(itemMovimentacao.quantidade_atual)) {
      if(!window.confirm("Atenção: A quantidade de saída é maior que o estoque atual. O estoque ficará negativo. Deseja continuar?")) return;
    }

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/estoque/movimentar', {
        item_id: itemMovimentacao.id,
        tipo_movimento: tipoMovimentacao,
        quantidade: movQuantidade,
        operador_id: movOperadorId || null,
        projeto_id: movProjetoId || null,
        observacao: movObservacao
      });
      alert(`Movimentação de ${tipoMovimentacao} registrada com sucesso!`);
      setModalMovimentacao(false);
      carregarEstoqueDoBanco();
    } catch (error) {
      alert("Erro ao movimentar o estoque.");
    }
  };








  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '120px' }}>
      
      {/* BARRA SUPERIOR GLOBAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {telaAtual !== 'menu' && autenticado ? (
            <button onClick={() => setTelaAtual('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} color="#111827" strokeWidth={2.5} /></button>
          ) : (
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft size={24} color="#111827" strokeWidth={2.5} /></button>
          )}
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {!autenticado ? 'Acesso Restrito' : 
              telaAtual === 'historico' ? 'Histórico de Ocorrências' : 
              telaAtual === 'relatorios' ? 'Relatórios de Usinagem' : 
              telaAtual === 'alunos' ? 'Gerenciar Alunos' : 
              telaAtual === 'projetos' ? 'Projetos e Estampos' : 
              telaAtual === 'turmas' ? 'Gerenciar Semestres' : 'Ajustes do Sistema'}
          </h1>
        </div>
        {autenticado && telaAtual === 'menu' && (
          <button onClick={handleBloquear} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}><Lock size={16} /> Bloquear</button>
        )}
      </div>

      {/* TELA DE LOGIN */}
      {!autenticado ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 24px' }}>
          <form onSubmit={verificarSenha} style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto' }}><Key size={32} color="#4B5563" /></div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#111827' }}>Área da Administração</h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#6B7280' }}>Insira a senha para acessar os ajustes.</p>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite a senha..." disabled={carregandoLogin} style={{ width: '100%', boxSizing: 'border-box', padding: '14px', border: erroSenha ? '1px solid #EF4444' : '1px solid #D1D5DB', borderRadius: '12px', fontSize: '16px', outline: 'none', marginBottom: '16px', textAlign: 'center', backgroundColor: '#FAFBFC', opacity: carregandoLogin ? 0.6 : 1 }} />
            {erroSenha && <p style={{ color: '#DC2626', fontSize: '13px', margin: '0 0 16px 0', fontWeight: '500' }}>Senha incorreta. Tente novamente.</p>}
            <button type="submit" disabled={carregandoLogin} style={{ width: '100%', padding: '14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: carregandoLogin ? 'wait' : 'pointer', opacity: carregandoLogin ? 0.8 : 1 }}>
              {carregandoLogin ? 'Verificando...' : 'Acessar'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ padding: '0 24px' }}>
          
          {/* MENU PRINCIPAL DE AJUSTES */}
          {telaAtual === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              
              {/* NOVO MENU: TURMAS */}
              <div onClick={abrirTurmas} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '2px solid #8B5CF6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F5F3FF', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><BookOpen size={24} color="#8B5CF6" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#111827' }}>Gerenciar Semestres (Turmas)</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Crie novos anos letivos e alterne entre as turmas do sistema.</p></div>
              </div>

              <div onClick={abrirRelatorios} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F0F9FF', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><TrendingUp size={24} color="#0284C7" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Relatórios de Usinagem</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Analise atrasos, exporte dados e veja processos.</p></div>
              </div>
              <div onClick={abrirProjetos} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F0FDF4', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FolderPlus size={24} color="#16A34A" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Gerenciar Projetos</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Edite estampos, defina prazos e mude o status.</p></div>
              </div>
              <div onClick={abrirAlunos} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#FFF7ED', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Users size={24} color="#EA580C" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Gerenciar Alunos (Crachás)</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar, editar ou remover IDs de operadores.</p></div>
              </div>
              <div onClick={abrirHistorico} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#FEF2F2', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><AlertOctagon size={24} color="#DC2626" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Relatório de Ocorrências</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Visualize quebras, paradas e relatos dos alunos.</p></div>
              </div>
              <div onClick={() => navigate('/correcoes')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#FEF9C3', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Clock size={24} color="#CA8A04" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Correção de Apontamentos</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Ajustar manualmente horários que ficaram em aberto.</p></div>
              </div>
              <div onClick={() => navigate('/engenharia')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F3F4F6', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Settings size={24} color="#4B5563" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Engenharia e Roteiros</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar peças, editar processos, sequência e tempos alvo.</p></div>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* TELA DE TURMAS E SEMESTRES (NOVA)              */}
          {/* ============================================== */}
          {telaAtual === 'turmas' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Abrir Novo Semestre Letivo</h3>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Ao criar uma nova turma, ela se tornará a turma ativa e o painel ficará em branco pronto para novos projetos e alunos.</p>
                <form onSubmit={criarNovaTurma} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Ex: Turma 2027 - 1º Semestre" value={nomeNovaTurma} onChange={e => setNomeNovaTurma(e.target.value)} required style={{ flex: 1, minWidth: '200px', ...estiloInput }} />
                  <button type="submit" style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '0 24px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Criar Turma</button>
                </form>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Histórico de Turmas (Alternar Visão)</h3>
                {carregandoTurmas ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando turmas...</p>
                ) : turmas.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhuma turma cadastrada.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {turmas.map(turma => (
                      <div key={turma.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: turma.ativa ? '#F5F3FF' : '#F9FAFB', borderRadius: '8px', border: turma.ativa ? '2px solid #8B5CF6' : '1px solid #E5E7EB' }}>
                        <div>
                          <span style={{ fontWeight: '800', color: turma.ativa ? '#5B21B6' : '#374151', fontSize: '15px', display: 'block', marginBottom: '4px' }}>{turma.nome}</span>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>ID: {turma.id} | Criado em: {new Date(turma.criado_em).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {turma.ativa ? (
                          <span style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>⭐ Turma Ativa</span>
                        ) : (
                          <button onClick={() => ativarTurma(turma.id)} style={{ backgroundColor: '#111827', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Carregar Dados</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* TELA DE PROJETOS E ESTAMPOS                  */}
          {/* ============================================== */}
          {telaAtual === 'projetos' && (
            <div style={{ maxWidth: '900px', margin: '0 auto', marginTop: '10px' }}>
              
              {/* Formulário Centralizado de Cadastro/Edição */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: idEdicao ? '2px solid #0284C7' : '1px solid #E5E7EB', marginBottom: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {idEdicao && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', color: '#0284C7', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit2 size={18}/> Editando Projeto (ID: {idEdicao})</h2>
                    <button onClick={cancelarEdicao} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}><X size={16} /> Cancelar</button>
                  </div>
                )}

                <form onSubmit={cadastrarOuEditarProjeto}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={estiloLabel}>Nome do Projeto</label>
                      <input type="text" placeholder="Ex: Estampo Progressivo 05..." value={novoProjNome} onChange={e => setNovoProjNome(e.target.value)} required style={estiloInput} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={estiloLabel}>Tipo *</label>
                      <select value={novoProjTipo} onChange={e => setNovoProjTipo(e.target.value)} required style={estiloInput}>
                        <option value="">Selecione...</option>
                        <option value="Corte">Estampo de Corte</option>
                        <option value="Dobra">Estampo de Dobra</option>
                        <option value="Repuxo">Estampo de Repuxo</option>
                        <option value="Progressivo">Estampo Progressivo</option>
                        <option value="Transfer">Estampo Transfer</option>
                        <option value="Molde">Molde de Injeção</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label style={estiloLabel}>Data Início *</label>
                      <input type="date" value={novoProjInicio} onChange={e => setNovoProjInicio(e.target.value)} required style={estiloInput} />
                    </div>
                    <div>
                      <label style={estiloLabel}>Previsão Fim</label>
                      <input type="date" value={novoProjFim} onChange={e => setNovoProjFim(e.target.value)} style={estiloInput} />
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0284C7', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {idEdicao ? 'Salvar Alterações' : <><Plus size={18} /> Cadastrar Projeto</>}
                  </button>
                </form>
              </div>

              {/* Lista Dinâmica de Projetos */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Projetos Ativos (Turma Atual)</h3>
                {carregandoProjetos ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando projetos...</p>
                ) : projetos.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhum projeto cadastrado nesta turma.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {projetos.map(proj => (
                      <div key={proj.projeto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', flexWrap: 'wrap', gap: '12px' }}>
                        
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#111827', fontWeight: '700' }}>{proj.projeto}</h4>
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
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button onClick={() => prepararEdicao(proj)} style={{ background: 'none', border: 'none', color: '#0284C7', cursor: 'pointer', padding: '4px' }} title="Editar"><Edit2 size={20} /></button>
                          <button onClick={() => handleDeletarProjeto(proj.projeto_id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }} title="Apagar"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* TELA DE ALUNOS                               */}
          {/* ============================================== */}
          {telaAtual === 'alunos' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Cadastrar Novo Aluno</h3>
                <form onSubmit={cadastrarAluno} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input type="number" placeholder="ID do Crachá" value={novoAlunoId} onChange={e => setNovoAlunoId(e.target.value)} required style={estiloInput} />
                  <input type="text" placeholder="Nome do Aluno" value={novoAlunoNome} onChange={e => setNovoAlunoNome(e.target.value)} required style={{ flex: 1, minWidth: '200px', ...estiloInput }} />
                  <button type="submit" style={{ backgroundColor: '#0284C7', color: 'white', padding: '0 24px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={18} /> Adicionar</button>
                </form>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Alunos da Turma Atual</h3>
                {carregandoAlunos ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando crachás...</p>
                ) : alunos.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhum aluno cadastrado nesta turma.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {alunos.map(aluno => (
                      <div key={aluno.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div>
                          <span style={{ fontWeight: '700', color: '#0284C7', marginRight: '16px' }}>#{aluno.id}</span>
                          <span style={{ fontWeight: '600', color: '#374151', fontSize: '15px' }}>{aluno.nome}</span>
                        </div>
                        <button onClick={() => deletarAluno(aluno.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* TELA DE OCORRÊNCIAS                          */}
          {/* ============================================== */}
          {telaAtual === 'historico' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                 <button onClick={() => exportarParaExcel(ocorrencias, 'Ocorrencias_Ferramentaria')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={16} /> Baixar Planilha</button>
              </div>
              {carregandoOcorrencias ? (
                <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Buscando registros no banco de dados...</p>
              ) : ocorrencias.length === 0 ? (
                <div style={{ backgroundColor: '#F0FDF4', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#166534', border: '1px solid #22C55E' }}>
                  <strong>Nenhuma ocorrência registrada nesta turma!</strong>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {ocorrencias.map((item) => (
                    <div key={item.id} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #FEE2E2' }}>
                      <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#991B1B' }}>
                        <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Relato do Operador:</strong>
                        <span style={{ fontSize: '15px', fontWeight: '500' }}>"{item.ocorrencia}"</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><ClipboardList size={16} color="#6B7280" style={{ marginTop: '2px' }} /><div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Projeto</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.projeto || 'N/A'}</span></div></div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><Wrench size={16} color="#6B7280" style={{ marginTop: '2px' }} /><div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Peça / Operação</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.peca || 'N/A'} - {item.operacao || 'N/A'}</span></div></div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><User size={16} color="#6B7280" style={{ marginTop: '2px' }} /><div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Operador (Aluno)</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.operador || 'Desconhecido'}</span></div></div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><Calendar size={16} color="#6B7280" style={{ marginTop: '2px' }} /><div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Data do Registro</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.data_registro}</span></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================== */}
          {/* TELA DE RELATÓRIOS                           */}
          {/* ============================================== */}
          {telaAtual === 'relatorios' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                 <button onClick={() => exportarParaExcel(dadosProcessos, 'Desempenho_Processos')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><Download size={16} /> Baixar Planilha</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#FFFFFF', padding: '8px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <button onClick={() => setFiltroUsinagem('pecas')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: filtroUsinagem === 'pecas' ? '#111827' : 'transparent', color: filtroUsinagem === 'pecas' ? '#FFFFFF' : '#6B7280' }}><LayoutGrid size={16} /> Por Peça</button>
                <button onClick={() => setFiltroUsinagem('processos')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: filtroUsinagem === 'processos' ? '#111827' : 'transparent', color: filtroUsinagem === 'processos' ? '#FFFFFF' : '#6B7280' }}><Filter size={16} /> Por Processo</button>
                <button onClick={() => setFiltroUsinagem('atrasos')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: filtroUsinagem === 'atrasos' ? '#DC2626' : 'transparent', color: filtroUsinagem === 'atrasos' ? '#FFFFFF' : '#6B7280' }}><AlertTriangle size={16} /> Atrasos</button>
              </div>
              {carregandoRelatorio ? (
                <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Processando relatórios de usinagem...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filtroUsinagem === 'pecas' && dadosPecas.map((item, index) => {
                    const planejadoMin = Number(item.total_planejado) || 0;
                    const realizadoMin = Number(item.total_realizado) || 0;
                    const progresso = planejadoMin > 0 ? Math.round((realizadoMin / planejadoMin) * 100) : 0;
                    return (
                      <div key={`peca-${index}`} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Projeto: {item.projeto || 'Geral'}</span><h4 style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#111827' }}>{item.peca || 'Resumo do Projeto'}</h4></div>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: progresso >= 100 ? '#16A34A' : '#0284C7' }}>{progresso}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}><div style={{ width: `${Math.min(progresso, 100)}%`, height: '100%', backgroundColor: progresso >= 100 ? '#16A34A' : '#0284C7' }}></div></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Planejado</span><span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>{(planejadoMin / 60).toFixed(1)} h</span></div>
                          <div style={{ textAlign: 'right' }}><span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Executado (Real)</span><span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>{(realizadoMin / 60).toFixed(1)} h</span></div>
                        </div>
                      </div>
                    );
                  })}
                  {filtroUsinagem === 'processos' && (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', paddingBottom: '8px', overflowX: 'auto' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', alignSelf: 'center', marginRight: '8px' }}>Agrupar por:</span>
                        {[ { id: 'maquina', label: 'Máquina' }, { id: 'projeto', label: 'Ferramenta' }, { id: 'peca', label: 'Peça' }, { id: 'processo', label: 'Processo' } ].map(tipo => (
                          <button key={tipo.id} onClick={() => setAgrupamento(tipo.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: agrupamento === tipo.id ? '#111827' : '#FFFFFF', color: agrupamento === tipo.id ? '#FFFFFF' : '#4B5563', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{tipo.label}</button>
                        ))}
                      </div>
                      {Object.entries(dadosAgrupados).map(([grupo, itens], idx) => (
                        <div key={idx} style={{ marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '14px', color: '#111827', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>{grupo} <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: 'normal', textTransform: 'none' }}>({itens.length} registros)</span></h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {itens.map((item, i) => {
                              const planejado = Number(item.planejado) || 0;
                              const realizado = Number(item.realizado) || 0;
                              const estourou = realizado > planejado && planejado > 0;
                              return (
                                <div key={i} style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: estourou ? '4px solid #DC2626' : '4px solid #22C55E' }}>
                                  <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>{item.projeto} / {item.peca}</span>
                                  <h4 style={{ margin: '4px 0 12px 0', fontSize: '15px', color: '#111827' }}>{item.processo} <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 'normal' }}>({item.maquina})</span></h4>
                                  <div style={{ display: 'flex', gap: '24px' }}>
                                    <div><span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Planejado</span><span style={{ fontSize: '14px', fontWeight: '600' }}>{planejado.toFixed(1)} min</span></div>
                                    <div><span style={{ fontSize: '11px', color: '#6B7280', display: 'block' }}>Realizado</span><span style={{ fontSize: '14px', fontWeight: '600', color: estourou ? '#DC2626' : '#16A34A' }}>{realizado.toFixed(1)} min</span></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {filtroUsinagem === 'atrasos' && (
                    processosComAtraso.length === 0 ? <div style={{ textAlign: 'center', padding: '40px', color: '#16A34A' }}><strong>Excelente!</strong> Nenhuma operação estourou o tempo planejado.</div> : processosComAtraso.map((item, index) => {
                        const planejado = Number(item.planejado) || 0;
                        const realizado = Number(item.realizado) || 0;
                        const atraso = realizado - planejado;
                        return (
                          <div key={`atraso-${index}`} style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div><span style={{ fontSize: '11px', color: '#991B1B', textTransform: 'uppercase' }}>{item.projeto} / {item.peca}</span><h4 style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#7F1D1D' }}>{item.processo} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>({item.maquina})</span></h4></div>
                              <div style={{ textAlign: 'right', backgroundColor: '#DC2626', color: '#FFF', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>+ {atraso.toFixed(1)} min</div>
                            </div>
                            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#991B1B' }}>Planejado: <strong>{planejado.toFixed(1)}m</strong> | Realizado: <strong>{realizado.toFixed(1)}m</strong></p>
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ============================================== */}
          {/* TELA DE ESTOQUE (NOVO)                         */}
          {/* ============================================== */}
          {telaAtual === 'estoque' && (
            <div style={{ maxWidth: '900px', margin: '0 auto', marginTop: '10px' }}>
              
             {/* CADASTRAR OU EDITAR MATERIAL */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: idEdicaoEstoque ? '2px solid #EA580C' : '1px solid #E5E7EB', marginBottom: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: idEdicaoEstoque ? '#EA580C' : '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {idEdicaoEstoque ? <Edit2 size={18} /> : <Archive size={18} color="#F97316"/>}
                    {idEdicaoEstoque ? `Editando Material (ID: ${idEdicaoEstoque})` : 'Cadastrar Novo Material'}
                  </h3>
                  {idEdicaoEstoque && (
                    <button onClick={cancelarEdicaoEstoque} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}><X size={16} /> Cancelar</button>
                  )}
                </div>
                <form onSubmit={cadastrarOuEditarItemEstoque}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={estiloLabel}>Categoria *</label>
                      <select value={novoEstoqueCat} onChange={e => setNovoEstoqueCat(e.target.value)} required style={estiloInput}>
                        <option value="Matéria-Prima">Matéria-Prima (Aço, Alumínio)</option>
                        <option value="Componente">Componente (Molas, Parafusos)</option>
                        <option value="Consumível">Consumível (Pastilhas, Óleo)</option>
                      </select>
                    </div>
                    <div>
                      <label style={estiloLabel}>Nome / Descrição *</label>
                      <input type="text" placeholder="Ex: Placa Base SAE 1020" value={novoEstoqueDesc} onChange={e => setNovoEstoqueDesc(e.target.value)} required style={estiloInput} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={estiloLabel}>Especificação (Dimensões)</label>
                      <input type="text" placeholder="Ex: 20 x 200 x 200 mm" value={novoEstoqueEsp} onChange={e => setNovoEstoqueEsp(e.target.value)} style={estiloInput} />
                    </div>
                    <div>
                      <label style={estiloLabel}>Código (Opcional)</label>
                      <input type="text" placeholder="Ex: MP-001" value={novoEstoqueCodigo} onChange={e => setNovoEstoqueCodigo(e.target.value)} style={estiloInput} />
                    </div>
                    <div>
                      <label style={estiloLabel}>Estoque Mínimo de Alerta</label>
                      <input type="number" placeholder="Ex: 5" value={novoEstoqueMin} onChange={e => setNovoEstoqueMin(e.target.value)} style={estiloInput} />
                    </div>
                  </div>
                  <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: idEdicaoEstoque ? '#EA580C' : '#111827', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    {idEdicaoEstoque ? 'Salvar Alterações' : <><Plus size={18} /> Salvar no Cadastro</>}
                  </button>
                </form>
              </div>

              {/* LISTAGEM DE ESTOQUE */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Materiais na Prateleira</h3>
                {carregandoEstoque ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando gavetas...</p>
                ) : estoque.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>O estoque está vazio.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {estoque.map(item => {
                      const qtAtual = Number(item.quantidade_atual);
                      const qtMinima = Number(item.estoque_minimo);
                      const emAlerta = qtAtual <= qtMinima && qtMinima > 0;
                      const semEstoque = qtAtual <= 0;

                      return (
                        <div key={item.id} style={{ padding: '16px', backgroundColor: semEstoque ? '#FEF2F2' : emAlerta ? '#FFFBEB' : '#F9FAFB', borderRadius: '12px', border: `1px solid ${semEstoque ? '#FCA5A5' : emAlerta ? '#FDE047' : '#E5E7EB'}`, display: 'flex', flexDirection: 'column' }}>
                          
                          {/* CABEÇALHO COM BOTÕES DE EDIÇÃO */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>{item.categoria}</span>
                              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{item.codigo_interno || 'S/N'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => prepararEdicaoEstoque(item)} style={{ background: 'none', border: 'none', color: '#EA580C', cursor: 'pointer', padding: '0' }} title="Editar"><Edit2 size={16} /></button>
                              <button onClick={() => deletarItemEstoque(item.id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '0' }} title="Apagar"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827', fontWeight: '700' }}>{item.descricao}</h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#6B7280', minHeight: '38px' }}>{item.especificacao || 'Sem especificação'}</p>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '16px', padding: '12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Em Estoque</span>
                              <span style={{ fontSize: '20px', fontWeight: '800', color: semEstoque ? '#DC2626' : '#111827' }}>{qtAtual} <span style={{ fontSize: '12px', fontWeight: '500' }}>Unid</span></span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Mínimo ideal</span>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{qtMinima}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => abrirPainelMovimentacao(item, 'Entrada')} style={{ flex: 1, padding: '10px', backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}><PlusCircle size={16}/> Entrada</button>
                            <button onClick={() => abrirPainelMovimentacao(item, 'Saída')} style={{ flex: 1, padding: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}><MinusCircle size={16}/> Saída</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

      {/* ============================================== */}
      {/* MODAL DE ENTRADA/SAÍDA DE ESTOQUE              */}
      {/* ============================================== */}
      {modalMovimentacao && itemMovimentacao && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: tipoMovimentacao === 'Entrada' ? '#166534' : '#991B1B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {tipoMovimentacao === 'Entrada' ? <PlusCircle size={20} /> : <MinusCircle size={20} />} 
                Registrar {tipoMovimentacao}
              </h3>
              <button onClick={() => setModalMovimentacao(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}><X size={24} /></button>
            </div>
            
            <div style={{ backgroundColor: '#F3F4F6', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#111827' }}>{itemMovimentacao.descricao}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Estoque atual: {itemMovimentacao.quantidade_atual} Unid</p>
            </div>

            <form onSubmit={confirmarMovimentacaoEstoque}>
              <label style={estiloLabel}>Quantidade (Unid) *</label>
              <input type="number" step="0.01" min="0.01" required value={movQuantidade} onChange={(e) => setMovQuantidade(e.target.value)} placeholder="Quantas unidades?" style={{ ...estiloInput, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }} />
              
              {tipoMovimentacao === 'Saída' && (
                <>
                  <label style={estiloLabel}>Crachá de quem retirou (Opcional)</label>
                  <select value={movOperadorId} onChange={e => setMovOperadorId(e.target.value)} style={{ ...estiloInput, marginBottom: '16px' }}>
                    <option value="">Nenhum Aluno vinculado</option>
                    {alunos.map(a => <option key={a.id} value={a.id}>#{a.id} - {a.nome}</option>)}
                  </select>

                  <label style={estiloLabel}>Projeto de destino (Opcional)</label>
                  <select value={movProjetoId} onChange={e => setMovProjetoId(e.target.value)} style={{ ...estiloInput, marginBottom: '16px' }}>
                    <option value="">Estoque Geral (Sem projeto)</option>
                    {projetos.map(p => <option key={p.projeto_id} value={p.projeto_id}>{p.projeto}</option>)}
                  </select>
                </>
              )}

              <label style={estiloLabel}>Observação / Motivo (Opcional)</label>
              <input type="text" value={movObservacao} onChange={(e) => setMovObservacao(e.target.value)} placeholder={tipoMovimentacao === 'Entrada' ? 'Ex: NF 1234, Doação' : 'Ex: Quebra da peça anterior'} style={{ ...estiloInput, marginBottom: '24px' }} />

              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: tipoMovimentacao === 'Entrada' ? '#16A34A' : '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                Confirmar {tipoMovimentacao}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MENU INFERIOR FIXO */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
        <div onClick={() => setTelaAtual('menu')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Ajustes;