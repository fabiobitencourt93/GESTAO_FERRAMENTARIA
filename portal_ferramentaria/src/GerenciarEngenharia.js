import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, Plus, Edit, Save, Clock, Wrench } from 'lucide-react';

function GerenciarEngenharia() {
  const navigate = useNavigate();
  
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState('');
  const [pecas, setPecas] = useState([]);
  
  // Controles de interface
  const [pecaExpandida, setPecaExpandida] = useState(null);
  const [editandoProcesso, setEditandoProcesso] = useState(null);
  const [formProcesso, setFormProcesso] = useState({});
  
  // Novos controles de Cadastro
  const [exibirFormPeca, setExibirFormPeca] = useState(false);
  const [novaPeca, setNovaPeca] = useState({ pos: '', nome: '' });
  
  const [adicionandoProcessoNaPeca, setAdicionandoProcessoNaPeca] = useState(null);
  const [novoProcesso, setNovoProcesso] = useState({ ordem_execucao: '', nome_operacao: '', tempo_planejado_horas: '', maquina_sugerida: '' });

  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(res => setProjetos(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (projetoSelecionado) {
      carregarPecasEProcessos();
    }
  }, [projetoSelecionado]);

  const carregarPecasEProcessos = () => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/projetos/${projetoSelecionado}/engenharia`)
      .then(res => setPecas(res.data))
      .catch(err => console.error(err));
  };

  // Enviar Nova Peça ao Banco
  const salvarNovaPeca = async () => {
    if (!novaPeca.pos || !novaPeca.nome) return alert("Preencha a Posição e o Nome da Peça.");
    try {
      await axios.post('https://gestao-ferramentaria.onrender.com/api/pecas', {
        estampo_id: projetoSelecionado,
        pos: novaPeca.pos,
        nome: novaPeca.nome
      });
      setExibirFormPeca(false);
      setNovaPeca({ pos: '', nome: '' });
      carregarPecasEProcessos();
    } catch (err) {
      alert("Erro ao cadastrar peça.");
    }
  };

  // Enviar Novo Processo ao Banco
  const salvarNovoProcesso = async (pecaId) => {
    if (!novoProcesso.ordem_execucao || !novoProcesso.nome_operacao) return alert("Preencha ao menos a Sequência e o Nome da Operação.");
    try {
      const tempoEmMinutos = parseFloat(novoProcesso.tempo_planejado_horas || 0) * 60;
      await axios.post('https://gestao-ferramentaria.onrender.com/api/processos', {
        peca_id: pecaId,
        ordem_execucao: novoProcesso.ordem_execucao,
        nome_operacao: novoProcesso.nome_operacao,
        tempo_planejado_min: tempoEmMinutos,
        maquina_sugerida: novoProcesso.maquina_sugerida
      });
      setAdicionandoProcessoNaPeca(null);
      setNovoProcesso({ ordem_execucao: '', nome_operacao: '', tempo_planejado_horas: '', maquina_sugerida: '' });
      carregarPecasEProcessos();
    } catch (err) {
      alert("Erro ao cadastrar processo.");
    }
  };

  const salvarEdicaoProcesso = async () => {
    try {
      const tempoEmMinutos = parseFloat(formProcesso.tempo_planejado_horas || 0) * 60;
      const payload = { ...formProcesso, tempo_planejado_min: tempoEmMinutos };
      await axios.put(`https://gestao-ferramentaria.onrender.com/api/processos/${editandoProcesso}`, payload);
      setEditandoProcesso(null);
      carregarPecasEProcessos();
    } catch (error) {
      alert("Erro ao salvar processo.");
    }
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '40px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Engenharia</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4B5563', marginBottom: '8px' }}>Selecione o Projeto/Estampo</label>
          <select 
            value={projetoSelecionado} 
            onChange={(e) => setProjetoSelecionado(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', fontSize: '15px' }}
          >
            <option value="">-- Escolha um Projeto --</option>
            {projetos.map(p => (
              <option key={p.estampo_id} value={p.estampo_id}>{p.projeto}</option>
            ))}
          </select>
        </div>

        {projetoSelecionado && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Peças do Projeto</h3>
              <button 
                onClick={() => setExibirFormPeca(!exibirFormPeca)}
                style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Nova Peça
              </button>
            </div>

            {/* Painel para criar nova peça */}
            {exibirFormPeca && (
              <div style={{ backgroundColor: '#E0F2FE', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', border: '1px solid #BAE6FD', flexWrap: 'wrap' }}>
                <input type="number" placeholder="POS (ex: 01)" value={novaPeca.pos} onChange={e => setNovaPeca({...novaPeca, pos: e.target.value})} style={{ width: '100px', padding: '10px', borderRadius: '6px', border: '1px solid #7DD3FC', outline: 'none' }} />
                <input type="text" placeholder="Nome da Peça (ex: Matriz)" value={novaPeca.nome} onChange={e => setNovaPeca({...novaPeca, nome: e.target.value})} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #7DD3FC', outline: 'none' }} />
                <button onClick={salvarNovaPeca} style={{ backgroundColor: '#0284C7', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0 20px', cursor: 'pointer', fontWeight: '700' }}>Salvar</button>
              </div>
            )}

            {pecas.map(peca => (
              <div key={peca.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                
                <div 
                  onClick={() => setPecaExpandida(pecaExpandida === peca.id ? null : peca.id)}
                  style={{ padding: '16px', backgroundColor: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284C7', backgroundColor: '#E0F2FE', padding: '4px 8px', borderRadius: '4px', marginRight: '8px' }}>POS {peca.pos}</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>{peca.nome}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>{peca.processos.length} operações</span>
                </div>

                {pecaExpandida === peca.id && (
                  <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      
                      {peca.processos.map(proc => (
                        <div key={proc.id} style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '8px' }}>
                          {editandoProcesso === proc.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="number" placeholder="Seq" value={formProcesso.ordem_execucao} onChange={e => setFormProcesso({...formProcesso, ordem_execucao: e.target.value})} style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                                <input type="text" placeholder="Nome da Operação" value={formProcesso.nome_operacao} onChange={e => setFormProcesso({...formProcesso, nome_operacao: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="number" step="0.1" placeholder="Tempo (h)" value={formProcesso.tempo_planejado_horas} onChange={e => setFormProcesso({...formProcesso, tempo_planejado_horas: e.target.value})} style={{ width: '100px', padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                                <input type="text" placeholder="Ex: ROMI D800" value={formProcesso.maquina_sugerida} onChange={e => setFormProcesso({...formProcesso, maquina_sugerida: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                                <button onClick={salvarEdicaoProcesso} style={{ backgroundColor: '#007A33', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0 16px', cursor: 'pointer' }}><Save size={18} /></button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#4B5563' }}>OP {proc.ordem_execucao}</span>
                                  <span style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>{proc.nome_operacao}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6B7280', fontSize: '12px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {(proc.tempo_planejado_min / 60).toFixed(1)} h</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wrench size={12} /> {proc.maquina_sugerida}</span>
                                </div>
                              </div>
                              <button onClick={() => { setEditandoProcesso(proc.id); setFormProcesso({...proc, tempo_planejado_horas: proc.tempo_planejado_min ? (proc.tempo_planejado_min / 60).toFixed(1) : 0}); }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer' }}><Edit size={18} /></button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Botão ou Formulário de Novo Processo */}
                      {adicionandoProcessoNaPeca !== peca.id ? (
                        <button 
                          onClick={() => setAdicionandoProcessoNaPeca(peca.id)}
                          style={{ backgroundColor: '#E5E7EB', color: '#4B5563', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
                        >
                          + Adicionar Operação (Roteiro)
                        </button>
                      ) : (
                        <div style={{ backgroundColor: '#DCFCE7', padding: '12px', borderRadius: '8px', marginTop: '8px', border: '1px solid #86EFAC', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>Nova Operação</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" placeholder="Seq (ex: 10)" value={novoProcesso.ordem_execucao} onChange={e => setNovoProcesso({...novoProcesso, ordem_execucao: e.target.value})} style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid #86EFAC', outline: 'none' }} />
                            <input type="text" placeholder="Nome da Operação" value={novoProcesso.nome_operacao} onChange={e => setNovoProcesso({...novoProcesso, nome_operacao: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #86EFAC', outline: 'none' }} />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" step="0.1" placeholder="Tempo (h)" value={novoProcesso.tempo_planejado_horas} onChange={e => setNovoProcesso({...novoProcesso, tempo_planejado_horas: e.target.value})} style={{ width: '100px', padding: '8px', borderRadius: '6px', border: '1px solid #86EFAC', outline: 'none' }} />
                            <input type="text" placeholder="Máquina sugerida" value={novoProcesso.maquina_sugerida} onChange={e => setNovoProcesso({...novoProcesso, maquina_sugerida: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #86EFAC', outline: 'none' }} />
                            <button onClick={() => salvarNovoProcesso(peca.id)} style={{ backgroundColor: '#16A34A', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0 16px', cursor: 'pointer', fontWeight: '700' }}>Salvar</button>
                            <button onClick={() => setAdicionandoProcessoNaPeca(null)} style={{ backgroundColor: '#9CA3AF', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0 12px', cursor: 'pointer' }}>X</button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarEngenharia;