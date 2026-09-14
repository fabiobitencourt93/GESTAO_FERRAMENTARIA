import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Lock, Users, Clock, Settings, History, AlertOctagon, LayoutGrid, BarChart2, User, Wrench, Calendar, ClipboardList, Key, TrendingUp, Filter, AlertTriangle, Plus, Trash2, FolderPlus, Download, Monitor } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  // Estados de Navegação
  const [telaAtual, setTelaAtual] = useState('menu'); 
  
  // Estados: Ocorrências
  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregandoOcorrencias, setCarregandoOcorrencias] = useState(false);

  // Estados: Relatórios
  const [dadosPecas, setDadosPecas] = useState([]);
  const [dadosProcessos, setDadosProcessos] = useState([]);
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);
  const [filtroUsinagem, setFiltroUsinagem] = useState('pecas'); 
  const [agrupamento, setAgrupamento] = useState('maquina'); 

  // Estados: Cadastro de Alunos
  const [alunos, setAlunos] = useState([]);
  const [novoAlunoId, setNovoAlunoId] = useState('');
  const [novoAlunoNome, setNovoAlunoNome] = useState('');
  const [carregandoAlunos, setCarregandoAlunos] = useState(false);

  // Estados: Cadastro de Projetos
  const [projetos, setProjetos] = useState([]);
  const [novoProjNome, setNovoProjNome] = useState('');
  const [novoProjTipo, setNovoProjTipo] = useState('');
  const [novoProjInicio, setNovoProjInicio] = useState('');
  const [novoProjFim, setNovoProjFim] = useState('');
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);

  // --- NOVA VERIFICAÇÃO DE SENHA PELO NODE.JS ---
  const verificarSenha = async (e) => {
    e.preventDefault();
    setCarregandoLogin(true);
    setErroSenha(false);
    
    try {
      // O React não sabe a senha, ele manda para o backend validar
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

  // --- FUNÇÃO PARA EXPORTAR CSV (EXCEL) ---
  const exportarParaExcel = (dados, nomeArquivo) => {
    if (!dados || dados.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
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

  // --- FUNÇÕES DE NAVEGAÇÃO E DADOS ---
  const abrirHistorico = () => {
    setCarregandoOcorrencias(true);
    setTelaAtual('historico');
    axios.get('https://gestao-ferramentaria.onrender.com/api/ocorrencias')
      .then(response => { setOcorrencias(response.data); setCarregandoOcorrencias(false); })
      .catch(error => { console.error(error); setCarregandoOcorrencias(false); });
  };

  const abrirRelatorios = () => {
    setCarregandoRelatorio(true);
    setTelaAtual('relatorios');
    setFiltroUsinagem('pecas');
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/desempenho')
      .then(response => setDadosPecas(response.data)).catch(err => console.error(err));
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/processos')
      .then(response => { setDadosProcessos(response.data); setCarregandoRelatorio(false); })
      .catch(err => { console.error(err); setCarregandoRelatorio(false); });
  };

  const abrirAlunos = () => {
    setCarregandoAlunos(true);
    setTelaAtual('alunos');
    carregarAlunosDoBanco();
  };

  const carregarAlunosDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/operadores')
      .then(response => { setAlunos(response.data); setCarregandoAlunos(false); })
      .catch(error => { console.error(error); setCarregandoAlunos(false); });
  };

  const abrirProjetos = () => {
    setCarregandoProjetos(true);
    setTelaAtual('projetos');
    carregarProjetosDoBanco();
  };

  const carregarProjetosDoBanco = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(response => { setProjetos(response.data); setCarregandoProjetos(false); })
      .catch(error => { console.error(error); setCarregandoProjetos(false); });
  };

  // --- FUNÇÕES CRUD ---
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

  const cadastrarProjeto = async (e) => {
    e.preventDefault();
    if (!novoProjNome || !novoProjTipo || !novoProjInicio) {
      alert("Preencha todos os campos obrigatórios (*)");
      return;
    }
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
        nome: novoProjNome, tipo: novoProjTipo, data_inicio: novoProjInicio, data_fim: novoProjFim || null
      });
      setNovoProjNome(''); setNovoProjTipo(''); setNovoProjInicio(''); setNovoProjFim('');
      carregarProjetosDoBanco();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao cadastrar projeto.'); }
  };

  const deletarProjeto = async (id) => {
    if (!window.confirm('Tem certeza que deseja apagar este projeto e tudo associado a ele?')) return;
    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/projetos/${id}`);
      carregarProjetosDoBanco();
    } catch (error) { alert(error.response?.data?.error || 'Erro ao excluir projeto.'); }
  };

  const handleBloquear = () => {
    setAutenticado(false);
  };

  const processosComAtraso = [...dadosProcessos].filter(p => Number(p.realizado) > Number(p.planejado)).sort((a, b) => (Number(b.realizado) - Number(b.planejado)) - (Number(a.realizado) - Number(a.planejado)));
  const dadosAgrupados = dadosProcessos.reduce((acc, item) => {
    const chave = item[agrupamento] || 'Não definido';
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(item);
    return acc;
  }, {});

  const estiloInput = { width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#FFFFFF' };
  const estiloLabel = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '120px' }}>
      
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
              telaAtual === 'projetos' ? 'Projetos e Estampos' : 'Ajustes do Sistema'}
          </h1>
        </div>
        {autenticado && telaAtual === 'menu' && (
          <button onClick={handleBloquear} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}><Lock size={16} /> Bloquear</button>
        )}
      </div>

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
          
          {telaAtual === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              <div onClick={abrirRelatorios} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F5F3FF', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><TrendingUp size={24} color="#8B5CF6" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Relatórios de Usinagem</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Analise atrasos, exporte dados e veja processos.</p></div>
              </div>
              <div onClick={abrirProjetos} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F0FDF4', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><FolderPlus size={24} color="#16A34A" /></div>
                <div><h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Cadastrar Projetos</h3><p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Crie novos projetos, estampos e defina prazos.</p></div>
              </div>
              <div onClick={abrirAlunos} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ backgroundColor: '#F0F9FF', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Users size={24} color="#0284C7" /></div>
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

          {telaAtual === 'projetos' && (
            <div style={{ maxWidth: '900px', margin: '0 auto', marginTop: '10px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6', marginBottom: '24px' }}>
                <form onSubmit={cadastrarProjeto}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={estiloLabel}>Nome do Projeto</label>
                      <input type="text" placeholder="Ex: Estampo Progressivo 05..." value={novoProjNome} onChange={e => setNovoProjNome(e.target.value)} required style={estiloInput} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={estiloLabel}>Tipo *</label>
                      <select value={novoProjTipo} onChange={e => setNovoProjTipo(e.target.value)} required style={estiloInput}>
                        <option value="">Selecione...</option>
                        <option value="Progressivo">Estampo Progressivo</option>
                        <option value="Transfer">Estampo Transfer</option>
                        <option value="Corte">Estampo de Corte</option>
                        <option value="Dobra">Estampo de Dobra</option>
                        <option value="Repuxo">Estampo de Repuxo</option>
                        <option value="Molde">Molde de Injeção</option>
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
                    <Plus size={18} /> Cadastrar Projeto
                  </button>
                </form>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F3F4F6' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Projetos Ativos</h3>
                {carregandoProjetos ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando projetos...</p>
                ) : projetos.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhum projeto cadastrado.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {projetos.map(proj => (
                      <div key={proj.projeto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111827' }}>{proj.projeto}</h4>
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>Início: {proj.data_inicio} | Status: {proj.status}</span>
                        </div>
                        <button onClick={() => deletarProjeto(proj.projeto_id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '8px' }}><Trash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Alunos Cadastrados</h3>
                {carregandoAlunos ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Buscando crachás...</p>
                ) : alunos.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center' }}>Nenhum aluno cadastrado.</p>
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

          {telaAtual === 'historico' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                 <button onClick={() => exportarParaExcel(ocorrencias, 'Ocorrencias_Ferramentaria')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} /> Baixar Planilha
                 </button>
              </div>

              {carregandoOcorrencias ? (
                <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Buscando registros no banco de dados...</p>
              ) : ocorrencias.length === 0 ? (
                <div style={{ backgroundColor: '#F0FDF4', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#166534', border: '1px solid #22C55E' }}>
                  <strong>Nenhuma ocorrência registrada!</strong>
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
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <ClipboardList size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Projeto</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.projeto || 'N/A'}</span></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Wrench size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Peça / Operação</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.peca || 'N/A'} - {item.operacao || 'N/A'}</span></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <User size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Operador (Aluno)</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.operador || 'Desconhecido'}</span></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <Calendar size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                          <div><span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Data do Registro</span><span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.data_registro}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {telaAtual === 'relatorios' && (
            <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '10px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                 <button onClick={() => exportarParaExcel(dadosProcessos, 'Desempenho_Processos')} style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={16} /> Baixar Planilha
                 </button>
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
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Projeto: {item.projeto || 'Geral'}</span>
                            <h4 style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#111827' }}>{item.peca || 'Resumo do Projeto'}</h4>
                          </div>
                          <span style={{ fontSize: '18px', fontWeight: '800', color: progresso >= 100 ? '#16A34A' : '#0284C7' }}>{progresso}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#F3F4F6', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                          <div style={{ width: `${Math.min(progresso, 100)}%`, height: '100%', backgroundColor: progresso >= 100 ? '#16A34A' : '#0284C7' }}></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Planejado</span>
                            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>{(planejadoMin / 60).toFixed(1)} h</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '11px', color: '#6B7280' }}>Executado (Real)</span>
                            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '600' }}>{(realizadoMin / 60).toFixed(1)} h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filtroUsinagem === 'processos' && (
                    <>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', paddingBottom: '8px', overflowX: 'auto' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', alignSelf: 'center', marginRight: '8px' }}>Agrupar por:</span>
                        {[
                          { id: 'maquina', label: 'Máquina' },
                          { id: 'projeto', label: 'Ferramenta' },
                          { id: 'peca', label: 'Peça' },
                          { id: 'processo', label: 'Processo' }
                        ].map(tipo => (
                          <button key={tipo.id} onClick={() => setAgrupamento(tipo.id)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #E5E7EB', backgroundColor: agrupamento === tipo.id ? '#111827' : '#FFFFFF', color: agrupamento === tipo.id ? '#FFFFFF' : '#4B5563', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{tipo.label}</button>
                        ))}
                      </div>

                      {Object.entries(dadosAgrupados).map(([grupo, itens], idx) => (
                        <div key={idx} style={{ marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '14px', color: '#111827', borderBottom: '2px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>
                            {grupo} <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: 'normal', textTransform: 'none' }}>({itens.length} registros)</span>
                          </h3>
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
                    processosComAtraso.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#16A34A' }}><strong>Excelente!</strong> Nenhuma operação estourou o tempo planejado.</div>
                    ) : (
                      processosComAtraso.map((item, index) => {
                        const planejado = Number(item.planejado) || 0;
                        const realizado = Number(item.realizado) || 0;
                        const atraso = realizado - planejado;
                        return (
                          <div key={`atraso-${index}`} style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: '#991B1B', textTransform: 'uppercase' }}>{item.projeto} / {item.peca}</span>
                                <h4 style={{ margin: '4px 0 0 0', fontSize: '15px', color: '#7F1D1D' }}>{item.processo} <span style={{ fontSize: '12px', fontWeight: 'normal' }}>({item.maquina})</span></h4>
                              </div>
                              <div style={{ textAlign: 'right', backgroundColor: '#DC2626', color: '#FFF', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>+ {atraso.toFixed(1)} min</div>
                            </div>
                            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#991B1B' }}>Planejado: <strong>{planejado.toFixed(1)}m</strong> | Realizado: <strong>{realizado.toFixed(1)}m</strong></p>
                          </div>
                        );
                      })
                    )
                  )}
                </div>
              )}
            </div>
          )}
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



export default Ajustes;