import React, {useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    // Pede os dados ao nosso servidor Back-end (que está na porta 3000)
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(response => setProjetos(response.data))
      .catch(error => console.error("Erro ao procurar projetos:", error));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Painel Geral de Projetos</h2>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th>Projeto</th>
            <th>Estampo</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {projetos.map((item) => (
            <tr key={item.estampo_id}>
              <td>{item.projeto}</td>
              <td>{item.estampo}</td>
              <td>
                <button 
                  onClick={() => navigate(`/estampo/${item.estampo_id}`)}
                  style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Abrir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Projetos;