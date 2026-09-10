import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importando ícones com o mesmo traço fino e moderno das imagens
import { Bell, Wrench, LayoutGrid, BarChart2, Settings, ArrowRight } from 'lucide-react';

function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/projetos')
      .then(response => setProjetos(response.data))
      .catch(error => console.error("Erro ao procurar projetos:", error));
  }, []);

  return (
    // Fundo da página em cinza muito claro (off-white)
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", paddingBottom: '80px' }}>
      
      {/* Top Bar (Cabeçalho do App) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* AQUI ENTRA A SUA LOGO */}
          <img 
            src="/cecdr.png" 
            alt="Logo GestãoFab" 
            style={{ height: '56px', width: 'auto', borderRadius: '8px' }} 
          />

          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Gestão CECDR - 2026</h1>
        </div>
        <Bell size={24} color="#111827" />
      </div>

      {/* Conteúdo Principal */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>Projetos Ativos</h2>
            <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{projetos.length} sistemas em fabricação</p>
          </div>
        </div>

        {/* Lista de Projetos (Estilo Cards "Active Appliances") */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projetos.map((item) => (
            <div 
              key={item.estampo_id} 
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
              {/* Esquerda: Ícone + Textos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Bloco do Ícone (Fundo verde claro, ícone verde escuro) */}
                <div style={{ backgroundColor: '#c5eaff', color: '#00289f', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Wrench size={24} />
                </div>
                
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>{item.projeto}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6B7280' }}>{item.estampo}</p>
                </div>
              </div>

              {/* Direita: Botão de Ação (Estilo "Schedule Now") */}
              <button 
                onClick={() => navigate(`/estampo/${item.estampo_id}`)}
                style={{ 
                  backgroundColor: '#005fb7', 
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
                  boxShadow: '0 2px 8px rgba(0, 122, 51, 0.25)'
                }}
              >
                Abrir <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        
        {/* Botão Painel (Home) */}
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#005eff', cursor: 'pointer' }}
        >
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PAINEL</span>
        </div>

        {/* Botão Produção */}
        <div 
          onClick={() => navigate('/producao')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <BarChart2 size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PRODUÇÃO</span>
        </div>

        {/* Botão Ajustes */}
        <div 
          onClick={() => navigate('/ajustes')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <Settings size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>AJUSTES</span>
        </div>

      </div>

    </div>
  );
}

export default Projetos;