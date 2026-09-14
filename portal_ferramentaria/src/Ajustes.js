import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Lock, Users, Clock, Settings, History, AlertOctagon, LayoutGrid, BarChart2, User, Wrench, Calendar, ClipboardList } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState('menu'); 
  const [ocorrencias, setOcorrencias] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregarOcorrencias = () => {
    setCarregando(true);
    axios.get('https://gestao-ferramentaria.onrender.com/api/ocorrencias')
      .then(response => {
        setOcorrencias(response.data);
        setCarregando(false);
      })
      .catch(error => {
        console.error("Erro ao carregar ocorrências:", error);
        setCarregando(false);
      });
  };

  const abrirHistorico = () => {
    carregarOcorrencias();
    setTelaAtual('historico');
  };

  const handleBloquear = () => {
    // Limpa a identificação do usuário e manda para a tela inicial/login
    localStorage.removeItem('operadorId');
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '120px' }}>
      
      {/* Barra Superior - Fiel ao design original */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {telaAtual === 'historico' ? (
            <button onClick={() => setTelaAtual('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={24} color="#111827" strokeWidth={2.5} />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={24} color="#111827" strokeWidth={2.5} />
            </button>
          )}
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {telaAtual === 'historico' ? 'Histórico de Ocorrências' : 'Ajustes do Sistema'}
          </h1>
        </div>
        
        {/* Botão Bloquear */}
        {telaAtual === 'menu' && (
          <button onClick={handleBloquear} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#DC2626', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
            <Lock size={16} /> Bloquear
          </button>
        )}
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* TELA 1: MENU ORIGINAL + OCORRÊNCIAS */}
        {telaAtual === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px', margin: '0 auto', marginTop: '20px' }}>
            
            {/* 1. Relatório de Ocorrências (NOVO) */}
            <div onClick={abrirHistorico} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#FEF2F2', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <AlertOctagon size={24} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Relatório de Ocorrências</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Visualize quebras, paradas e relatos dos alunos.</p>
              </div>
            </div>

            {/* 2. Gerenciar Alunos */}
            <div onClick={() => navigate('/alunos')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#F0F9FF', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Users size={24} color="#0284C7" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Gerenciar Alunos (Crachás)</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar, editar ou remover IDs de operadores.</p>
              </div>
            </div>

            {/* 3. Correção de Apontamentos */}
            <div onClick={() => navigate('/correcoes')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#FEF9C3', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Clock size={24} color="#CA8A04" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Correção de Apontamentos</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Ajustar manualmente horários que ficaram em aberto.</p>
              </div>
            </div>

            {/* 4. Engenharia e Roteiros */}
            <div onClick={() => navigate('/engenharia')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#F3F4F6', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Settings size={24} color="#4B5563" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Engenharia e Roteiros</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Cadastrar peças, editar processos, sequência e tempos alvo.</p>
              </div>
            </div>

            {/* 5. Lançamento Retroativo */}
            <div onClick={() => navigate('/retroativo')} style={{ backgroundColor: '#FFFFFF', padding: '20px 24px', borderRadius: '12px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ backgroundColor: '#FFF7ED', minWidth: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <History size={24} color="#EA580C" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#111827' }}>Lançamento Retroativo de Horas</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Inserção de tempo para operadores que esqueceram.</p>
              </div>
            </div>

          </div>
        )}

        {/* TELA 2: LISTA DE OCORRÊNCIAS */}
        {telaAtual === 'historico' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', marginTop: '20px' }}>
            {carregando ? (
              <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Buscando registros no banco de dados...</p>
            ) : ocorrencias.length === 0 ? (
              <div style={{ backgroundColor: '#F0FDF4', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#166534', border: '1px solid #22C55E' }}>
                <strong>Nenhuma ocorrência registrada!</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>A produção ocorreu perfeitamente até o momento.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ocorrencias.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #FEE2E2' }}>
                    
                    {/* Cabeçalho do Card */}
                    <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#991B1B' }}>
                      <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Relato do Operador:</strong>
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>"{item.ocorrencia}"</span>
                    </div>

                    {/* Detalhes Técnicos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <ClipboardList size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Projeto</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.projeto || 'N/A'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Wrench size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Peça / Operação</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.peca || 'N/A'} - {item.operacao || 'N/A'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <User size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Operador (Aluno)</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.operador || 'Desconhecido'}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Calendar size={16} color="#6B7280" style={{ marginTop: '2px' }} />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Data do Registro</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.data_registro}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span>
        </div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}>
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '700' }}>AJUSTES</span>
        </div>
      </div>
    </div>
  );
}

export default Ajustes;