import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save, Clock, Bell } from 'lucide-react';

function ApontamentoRetroativo() {
  const navigate = useNavigate();
  
  // Estados para as caixas de seleção
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState('');
  
  const [pecas, setPecas] = useState([]);
  const [pecaSelecionada, setPecaSelecionada] = useState('');
  
  const [processos, setProcessos] = useState([]);
  const [processoSelecionado, setProcessoSelecionado] = useState('');

  // Estados do formulário de tempo
  const [operadorId, setOperadorId] = useState('');
  const [dataRetroativa, setDataRetroativa] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFim, setHoraFim] = useState('10:00');

  // Carrega os Projetos ao entrar na tela
  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(res => setProjetos(res.data))
      .catch(err => console.error(err));
  }, []);

  // Quando escolhe um projeto, carrega as Peças e OPs daquele projeto
  useEffect(() => {
    if (projetoSelecionado) {
      axios.get(`https://gestao-ferramentaria.onrender.com/api/projetos/${projetoSelecionado}/engenharia`)
        .then(res => setPecas(res.data))
        .catch(err => console.error(err));
    } else {
      setPecas([]);
      setPecaSelecionada('');
    }
  }, [projetoSelecionado]);

  // Quando escolhe uma peça, filtra os processos dela
  useEffect(() => {
    if (pecaSelecionada && pecas.length > 0) {
      const pecaEncontrada = pecas.find(p => p.id === Number(pecaSelecionada));
      setProcessos(pecaEncontrada ? pecaEncontrada.processos : []);
    } else {
      setProcessos([]);
      setProcessoSelecionado('');
    }
  }, [pecaSelecionada, pecas]);

  const salvarRetroativo = async () => {
    if (!processoSelecionado || !operadorId || !dataRetroativa || !horaInicio || !horaFim) {
      return alert('Preencha todos os campos antes de salvar.');
    }

    const inicioSQL = `${dataRetroativa} ${horaInicio}:00`;
    const fimSQL = `${dataRetroativa} ${horaFim}:00`;

    if (new Date(`${dataRetroativa}T${horaInicio}`) >= new Date(`${dataRetroativa}T${horaFim}`)) {
      return alert('A hora final não pode ser menor ou igual à hora inicial!');
    }

    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/apontamentos/manual', {
        processo_id: processoSelecionado,
        operador_id: operadorId,
        data_hora_inicio: inicioSQL,
        data_hora_fim: fimSQL
      });
      alert('Apontamento retroativo salvo com sucesso no banco de dados!');
      navigate('/ajustes'); // Volta para o menu do professor após salvar
    } catch (error) {
      alert('Erro ao lançar tempo retroativo. Verifique se o ID do aluno existe.');
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: '#FFF', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#4B5563', fontWeight: '600' }}>
          <ChevronLeft size={24} /> Voltar aos Ajustes
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#FEF3C7', padding: '12px', borderRadius: '12px' }}>
            <Clock size={28} color="#D97706" />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Lançamento Retroativo</h1>
            <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>Correção de horas não apontadas pelos alunos</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>1. Selecione a Ferramenta / Projeto</label>
            <select value={projetoSelecionado} onChange={e => setProjetoSelecionado(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}>
              <option value="">-- Escolha um Projeto --</option>
              {projetos.map(p => <option key={p.estampo_id} value={p.estampo_id}>{p.projeto}</option>)}
            </select>
          </div>

          {projetoSelecionado && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>2. Selecione a Peça</label>
              <select value={pecaSelecionada} onChange={e => setPecaSelecionada(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}>
                <option value="">-- Escolha a Peça --</option>
                {pecas.map(p => <option key={p.id} value={p.id}>POS {p.pos} - {p.nome}</option>)}
              </select>
            </div>
          )}

          {pecaSelecionada && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>3. Selecione a Operação</label>
              <select value={processoSelecionado} onChange={e => setProcessoSelecionado(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none' }}>
                <option value="">-- Escolha a Operação --</option>
                {processos.map(proc => <option key={proc.id} value={proc.id}>OP {proc.ordem_execucao} - {proc.nome_operacao}</option>)}
              </select>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>ID do Aluno (Crachá)</label>
            <input type="number" value={operadorId} onChange={e => setOperadorId(e.target.value)} placeholder="Ex: 20265" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Data do Apontamento</label>
            <input type="date" value={dataRetroativa} onChange={e => setDataRetroativa(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Hora Inicial</label>
              <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Hora Final</label>
              <input type="time" value={horaFim} onChange={e => setHoraFim(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none' }} />
            </div>
          </div>

          <button onClick={salvarRetroativo} style={{ marginTop: '16px', backgroundColor: '#F59E0B', color: '#FFF', border: 'none', borderRadius: '8px', padding: '16px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Save size={20} /> Salvar Apontamento
          </button>
        </div>

      </div>
    </div>
  );
}

export default ApontamentoRetroativo;