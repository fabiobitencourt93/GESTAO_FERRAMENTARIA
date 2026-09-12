import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Plus, LayoutGrid, BarChart2, Settings, AlertTriangle, Bell } from 'lucide-react';

function Projetos() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  
  const [novoProjeto, setNovoProjeto] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [tipoEstampo, setTipoEstampo] = useState(''); // Nova variável de memória
  
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
        tipo: tipoEstampo // Enviando o tipo selecionado para o Node.js
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

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
      {/* Barra Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
            <ChevronLeft size={28} color="#111827" />
          </button>
          
          {/* Logo CECDR - Ajuste o 'src' com o caminho/nome exato da sua imagem */}
          <img src="public/cecdr.png" alt="CECDR" style={{ height: '45px', objectFit: 'contain' }} />
          
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0, marginLeft: '8px' }}>Projetos - Contrutor de Estampos de Corte, Dobra e Repuxo</h1>
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
        
        {/* Painel de Avisos */}
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

        {/* Bloco de Cadastro */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '2', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>Nome do Projeto</label>
              <input 
                type="text" 
                placeholder="Ex: Estampo Progressivo 05..." 
                value={novoProjeto}
                onChange={(e) => setNovoProjeto(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px' }}
              />
            </div>

            {/* Novo Campo: Tipo de Estampo */}
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>Tipo *</label>
              <select 
                value={tipoEstampo}
                onChange={(e) => setTipoEstampo(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px', color: tipoEstampo ? '#111827' : '#9CA3AF', backgroundColor: '#FFF' }}
              >
                <option value="" disabled>Selecione...</option>
                <option value="Progressivo">Progressivo</option>
                <option value="Corte">Corte Simples</option>
                <option value="Dobra">Dobra</option>
                <option value="Repuxo">Repuxo</option>
                <option value="Dispositivo">Dispositivo</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>Data Início *</label>
              <input 
                type="date" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px', color: '#111827' }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: '600' }}>Previsão Fim</label>
              <input 
                type="date" 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px', color: '#111827' }}
              />
            </div>
          </div>

          <button 
            onClick={handleCadastrar}
            style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600', width: '100%', marginTop: '8px' }}
          >
            <Plus size={20} /> Cadastrar Projeto
          </button>
        </div>
        
        {/* Lista de Projetos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projetos.map((item, index) => (
            <div 
              key={item.projeto_id || index} 
              onClick={() => item.estampo_id ? navigate(`/estampo/${item.estampo_id}`) : alert("Este projeto ainda não possui um estampo vinculado.")} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                padding: '20px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: item.estampo_id ? 'pointer' : 'default',
                transition: 'transform 0.2s',
                border: '1px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = item.estampo_id ? '#0284C7' : 'transparent'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: '700' }}>{item.projeto}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                <strong>ID do Projeto:</strong> {item.projeto_id} <br/>
                <strong>Nome do Estampo:</strong> {item.estampo || <span style={{ color: '#EF4444' }}>Nenhum estampo cadastrado</span>} <br/>
                <strong>ID do Estampo:</strong> {item.estampo_id || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #E5E7EB', zIndex: 9999 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span></div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span></div>
      </div>

    </div>
  );
}

export default Projetos;