import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, AlertCircle } from 'lucide-react';

function CorrecaoApontamentos() {
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState([]);

  const carregarPendentes = () => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/apontamentos/abertos')
      .then(response => setPendentes(response.data))
      .catch(error => console.error("Erro ao buscar apontamentos:", error));
  };

  useEffect(() => {
    carregarPendentes();
  }, []);

  // Nova função que se comunica com o banco para fechar a tarefa
  const encerrarApontamento = async (processoId, operadorId) => {
    const confirmar = window.confirm('Deseja forçar o encerramento deste apontamento agora?');
    if (!confirmar) return;

    try {
      await axios.put('https://gestao-ferramentaria.onrender.com/api/apontamentos/finalizar', {
        processo_id: processoId,
        operador_id: operadorId
      });
      alert('Apontamento encerrado com sucesso!');
      carregarPendentes(); // Atualiza a tela automaticamente, fazendo o card sumir
    } catch (error) {
      console.error("Erro ao encerrar:", error);
      alert('Erro ao encerrar. Verifique a conexão com o servidor.');
    }
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Correção Manual</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <h3 style={{ fontSize: '16px', color: '#4B5563', marginBottom: '16px' }}>
          Apontamentos Esquecidos Abertos ({pendentes.length})
        </h3>
        
        {pendentes.length === 0 ? (
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Não há operações esquecidas no momento. Tudo certo!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendentes.map(item => (
              <div key={item.processo_id + item.id_aluno} style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE047', padding: '16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <AlertCircle size={16} color="#CA8A04" />
                    <span style={{ fontWeight: '700', color: '#854D0E', fontSize: '14px' }}>{item.operacao}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#A16207' }}>
                    Iniciado por {item.aluno} (ID {item.id_aluno})<br/> 
                    Em: {formatarData(item.inicio)}
                  </p>
                </div>
                
                {/* Botão funcional com evento onClick */}
                <button 
                  onClick={() => encerrarApontamento(item.processo_id, item.id_aluno)}
                  style={{ backgroundColor: '#CA8A04', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Encerrar
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CorrecaoApontamentos;