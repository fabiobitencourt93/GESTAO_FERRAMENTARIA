import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Home, ChevronLeft, Bell, User, Activity, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Producao() {
  const navigate = useNavigate();
  const [dadosDesempenho, setDadosDesempenho] = useState([]);
  const [alunosAoVivo, setAlunosAoVivo] = useState([]);

  useEffect(() => {
    // Busca os dados do gráfico
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/desempenho')
      .then(response => setDadosDesempenho(response.data))
      .catch(error => console.error("Erro ao carregar relatório:", error));

    // Busca o status ao vivo dos 16 alunos
    const carregarAoVivo = () => {
      axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/ao-vivo')
        .then(response => setAlunosAoVivo(response.data))
        .catch(error => console.error("Erro ao carregar status ao vivo:", error));
    };

    carregarAoVivo();
    
    // Opcional: Atualiza o status da equipe a cada 10 segundos
    const intervalo = setInterval(carregarAoVivo, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '100px' }}>
      
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

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Gráfico Analítico */}
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

        {/* Quadro de Operadores Ao Vivo */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '18px' }}>Status da Equipe (Ao Vivo)</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {alunosAoVivo.map((aluno) => {
              const emAtividade = !!aluno.nome_operacao;

              return (
                <div key={aluno.operador_id} style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '16px', 
                  padding: '16px', 
                  borderTop: emAtividade ? '4px solid #22C55E' : '4px solid #E5E7EB',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: emAtividade ? '#DCFCE7' : '#F3F4F6', padding: '6px', borderRadius: '50%' }}>
                      <User size={16} color={emAtividade ? '#166534' : '#6B7280'} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                      {aluno.operador_nome}
                    </span>
                  </div>
                  
                  {emAtividade ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#15803D', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Activity size={14} /> {aluno.nome_operacao}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        Peça: {aluno.nome_peca}
                      </span>
                      <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wrench size={12} /> {aluno.maquina_sugerida}
                      </span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', height: '100%', paddingBottom: '8px' }}>
                      Disponível / Livre
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Menu Inferior */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'space-around', padding: '16px 0 24px 0', borderTop: '1px solid #F3F4F6', zIndex: 10 }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><LayoutGrid size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>PAINEL</span></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#005eff', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>PRODUÇÃO</span></div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Producao;