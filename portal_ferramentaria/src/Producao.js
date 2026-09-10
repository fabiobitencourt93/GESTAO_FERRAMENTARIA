import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, BarChart2, Settings, Home, ChevronLeft, Bell, User, Activity, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Producao() {
  const navigate = useNavigate();
  const [dadosBrutos, setDadosBrutos] = useState([]);
  const [alunosAoVivo, setAlunosAoVivo] = useState([]);
  
  // Controles independentes para o Gráfico e para a Lista de Progresso
  const [filtroGrafico, setFiltroGrafico] = useState('Geral'); 
  const [filtroProgresso, setFiltroProgresso] = useState('TodasAsPecas'); 

  useEffect(() => {
    axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/desempenho')
      .then(response => setDadosBrutos(response.data))
      .catch(error => console.error("Erro ao carregar relatório:", error));

    const carregarAoVivo = () => {
      axios.get('https://gestao-ferramentaria.onrender.com/api/relatorios/ao-vivo')
        .then(response => setAlunosAoVivo(response.data))
        .catch(error => console.error("Erro ao carregar status ao vivo:", error));
    };

    carregarAoVivo();
    const intervalo = setInterval(carregarAoVivo, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const projetosUnicos = [...new Set(dadosBrutos.map(d => d.projeto))];

  // Função central que processa a matemática dependendo do filtro escolhido
  const processarAgrupamento = (filtro) => {
    const calcularProgresso = (realizado, planejado) => {
      const plan = Number(planejado) || 0;
      const real = Number(realizado) || 0;
      if (plan <= 0) return 0; 
      return Math.round((real / plan) * 100);
    };

    if (filtro === 'Geral') {
      const agrupado = {};
      dadosBrutos.forEach(item => {
        const nome = item.projeto || 'Desconhecido';
        if (!agrupado[nome]) agrupado[nome] = { nome, total_planejado: 0, total_realizado: 0, progresso: 0 };
        agrupado[nome].total_planejado += Number(item.total_planejado || 0) / 60;
        agrupado[nome].total_realizado += Number(item.total_realizado || 0) / 60;
      });
      return Object.values(agrupado).map(i => ({ ...i, progresso: calcularProgresso(i.total_realizado, i.total_planejado) }));
      
    } else if (filtro === 'TodasAsPecas') {
      const agrupado = {};
      dadosBrutos.forEach(item => {
        // Junta o nome do projeto e da peça para não confundir peças com nomes iguais em projetos diferentes
        const nome = item.peca ? `${item.projeto} - ${item.peca}` : 'Peça sem nome';
        if (!agrupado[nome]) agrupado[nome] = { nome, total_planejado: 0, total_realizado: 0, progresso: 0 };
        agrupado[nome].total_planejado += Number(item.total_planejado || 0) / 60;
        agrupado[nome].total_realizado += Number(item.total_realizado || 0) / 60;
      });
      return Object.values(agrupado).map(i => ({ ...i, progresso: calcularProgresso(i.total_realizado, i.total_planejado) }));

    } else {
      const agrupado = {};
      dadosBrutos.filter(item => item.projeto === filtro).forEach(item => {
        const nome = item.peca || 'Peça sem nome';
        if (!agrupado[nome]) agrupado[nome] = { nome, total_planejado: 0, total_realizado: 0, progresso: 0 };
        agrupado[nome].total_planejado += Number(item.total_planejado || 0) / 60;
        agrupado[nome].total_realizado += Number(item.total_realizado || 0) / 60;
      });
      return Object.values(agrupado).map(i => ({ ...i, progresso: calcularProgresso(i.total_realizado, i.total_planejado) }));
    }
  };

  const dadosGrafico = useMemo(() => processarAgrupamento(filtroGrafico), [dadosBrutos, filtroGrafico]);
  const dadosProgresso = useMemo(() => processarAgrupamento(filtroProgresso), [dadosBrutos, filtroProgresso]);

  return (
    <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '120px' }}>
      
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ChevronLeft size={28} /></button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Desempenho de Produção</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><Home size={24} /></button>
          <Bell size={24} />
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* BLOCO 1: GRÁFICO */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Planejado vs Realizado (Horas)</h3>
            <select 
              value={filtroGrafico} 
              onChange={(e) => setFiltroGrafico(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', cursor: 'pointer', fontSize: '14px', color: '#374151', minWidth: '220px' }}
            >
              <option value="Geral">Visão Geral (Ferramentas Completas)</option>
              <option value="TodasAsPecas">Visão Detalhada (Todas as Peças)</option>
              {projetosUnicos.map(proj => <option key={proj} value={proj}>Ver peças: {proj}</option>)}
            </select>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={dadosGrafico} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="nome" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(value) => Number(value).toFixed(1)} />
                <Tooltip cursor={{fill: '#F3F4F6'}} borderRadius={12} formatter={(value, name) => [`${Number(value).toFixed(1)} h`, name]} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="total_planejado" name="Tempo Planejado" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="total_realizado" name="Tempo Realizado" fill="#007A33" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BLOCO 2: PROGRESSO */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>Progresso de Execução</h3>
            <select 
              value={filtroProgresso} 
              onChange={(e) => setFiltroProgresso(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', outline: 'none', cursor: 'pointer', fontSize: '14px', color: '#374151', minWidth: '220px' }}
            >
              <option value="TodasAsPecas">Todas as Peças (Lista Completa)</option>
              <option value="Geral">Ferramentas Completas (Agrupado)</option>
              {projetosUnicos.map(proj => <option key={proj} value={proj}>Ver peças: {proj}</option>)}
            </select>
          </div>
          
          {/* Caixa com Scroll para suportar dezenas de peças sem quebrar a tela */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
            {dadosProgresso.map(item => (
              <div key={item.nome}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{item.nome}</span>
                  <span style={{ color: item.progresso >= 100 ? '#16A34A' : '#0284C7', fontWeight: '700' }}>
                    {item.progresso}% {item.progresso >= 100 && '(Concluído)'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: '#F3F4F6', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(item.progresso, 100)}%`, height: '100%', backgroundColor: item.progresso >= 100 ? '#16A34A' : '#0284C7', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCO 3: EQUIPE AO VIVO */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', color: '#111827', fontSize: '18px', fontWeight: '700' }}>Status da Equipe (Ao Vivo)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {alunosAoVivo.map((aluno) => {
              const emAtividade = !!aluno.nome_operacao;
              return (
                <div key={aluno.operador_id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '16px', borderTop: emAtividade ? '4px solid #22C55E' : '4px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ backgroundColor: emAtividade ? '#DCFCE7' : '#F3F4F6', padding: '6px', borderRadius: '50%' }}>
                      <User size={16} color={emAtividade ? '#166534' : '#6B7280'} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>{aluno.operador_nome}</span>
                  </div>
                  {emAtividade ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#15803D', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={14} /> {aluno.nome_operacao}</span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>Peça: {aluno.nome_peca}</span>
                      <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Wrench size={12} /> {aluno.maquina_sugerida}</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', height: '100%', paddingBottom: '8px' }}>Disponível / Livre</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#007A33', cursor: 'pointer' }}><BarChart2 size={24} /><span style={{ fontSize: '10px', fontWeight: '700' }}>PRODUÇÃO</span></div>
        <div onClick={() => navigate('/ajustes')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#9CA3AF', cursor: 'pointer' }}><Settings size={24} /><span style={{ fontSize: '10px', fontWeight: '600' }}>AJUSTES</span></div>
      </div>
    </div>
  );
}

export default Producao;