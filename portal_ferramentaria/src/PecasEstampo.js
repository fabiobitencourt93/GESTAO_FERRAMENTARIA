import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Bell, ArrowRight, LayoutGrid, BarChart2, Settings, Home, Monitor } from 'lucide-react';

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
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}>
            <ChevronLeft size={28} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Roteiro de Fabricação</h1>
        </div>
        
        {/* Agrupamento de ícones à direita */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', padding: 0, display: 'flex', cursor: 'pointer', color: '#111827' }}>
            <Home size={24} />
          </button>
          <Bell size={24} color="#111827" />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Componentes (ID: {id})</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{pecas.length} peças compõem esta ferramenta</p>
        </div>

        {/* Lista de Peças (Estilo Cards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pecas.map((peca) => {
  // 1. Calcula a percentagem (Evita divisão por zero caso a peça ainda não tenha roteiro)
  const total = parseInt(peca.total_processos) || 0;
  const concluidos = parseInt(peca.processos_concluidos) || 0;
  const percentagem = total > 0 ? Math.round((concluidos / total) * 100) : 0;

  return (
    <div 
      key={peca.id} 
      // RESTAURA A AÇÃO DE CLICAR (Altere o link abaixo para a sua rota real)
      onClick={() => navigate(`/peca/${peca.id}/processos`)}
      style={{
        background: `linear-gradient(to right, #ECFDF5 ${percentagem}%, #FFFFFF ${percentagem}%)`,
        border: '1px solid #E5E7EB',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        // RESTAURA O MOUSE COMO MÃOZINHA PARA INDICAR QUE É CLICÁVEL
        cursor: 'pointer', 
        
        // Efeito para escurecer de leve ao passar o mouse (dá mais cara de botão)
        transition: 'all 0.2s ease',
      }}
      // Um truquezinho em CSS inline para dar feedback ao passar o mouse
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#111827' }}>
          Pos. {peca.pos} - {peca.nome}
        </h3>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          {concluidos} de {total} operações concluídas
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontWeight: '800', fontSize: '15px', color: percentagem === 100 ? '#059669' : '#9CA3AF' }}>
          {percentagem}%
        </div>
        
        {/* Um ícone de seta sutil para mostrar que o card vai para outra tela */}
        <div style={{ color: '#D1D5DB' }}>
          <ChevronRight size={20} />
        </div>
      </div>
    </div>
  );
})}
        </div>
      </div>

      {/* MENU INFERIOR PADRONIZADO COM 4 BOTÕES */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span>
        </div>
        <div onClick={() => navigate('/producao')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>PRODUÇÃO</span>
        </div>
        <div onClick={() => navigate('/dashboard')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Monitor size={24} />
          <span style={{ fontSize: '10px', fontWeight: '700' }}>DASHBOARD</span>
        </div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}>
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span>
        </div>
      </div>
        </div>
        );
      }

export default PecasEstampo;