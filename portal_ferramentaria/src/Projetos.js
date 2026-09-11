import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react'; 

function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [novoProjeto, setNovoProjeto] = useState('');

  const carregarProjetos = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(resposta => setProjetos(resposta.data))
      .catch(erro => console.error(erro));
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  const handleCadastrar = async () => {
    if (!novoProjeto) return alert("Digite o nome do projeto!");

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/projetos', {
        nome: novoProjeto
      });
      
      setNovoProjeto(''); 
      carregarProjetos(); 
      
    } catch (error) {
      alert("Erro ao cadastrar projeto.");
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '20px', color: '#111827', marginBottom: '24px' }}>Projetos e Estampos</h1>
      
      {/* Bloco de Cadastro */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          placeholder="Nome do novo projeto..." 
          value={novoProjeto}
          onChange={(e) => setNovoProjeto(e.target.value)}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}
        />
        <button 
          onClick={handleCadastrar}
          style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} /> Cadastrar
        </button>
      </div>
      
      {/* Lista de Projetos Corrigida */}
      <div>
        {projetos.map((item, index) => (
          // Usamos item.estampo_id como chave principal
          <div key={item.estampo_id || index} style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #E5E7EB' }}>
            
            {/* Aqui chamamos item.projeto (nome do projeto) em vez de item.nome */}
            <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
              {item.projeto}
            </h3>
            
            {/* E aqui exibimos o ID e o nome do Estampo */}
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
              <strong>Estampo:</strong> {item.estampo} <br/>
              <strong>ID no Banco:</strong> {item.estampo_id}
            </p>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Projetos;