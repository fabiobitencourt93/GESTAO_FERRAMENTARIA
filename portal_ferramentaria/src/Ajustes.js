import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Home, Bell, LayoutGrid, BarChart2, Settings, AlertOctagon, User, Tool, Calendar, ClipboardList } from 'lucide-react';

function Ajustes() {
  const navigate = useNavigate();
  const [telaAtual, setTelaAtual] = useState('menu'); // Controla se mostra o Menu ou as Ocorrências
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

  // Quando o usuário clicar para abrir o histórico, buscamos os dados
  const abrirHistorico = () => {
    carregarOcorrencias();
    setTelaAtual('historico');
  };

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '120px' }}>
      
      {/* Barra Superior */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {telaAtual === 'historico' ? (
            <button onClick={() => setTelaAtual('menu')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={28} color="#111827" />
            </button>
          ) : (
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ChevronLeft size={28} color="#111827" />
            </button>
          )}
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {telaAtual === 'historico' ? 'Histórico de Ocorrências' : 'Ajustes do Sistema'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Home size={24} color="#111827" />
          </button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Bell size={24} color="#111827" />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* TELA 1: MENU DE AJUSTES */}
        {telaAtual === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div onClick={abrirHistorico} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', borderLeft: '4px solid #EF4444' }}>
              <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '12px' }}>
                <AlertOctagon size={28} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>Relatório de Ocorrências</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Visualize quebras, paradas e relatos dos alunos.</p>
              </div>
            </div>

            {/* Você pode adicionar outros botões de configuração aqui no futuro (Ex: Cadastro de Alunos, Máquinas, etc) */}
            <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '16px', opacity: 0.6 }}>
              <div style={{ backgroundColor: '#F3F4F6', padding: '12px', borderRadius: '12px' }}>
                <Settings size={28} color="#4B5563" />
              </div>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#111827' }}>Configurações Gerais</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Em breve...</p>
              </div>
            </div>

          </div>
        )}

        {/* TELA 2: LISTA DE OCORRÊNCIAS */}
        {telaAtual === 'historico' && (
          <div>
            {carregando ? (
              <p style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Buscando registros no banco de dados...</p>
            ) : ocorrencias.length === 0 ? (
              <div style={{ backgroundColor: '#F0FDF4', padding: '24px', borderRadius: '16px', textAlign: 'center', color: '#166534', border: '1px solid #22C55E' }}>
                <strong>Nenhuma ocorrência registrada!</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>A produção ocorreu perfeitamente até o momento.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {ocorrencias.map((item) => (
                  <div key={item.id} style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #FEE2E2' }}>
                    
                    {/* Cabeçalho do Card (Ocorrência em si) */}
                    <div style={{ backgroundColor: '#FEF2F2', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: '#991B1B' }}>
                      <strong style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Relato do Operador:</strong>
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>"{item.ocorrencia}"</span>
                    </div>

                    {/* Detalhes Técnicos */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={16} color="#6B7280" />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Projeto</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.projeto || 'N/A'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tool size={16} color="#6B7280" />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Peça / Operação</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.peca || 'N/A'} - {item.operacao || 'N/A'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} color="#6B7280" />
                        <div>
                          <span style={{ display: 'block', fontSize: '11px', color: '#9CA3AF' }}>Operador (Aluno)</span>
                          <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{item.operador || 'Desconhecido'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#6B7280" />
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