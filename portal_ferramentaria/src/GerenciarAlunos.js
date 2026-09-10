import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, Plus, Trash2, Users } from 'lucide-react';

function GerenciarAlunos() {
  const navigate = useNavigate();
  
  const [alunos, setAlunos] = useState([]);
  const [novoId, setNovoId] = useState('');
  const [novoNome, setNovoNome] = useState('');

  // Busca a lista de alunos ao abrir a página
  const carregarAlunos = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/operadores')
      .then(response => setAlunos(response.data))
      .catch(error => console.error("Erro ao buscar alunos:", error));
  };

  useEffect(() => {
    carregarAlunos();
  }, []);

  // Função para cadastrar novo aluno
  const handleCadastrar = async () => {
    if (!novoId || !novoNome) {
      return alert("Preencha o ID e o Nome do aluno.");
    }

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/operadores', {
        id: novoId,
        nome: novoNome
      });
      
      alert('Aluno cadastrado com sucesso!');
      setNovoId('');
      setNovoNome('');
      carregarAlunos(); // Recarrega a lista instantaneamente
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error); // Mostra o erro de ID duplicado do backend
      } else {
        alert('Erro ao cadastrar aluno. Verifique a conexão.');
      }
    }
  };

  // Função para excluir aluno
  const handleExcluir = async (id, nome) => {
    const confirmar = window.confirm(`Tem certeza que deseja excluir o aluno ${nome} (ID: ${id})?`);
    if (!confirmar) return;

    try {
      await axios.delete(`https://gestao-ferramentaria.onrender.com/api/operadores/${id}`);
      carregarAlunos(); // Atualiza a lista tirando o aluno excluído
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error); // Mostra o erro caso o aluno já tenha apontamentos
      } else {
        alert('Erro ao excluir aluno.');
      }
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Gerenciar Alunos</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* Painel de Cadastro */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#111827' }}>Cadastrar Novo Aluno</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input 
              type="number" 
              placeholder="ID (Crachá)" 
              value={novoId}
              onChange={(e) => setNovoId(e.target.value)}
              style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} 
            />
            <input 
              type="text" 
              placeholder="Nome do Aluno" 
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }} 
            />
            <button 
              onClick={handleCadastrar}
              style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px' }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Lista de Alunos do Banco de Dados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
          {alunos.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>Carregando alunos...</p>
          ) : (
            alunos.map(aluno => (
              <div key={aluno.id} style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Users size={20} color="#6B7280" />
                  <span style={{ fontWeight: '600', color: '#111827' }}>{aluno.nome}</span>
                  <span style={{ fontSize: '13px', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '6px' }}>ID: {aluno.id}</span>
                </div>
                <button 
                  onClick={() => handleExcluir(aluno.id, aluno.nome)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default GerenciarAlunos;