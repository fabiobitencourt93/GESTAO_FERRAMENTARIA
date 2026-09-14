import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

// Seus imports de telas vêm todos aqui em cima:
// (Confirme se os nomes dos seus arquivos estão exatamente assim)
import Painel from './Painel';
import Producao from './Producao';
import Dashboard from './Dashboard';
import Ajustes from './Ajustes';
// import PecasEstampo from './PecasEstampo';
// import ProcessosPeca from './ProcessosPeca';
// import Engenharia from './Engenharia';

// SÓ PODE EXISTIR ESTE 'function App()' NO ARQUIVO INTEIRO:
function App() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    return localStorage.getItem('tema') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', temaEscuro ? 'dark' : 'light');
    localStorage.setItem('tema', temaEscuro ? 'dark' : 'light');
  }, [temaEscuro]);

  return (
    <Router>
      
      {/* BOTÃO FLUTUANTE DE MODO ESCURO */}
      <button 
        onClick={() => setTemaEscuro(!temaEscuro)}
        style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 9999,
          backgroundColor: 'var(--fundo-card)', color: 'var(--texto-titulo)',
          border: '1px solid var(--borda)', borderRadius: '50%',
          width: '48px', height: '48px', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        {temaEscuro ? <Sun size={24} color="#FBBF24" /> : <Moon size={24} color="#4B5563" />}
      </button>

      {/* SUAS ROTAS FICAM TODAS AQUI DENTRO */}
      <Routes>
        <Route path="/" element={<Painel />} />
        <Route path="/producao" element={<Producao />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ajustes" element={<Ajustes />} />
        
        {/* Adicione as rotas de peças, correção e engenharia que você já tinha: */}
        {/* <Route path="/pecas/:id" element={<PecasEstampo />} /> */}
        {/* <Route path="/processos/:id" element={<ProcessosPeca />} /> */}
        {/* <Route path="/engenharia" element={<Engenharia />} /> */}
      </Routes>
      
    </Router>
  );
}

export default App;