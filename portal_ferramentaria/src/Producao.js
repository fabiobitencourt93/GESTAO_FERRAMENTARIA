import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Home, ChevronLeft, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Producao() {
  const navigate = useNavigate();
  const [dadosDesempenho, setDadosDesempenho] = useState([]);

  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/desempenho')
      .then(response => setDadosDesempenho(response.data))
      .catch(error => console.error("Erro ao carregar relatório:", error));
  }, []);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '80px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Desempenho de Produção</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Home size={24} /></button>
          <button onClick={() => navigate('/notificacoes')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Bell size={24} /></button>
        </div>
      </div>

      {/* Gráfico Analítico */}
      <div style={{ padding: '0 24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#111827' }}>Horas: Planejado vs Realizado (Minutos)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={dadosDesempenho} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="projeto" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} borderRadius={12} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total_planejado" name="Tempo Planejado" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="total_realizado" name="Tempo Realizado" fill="#007A33" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        
        {/* Botão Painel (Home) */}
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}
        >
          <LayoutGrid size={24} />
          <span style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '0.5px' }}>PAINEL</span>
        </div>

        {/* Botão Produção */}
        <div 
          onClick={() => navigate('/producao')} 
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#005eff', cursor: 'pointer' }}
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

export default Producao;