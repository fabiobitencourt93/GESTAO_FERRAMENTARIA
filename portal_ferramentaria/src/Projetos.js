import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Plus, LayoutGrid, BarChart2, Settings, AlertTriangle } from 'lucide-react';

function Projetos() {
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState([]);
  const [novoProjeto, setNovoProjeto] = useState('');
  
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

    if (!novoProjeto) {
      setMensagemErro("Por favor, digite o nome do projeto na caixa de texto.");
      return;
    }

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
        nome: novoProjeto
      });
      
      setNovoProjeto(''); 
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
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={28} color="#111827" />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Projetos e Estampos</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Home size={24} color="#111827" />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* Painel de Avisos */}
        {mensagemErro && (
          <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #EF4444', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#991B1B', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <AlertTriangle size={24} color="#DC2626" />
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>O Banco de Dados recusou:</strong>
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
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <input 
            type="text" 
            placeholder="Nome do novo projeto..." 
            value={novoProjeto}
            onChange={(e) => setNovoProjeto(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px' }}
          />
          <button 
            onClick={handleCadastrar}
            style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
          >
            <Plus size={20} /> Cadastrar
          </button>
        </div>
        
        {/* Lista de Projetos (Redirecionamento Corrigido) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projetos.map((item, index) => (
            <div 
              key={item.estampo_id || index} 
              onClick={() => navigate(`/estampo/${item.estampo_id}`)} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                padding: '20px', 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                border: '1px solid transparent'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#0284C7'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <h3 style={{ margin: 0, fontSize: '16px', color: '#111827', fontWeight: '700' }}>{item.projeto}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                <strong>Estampo:</strong> {item.estampo} <br/>
                <strong>ID no Banco:</strong> {item.estampo_id}
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