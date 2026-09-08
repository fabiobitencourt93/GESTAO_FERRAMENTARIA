import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProcessosPeca() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  
  // Controles do Modal do Operador
  const [modalAberto, setModalAberto] = useState(false);
  const [processoSelecionado, setProcessoSelecionado] = useState(null);
  const [operadorId, setOperadorId] = useState('');

  useEffect(() => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/pecas/${id}/processos`)
      .then(response => setProcessos(response.data))
      .catch(error => console.error("Erro:", error));
  }, [id]);

  const abrirModal = (proc) => {
    setProcessoSelecionado(proc);
    setModalAberto(true);
  };

  const iniciarApontamento = async () => {
    if (!operadorId) return alert("Digite o ID do Operador!");
    
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/apontamentos/iniciar', {
        processo_id: processoSelecionado.id,
        operador_id: operadorId
      });
      alert('Operação iniciada com sucesso!');
      setModalAberto(false);
      setOperadorId('');
      // Aqui você poderia recarregar a lista para mudar a cor do botão, por exemplo.
    } catch (error) {
      alert('Erro ao iniciar. O ID deste operador existe no banco de dados?');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', padding: '5px 10px' }}>Voltar</button>
      <h2>Roteiro de Fabricação (Peça ID: {id})</h2>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#fff3cd' }}>
          <tr>
            <th>Ordem</th>
            <th>Operação</th>
            <th>Máquina</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {processos.map((proc) => (
            <tr key={proc.id}>
              <td>{proc.ordem_execucao}</td>
              <td>{proc.nome_operacao}</td>
              <td>{proc.maquina_sugerida}</td>
              <td>
                <button 
                  style={{ backgroundColor: '#198754', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                  onClick={() => abrirModal(proc)}
                >
                  Iniciar Operação
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* JANELA FLUTUANTE (MODAL) */}
      {modalAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '300px' }}>
            <h3>Apontamento de Chão de Fábrica</h3>
            <p>Operação: <strong>{processoSelecionado?.nome_operacao}</strong></p>
            
            <label>ID do Operador (Crachá):</label>
            <input 
              type="number" 
              value={operadorId}
              onChange={(e) => setOperadorId(e.target.value)}
              style={{ width: '100%', padding: '8px', margin: '10px 0' }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button onClick={() => setModalAberto(false)} style={{ padding: '8px' }}>Cancelar</button>
              <button onClick={iniciarApontamento} style={{ padding: '8px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius:'15px' }}>
                Confirmar Início
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessosPeca;