import React, {useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PecasEstampo() {
  const { id } = useParams(); // ID do estampo
  const navigate = useNavigate();
  const [pecas, setPecas] = useState([]);
  

  useEffect(() => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/estampos/${id}/pecas`)
      .then(response => setPecas(response.data))
      .catch(error => console.error("Erro:", error));
  }, [id]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>Voltar aos Projetos</button>
      <h2>Peças do Estampo {id}</h2>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#e2e3e5' }}>
          <tr>
            <th>Posição</th>
            <th>Nome da Peça</th>
            <th>Material</th>
            <th>Tratamento</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {pecas.map((peca) => (
            <tr key={peca.id}>
              <td>{peca.pos}</td>
              <td>{peca.nome}</td>
              <td>{peca.material}</td>
              <td>{peca.tratamento_termico}</td>
              <td>
                <button 
                  onClick={() => navigate(`/peca/${peca.id}/processos`)}
                  style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Ver Processos
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PecasEstampo;