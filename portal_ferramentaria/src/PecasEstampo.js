import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, ArrowRight, LayoutGrid, BarChart2, Settings } from 'lucide-react';

function PecasEstampo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pecas, setPecas] = useState([]);

  useEffect(() => {
    axios.get(`https://gestao-ferramentaria.onrender.com/api/estampos/${id}/pecas`)
      .then(response => setPecas(response.data))
      .catch(error => console.error("Erro:", error));
  }, [id]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '80px' }}>
      
      {/* Top Bar (Cabeçalho com botão Voltar) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}
          >
            <ChevronLeft size={28} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Detalhes do Estampo</h1>
        </div>
        <Bell size={24} color="#111827" />
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Componentes (ID: {id})</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{pecas.length} peças compõem esta ferramenta</p>
        </div>

        {/* Lista de Peças (Estilo Cards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pecas.map((peca) => (
            <div 
              key={peca.id} 
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: '20px', 
                padding: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
              }}
            >
              {/* Esquerda: Caixa de Posição + Textos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Destaque para o Número da Posição (Fundo azul claro) */}
                <div style={{ 
                  backgroundColor: '#E6F0FF', 
                  color: '#0B5ED7', 
                  minWidth: '48px', 
                  height: '48px', 
                  borderRadius: '14px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center',
                  padding: '0 8px'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>POS</span>
                  <span style={{ fontSize: '16px', fontWeight: '800' }}>{peca.pos}</span>
                </div>
                
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>{peca.nome}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                    {peca.material} • {peca.tratamento_termico}
                  </p>
                </div>
              </div>

              {/* Direita: Botão de Ação */}
              <button 
                onClick={() => navigate(`/peca/${peca.id}/processos`)}
                style={{ 
                  backgroundColor: '#007A33', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '10px 16px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(0, 122, 51, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                Processos <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu de Navegação Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33' }}>
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>PAINEL</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PRODUÇÃO</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF' }}>
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>AJUSTES</span>
        </div>
      </div>

    </div>
  );
}

export default PecasEstampo;